-- F. Relational schema (PostgreSQL dialect). NOT used by the prototype, which
-- keeps everything in the browser. This is the target model for when Frontier
-- approves persistence. Content tables mirror src/content/*.ts.
--
-- Design notes
--  * All content is versioned via assessment_version; sessions pin a version so
--    results are reproducible.
--  * Identifying contact info lives ONLY in contact_request, linked to a session
--    by id, so assessment data can be retained/deleted separately.
--  * Nothing here should be written without a consent_record.

-- ───────────── Content (versioned)
CREATE TABLE assessment_version (
  id              text PRIMARY KEY,            -- e.g. 'qb-2026.11-v1'
  signal_version  text NOT NULL,               -- e.g. 'sig-2026.11-v1'
  matching_version text NOT NULL,              -- e.g. 'match-2026.11-v1'
  title           text NOT NULL,
  config_json     jsonb NOT NULL,              -- site copy, weights snapshot
  published_at    timestamptz,
  retired_at      timestamptz
);

CREATE TABLE gift_category (
  id          text PRIMARY KEY,                -- prophecy | serving | ...
  name        text NOT NULL,
  reference   text NOT NULL,                   -- 'Romans 12:6'
  paraphrase  text NOT NULL,                   -- paraphrase, not quotation
  across_teams text NOT NULL
);

CREATE TABLE ministry_area (
  id                 text PRIMARY KEY,         -- tech | welcome | ...
  version_id         text NOT NULL REFERENCES assessment_version(id),
  name               text NOT NULL,
  heart              text NOT NULL,
  short_description  text NOT NULL,
  includes           text[] NOT NULL,
  distinctions       text[] NOT NULL,
  default_first_step text NOT NULL,
  placement_requirements text                  -- safeguarding etc. (Frontier-owned)
);

CREATE TABLE ministry_area_gift (               -- proposed applications, not mandates
  ministry_area_id text REFERENCES ministry_area(id),
  gift_id          text REFERENCES gift_category(id),
  PRIMARY KEY (ministry_area_id, gift_id)
);

CREATE TABLE ministry_opportunity (             -- only what Frontier has configured
  id               uuid PRIMARY KEY,
  ministry_area_id text NOT NULL REFERENCES ministry_area(id),
  title            text NOT NULL,
  description      text,
  beginner_friendly boolean NOT NULL DEFAULT true,
  active           boolean NOT NULL DEFAULT true
);

CREATE TABLE question (
  id           text NOT NULL,                  -- stable id, e.g. 'c2_arrive'
  version_id   text NOT NULL REFERENCES assessment_version(id),
  chapter      text NOT NULL,
  tier         text NOT NULL CHECK (tier IN ('core','followup','deeper')),
  format       text NOT NULL,
  prompt       text NOT NULL,
  helper       text,
  story_line   text,
  max_selections int,
  max_length   int,
  skippable    boolean NOT NULL,
  why          text NOT NULL,
  not_proves   text NOT NULL,
  ambiguity    text NOT NULL,
  barometer_json jsonb,                        -- anchors, scaled signals
  followup_team text REFERENCES ministry_area(id),
  sort_order   int NOT NULL,
  PRIMARY KEY (id, version_id)
);

CREATE TABLE answer_option (
  id          text NOT NULL,
  question_id text NOT NULL,
  version_id  text NOT NULL,
  label       text NOT NULL,
  because     text,                            -- explanation fragment
  neutral     boolean NOT NULL DEFAULT false,
  opt_out_area text REFERENCES ministry_area(id),
  sort_order  int NOT NULL,
  PRIMARY KEY (id, question_id, version_id),
  FOREIGN KEY (question_id, version_id) REFERENCES question(id, version_id)
);

CREATE TABLE signal_mapping (                   -- option → signal weights
  id          bigserial PRIMARY KEY,
  option_id   text NOT NULL,
  question_id text NOT NULL,
  version_id  text NOT NULL,
  dimension   text NOT NULL CHECK (dimension IN ('team','gift','skill','learning','readiness','practical')),
  key         text NOT NULL,                   -- team/gift/skill id, readiness value…
  weight      numeric(4,2),
  FOREIGN KEY (option_id, question_id, version_id) REFERENCES answer_option(id, question_id, version_id)
);

CREATE TABLE branch_rule (
  question_id text NOT NULL,
  version_id  text NOT NULL,
  condition_json jsonb NOT NULL,               -- {anyOf:[{q,includesAny}|{q,atLeast}]}
  PRIMARY KEY (question_id, version_id),
  FOREIGN KEY (question_id, version_id) REFERENCES question(id, version_id)
);

CREATE TABLE signal_rule (                      -- free-text lexicon
  id          text NOT NULL,                   -- 'tech.audio'
  signal_version text NOT NULL,
  patterns    text[] NOT NULL,
  team_id     text REFERENCES ministry_area(id),
  gift_id     text REFERENCES gift_category(id),
  skill       text,
  weight      numeric(4,2) NOT NULL,
  team_core   boolean NOT NULL DEFAULT false,
  PRIMARY KEY (id, signal_version)
);

-- ───────────── Participant data (sensitive; minimal; consent-gated)
CREATE TABLE assessment_session (
  id          uuid PRIMARY KEY,
  version_id  text NOT NULL REFERENCES assessment_version(id),
  started_at  timestamptz NOT NULL,
  completed_at timestamptz,
  took_deeper boolean NOT NULL DEFAULT false,
  delete_after timestamptz NOT NULL            -- retention (Frontier to set)
  -- no name/email/IP here
);

CREATE TABLE consent_record (
  id           uuid PRIMARY KEY,
  session_id   uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  share_summary boolean NOT NULL,
  request_follow_up boolean NOT NULL,
  include_written boolean NOT NULL,
  consent_text_version text NOT NULL,
  recorded_at  timestamptz NOT NULL
);

CREATE TABLE response (                         -- store only if consent includes it
  session_id  uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  value_json  jsonb NOT NULL,                  -- choice ids / scale / text (text only if include_written)
  skipped     boolean NOT NULL DEFAULT false,
  PRIMARY KEY (session_id, question_id)
);

CREATE TABLE derived_signal (                   -- provenance, no raw narratives
  id          bigserial PRIMARY KEY,
  session_id  uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  layer       text NOT NULL,
  question_id text NOT NULL,
  rule_id     text NOT NULL,
  phrase      text,                            -- matched phrase only (short)
  team_id     text,
  gift_id     text,
  skill       text,
  weight      numeric(5,3) NOT NULL,
  interpretation text NOT NULL,
  counted     boolean NOT NULL
);

CREATE TABLE match_result (
  session_id  uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  team_id     text NOT NULL REFERENCES ministry_area(id),
  tier        text CHECK (tier IN ('strong','also')),
  tied        boolean NOT NULL DEFAULT false,
  fit         numeric(5,3) NOT NULL,           -- internal heuristic, never shown
  excluded_reason text,
  PRIMARY KEY (session_id, team_id)
);

CREATE TABLE participant_feedback (
  session_id  uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  team_id     text NOT NULL REFERENCES ministry_area(id),
  feedback    text NOT NULL CHECK (feedback IN ('feels_like_me','curious','not_for_me')),
  updated_at  timestamptz NOT NULL,
  PRIMARY KEY (session_id, team_id)
);

CREATE TABLE contact_request (                  -- the ONLY identifying table
  id            uuid PRIMARY KEY,
  session_id    uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  consent_id    uuid NOT NULL REFERENCES consent_record(id),
  preferred_name text,
  email         text,
  contact_method text NOT NULL,
  exploring_only boolean NOT NULL,
  status        text NOT NULL DEFAULT 'new',   -- new | contacted | closed
  delete_after  timestamptz NOT NULL
);
-- Access: leader-facing reads should go through a role with SELECT on
-- contact_request + match_result + participant_feedback only.
