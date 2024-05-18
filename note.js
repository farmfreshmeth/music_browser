/*
  notes.js model
*/

const PG = require('./pg.js');
let pg = new PG();
const Collection = require('./collection.js');
let collection = new Collection(pg);

let Note = function (
    user_id,
    resource_type,
    resource_id,
    note
  ) {
  this.user_id = user_id;
  this.resource_type = resource_type;
  this.resource_id = resource_id;
  this.note = note;
};

Note.prototype.set = async function () {
  let query, values;
  if (!this.id) {
    query = `
      INSERT INTO notes (created_by, resource_type, resource_id, note)
      VALUES ($1, $2, $3, $4)
    `;
    values = [
        this.user_id,
        this.resource_type,
        this.resource_id,
        this.note,
      ];
  } else {
    query = `
      UPDATE notes
      SET updated_at = NOW(), note = $2
      WHERE id = $1
    `;
    values = [this.id, this.note];
  }

  try {
    let res = await pg.client.query(query, values);
    return null;
  } catch (err) {
    throw err;
  }
};

const objectifyResults = function (rows) {
  let notes = [];
  rows.forEach((row) => {
    var note = new Note (
        row.user_id,
        row.resource_type,
        row.resource_id,
        row.note,
      );
    note.id = row.id;
    note.user_fullname = row.user_fullname;
    note.created_at = row.created_at;
    notes.push(note);
  });
  return notes;
};

// polymorphism makes this challenging...
// start with item-only notes
Note.getNotesForTag = async function (tag) {
  let query = `
    SELECT
      notes.id AS id,
      notes.resource_type,
      notes.resource_id,
      to_char(notes.created_at, 'Mon DD, YYYY HH:MI pm') AS created_at,
      notes.created_by,
      notes.updated_at,
      notes.note,
      users.id AS user_id,
      users.first_name || ' ' || users.last_name AS user_fullname,
      items.value AS resource
    FROM notes
    LEFT JOIN users ON notes.created_by = users.id
    LEFT JOIN items ON notes.resource_id::integer = items.key
    WHERE note ~ $1 AND resource_type = 'item'
    ORDER BY updated_at DESC
  `;
  let values = [tag];
  let res = await pg.client.query(query, values);
  return res.rows;
};

Note.prototype.getResource = async function () {
  let resource;
  if (this.resource_type == 'folder') {
    resource = await collection.getFolderStruct(this.resource_id);
  } else if (this.resource_type == 'track') {
    let [item_key, track_position] = String(this.resource_id).split(':');
    let item = await collection.item(item_key);
    resource = item.tracklist.find((track) => track.position == track_position);
    resource.item = item;
  } else {
    resource = await collection.item(this.resource_id);
  }
  return resource;
};

Note.getNotesForResource = async function (resource_type, resource_id) {
  let query = `
    SELECT
      notes.id AS id,
      notes.resource_type,
      notes.resource_id,
      to_char(notes.created_at, 'Mon DD, YYYY HH:MI pm') AS created_at,
      notes.created_by,
      notes.updated_at,
      notes.note,
      users.id AS user_id,
      users.first_name || ' ' || users.last_name AS user_fullname
    FROM notes
    LEFT JOIN users ON notes.created_by = users.id
    WHERE resource_type = $1 AND resource_id = $2
    ORDER BY updated_at DESC
  `;
  let res = await pg.client.query(query, [resource_type, resource_id]);
  return objectifyResults(res.rows);
};

// NOTE: the double slash \\s in '[\\s\?\.\!]' is unexpected.  Either
// a bad reading of the docs or a bug in the node-pg lib.  May stop working...
Note.allTags = async function () {
  let query = `
    SELECT token, count(*)
    FROM (
      SELECT regexp_split_to_table(note, '[\\s\?\.\!]') AS token
      FROM notes
    ) AS token
    WHERE token ~ '^#'
    GROUP BY token
    ORDER BY count DESC, token ASC
  `;
  let res = await pg.client.query(query);
  return res.rows;
};

module.exports = Note;


