-- F. Relational schema (PostgreSQL dialect). NOT used by the prototype, which
-- keeps everything in the browser. Target model for when Frontier approves
-- persistence. Content tables mirror src/content/*.ts.
--
-- Notes
--  * Content is versioned; sessions pin a version so results are reproducible.
--  * The v2 inventory collects no identifying information. If contact/follow-up
--    is added later, keep it in a separate table with its own consent record.

-- ───────────── Content (versioned)
CREATE TABLE assessment_version (
  id               text PRIMARY KEY,           -- 'gifts-2026.11-v2'
  scoring_version  text NOT NULL,              -- 'score-2026.11-v2'
  scoring_json     jsonb NOT NULL,             -- weights + thresholds snapshot
  published_at     timestamptz,
  retired_at       timestamptz
);

CREATE TABLE gift_category (
  id          text PRIMARY KEY,                -- prophecy | serving | ...
  name        text NOT NULL,
  reference   text NOT NULL,                   -- 'Romans 12:6'
  paraphrase  text NOT NULL,                   -- paraphrase, not quotation
  in_practice text NOT NULL
);

CREATE TABLE ministry_area (
  id                 text PRIMARY KEY,         -- tech | welcome | ...
  name               text NOT NULL,
  heart              text NOT NULL,
  short_description  text NOT NULL,
  default_first_step text NOT NULL,
  placement_requirements text
);

CREATE TABLE gift_team_weight (                -- proposed applications, not mandates
  version_id       text REFERENCES assessment_version(id),
  ministry_area_id text REFERENCES ministry_area(id),
  gift_id          text REFERENCES gift_category(id),
  weight           numeric(3,2) NOT NULL CHECK (weight > 0 AND weight <= 1),
  PRIMARY KEY (version_id, ministry_area_id, gift_id)
);

CREATE TABLE ministry_opportunity (
  id               uuid PRIMARY KEY,
  ministry_area_id text NOT NULL REFERENCES ministry_area(id),
  title            text NOT NULL,
  active           boolean NOT NULL DEFAULT true
);

CREATE TABLE screen (
  id          text NOT NULL,                   -- 'r1', 's_friend'
  version_id  text NOT NULL REFERENCES assessment_version(id),
  kind        text NOT NULL CHECK (kind IN ('ratings','scenario')),
  chapter     text NOT NULL,
  prompt      text NOT NULL,
  helper      text,
  story_line  text,
  sort_order  int NOT NULL,
  PRIMARY KEY (id, version_id)
);

CREATE TABLE gift_item (                       -- rated statement, one gift each
  id          text NOT NULL,                   -- 'mer1'
  version_id  text NOT NULL,
  screen_id   text NOT NULL,
  gift_id     text NOT NULL REFERENCES gift_category(id),
  perspective text NOT NULL CHECK (perspective IN ('self','others')),
  text        text NOT NULL,
  sort_order  int NOT NULL,
  PRIMARY KEY (id, version_id),
  FOREIGN KEY (screen_id, version_id) REFERENCES screen(id, version_id)
);

CREATE TABLE scenario_option (                 -- exactly one per gift per scenario
  id          text NOT NULL,
  screen_id   text NOT NULL,
  version_id  text NOT NULL,
  gift_id     text NOT NULL REFERENCES gift_category(id),
  label       text NOT NULL,
  sort_order  int NOT NULL,
  PRIMARY KEY (id, screen_id, version_id),
  UNIQUE (screen_id, version_id, gift_id),
  FOREIGN KEY (screen_id, version_id) REFERENCES screen(id, version_id)
);

-- ───────────── Participant data (anonymous)
CREATE TABLE assessment_session (
  id           uuid PRIMARY KEY,
  version_id   text NOT NULL REFERENCES assessment_version(id),
  started_at   timestamptz NOT NULL,
  completed_at timestamptz,
  delete_after timestamptz NOT NULL            -- retention (Frontier to set)
);

CREATE TABLE item_response (
  session_id uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  item_id    text NOT NULL,
  rating     smallint CHECK (rating BETWEEN 0 AND 4),  -- NULL = "Not sure"
  PRIMARY KEY (session_id, item_id)
);

CREATE TABLE scenario_response (
  session_id uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  screen_id  text NOT NULL,
  option_id  text NOT NULL,
  PRIMARY KEY (session_id, screen_id)
);

CREATE TABLE gift_score (                       -- internal; never shown as numbers
  session_id uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  gift_id    text NOT NULL REFERENCES gift_category(id),
  score      numeric(4,3),
  level      text CHECK (level IN ('strong','present','emerging')),
  rated_items smallint NOT NULL,
  scenario_picks smallint NOT NULL,
  PRIMARY KEY (session_id, gift_id)
);

CREATE TABLE team_recommendation (
  session_id uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  team_id    text NOT NULL REFERENCES ministry_area(id),
  fit        numeric(4,3) NOT NULL,
  tier       text CHECK (tier IN ('recommended','also')),
  drivers    text[] NOT NULL,
  PRIMARY KEY (session_id, team_id)
);

CREATE TABLE participant_feedback (
  session_id uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  team_id    text NOT NULL REFERENCES ministry_area(id),
  feedback   text NOT NULL CHECK (feedback IN ('feels_like_me','curious','not_for_me')),
  PRIMARY KEY (session_id, team_id)
);
