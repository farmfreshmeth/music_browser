/*
  remove_duplicate_fields.js

  Bug in fetch spotify ids created duplicate field 6
  records.
*/

const PG = require('../../pg.js');
let pg = new PG();

(async () => {
  let query = `SELECT * FROM items ORDER BY key ASC`;
  let res = await pg.client.query(query);
  let items = res.rows;

  for (let i = 0; i < items.length; i++) {
    let item = items[i].value;
    let new_data = [];

    if (item && item.custom_data) {
      item.custom_data.forEach((field) => {
        if (!(new_data.length > 0 && new_data.some(n => n.field_id == field.field_id))) {
          new_data.push(field);
        }
      });
      item.custom_data = new_data;
      await pg.set('items', item.id, item);
      console.log(`KEY ${item.id} OLD ${item.custom_data.length} NEW ${new_data.length}`);
    } else {
      console.log(`KEY ${item.id} NO custom_data`);
    }
  }
})();
