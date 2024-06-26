#!/bin/bash

username=farmfreshmeth
database=music_browser_test

psql -U $username -d $database -f ./scripts/provision_db.sql

psql -U $username -d $database -f ./tests/data/folders.sql
psql -U $username -d $database -f ./tests/data/fields.sql
psql -U $username -d $database -f ./tests/data/items.sql
psql -U $username -d $database -f ./tests/data/lyrics.sql
psql -U $username -d $database -f ./tests/data/users.sql
psql -U $username -d $database -f ./tests/data/notes.sql
psql -U $username -d $database -f ./tests/data/wants.sql

jest --runInBand --detectOpenHandles $@
