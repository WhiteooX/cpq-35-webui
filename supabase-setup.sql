create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.couple_sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  pin_hash text not null,
  token_a uuid,
  token_b uuid,
  answers_a jsonb not null default '[]'::jsonb,
  answers_b jsonb not null default '[]'::jsonb,
  submitted_a boolean not null default false,
  submitted_b boolean not null default false,
  ecr_answers_a jsonb not null default '[]'::jsonb,
  ecr_answers_b jsonb not null default '[]'::jsonb,
  ecr_submitted_a boolean not null default false,
  ecr_submitted_b boolean not null default false,
  dci_answers_a jsonb not null default '[]'::jsonb,
  dci_answers_b jsonb not null default '[]'::jsonb,
  dci_scores_a jsonb not null default '{}'::jsonb,
  dci_scores_b jsonb not null default '{}'::jsonb,
  dci_submitted_a boolean not null default false,
  dci_submitted_b boolean not null default false,
  csi_answers_a jsonb not null default '[]'::jsonb,
  csi_answers_b jsonb not null default '[]'::jsonb,
  csi_scores_a jsonb not null default '{}'::jsonb,
  csi_scores_b jsonb not null default '{}'::jsonb,
  csi_submitted_a boolean not null default false,
  csi_submitted_b boolean not null default false,
  gmsex_answers_a jsonb not null default '[]'::jsonb,
  gmsex_answers_b jsonb not null default '[]'::jsonb,
  gmsex_scores_a jsonb not null default '{}'::jsonb,
  gmsex_scores_b jsonb not null default '{}'::jsonb,
  gmsex_submitted_a boolean not null default false,
  gmsex_submitted_b boolean not null default false,
  nsss_answers_a jsonb not null default '[]'::jsonb,
  nsss_answers_b jsonb not null default '[]'::jsonb,
  nsss_scores_a jsonb not null default '{}'::jsonb,
  nsss_scores_b jsonb not null default '{}'::jsonb,
  nsss_submitted_a boolean not null default false,
  nsss_submitted_b boolean not null default false,
  kos_answers_a jsonb not null default '[]'::jsonb,
  kos_answers_b jsonb not null default '[]'::jsonb,
  kos_scores_a jsonb not null default '{}'::jsonb,
  kos_scores_b jsonb not null default '{}'::jsonb,
  kos_submitted_a boolean not null default false,
  kos_submitted_b boolean not null default false,
  promis_response_a jsonb not null default '{"profile":"vaginal","answers":{},"reasons":[]}'::jsonb,
  promis_response_b jsonb not null default '{"profile":"vaginal","answers":{},"reasons":[]}'::jsonb,
  promis_scores_a jsonb not null default '{}'::jsonb,
  promis_scores_b jsonb not null default '{}'::jsonb,
  promis_submitted_a boolean not null default false,
  promis_submitted_b boolean not null default false,
  rfs_answers_a jsonb not null default '[]'::jsonb,
  rfs_answers_b jsonb not null default '[]'::jsonb,
  rfs_scores_a jsonb not null default '{}'::jsonb,
  rfs_scores_b jsonb not null default '{}'::jsonb,
  rfs_submitted_a boolean not null default false,
  rfs_submitted_b boolean not null default false,
  -- Legacy column name retained for non-destructive migration. These rows are
  -- macro affect-duration events and must not be interpreted as formal SPAFF.
  spaff_events jsonb not null default '[]'::jsonb,
  spaff_ratings jsonb not null default '{"A": {}, "B": {}}'::jsonb,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint couple_sessions_code_format check (code ~ '^[0-9]{6}$'),
  constraint couple_sessions_attempts_nonnegative check (failed_attempts >= 0)
);

-- Safe migration path for projects that ran an earlier version of this file.
alter table public.couple_sessions add column if not exists failed_attempts integer not null default 0;
alter table public.couple_sessions add column if not exists locked_until timestamptz;
alter table public.couple_sessions add column if not exists expires_at timestamptz not null default (now() + interval '30 days');
alter table public.couple_sessions add column if not exists spaff_ratings jsonb not null default '{"A": {}, "B": {}}'::jsonb;
alter table public.couple_sessions add column if not exists ecr_answers_a jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists ecr_answers_b jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists ecr_submitted_a boolean not null default false;
alter table public.couple_sessions add column if not exists ecr_submitted_b boolean not null default false;
alter table public.couple_sessions add column if not exists dci_answers_a jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists dci_answers_b jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists dci_scores_a jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists dci_scores_b jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists dci_submitted_a boolean not null default false;
alter table public.couple_sessions add column if not exists dci_submitted_b boolean not null default false;
alter table public.couple_sessions add column if not exists csi_answers_a jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists csi_answers_b jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists csi_scores_a jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists csi_scores_b jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists csi_submitted_a boolean not null default false;
alter table public.couple_sessions add column if not exists csi_submitted_b boolean not null default false;
alter table public.couple_sessions add column if not exists gmsex_answers_a jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists gmsex_answers_b jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists gmsex_scores_a jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists gmsex_scores_b jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists gmsex_submitted_a boolean not null default false;
alter table public.couple_sessions add column if not exists gmsex_submitted_b boolean not null default false;
alter table public.couple_sessions add column if not exists nsss_answers_a jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists nsss_answers_b jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists nsss_scores_a jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists nsss_scores_b jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists nsss_submitted_a boolean not null default false;
alter table public.couple_sessions add column if not exists nsss_submitted_b boolean not null default false;
alter table public.couple_sessions add column if not exists kos_answers_a jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists kos_answers_b jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists kos_scores_a jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists kos_scores_b jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists kos_submitted_a boolean not null default false;
alter table public.couple_sessions add column if not exists kos_submitted_b boolean not null default false;
alter table public.couple_sessions add column if not exists promis_response_a jsonb not null default '{"profile":"vaginal","answers":{},"reasons":[]}'::jsonb;
alter table public.couple_sessions add column if not exists promis_response_b jsonb not null default '{"profile":"vaginal","answers":{},"reasons":[]}'::jsonb;
alter table public.couple_sessions add column if not exists promis_scores_a jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists promis_scores_b jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists promis_submitted_a boolean not null default false;
alter table public.couple_sessions add column if not exists promis_submitted_b boolean not null default false;
alter table public.couple_sessions add column if not exists rfs_answers_a jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists rfs_answers_b jsonb not null default '[]'::jsonb;
alter table public.couple_sessions add column if not exists rfs_scores_a jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists rfs_scores_b jsonb not null default '{}'::jsonb;
alter table public.couple_sessions add column if not exists rfs_submitted_a boolean not null default false;
alter table public.couple_sessions add column if not exists rfs_submitted_b boolean not null default false;

