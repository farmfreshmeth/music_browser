#!/bin/bash

# render_everything.sh

# Gut-check script to test every item to make sure it
# doesn't crash the app.

base_url="http://localhost:3000"

curl "$base_url/random"
curl "$base_url/wantlist"
curl "$base_url/login"
curl "$base_url/"

folders=$(psql -U farmfreshmeth -d music_browser -c "SELECT value -> 'name_encoded' AS name_encoded FROM folders WHERE key > 1")
for folder in $folders; do
  if [[ $folder =~ ^\"([0-9]{2}[a-zA-Z\%0-9\']+)\"$ ]]; then
    name="${BASH_REMATCH[1]}"
    echo "FOLDER $name"
    curl "$base_url/items?search_str=$name&search_target=folder"
  fi
done

keys=$(psql -U farmfreshmeth -d music_browser -c "SELECT key FROM items")
for key in $keys; do
  if [[ "$key" =~ ^[0-9]+$ ]]; then
    echo "ITEM $key"
    curl "$base_url/item/$key"
  fi
done
