/*
  provision_db.sql
    Bootstraps a music_browser postgres database from bare install

  Before you can run this, do this by hand
    $ psql postgres
    postgres=# CREATE ROLE farmfreshmeth WITH LOGIN CREATEDB;
    CREATE ROLE
    postgres=# CREATE DATABASE music_browser WITH OWNER farmfreshmeth;
    CREATE DATABASE
    postgres=# CREATE DATABASE music_browser_test WITH OWNER farmfreshmeth;
    CREATE DATABASE
    postgres=# quit

  Usage:
    $ psql -U farmfreshmeth -d music_browser -f scripts/provision_db.sql
    $ psql -U farmfreshmeth -d music_browser_test -f scripts/provision_db.sql
    $ heroku pg:psql postgresql-shaped-78815 --app music-browser -f scripts/provision_db.sql
*/

---- Initial schema ----
DROP TABLE IF EXISTS folders, fields, items, lyrics, state, log CASCADE;

CREATE TABLE folders (
  key         integer PRIMARY KEY,
  value       jsonb
);
CREATE UNIQUE INDEX folders_pk ON folders (key);

CREATE TABLE fields (
  key         integer PRIMARY KEY,
  value       jsonb
);
CREATE UNIQUE INDEX fields_pk ON fields (key);

CREATE TABLE items (
  key         integer PRIMARY KEY,
  value       jsonb
);
CREATE UNIQUE INDEX items_pk ON items (key);

---- Migration 20240402 ----
CREATE INDEX idx_items ON items USING GIN (value);
CREATE INDEX idx_artists_sort ON items USING GIN ((value -> 'artists_sort'));
CREATE INDEX idx_release_title ON items USING GIN ((value -> 'title'));
CREATE INDEX idx_release_artists ON items USING GIN ((value -> 'artists'));

---- Migration 20240406 ----
CREATE TABLE lyrics (
  item_key        integer,
  artist          varchar(100),
  track_title     varchar(255),
  track_position  varchar(20),
  lyrics          text,
  PRIMARY KEY (item_key, track_position)
);
CREATE INDEX fk_item_key ON lyrics (item_key);
CREATE INDEX idx_track_position ON lyrics (track_position);
CREATE INDEX idx_track_title ON lyrics (track_title);

CREATE TABLE state (
  key           integer PRIMARY KEY,
  value         jsonb
);
CREATE UNIQUE INDEX state_pk ON state (key);

CREATE TABLE log (
  ts            timestamp with time zone NOT NULL DEFAULT NOW(),
  env           varchar(40),
  job           varchar(40),
  level         varchar(20),
  message       text
);
CREATE INDEX idx_ts ON log (ts);
