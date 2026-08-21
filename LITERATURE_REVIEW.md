# 情侣冲突、情感观察与关系发展：同行评审补充报告

## 结论先行

CPQ-35 适合描述双方报告的建设性沟通和要求／回避模式，但不能单独承担“预测感情发展”的任务。SPAFF 类观察能补充可见行为，却同样不能从一次互动直接给出个人层面的分手或离婚概率。

最稳妥的研究架构是把结果、机制、背景与安全分开测量，并进行真正的纵向随访：

1. 以关系满意度为主要连续结局；
2. 以承诺、替代选择、投入和分居想法作为较近端的关系稳定性变量；
3. 保留 CPQ 作为沟通过程自陈指标；
4. 把 SPAFF-informed 观察作为独立的行为资料；
5. 把亲密伴侣暴力与即时安全完全独立处理；
6. 在多个时间点重复测量，而不是从一次横断面分数预测未来。

当前实现已经把 ECR-R 作为依恋背景维度、把 DCI 作为压力适应层，并增加本地纵向档案导入。它们不会与 CPQ 合成总分：ECR-R 更接近相对稳定的个体脆弱性，DCI 和 CPQ 更接近可变化的适应过程，满意度／承诺仍是尚待补入的关系评价层。

Joel 等（2020）汇总 43 个纵向情侣数据集、11,196 对伴侣。关系特异变量能够解释相当一部分当前关系质量，但各种自陈变量的组合仍难以预测谁的关系质量之后会上升或下降。这直接反对从一次 CPQ 作答生成未经纵向验证的“感情发展概率”。

## 当前实现：描述指数与真实概率严格分离

网站现在提供一个 0–100 的“沟通压力研究指数”，将反向标准化的双方建设性沟通与标准化的四个要求／回避方向等权平均。它的作用是让用户看见计算依据，而不是声称建立了新的心理量表。由于该组合尚无信度、效度、常模或结局校准证据，不能用其数值直接替代离婚概率。

同时，项目已加入固定期限法律离婚模型的训练、校准、外部验证和运行时门控接口。默认模型为空，训练脚本也始终将自动部署设为关闭；只有独立外部验证通过和人工研究治理批准后，界面才允许显示真实概率。该结构解决的是“如何诚实部署模型”，并不等于现阶段已经获得可用于真实情侣的预测模型。

## 为什么此前没有把观察模块称为 SPAFF

旧模块只记录五个宏观情感状态的持续时间。它缺少正式 SPAFF 所需要的明确版本与代码本、标准化互动任务、编码员训练、双人独立编码和编码员间一致性，因此不能诚实地标为 SPAFF。

Johnson（2002）对 SPAFF 的心理测量研究发现，多个具体代码存在共线性，数据中可提取出愤怒／蔑视、悲伤、焦虑、幽默／关爱等较高阶因素。这意味着把许多代码简单相加或按“正负比例”解释并不稳妥。

本次实现增加了一个明确标为 **SPAFF-informed** 的 9 维整体评级，采用 Roels 等（2021）公开描述的 SPAFF/SCIFF 改编维度：

- 负向：蔑视、支配／挑衅、恼怒／挫败、总体冲突强度；
- 正向：关爱、理解／确认、协作、关注伴侣视角、轻松感。

该研究让受训编码员在观看完整互动后按 1–10 评级，并对一部分互动进行多编码员复评，报告单测量 ICC 为 .61–.89。本网页复现的是数据录入结构，不继承原研究的信度或效度。

### 若要升级为正式观察研究

- 预先指定具体 SPAFF 版本、代码本和允许的改编；
- 统一冲突议题选择、录像环境和互动时长；
- 同时编码言语、语调、面部和身体行为；
- 编码员对自陈分数和关系结局保持盲法；
- 至少抽取一部分录像双重编码，并预先规定 ICC 或 kappa 门槛；
- 区分持续时间、出现频率、序列转移和双方同步，不把点击次数当情感占比；
- 在独立样本中验证后，才讨论预测用途。

