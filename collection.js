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

Collection.prototype.customFields = async function () {
  return await this.storage.getItem("custom_fields");
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
          items.value ->> 'artists_sort' AS artist,
          items.value ->> 'title' AS title
        FROM items
        WHERE (value -> 'folder' @> '{ "name": "${search_str}" }')
        ORDER BY artist ASC, title ASC
      `;
      break;
    case 'artist':
      query = `
        SELECT
          items.value,
          items.value ->> 'artists_sort' AS artist,
          items.value ->> 'title' AS title
        FROM
          items,
          jsonb_array_elements(value -> 'artists') artist
        WHERE
          artist->>'name' ILIKE '%${search_str}%'
        ORDER BY artist ASC, title ASC
      `;
      break;
    case 'item_title':
      query = `
        SELECT
          items.value,
          items.value ->> 'artists_sort' AS artist,
          items.value ->> 'title' AS title
        FROM items
        WHERE items.value ->> 'title' ILIKE '%${search_str}%'
        ORDER BY artist ASC, title ASC
      `;
      break;
    default:
      // dunno
  }

  let res = await this.pg.client.query(query);
  return res.rows.map((i) => { return i.value; });
};

Collection.prototype.item = async function (key) {
  try {
    let query = `SELECT value FROM items WHERE key = ${key}`;
    let res = await this.pg.client.query(query);
    return res.rows.map((i) => { return i.value; });
  } catch (err) {
    return undefined;
  };
};

module.exports = Collection;
