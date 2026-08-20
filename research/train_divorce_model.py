#!/usr/bin/env python3
"""Train and calibrate a fixed-horizon legal-divorce research model.

Standard-library only. This script deliberately writes a candidate model with
deploymentApproved=false. Independent validation and human review are required
before the WebUI will display a probability.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from statistics import fmean, pstdev


def sigmoid(value: float) -> float:
    if value >= 0:
        exp = math.exp(-value)
        return 1.0 / (1.0 + exp)
    exp = math.exp(value)
    return exp / (1.0 + exp)


def logit(probability: float) -> float:
    bounded = min(1.0 - 1e-12, max(1e-12, probability))
    return math.log(bounded / (1.0 - bounded))


def load_rows(path: Path, features: list[str]) -> list[dict]:
    rows = []
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        required = {"coupleId", "legalDivorceWithinHorizon", *features}
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Missing columns: {', '.join(sorted(missing))}")
        for line_number, raw in enumerate(reader, start=2):
            couple_id = (raw.get("coupleId") or "").strip()
            outcome = (raw.get("legalDivorceWithinHorizon") or "").strip()
            if not couple_id or outcome not in {"0", "1"}:
                raise ValueError(f"Invalid coupleId/outcome at line {line_number}")
            values = {}
            for feature in features:
                try:
                    values[feature] = float(raw[feature])
                except (TypeError, ValueError) as error:
                    raise ValueError(f"Invalid {feature} at line {line_number}") from error
                if not math.isfinite(values[feature]):
                    raise ValueError(f"Non-finite {feature} at line {line_number}")
            rows.append({"coupleId": couple_id, "y": int(outcome), "x": values})
    if len({row["coupleId"] for row in rows}) != len(rows):
        raise ValueError("Each coupleId must appear exactly once")
    return rows


def split_name(couple_id: str) -> str:
    bucket = int(hashlib.sha256(couple_id.encode("utf-8")).hexdigest()[:8], 16) % 100
    if bucket < 70:
        return "train"
    if bucket < 85:
        return "calibration"
    return "test"


def validate_sample(rows: list[dict], label: str, minimum: int = 20) -> None:
    events = sum(row["y"] for row in rows)
    non_events = len(rows) - events
    if len(rows) < minimum or events < 5 or non_events < 5:
        raise ValueError(f"{label} split is too small or lacks outcome variation")


def standardization(rows: list[dict], features: list[str]) -> dict:
    result = {}
    for feature in features:
        values = [row["x"][feature] for row in rows]
        scale = pstdev(values)
        if scale <= 0:
            raise ValueError(f"Feature has zero variance: {feature}")
        result[feature] = {"mean": fmean(values), "scale": scale}
    return result


def matrix(rows: list[dict], features: list[str], scaling: dict) -> tuple[list[list[float]], list[int]]:
    x = [
        [(row["x"][feature] - scaling[feature]["mean"]) / scaling[feature]["scale"] for feature in features]
        for row in rows
    ]
    return x, [row["y"] for row in rows]


def fit_logistic(x: list[list[float]], y: list[int], l2: float = 0.01, iterations: int = 8000) -> tuple[float, list[float]]:
    feature_count = len(x[0])
    event_rate = min(1 - 1e-6, max(1e-6, fmean(y)))
    intercept = logit(event_rate)
    weights = [0.0] * feature_count
    learning_rate = 0.08
    for _ in range(iterations):
        gradient_intercept = 0.0
        gradient_weights = [0.0] * feature_count
        for values, outcome in zip(x, y):
            prediction = sigmoid(intercept + sum(weight * value for weight, value in zip(weights, values)))
            error = prediction - outcome
            gradient_intercept += error
            for index, value in enumerate(values):
                gradient_weights[index] += error * value
        count = len(y)
        intercept -= learning_rate * gradient_intercept / count
        for index in range(feature_count):
            penalty = l2 * weights[index]
            weights[index] -= learning_rate * ((gradient_weights[index] / count) + penalty)
    return intercept, weights


def probabilities(x: list[list[float]], intercept: float, weights: list[float]) -> list[float]:
    return [sigmoid(intercept + sum(weight * value for weight, value in zip(weights, values))) for values in x]


def fit_calibration(raw_probabilities: list[float], outcomes: list[int]) -> tuple[float, float]:
    calibration_x = [[logit(probability)] for probability in raw_probabilities]
    return_value = fit_logistic(calibration_x, outcomes, l2=0.0, iterations=5000)
    return return_value[0], return_value[1][0]


def calibrated(raw_probabilities: list[float], intercept: float, slope: float) -> list[float]:
    return [sigmoid(intercept + slope * logit(probability)) for probability in raw_probabilities]


def metrics(outcomes: list[int], predicted: list[float]) -> dict:
    brier = fmean((prediction - outcome) ** 2 for outcome, prediction in zip(outcomes, predicted))
    log_loss = -fmean(
        outcome * math.log(max(prediction, 1e-12)) + (1 - outcome) * math.log(max(1 - prediction, 1e-12))
        for outcome, prediction in zip(outcomes, predicted)
    )
    positive = [prediction for outcome, prediction in zip(outcomes, predicted) if outcome == 1]
    negative = [prediction for outcome, prediction in zip(outcomes, predicted) if outcome == 0]
    wins = sum(1 if p > n else 0.5 if p == n else 0 for p in positive for n in negative)
    auc = wins / (len(positive) * len(negative))
    return {
        "sampleSize": len(outcomes),
        "events": sum(outcomes),
        "eventRate": fmean(outcomes),
        "meanPredicted": fmean(predicted),
        "brier": brier,
        "logLoss": log_loss,
        "auc": auc,
    }


def evaluate(rows: list[dict], features: list[str], scaling: dict, intercept: float, weights: list[float], calibration: tuple[float, float]) -> tuple[dict, list[float]]:
    x, y = matrix(rows, features, scaling)
    raw = probabilities(x, intercept, weights)
    predicted = calibrated(raw, *calibration)
    report = metrics(y, predicted)
    calibration_fit = fit_calibration(predicted, y)
    report["calibrationIntercept"] = calibration_fit[0]
    report["calibrationSlope"] = calibration_fit[1]
    return report, predicted


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", type=Path)
    parser.add_argument("--external-dataset", type=Path)
    parser.add_argument("--features", default="cpqCommunicationStrain")
    parser.add_argument("--horizon-months", type=int, required=True)
    parser.add_argument("--population", required=True)
    parser.add_argument("--output", type=Path, default=Path("divorce-model-candidate.js"))
    args = parser.parse_args()

    features = [feature.strip() for feature in args.features.split(",") if feature.strip()]
    if not features or args.horizon_months <= 0:
        raise ValueError("Features and a positive horizon are required")
    rows = load_rows(args.dataset, features)
    if len(rows) < 300 or sum(row["y"] for row in rows) < 30 or sum(1 - row["y"] for row in rows) < 30:
        raise ValueError("Development data require at least 300 couples, 30 events, and 30 non-events; this is a floor, not a sufficiency guarantee")

    splits = {name: [row for row in rows if split_name(row["coupleId"]) == name] for name in ("train", "calibration", "test")}
    for name, split in splits.items():
        validate_sample(split, name)
    scaling = standardization(splits["train"], features)
    train_x, train_y = matrix(splits["train"], features, scaling)
    intercept, weights = fit_logistic(train_x, train_y)
    calibration_x, calibration_y = matrix(splits["calibration"], features, scaling)
    raw_calibration = probabilities(calibration_x, intercept, weights)
    calibration = fit_calibration(raw_calibration, calibration_y)
    if calibration[1] <= 0:
        raise ValueError("Calibration slope is non-positive; model is unsuitable")
    internal_report, _ = evaluate(splits["test"], features, scaling, intercept, weights, calibration)

    external_report = {"status": "not_performed"}
    if args.external_dataset:
        external_rows = load_rows(args.external_dataset, features)
        validate_sample(external_rows, "external", minimum=50)
        external_report, _ = evaluate(external_rows, features, scaling, intercept, weights, calibration)
        external_report["status"] = "evaluated_not_approved"
        external_report["cohort"] = args.external_dataset.name

    model = {
        "modelId": f"cpq-divorce-candidate-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}",
        "outcome": "legal_divorce",
        "horizonMonths": args.horizon_months,
        "population": args.population,
        "intercept": intercept,
        "coefficients": dict(zip(features, weights)),
        "standardization": scaling,
        "calibration": {"intercept": calibration[0], "slope": calibration[1]},
        "internalValidation": internal_report,
        "externalValidation": external_report,
        "developmentSampleSize": len(rows),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "deploymentApproved": False,
    }
    args.output.write_text("window.CPQ_DIVORCE_MODEL = " + json.dumps(model, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "internalValidation": internal_report, "externalValidation": external_report}, indent=2))


if __name__ == "__main__":
    main()