## 建议补足的量表矩阵

| 层级 | 建议工具 | 测量目标 | 在本项目中的位置 | 主要限制 |
| --- | --- | --- | --- | --- |
| 主要结局 | Couples Satisfaction Index（CSI-32/16/4） | 当前关系满意度 | 优先新增，作为重复随访结局 | 不能把单次分数当未来结局 |
| 承诺机制 | Investment Model Scale（IMS） | 满意、替代选择、投入、承诺 | 与 CPQ 并列的解释变量 | 构念相关但不可与满意度合成总分 |
| 依恋背景 | ECR-R | 依恋焦虑与回避 | 调节变量或分层变量 | 是个体倾向，不是关系健康诊断 |
| 压力适应 | Dyadic Coping Inventory（DCI） | 压力沟通、支持性／委托式／消极／共同应对 | 已实现完整官方英文 DCI-37、正式计分与双人云同步 | 中文版仍需授权／等值性证据；不作个体诊断 |
| 近端稳定性 | Marital Instability Index | 分居／离婚想法与行动 | 仅用于明确同意的纵向研究 | 主要面向婚姻且题目敏感 |
| 简短满意度备选 | Relationship Assessment Scale（RAS） | 总体关系评价 | 时间极短时的备选 | 若可使用 CSI，不建议重复堆叠 |
| 安全域 | CTS2 或经本地验证的 IPV 筛查 | 谈判、心理攻击、身体伤害等 | 必须独立于“关系预测” | 需要安全处置流程，不可由正向分数抵消 |
| 行为观察 | 正式 SPAFF 或预注册改编 | 冲突中的具体情感／行为 | 独立观察层 | 依赖训练、录像质量和一致性 |

不建议把全部量表合成单一分数。当前项目已加入 **CPQ-35 + ECR-R + 完整英文 DCI-37 + 重复随访档案**；下一优先级仍应是 CSI-16 与 IMS，因为满意度和承诺是区别于依恋、沟通和共同应对的独立预测层。

## “预测感情发展”的正确建模方向

### 先定义不同结局

- 关系质量变化：连续结局，使用 CSI 等量表的重复测量；
- 是否分居／分手：事件结局，记录发生时间并使用生存分析；
- 是否考虑分开：近端意向，不等于实际分手；
- 冲突是否恶化：沟通或行为轨迹，不等于整体关系结局。

这些结局不能混成同一个标签。

### 推荐设计

- 基线、1、3、6、12 个月测量双方；
- 使用 Actor–Partner Interdependence Model 或双人多层模型处理双方数据不独立；
- 对关系质量使用增长曲线／变化模型，对分手使用生存模型；
- 训练、调参和验证按“情侣”分组，禁止把同一对伴侣拆到不同数据集；
- 报告校准、区分度、置信区间、缺失与失访，而不只报告准确率；
- 做跨文化、关系类型、性别／性取向和关系阶段的测量不变性与外部验证；
- 预注册特征、结局和分析，避免从大量变量中事后挑选显著结果。

当前仓库的 `research/train_divorce_model.py` 实现了一个最小固定期限逻辑回归基线：按情侣哈希分组拆分开发集、在训练集拟合标准化和系数、在独立校准集拟合概率校准、在保留测试集和可选外部队列报告 Brier score、log loss、AUC 与校准截距／斜率。脚本中的最低样本与事件数检查只是防止管线误跑的工程下限，不是样本量论证；正式研究仍需按预期事件率、候选参数、目标精度和外部验证计划进行样本量设计。

### 对用户输出的限制

- 不显示“你们有 78% 概率分手”一类未经校准、未经外部验证或超出模型适用范围的个人预测；
- 只显示各构念的原量表结果、随时间变化和不确定性；
- 不把伴侣之间的分数差自动解释为欺骗、否认或关系恶化；
- 安全风险信号不进入普通关系总分，应触发独立的安全说明和人工支持路径。

## 对当前网站的架构建议

建议继续维持分层结构：