alter table public.couple_sessions enable row level security;
revoke all on public.couple_sessions from public, anon, authenticated;

create or replace function public.cpq_service_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'status', 'ok',
    'schemaVersion', 8,
    'features', jsonb_build_array('serverDciScoring', 'measureProgressCounts', 'relationshipOutcomeMeasures', 'sexSubMeasures', 'promisSexFsProfiles'),
    'sessionRetentionDays', 30,
    'serverTime', now()
  )
$$;

-- Remove RPCs left by the earlier prototype. The three-argument join function
-- allowed a caller with the invitation PIN to replace an existing role token.
drop function if exists public.join_couple_session(text, text, text);
drop function if exists public._hash_pin(text);
drop function if exists public.save_spaff_events(text, uuid, jsonb);

create or replace function public._pin_matches(p_stored text, p_pin text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case
    when p_stored like '$2%' then p_stored = extensions.crypt(coalesce(p_pin, ''), p_stored)
    -- Backward compatibility for sessions made by the earlier SHA-256 script.
    else p_stored = encode(extensions.digest(coalesce(p_pin, ''), 'sha256'), 'hex')
  end
$$;

create or replace function public._valid_cpq_answers(p_answers jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case
    when jsonb_typeof(p_answers) = 'array' then
      jsonb_array_length(p_answers) = 35
      and not exists (
        select 1
        from jsonb_array_elements(p_answers) as answer
        where jsonb_typeof(answer) not in ('number', 'null')
           or (
             jsonb_typeof(answer) = 'number'
             and (answer #>> '{}') !~ '^[1-9]$'
           )
      )
    else false
  end
$$;

create or replace function public._valid_scale_answers(p_answers jsonb, p_length integer, p_max integer)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case
    when jsonb_typeof(p_answers) = 'array' then
      jsonb_array_length(p_answers) = p_length
      and not exists (
        select 1
        from jsonb_array_elements(p_answers) as answer
        where jsonb_typeof(answer) not in ('number', 'null')
           or case
                when jsonb_typeof(answer) = 'number' then
                  case
                    when (answer #>> '{}') ~ '^[1-9][0-9]*$'
                    then (answer #>> '{}')::integer < 1 or (answer #>> '{}')::integer > p_max
                    else true
                  end
                else false
              end
      )
    else false
  end
$$;

create or replace function public._valid_dci_scores(p_scores jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case
    when jsonb_typeof(p_scores) = 'object' then
      not exists (
        select 1
        from jsonb_each(p_scores) as score(key, value)
        where key not in (
          'selfStressCommunication', 'selfSupportive', 'selfDelegated', 'selfNegative',
          'partnerStressCommunication', 'partnerSupportive', 'partnerDelegated', 'partnerNegative',
          'common', 'totalWithoutEvaluation', 'satisfaction', 'effectiveness'
        )
        or jsonb_typeof(value) not in ('number', 'null')
        or case
             when jsonb_typeof(value) = 'number' then
               case
                 when (value #>> '{}') !~ '^[0-9]+$' then true
                 when key in ('selfStressCommunication', 'selfNegative', 'partnerStressCommunication', 'partnerNegative')
                   then (value #>> '{}')::integer not between 4 and 20
                 when key in ('selfSupportive', 'partnerSupportive', 'common')
                   then (value #>> '{}')::integer not between 5 and 25
                 when key in ('selfDelegated', 'partnerDelegated')
                   then (value #>> '{}')::integer not between 2 and 10
                 when key = 'totalWithoutEvaluation'
                   then (value #>> '{}')::integer not between 35 and 175
                 when key in ('satisfaction', 'effectiveness')
                   then (value #>> '{}')::integer not between 1 and 5
                 else true
               end
             else false
           end
      )
    else false
  end
$$;

create or replace function public._score_dci_answers(p_answers jsonb)
returns jsonb
language sql
immutable
strict
set search_path = public
as $$
  with keyed as (
    select
      response.id::integer as id,
      (response.value #>> '{}')::integer as raw,
      case
        when response.id in (7, 10, 11, 15, 22, 25, 26, 27)
          then 6 - (response.value #>> '{}')::integer
        else (response.value #>> '{}')::integer
      end as score
    from jsonb_array_elements(p_answers) with ordinality as response(value, id)
  )
  select jsonb_build_object(
    'selfStressCommunication', sum(score) filter (where id in (1, 2, 3, 4)),
    'selfSupportive', sum(score) filter (where id in (20, 21, 23, 24, 29)),
    'selfDelegated', sum(score) filter (where id in (28, 30)),
    'selfNegative', sum(score) filter (where id in (22, 25, 26, 27)),
    'partnerStressCommunication', sum(score) filter (where id in (16, 17, 18, 19)),
    'partnerSupportive', sum(score) filter (where id in (5, 6, 8, 9, 13)),
    'partnerDelegated', sum(score) filter (where id in (12, 14)),
    'partnerNegative', sum(score) filter (where id in (7, 10, 11, 15)),
    'common', sum(score) filter (where id in (31, 32, 33, 34, 35)),
    'totalWithoutEvaluation', sum(score) filter (where id between 1 and 35),
    'satisfaction', max(raw) filter (where id = 36),
    'effectiveness', max(raw) filter (where id = 37)
  )
  from keyed
$$;

create or replace function public._valid_csi_answers(p_answers jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case when jsonb_typeof(p_answers) = 'array' and jsonb_array_length(p_answers) = 32 then
    not exists (
      select 1 from jsonb_array_elements(p_answers) with ordinality as response(value, id)
      where jsonb_typeof(value) not in ('number', 'null')
         or case when jsonb_typeof(value) = 'number' then
           (value #>> '{}') !~ '^[0-6]$'
           or (id > 1 and (value #>> '{}')::integer > 5)
         else false end
    )
  else false end
$$;

create or replace function public._score_csi_answers(p_answers jsonb)
returns jsonb
language sql
immutable
strict
set search_path = public
as $$
  with responses as (
    select id::integer, (value #>> '{}')::integer as raw
    from jsonb_array_elements(p_answers) with ordinality as response(value, id)
  )
  select jsonb_build_object('total', sum(case when id in (6, 10, 15) then 5 - raw else raw end)) from responses
$$;

create or replace function public._score_gmsex_answers(p_answers jsonb)
returns jsonb
language sql
immutable
strict
set search_path = public
as $$
  with responses as (select (value #>> '{}')::integer as raw from jsonb_array_elements(p_answers) as response(value))
  select jsonb_build_object('total', sum(raw), 'mean', round(avg(raw), 2)) from responses
$$;

create or replace function public._score_nsss_answers(p_answers jsonb)
returns jsonb
language sql
immutable
strict
set search_path = public
as $$
  with responses as (select (value #>> '{}')::integer as raw from jsonb_array_elements(p_answers) as response(value))
  select jsonb_build_object('total', sum(raw), 'mean', round(avg(raw), 2)) from responses
$$;

create or replace function public._score_kos_answers(p_answers jsonb)
returns jsonb
language sql
immutable
strict
set search_path = public
as $$
  with responses as (
    select id::integer, (value #>> '{}')::integer as raw
    from jsonb_array_elements(p_answers) with ordinality as response(value, id)
  )
  select jsonb_build_object(
    'total', sum(raw), 'mean', round(avg(raw), 2),
    'factors', jsonb_build_object(
      'identity', round(avg(raw) filter (where id in (1,2,3)), 2),
      'practices', round(avg(raw) filter (where id in (4,5,6,7,14)), 2),
      'paraphernalia', round(avg(raw) filter (where id in (8,9,18)), 2),
      'community', round(avg(raw) filter (where id in (10,11,12,13)), 2),
      'communication', round(avg(raw) filter (where id in (15,16,17)), 2)
    )
  ) from responses
$$;

create or replace function public._valid_promis_response(p_response jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case when jsonb_typeof(p_response) = 'object'
    and p_response->>'profile' in ('vaginal', 'erectile')
    and jsonb_typeof(p_response->'answers') = 'object'
    and jsonb_typeof(p_response->'reasons') = 'array'
  then
    not exists (select 1 from jsonb_object_keys(p_response) as response_key(key) where key not in ('profile','answers','reasons'))
    and jsonb_array_length(p_response->'reasons') <= 10
    and jsonb_array_length(p_response->'reasons') = (select count(distinct value #>> '{}') from jsonb_array_elements(p_response->'reasons') as reason(value))
    and not exists (
      select 1 from jsonb_each(p_response->'answers') as answer(key, value)
      where key not in (
        'interestLevel','interestFrequency','activity','orgasmAbility','orgasmPleasure','satisfaction','pleasure',
        'lubricationFrequency','lubricationMaintenance','vaginalDiscomfort','vaginalPain','labialDiscomfort','clitoralDiscomfort',
        'erectionFrequency','erectionMaintenance'
      )
      or jsonb_typeof(value) <> 'number'
      or (value #>> '{}') !~ '^[0-5]$'
      or (key = 'activity' and (value #>> '{}')::integer not between 1 and 2)
      or (key not in ('orgasmAbility','orgasmPleasure','erectionMaintenance','activity') and (value #>> '{}')::integer not between 1 and 5)
    )
    and not exists (
      select 1 from jsonb_array_elements(p_response->'reasons') as reason(value)
      where jsonb_typeof(value) <> 'number' or (value #>> '{}') !~ '^(10|[1-9])$'
    )
  else false end
$$;

create or replace function public._promis_required_count(p_response jsonb)
returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when p_response->'answers'->>'activity' = '1' then 4
    when p_response->'answers'->>'activity' = '2' and p_response->>'profile' = 'vaginal' then 13
    when p_response->'answers'->>'activity' = '2' and p_response->>'profile' = 'erectile' then 9
    else 3
  end
$$;

create or replace function public._promis_answered_count(p_response jsonb)
returns integer
language sql
immutable
set search_path = public
as $$
  with required_keys as (
    select unnest(case
      when p_response->'answers'->>'activity' = '2' and p_response->>'profile' = 'vaginal'
        then array['interestLevel','interestFrequency','activity','orgasmAbility','orgasmPleasure','satisfaction','pleasure','lubricationFrequency','lubricationMaintenance','vaginalDiscomfort','vaginalPain','labialDiscomfort','clitoralDiscomfort']
      when p_response->'answers'->>'activity' = '2' and p_response->>'profile' = 'erectile'
        then array['interestLevel','interestFrequency','activity','orgasmAbility','orgasmPleasure','satisfaction','pleasure','erectionFrequency','erectionMaintenance']
      else array['interestLevel','interestFrequency','activity']
    end) as key
  )
  select count(*)::integer
    + case when p_response->'answers'->>'activity' = '1' and jsonb_array_length(p_response->'reasons') > 0 then 1 else 0 end
  from required_keys where jsonb_typeof(p_response->'answers'->key) = 'number'
$$;

create or replace function public._score_promis_response(p_response jsonb)
returns jsonb
language sql
immutable
strict
set search_path = public
as $$
  select jsonb_build_object(
    'profile', p_response->>'profile',
    'sexuallyActive', p_response->'answers'->>'activity' = '2',
    'interestRaw', coalesce((p_response->'answers'->>'interestLevel')::integer, 0) + coalesce((p_response->'answers'->>'interestFrequency')::integer, 0),
    'satisfactionRaw', case when p_response->'answers'->>'activity' = '2' then
      coalesce((p_response->'answers'->>'satisfaction')::integer, 0) + coalesce((p_response->'answers'->>'pleasure')::integer, 0)
      else null end,
    'scoringStatus', 'raw-domain-profile; official T-score conversion not applied locally'
  )
$$;

create or replace function public._score_rfs_answers(p_answers jsonb)
returns jsonb
language sql
immutable
strict
set search_path = public
as $$
  with responses as (select (value #>> '{}')::integer as raw from jsonb_array_elements(p_answers) as response(value))
  select jsonb_build_object('total', sum(raw), 'mean', round(avg(raw), 2)) from responses
$$;

create or replace function public._valid_observation_events(p_events jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case
    when jsonb_typeof(p_events) = 'array' then
      jsonb_array_length(p_events) <= 2000
      and not exists (
        select 1
        from jsonb_array_elements(p_events) as event
        where jsonb_typeof(event) is distinct from 'object'
           or coalesce(event->>'person', '') not in ('A', 'B')
           or coalesce(event->>'code', '') not in ('positive', 'interest', 'neutral', 'internal', 'external')
           or jsonb_typeof(event->'startMs') is distinct from 'number'
           or coalesce(jsonb_typeof(event->'endMs'), 'missing') not in ('number', 'null')
           or case
                when jsonb_typeof(event->'startMs') = 'number'
                then (event->>'startMs')::numeric < 0 or (event->>'startMs')::numeric > 9999999999999
                else true
              end
           or case
                when jsonb_typeof(event->'endMs') = 'number' and jsonb_typeof(event->'startMs') = 'number'
                then (event->>'endMs')::numeric < (event->>'startMs')::numeric
                  or (event->>'endMs')::numeric > 9999999999999
                else false
              end
      )
    else false
  end
$$;

create or replace function public._valid_spaff_ratings(p_ratings jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case
    when jsonb_typeof(p_ratings) = 'object'
      and jsonb_typeof(p_ratings->'A') = 'object'
      and jsonb_typeof(p_ratings->'B') = 'object'
    then
      not exists (
        select 1 from jsonb_object_keys(p_ratings) as person
        where person not in ('A', 'B')
      )
      and not exists (
        select 1
        from (values ('A'), ('B')) as people(person)
        cross join lateral jsonb_each(p_ratings -> people.person) as rating(code, value)
        where code not in (
          'contempt', 'domineeringBelligerence', 'annoyanceFrustration', 'conflictLevel',
          'affection', 'validation', 'collaboration', 'perspectiveInterest', 'lightness'
        )
        or jsonb_typeof(value) not in ('number', 'null')
        or (
          jsonb_typeof(value) = 'number'
          and (value #>> '{}') !~ '^(10|[1-9])$'
        )
      )
    else false
  end
$$;

create or replace function public.create_couple_session(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_token uuid := gen_random_uuid();
  i integer := 0;
begin
  if p_pin !~ '^[0-9]{6,12}$' then
    raise exception 'PIN must be 6-12 digits';
  end if;

  -- Opportunistic retention cleanup. This runs only when a new session is made.
  delete from public.couple_sessions where expires_at <= now();

  loop
    v_code := lpad((floor(random() * 1000000))::integer::text, 6, '0');
    exit when not exists (select 1 from public.couple_sessions where code = v_code);
    i := i + 1;
    if i > 25 then raise exception 'Could not allocate invite code'; end if;
  end loop;

  insert into public.couple_sessions(code, pin_hash, token_a)
  values (v_code, extensions.crypt(p_pin, extensions.gen_salt('bf', 10)), v_token);

  return jsonb_build_object('code', v_code, 'role', 'A', 'token', v_token::text);
end;
$$;

create or replace function public.join_couple_session(p_code text, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.couple_sessions%rowtype;
  v_token uuid := gen_random_uuid();
  v_attempts integer;
begin
  select * into s
  from public.couple_sessions
  where code = p_code and expires_at > now()
  for update;

  if not found then
    return jsonb_build_object('error', 'Invalid code or PIN');
  end if;

  if s.locked_until is not null and s.locked_until > now() then
    return jsonb_build_object('error', 'Too many failed attempts. Try again later.');
  end if;

  if not public._pin_matches(s.pin_hash, p_pin) then
    v_attempts := s.failed_attempts + 1;
    update public.couple_sessions
    set failed_attempts = case when v_attempts >= 5 then 0 else v_attempts end,
        locked_until = case when v_attempts >= 5 then now() + interval '10 minutes' else null end,
        updated_at = now()
    where id = s.id;
    return jsonb_build_object('error', 'Invalid code or PIN');
  end if;

  if s.token_b is not null then
    return jsonb_build_object('error', 'Partner B has already joined this session');
  end if;

  update public.couple_sessions
  set token_b = v_token,
      pin_hash = case when s.pin_hash like '$2%' then s.pin_hash else extensions.crypt(p_pin, extensions.gen_salt('bf', 10)) end,
      failed_attempts = 0,
      locked_until = null,
      updated_at = now()
  where id = s.id;

  return jsonb_build_object(
    'code', p_code,
    'role', 'B',
    'token', v_token::text,
    'submittedA', s.submitted_a,
    'submittedB', s.submitted_b
  );
end;
$$;

create or replace function public.save_couple_answers(
  p_code text,
  p_token uuid,
  p_answers jsonb,
  p_submit boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.couple_sessions%rowtype;
  v_role text;
begin
  select * into s
  from public.couple_sessions
  where code = p_code and expires_at > now()
  for update;

  if not found then raise exception 'Session not found or expired'; end if;
  if s.token_a = p_token then v_role := 'A';
  elsif s.token_b = p_token then v_role := 'B';
  else raise exception 'Invalid member token';
  end if;

  if not public._valid_cpq_answers(p_answers) then
    raise exception 'Answers must contain exactly 35 values using null or integers from 1 to 9';
  end if;
  if coalesce(p_submit, false) and exists (
    select 1 from jsonb_array_elements(p_answers) as answer
    where jsonb_typeof(answer) <> 'number'
  ) then
    raise exception 'All 35 answers are required before submission';
  end if;

  if v_role = 'A' then
    if s.submitted_a then raise exception 'A is already submitted and locked'; end if;
    update public.couple_sessions
    set answers_a = p_answers, submitted_a = coalesce(p_submit, false), updated_at = now()
    where id = s.id;
  else
    if s.submitted_b then raise exception 'B is already submitted and locked'; end if;
    update public.couple_sessions
    set answers_b = p_answers, submitted_b = coalesce(p_submit, false), updated_at = now()
    where id = s.id;
  end if;

  return jsonb_build_object('ok', true, 'role', v_role, 'submitted', coalesce(p_submit, false));
end;
$$;

create or replace function public.save_ecr_answers(
  p_code text,
  p_token uuid,
  p_answers jsonb,
  p_submit boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.couple_sessions%rowtype;
  v_role text;
begin
  select * into s
  from public.couple_sessions
  where code = p_code and expires_at > now()
  for update;

  if not found then raise exception 'Session not found or expired'; end if;
  if s.token_a = p_token then v_role := 'A';
  elsif s.token_b = p_token then v_role := 'B';
  else raise exception 'Invalid member token';
  end if;

  if not public._valid_scale_answers(p_answers, 36, 7) then
    raise exception 'ECR-R answers must contain exactly 36 values using null or integers from 1 to 7';
  end if;
  if coalesce(p_submit, false) and exists (
    select 1 from jsonb_array_elements(p_answers) as answer
    where jsonb_typeof(answer) <> 'number'
  ) then
    raise exception 'All 36 ECR-R answers are required before submission';
  end if;

  if v_role = 'A' then
    if s.ecr_submitted_a then raise exception 'A ECR-R is already submitted and locked'; end if;
    update public.couple_sessions
    set ecr_answers_a = p_answers,
        ecr_submitted_a = coalesce(p_submit, false),
        updated_at = now()
    where id = s.id;
  else
    if s.ecr_submitted_b then raise exception 'B ECR-R is already submitted and locked'; end if;
    update public.couple_sessions
    set ecr_answers_b = p_answers,
        ecr_submitted_b = coalesce(p_submit, false),
        updated_at = now()
    where id = s.id;
  end if;

  return jsonb_build_object('ok', true, 'role', v_role, 'submitted', coalesce(p_submit, false));
end;
$$;

create or replace function public.save_dci_data(
  p_code text,
  p_token uuid,
  p_answers jsonb,
  p_scores jsonb,
  p_submit boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.couple_sessions%rowtype;
  v_role text;
  v_answers_complete boolean;
  v_answers_empty boolean;
  v_scores_available boolean;
begin
  select * into s
  from public.couple_sessions
  where code = p_code and expires_at > now()
  for update;

  if not found then raise exception 'Session not found or expired'; end if;
  if s.token_a = p_token then v_role := 'A';
  elsif s.token_b = p_token then v_role := 'B';
  else raise exception 'Invalid member token';
  end if;

  if not public._valid_scale_answers(p_answers, 37, 5) then
    raise exception 'DCI answers must contain exactly 37 values using null or integers from 1 to 5';
  end if;
  if not public._valid_dci_scores(p_scores) then
    raise exception 'DCI scores contain an unknown field or an out-of-range value';
  end if;

  select not exists (
    select 1 from jsonb_array_elements(p_answers) as answer where jsonb_typeof(answer) <> 'number'
  ) into v_answers_complete;
  select not exists (
    select 1 from jsonb_array_elements(p_answers) as answer where jsonb_typeof(answer) <> 'null'
  ) into v_answers_empty;
  select exists (
    select 1 from jsonb_each(p_scores) as score where jsonb_typeof(score.value) = 'number'
  ) into v_scores_available;

  -- Complete item-level responses are always rescored on the server with the
  -- official DCI-37 key. This prevents stored scores from drifting from the
  -- submitted answers even if a client is modified or outdated.
  if v_answers_complete then
    p_scores := public._score_dci_answers(p_answers);
    v_scores_available := true;
  end if;

  if coalesce(p_submit, false) and not (v_answers_complete or (v_answers_empty and v_scores_available)) then
    raise exception 'Submit either all 37 authorized DCI answers or at least one valid manual DCI score';
  end if;

  if v_role = 'A' then
    if s.dci_submitted_a then raise exception 'A DCI is already submitted and locked'; end if;
    update public.couple_sessions
    set dci_answers_a = p_answers,
        dci_scores_a = p_scores,
        dci_submitted_a = coalesce(p_submit, false),
        updated_at = now()
    where id = s.id;
  else
    if s.dci_submitted_b then raise exception 'B DCI is already submitted and locked'; end if;
    update public.couple_sessions
    set dci_answers_b = p_answers,
        dci_scores_b = p_scores,
        dci_submitted_b = coalesce(p_submit, false),
        updated_at = now()
    where id = s.id;
  end if;

  return jsonb_build_object('ok', true, 'role', v_role, 'submitted', coalesce(p_submit, false));
end;
$$;

create or replace function public.save_relationship_measure(
  p_code text,
  p_token uuid,
  p_measure text,
  p_answers jsonb,
  p_submit boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.couple_sessions%rowtype;
  v_role text;
  v_complete boolean;
  v_score jsonb := '{}'::jsonb;
begin
  if p_measure not in ('csi', 'gmsex', 'nsss', 'kos', 'rfs') then raise exception 'Unknown relationship measure'; end if;
  select * into s from public.couple_sessions where code = p_code and expires_at > now() for update;
  if not found then raise exception 'Session not found or expired'; end if;
  if s.token_a = p_token then v_role := 'A';
  elsif s.token_b = p_token then v_role := 'B';
  else raise exception 'Invalid member token';
  end if;

  if p_measure = 'csi' and not public._valid_csi_answers(p_answers) then
    raise exception 'CSI answers must contain exactly 32 values in the required ranges';
  elsif p_measure = 'gmsex' and not public._valid_scale_answers(p_answers, 5, 7) then
    raise exception 'GMSEX answers must contain exactly 5 values using null or integers from 1 to 7';
  elsif p_measure = 'nsss' and not public._valid_scale_answers(p_answers, 12, 5) then
    raise exception 'NSSS-S answers must contain exactly 12 values using null or integers from 1 to 5';
  elsif p_measure = 'kos' and not public._valid_scale_answers(p_answers, 18, 5) then
    raise exception 'KOS answers must contain exactly 18 values using null or integers from 1 to 5';
  elsif p_measure = 'rfs' and not public._valid_scale_answers(p_answers, 12, 5) then
    raise exception 'RFS answers must contain exactly 12 values using null or integers from 1 to 5';
  end if;
  select not exists (select 1 from jsonb_array_elements(p_answers) as answer where jsonb_typeof(answer) <> 'number') into v_complete;
  if coalesce(p_submit, false) and not v_complete then raise exception 'All measure answers are required before submission'; end if;
  if v_complete then
    v_score := case p_measure
      when 'csi' then public._score_csi_answers(p_answers)
      when 'gmsex' then public._score_gmsex_answers(p_answers)
      when 'nsss' then public._score_nsss_answers(p_answers)
      when 'kos' then public._score_kos_answers(p_answers)
      when 'rfs' then public._score_rfs_answers(p_answers)
    end;
  end if;

  if p_measure = 'csi' and v_role = 'A' then
    if s.csi_submitted_a then raise exception 'A CSI is already submitted and locked'; end if;
    update public.couple_sessions set csi_answers_a=p_answers,csi_scores_a=v_score,csi_submitted_a=coalesce(p_submit,false),updated_at=now() where id=s.id;
  elsif p_measure = 'csi' then
    if s.csi_submitted_b then raise exception 'B CSI is already submitted and locked'; end if;
    update public.couple_sessions set csi_answers_b=p_answers,csi_scores_b=v_score,csi_submitted_b=coalesce(p_submit,false),updated_at=now() where id=s.id;
  elsif p_measure = 'gmsex' and v_role = 'A' then
    if s.gmsex_submitted_a then raise exception 'A GMSEX is already submitted and locked'; end if;
    update public.couple_sessions set gmsex_answers_a=p_answers,gmsex_scores_a=v_score,gmsex_submitted_a=coalesce(p_submit,false),updated_at=now() where id=s.id;
  elsif p_measure = 'gmsex' then
    if s.gmsex_submitted_b then raise exception 'B GMSEX is already submitted and locked'; end if;
    update public.couple_sessions set gmsex_answers_b=p_answers,gmsex_scores_b=v_score,gmsex_submitted_b=coalesce(p_submit,false),updated_at=now() where id=s.id;
  elsif p_measure = 'nsss' and v_role = 'A' then
    if s.nsss_submitted_a then raise exception 'A NSSS-S is already submitted and locked'; end if;
    update public.couple_sessions set nsss_answers_a=p_answers,nsss_scores_a=v_score,nsss_submitted_a=coalesce(p_submit,false),updated_at=now() where id=s.id;
  elsif p_measure = 'nsss' then
    if s.nsss_submitted_b then raise exception 'B NSSS-S is already submitted and locked'; end if;
    update public.couple_sessions set nsss_answers_b=p_answers,nsss_scores_b=v_score,nsss_submitted_b=coalesce(p_submit,false),updated_at=now() where id=s.id;
  elsif p_measure = 'kos' and v_role = 'A' then
    if s.kos_submitted_a then raise exception 'A KOS is already submitted and locked'; end if;
    update public.couple_sessions set kos_answers_a=p_answers,kos_scores_a=v_score,kos_submitted_a=coalesce(p_submit,false),updated_at=now() where id=s.id;
  elsif p_measure = 'kos' then
    if s.kos_submitted_b then raise exception 'B KOS is already submitted and locked'; end if;
    update public.couple_sessions set kos_answers_b=p_answers,kos_scores_b=v_score,kos_submitted_b=coalesce(p_submit,false),updated_at=now() where id=s.id;
  elsif p_measure = 'rfs' and v_role = 'A' then
    if s.rfs_submitted_a then raise exception 'A RFS is already submitted and locked'; end if;
    update public.couple_sessions set rfs_answers_a=p_answers,rfs_scores_a=v_score,rfs_submitted_a=coalesce(p_submit,false),updated_at=now() where id=s.id;
  else
    if s.rfs_submitted_b then raise exception 'B RFS is already submitted and locked'; end if;
    update public.couple_sessions set rfs_answers_b=p_answers,rfs_scores_b=v_score,rfs_submitted_b=coalesce(p_submit,false),updated_at=now() where id=s.id;
  end if;
  return jsonb_build_object('ok', true, 'role', v_role, 'measure', p_measure, 'submitted', coalesce(p_submit, false), 'score', v_score);
end;
$$;

create or replace function public.save_promis_sexfs(
  p_code text,
  p_token uuid,
  p_response jsonb,
  p_submit boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.couple_sessions%rowtype;
  v_role text;
  v_answered integer;
  v_required integer;
  v_score jsonb := '{}'::jsonb;
begin
  if not public._valid_promis_response(p_response) then raise exception 'Invalid PROMIS SexFS response'; end if;
  v_answered := public._promis_answered_count(p_response);
  v_required := public._promis_required_count(p_response);
  if coalesce(p_submit, false) and v_answered <> v_required then raise exception 'Complete the applicable PROMIS SexFS branch before submission'; end if;
  if v_answered = v_required then v_score := public._score_promis_response(p_response); end if;

  select * into s from public.couple_sessions where code = p_code and expires_at > now() for update;
  if not found then raise exception 'Session not found or expired'; end if;
  if s.token_a = p_token then v_role := 'A';
  elsif s.token_b = p_token then v_role := 'B';
  else raise exception 'Invalid member token';
  end if;

  if v_role = 'A' then
    if s.promis_submitted_a then raise exception 'A PROMIS SexFS is already submitted and locked'; end if;
    update public.couple_sessions set promis_response_a=p_response,promis_scores_a=v_score,promis_submitted_a=coalesce(p_submit,false),updated_at=now() where id=s.id;
  else
    if s.promis_submitted_b then raise exception 'B PROMIS SexFS is already submitted and locked'; end if;
    update public.couple_sessions set promis_response_b=p_response,promis_scores_b=v_score,promis_submitted_b=coalesce(p_submit,false),updated_at=now() where id=s.id;
  end if;
  return jsonb_build_object('ok', true, 'role', v_role, 'submitted', coalesce(p_submit,false), 'answeredCount', v_answered, 'requiredCount', v_required, 'score', v_score);
end;
$$;

create or replace function public.get_couple_session(p_code text, p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.couple_sessions%rowtype;
  v_role text;
begin
  select * into s
  from public.couple_sessions
  where code = p_code and expires_at > now();

  if not found then raise exception 'Session not found or expired'; end if;
  if s.token_a = p_token then v_role := 'A';
  elsif s.token_b = p_token then v_role := 'B';
  else raise exception 'Invalid member token';
  end if;

  return jsonb_build_object(
    'code', s.code,
    'role', v_role,
    'submittedA', s.submitted_a,
    'submittedB', s.submitted_b,
    'answeredCountA', (
      select count(*) from jsonb_array_elements(s.answers_a) as answer
      where jsonb_typeof(answer) = 'number'
    ),
    'answeredCountB', (
      select count(*) from jsonb_array_elements(s.answers_b) as answer
      where jsonb_typeof(answer) = 'number'
    ),
    'myAnswers', case when v_role = 'A' then s.answers_a else s.answers_b end,
    'answersA', case when s.submitted_a and s.submitted_b then s.answers_a else null end,
    'answersB', case when s.submitted_a and s.submitted_b then s.answers_b else null end,
    'ecrSubmittedA', s.ecr_submitted_a,
    'ecrSubmittedB', s.ecr_submitted_b,
    'ecrAnsweredCountA', (
      select count(*) from jsonb_array_elements(s.ecr_answers_a) as answer
      where jsonb_typeof(answer) = 'number'
    ),
    'ecrAnsweredCountB', (
      select count(*) from jsonb_array_elements(s.ecr_answers_b) as answer
      where jsonb_typeof(answer) = 'number'
    ),
    'myEcrAnswers', case when v_role = 'A' then s.ecr_answers_a else s.ecr_answers_b end,
    'ecrAnswersA', case when s.ecr_submitted_a and s.ecr_submitted_b then s.ecr_answers_a else null end,
    'ecrAnswersB', case when s.ecr_submitted_a and s.ecr_submitted_b then s.ecr_answers_b else null end,
    'dciSubmittedA', s.dci_submitted_a,
    'dciSubmittedB', s.dci_submitted_b,
    'dciAnsweredCountA', (
      select count(*) from jsonb_array_elements(s.dci_answers_a) as answer
      where jsonb_typeof(answer) = 'number'
    ),
    'dciAnsweredCountB', (
      select count(*) from jsonb_array_elements(s.dci_answers_b) as answer
      where jsonb_typeof(answer) = 'number'
    ),
    'myDciAnswers', case when v_role = 'A' then s.dci_answers_a else s.dci_answers_b end,
    'myDciScores', case when v_role = 'A' then s.dci_scores_a else s.dci_scores_b end,
    'dciAnswersA', case when s.dci_submitted_a and s.dci_submitted_b then s.dci_answers_a else null end,
    'dciAnswersB', case when s.dci_submitted_a and s.dci_submitted_b then s.dci_answers_b else null end,
    'dciScoresA', case when s.dci_submitted_a and s.dci_submitted_b then s.dci_scores_a else null end,
    'dciScoresB', case when s.dci_submitted_a and s.dci_submitted_b then s.dci_scores_b else null end,
    'csiSubmittedA', s.csi_submitted_a,
    'csiSubmittedB', s.csi_submitted_b,
    'csiAnsweredCountA', (select count(*) from jsonb_array_elements(s.csi_answers_a) as answer where jsonb_typeof(answer) = 'number'),
    'csiAnsweredCountB', (select count(*) from jsonb_array_elements(s.csi_answers_b) as answer where jsonb_typeof(answer) = 'number'),
    'myCsiAnswers', case when v_role = 'A' then s.csi_answers_a else s.csi_answers_b end,
    'csiAnswersA', case when s.csi_submitted_a and s.csi_submitted_b then s.csi_answers_a else null end,
    'csiAnswersB', case when s.csi_submitted_a and s.csi_submitted_b then s.csi_answers_b else null end,
    'csiScoresA', case when s.csi_submitted_a and s.csi_submitted_b then s.csi_scores_a else null end,
    'csiScoresB', case when s.csi_submitted_a and s.csi_submitted_b then s.csi_scores_b else null end,
    'gmsexSubmittedA', s.gmsex_submitted_a,
    'gmsexSubmittedB', s.gmsex_submitted_b,
    'gmsexAnsweredCountA', (select count(*) from jsonb_array_elements(s.gmsex_answers_a) as answer where jsonb_typeof(answer) = 'number'),
    'gmsexAnsweredCountB', (select count(*) from jsonb_array_elements(s.gmsex_answers_b) as answer where jsonb_typeof(answer) = 'number'),
    'myGmsexAnswers', case when v_role = 'A' then s.gmsex_answers_a else s.gmsex_answers_b end,
    'gmsexAnswersA', case when s.gmsex_submitted_a and s.gmsex_submitted_b then s.gmsex_answers_a else null end,
    'gmsexAnswersB', case when s.gmsex_submitted_a and s.gmsex_submitted_b then s.gmsex_answers_b else null end,
    'gmsexScoresA', case when s.gmsex_submitted_a and s.gmsex_submitted_b then s.gmsex_scores_a else null end,
    'gmsexScoresB', case when s.gmsex_submitted_a and s.gmsex_submitted_b then s.gmsex_scores_b else null end,
    'nsssSubmittedA', s.nsss_submitted_a,
    'nsssSubmittedB', s.nsss_submitted_b,
    'nsssAnsweredCountA', (select count(*) from jsonb_array_elements(s.nsss_answers_a) as answer where jsonb_typeof(answer) = 'number'),
    'nsssAnsweredCountB', (select count(*) from jsonb_array_elements(s.nsss_answers_b) as answer where jsonb_typeof(answer) = 'number'),
    'myNsssAnswers', case when v_role = 'A' then s.nsss_answers_a else s.nsss_answers_b end,
    'nsssAnswersA', case when s.nsss_submitted_a and s.nsss_submitted_b then s.nsss_answers_a else null end,
    'nsssAnswersB', case when s.nsss_submitted_a and s.nsss_submitted_b then s.nsss_answers_b else null end,
    'nsssScoresA', case when s.nsss_submitted_a and s.nsss_submitted_b then s.nsss_scores_a else null end,
    'nsssScoresB', case when s.nsss_submitted_a and s.nsss_submitted_b then s.nsss_scores_b else null end,
    'kosSubmittedA', s.kos_submitted_a,
    'kosSubmittedB', s.kos_submitted_b,
    'kosAnsweredCountA', (select count(*) from jsonb_array_elements(s.kos_answers_a) as answer where jsonb_typeof(answer) = 'number'),
    'kosAnsweredCountB', (select count(*) from jsonb_array_elements(s.kos_answers_b) as answer where jsonb_typeof(answer) = 'number'),
    'myKosAnswers', case when v_role = 'A' then s.kos_answers_a else s.kos_answers_b end,
    'kosAnswersA', case when s.kos_submitted_a and s.kos_submitted_b then s.kos_answers_a else null end,
    'kosAnswersB', case when s.kos_submitted_a and s.kos_submitted_b then s.kos_answers_b else null end,
    'kosScoresA', case when s.kos_submitted_a and s.kos_submitted_b then s.kos_scores_a else null end,
    'kosScoresB', case when s.kos_submitted_a and s.kos_submitted_b then s.kos_scores_b else null end,
    'promisSubmittedA', s.promis_submitted_a,
    'promisSubmittedB', s.promis_submitted_b,
    'promisAnsweredCountA', public._promis_answered_count(s.promis_response_a),
    'promisAnsweredCountB', public._promis_answered_count(s.promis_response_b),
    'promisRequiredCountA', public._promis_required_count(s.promis_response_a),
    'promisRequiredCountB', public._promis_required_count(s.promis_response_b),
    'myPromisResponse', case when v_role = 'A' then s.promis_response_a else s.promis_response_b end,
    'promisResponseA', case when s.promis_submitted_a and s.promis_submitted_b then s.promis_response_a else null end,
    'promisResponseB', case when s.promis_submitted_a and s.promis_submitted_b then s.promis_response_b else null end,
    'promisScoresA', case when s.promis_submitted_a and s.promis_submitted_b then s.promis_scores_a else null end,
    'promisScoresB', case when s.promis_submitted_a and s.promis_submitted_b then s.promis_scores_b else null end,
    'rfsSubmittedA', s.rfs_submitted_a,
    'rfsSubmittedB', s.rfs_submitted_b,
    'rfsAnsweredCountA', (select count(*) from jsonb_array_elements(s.rfs_answers_a) as answer where jsonb_typeof(answer) = 'number'),
    'rfsAnsweredCountB', (select count(*) from jsonb_array_elements(s.rfs_answers_b) as answer where jsonb_typeof(answer) = 'number'),
    'myRfsAnswers', case when v_role = 'A' then s.rfs_answers_a else s.rfs_answers_b end,
    'rfsAnswersA', case when s.rfs_submitted_a and s.rfs_submitted_b then s.rfs_answers_a else null end,
    'rfsAnswersB', case when s.rfs_submitted_a and s.rfs_submitted_b then s.rfs_answers_b else null end,
    'rfsScoresA', case when s.rfs_submitted_a and s.rfs_submitted_b then s.rfs_scores_a else null end,
    'rfsScoresB', case when s.rfs_submitted_a and s.rfs_submitted_b then s.rfs_scores_b else null end,
    'spaffEvents', case when s.submitted_a and s.submitted_b then s.spaff_events else '[]'::jsonb end,
    'spaffRatings', case when s.submitted_a and s.submitted_b then s.spaff_ratings else '{"A": {}, "B": {}}'::jsonb end,
    'expiresAt', s.expires_at,
    'updatedAt', s.updated_at
  );
end;
$$;

create or replace function public.save_spaff_observation(
  p_code text,
  p_token uuid,
  p_events jsonb,
  p_ratings jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.couple_sessions%rowtype;
begin
  select * into s
  from public.couple_sessions
  where code = p_code and expires_at > now()
  for update;

  if not found then raise exception 'Session not found or expired'; end if;
  if s.token_a <> p_token and s.token_b <> p_token then raise exception 'Invalid member token'; end if;
  if not (s.submitted_a and s.submitted_b) then raise exception 'Both partners must submit CPQ first'; end if;
  if not public._valid_observation_events(p_events) then raise exception 'Invalid observation event data'; end if;
  if not public._valid_spaff_ratings(p_ratings) then raise exception 'Invalid SPAFF-informed rating data'; end if;

  update public.couple_sessions
  set spaff_events = p_events, spaff_ratings = p_ratings, updated_at = now()
  where id = s.id;
  return jsonb_build_object('ok', true, 'count', jsonb_array_length(p_events));
end;
$$;

create or replace function public.delete_couple_session(p_code text, p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.couple_sessions
  where code = p_code and (token_a = p_token or token_b = p_token);
  get diagnostics v_deleted = row_count;
  if v_deleted = 0 then raise exception 'Session not found or invalid member token'; end if;
  return jsonb_build_object('ok', true);
end;
$$;

revoke execute on function public._pin_matches(text, text) from public, anon, authenticated;
revoke execute on function public._valid_cpq_answers(jsonb) from public, anon, authenticated;
revoke execute on function public._valid_scale_answers(jsonb, integer, integer) from public, anon, authenticated;
revoke execute on function public._valid_dci_scores(jsonb) from public, anon, authenticated;
revoke execute on function public._score_dci_answers(jsonb) from public, anon, authenticated;
revoke execute on function public._valid_csi_answers(jsonb) from public, anon, authenticated;
revoke execute on function public._score_csi_answers(jsonb) from public, anon, authenticated;
revoke execute on function public._score_gmsex_answers(jsonb) from public, anon, authenticated;
revoke execute on function public._score_nsss_answers(jsonb) from public, anon, authenticated;
revoke execute on function public._score_kos_answers(jsonb) from public, anon, authenticated;
revoke execute on function public._valid_promis_response(jsonb) from public, anon, authenticated;
revoke execute on function public._promis_required_count(jsonb) from public, anon, authenticated;
revoke execute on function public._promis_answered_count(jsonb) from public, anon, authenticated;
revoke execute on function public._score_promis_response(jsonb) from public, anon, authenticated;
revoke execute on function public._score_rfs_answers(jsonb) from public, anon, authenticated;
revoke execute on function public._valid_observation_events(jsonb) from public, anon, authenticated;
revoke execute on function public._valid_spaff_ratings(jsonb) from public, anon, authenticated;

revoke execute on function public.cpq_service_status() from public;
revoke execute on function public.create_couple_session(text) from public;
revoke execute on function public.join_couple_session(text, text) from public;
revoke execute on function public.save_couple_answers(text, uuid, jsonb, boolean) from public;
revoke execute on function public.save_ecr_answers(text, uuid, jsonb, boolean) from public;
revoke execute on function public.save_dci_data(text, uuid, jsonb, jsonb, boolean) from public;
revoke execute on function public.save_relationship_measure(text, uuid, text, jsonb, boolean) from public;
revoke execute on function public.save_promis_sexfs(text, uuid, jsonb, boolean) from public;
revoke execute on function public.get_couple_session(text, uuid) from public;
revoke execute on function public.save_spaff_observation(text, uuid, jsonb, jsonb) from public;
revoke execute on function public.delete_couple_session(text, uuid) from public;

grant execute on function public.create_couple_session(text) to anon, authenticated;
grant execute on function public.cpq_service_status() to anon, authenticated;
grant execute on function public.join_couple_session(text, text) to anon, authenticated;
grant execute on function public.save_couple_answers(text, uuid, jsonb, boolean) to anon, authenticated;
grant execute on function public.save_ecr_answers(text, uuid, jsonb, boolean) to anon, authenticated;
grant execute on function public.save_dci_data(text, uuid, jsonb, jsonb, boolean) to anon, authenticated;
grant execute on function public.save_relationship_measure(text, uuid, text, jsonb, boolean) to anon, authenticated;
grant execute on function public.save_promis_sexfs(text, uuid, jsonb, boolean) to anon, authenticated;
grant execute on function public.get_couple_session(text, uuid) to anon, authenticated;
grant execute on function public.save_spaff_observation(text, uuid, jsonb, jsonb) to anon, authenticated;
grant execute on function public.delete_couple_session(text, uuid) to anon, authenticated;
