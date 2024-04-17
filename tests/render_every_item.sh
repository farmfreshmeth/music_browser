#!/bin/bash

# render_every_item.sh

# Gut-check script to test every item to make sure it
# doesn't crash the app.

keys=$(psql -U farmfreshmeth -d music_browser -c "SELECT key FROM items")

for key in $keys; do
  if [[ "$key" =~ ^[0-9]+$ ]]; then
    echo "GET $key"
    curl "http://localhost:3000/item/$key"
  fi
done