1. `CPQ core`：固定题面、正式计分、独立作答；
2. `Outcome`：CSI 等满意度随访；
3. `Mechanisms`：IMS、ECR-R 等；
4. `Observation`：宏观持续时间和 SPAFF-informed／正式 SPAFF；
5. `Safety`：独立同意、独立权限、独立处置；
6. `Research analytics`：只在获得纵向样本和验证后启用。

数据导出应保留量表版本、语言版本、时间点、作答者、缺失值和评分算法版本。任何后续预测模型都应保存模型卡、训练样本范围、外部验证结果和适用边界。

## 主要文献

- Booth, A., Johnson, D., & Edwards, J. N. (1983). Measuring marital instability. *Journal of Marriage and the Family, 45*, 387–394. https://doi.org/10.2307/351516
- Carrère, S., & Gottman, J. M. (1999). Predicting divorce among newlyweds from the first three minutes of a marital conflict discussion. *Family Process, 38*, 293–301. https://doi.org/10.1111/j.1545-5300.1999.00293.x
- Fraley, R. C., Waller, N. G., & Brennan, K. A. (2000). An item response theory analysis of self-report measures of adult attachment. *Journal of Personality and Social Psychology, 78*, 350–365. https://doi.org/10.1037/0022-3514.78.2.350
- Gmelch, S., Bodenmann, G., Meuwly, N., Ledermann, T., Steffen-Sozinova, O., & Striegl, K. (2008). Dyadisches Coping Inventar (DCI): Ein Fragebogen zur Erfassung des partnerschaftlichen Umgangs mit Stress. *Journal of Family Research, 20*, 185–202. https://doi.org/10.20377/jfr-264
- Funk, J. L., & Rogge, R. D. (2007). Testing the ruler with item response theory: Increasing precision of measurement for relationship satisfaction with the Couples Satisfaction Index. *Journal of Family Psychology, 21*, 572–583. https://doi.org/10.1037/0893-3200.21.4.572
- Gottman, J. M., Coan, J., Carrere, S., & Swanson, C. (1998). Predicting marital happiness and stability from newlywed interactions. *Journal of Marriage and the Family, 60*, 5–22. https://doi.org/10.2307/353438
- Heyman, R. E. (2001). Observation of couple conflicts: Clinical assessment applications, stubborn truths, and shaky foundations. *Psychological Assessment, 13*, 5–35. https://doi.org/10.1037/1040-3590.13.1.5
- Joel, S., Eastwick, P. W., Allison, C. J., et al. (2020). Machine learning uncovers the most robust self-report predictors of relationship quality across 43 longitudinal couples studies. *PNAS, 117*, 19061–19071. https://doi.org/10.1073/pnas.1917036117
- Johnson, M. D. (2002). The observation of specific affect in marital interactions: Psychometric properties of a coding system and a rating system. *Psychological Assessment, 14*, 423–438. https://doi.org/10.1037/1040-3590.14.4.423
- Roels, R., Rehman, U. S., Carter, C. S., Nazarloo, H. P., & Janssen, E. (2021). The link between oxytocin plasma levels and observed communication behaviors during sexual and nonsexual couple discussions: An exploratory study. *Psychoneuroendocrinology, 129*, 105265. https://doi.org/10.1016/j.psyneuen.2021.105265
- Rusbult, C. E., Martz, J. M., & Agnew, C. R. (1998). The Investment Model Scale. *Personal Relationships, 5*, 357–387. https://doi.org/10.1111/j.1475-6811.1998.tb00177.x
- Straus, M. A., Hamby, S. L., Boney-McCoy, S., & Sugarman, D. B. (1996). The Revised Conflict Tactics Scales (CTS2). *Journal of Family Issues, 17*, 283–316. https://doi.org/10.1177/019251396017003001
- Woodin, E. M. (2011). A two-dimensional approach to relationship conflict: Meta-analytic findings. *Journal of Family Psychology, 25*, 325–335. https://doi.org/10.1037/a0023791
