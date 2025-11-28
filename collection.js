/*
  collection.js defines Collection class to handle
    app interaction with the collection in
    local storage.  (wrapper for node-persist)

    routes/views should interact with Collection,
    not Discogs or node-storage directly

    An Item is a Release in the Collection including
    custom fields and folder.

    storage layout is:
    {
      key: "folders", value: {"1": {folder}, "2": {folder},...},
      key: "custom_fields", value: {"id": {custom_field},...},
      key: "item_123456", value: {collection item},
      key: "item_6543210", value: {collection item},
      ...
    }
    -- item keys are numeric strings of varying length
    -- a "Release" corresponds to Discogs "Release" resource
    -- an "Item" is a Release in a Collection (including custom data)
*/

// make safe for single-quoted sql statements
const sanitize = function (str) {
  str = str.trim();
  str = str.replace(/'/g, "''");
  return str;
};

var Collection = function (pg) {
  this.pg = pg;
};

Collection.prototype.length = async function () {
  let res = await this.pg.client.query('SELECT COUNT(*) FROM items');
  return Number(res["rows"][0].count);
};

Collection.prototype.folders = async function () {
  let query = "SELECT value FROM folders WHERE key > 1"; // exclude All & Uncategorized
  let res = await this.pg.client.query(query);
  res.rows = res.rows.sort((a, b) => {
    return a.value.section.localeCompare(b.value.section);
  });
  return res.rows.map((f) => { return f.value; });
};

// Collection.prototype.customFields = async function () {
//   return await this.storage.getItem("custom_fields");
// };

Collection.prototype.getFolderStruct = async function (folder_id) {
  let folder_dict = await this.pg.get("folders", folder_id);
  return {
    id: folder_id,
    name: folder_dict.name,
    crate: folder_dict.crate,
    section: folder_dict.section
  };
};

Collection.prototype.getFieldsStruct = async function (notes) {
  for (let i in notes) {
    let field_dict = await this.pg.get('fields', Number(notes[i]["field_id"]));
    notes[i]["name"] = field_dict.name;
  }
  return notes;
};

Collection.prototype.deepEquals = function (x, y) {
  if (x === y) {
    return true;
  } else if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
    if (Object.keys(x).length != Object.keys(y).length) return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (! this.deepEquals(x[prop], y[prop])) return false;
      } else {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

// all items.  TODO paginate
Collection.prototype.items = async function () {
  let query = `SELECT value FROM items`;
  let res = await this.pg.client.query(query);
  return res.rows.map((f) => { return f.value; });
};

// TODO deep search (all keys/values)
// TODO paginate
// TODO full text search (ts_value)
Collection.prototype.search = async function (search_str, search_target) {
  if (search_str == "") { return [] };
  search_str = sanitize(search_str);
  var regex = new RegExp(search_str, "gi");
  let query;

  switch (search_target) {
    case 'folder':
      query = `
        SELECT
          items.value,
          items.value ->> 'artists_sort' AS artists_sort,
          items.value ->> 'title' AS title
        FROM items
        WHERE (value -> 'folder' @> '{ "name": "${search_str}" }')
        ORDER BY artists_sort ASC, title ASC
      `;
      break;

    case 'artist':
      query = `
        SELECT DISTINCT
          items.value ->> 'artists_sort' AS artists_sort,
          items.value ->> 'title' AS title,
          items.value
        FROM
          items,
          jsonb_array_elements(items.value -> 'artists') release_artists,
          jsonb_array_elements(items.value -> 'tracklist') tracklist
        WHERE
          release_artists ->> 'name' ILIKE '%${search_str}%'
          OR items.value ->> 'artists_sort' ILIKE '%${search_str}%'
          OR tracklist ->> 'artists' ILIKE '%${search_str}%'
        ORDER BY artists_sort ASC, title ASC
      `;
      break;

    case 'item_title':
      query = `
        SELECT
          items.value ->> 'artists_sort' AS artists_sort,
          items.value ->> 'title' AS title,
          items.value
        FROM items
        WHERE items.value ->> 'title' ILIKE '%${search_str}%'
        ORDER BY artists_sort ASC, title ASC
      `;
      break;

    case 'track_title':
      query = `
        SELECT
          items.value ->> 'artists_sort' AS artists_sort,
          items.value ->> 'title' AS title,
          items.value
        FROM
          items,
          jsonb_array_elements(items.value -> 'tracklist') AS tracklist
        WHERE
          tracklist ->> 'title' ILIKE '%${search_str}%'
        ORDER BY artists_sort ASC, title ASC
      `;
      break;

    // TODO require auth
    case 'collection_notes':
      query = `
        SELECT
          items.value ->> 'artists_sort' AS artists_sort,
          items.value ->> 'title' AS title,
          items.value,
          ts_headline(notes.note, to_tsquery('${search_str}')) AS note
        FROM
          items
        RIGHT JOIN notes ON items.key = notes.resource_id::integer
        WHERE
          notes.search @@ to_tsquery('${search_str}')
          AND notes.resource_type = 'item'
        ORDER BY artists_sort ASC, title ASC
      `;
      break;

    // TODO require auth
    case 'discogs_notes':
      query = `
        SELECT
          items.value ->> 'artists_sort' AS artists_sort,
          items.value ->> 'title' AS title,
          items.value
        FROM
          items,
          jsonb_path_query_first(items.value, '$.custom_data[*] ? (@.field_id == 3)."value"') AS note
        WHERE
          note::text ILIKE '%${search_str}%'
        ORDER BY artists_sort ASC, title ASC
      `;
      break;

    case 'release_year':
      query = `
        SELECT
          items.value ->> 'artists_sort' AS artists_sort,
          items.value ->> 'title' AS title,
          items.value
        FROM
          items
        WHERE
          (items.value -> 'year')::integer = ${search_str}
        ORDER BY artists_sort ASC, title ASC
      `;
      break;

    default:
      // NOOP
  }

  let res = await this.pg.client.query(query);
  let items = res.rows.map((i) => {
    i.value = this.addDefaultImage(i.value);
    i.value.collection_note = i.note;
    return i.value;
  });
  return items;
};

Collection.prototype.item = async function (key) {
  try {
    let query = `
      SELECT
        lyrics.item_key AS item_key,
        lyrics.track_position AS track_position,
        lyrics.lyrics,
        items.value
      FROM items LEFT JOIN lyrics ON
        lyrics.item_key = items.key
        AND lyrics.track_position = track_position
      WHERE items.key = $1
    `;
    let values = [key];
    let res = await this.pg.client.query(query, values);
    let tracks = res.rows;

    item = this.mergeLyrics(tracks);
    item = this.addDefaultImage(item);
    item = this.hoistSpotifyId(item);
    return item;
  } catch (err) {
    return undefined;
  };
};

Collection.prototype.lyrics = async function (key) {
  let query = `
    SELECT * FROM lyrics WHERE item_key = $1 AND lyrics IS NOT NULL ORDER BY track_position
  `;
  let values = [key];
  let res = await this.pg.client.query(query, values);
  return res.rows;
};

Collection.prototype.mergeLyrics = function (lyrics_tracks) {
  let item = lyrics_tracks[0].value;
  lyrics_tracks.forEach((row) => {
    for (let i = 0; i < item['tracklist'].length; i++) {
      if (item['tracklist'][i]['position'] == row.track_position) {
        item['tracklist'][i]['lyrics'] = row.lyrics;
      }
    }
  });
  return item;
};

Collection.prototype.addDefaultImage = function (item) {
  let logo = "/images/studio_84_logo.png";
  if (!item.images) {
    item.images = [{
      resource_url: logo,
      uri: logo,
    }];
  }
  if (!item.thumb) {
    item.thumb = logo;
  }
  return item;
};

Collection.prototype.hoistSpotifyId = function (item) {
  for (let i = 0; i < item.custom_data.length; i++) {
    if (item.custom_data[i].field_id == 6) {
      let arr = item.custom_data[i].value.split('/');
      let id = arr[arr.length -1].split('?')[0];
      item.spotify_id = id;
    }
  }
  return item;
};

module.exports = Collection;
