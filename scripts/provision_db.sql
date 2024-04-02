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

DROP TABLE IF EXISTS folders, fields, items CASCADE;

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
