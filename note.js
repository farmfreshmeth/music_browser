/*
  notes.js model
*/

const PG = require('./pg.js');
let pg = new PG();

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

Note.get = async function (resource_type, resource_id) {
  let query = `
    SELECT
      notes.id AS id,
      notes.resource_type,
      notes.resource_id,
      notes.created_at,
      notes.created_by,
      notes.note,
      users.id AS user_id,
      users.first_name || ' ' || users.last_name AS user_fullname
    FROM notes
    LEFT JOIN users ON notes.created_by = users.id
    WHERE resource_type = $1 AND resource_id = $2
  `;
  try {
    let res = await pg.client.query(query, [resource_type, resource_id]);
    if (res.rows[0]) {
      let note = new this (
          res.rows[0].user_id,
          res.rows[0].resource_type,
          res.rows[0].resource_id,
          res.rows[0].note,
        );
      note.id = res.rows[0].id;
      note.user_fullname = res.rows[0].user_fullname;
      return note;
    } else {
      return new Error(`note not found ${resource_type}/${resource_id}`)
    }
  } catch (err) {
    return err;
  }
};

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

// TODO Note.search return item, track, or folder (or is this in Collection?)

module.exports = Note;