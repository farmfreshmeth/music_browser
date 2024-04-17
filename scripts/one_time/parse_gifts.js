/*
  one_time/parse_gifts.js
*/

const PG = require('../../pg.js');
let pg = new PG();
const Discogs = require("../../discogs.js");
let discogs = new Discogs();

let FIELD_NUM = 7; // "Gift of"
let query = `
  SELECT
    key,
    value -> 'instance_id' AS instance_id,
    value -> 'artists' -> 0 ->> 'name' AS artist,
    value -> 'title' AS title,
    value ->> 'custom_data' AS data,
    value -> 'folder' -> 'id' AS folder_id
  FROM items
  WHERE value ->> 'custom_data' ILIKE '%from%'
  OR value ->> 'custom_data' ILIKE '%gift%'
`;

const delay = async function (ms = 1050) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

(async () => {
  let res = await pg.client.query(query);

  res.rows.forEach(async (gift) => {
    let giver = '';
    let fields = JSON.parse(gift.data);
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].field_id == 3) {
        let regex = /from (\w+ \w+)/ig;
        let match = regex.exec(fields[i].value);

        if (match) {
          giver = match[1];
          console.log(`Matched '${giver}' (${gift.key})`);

          discogs.updateCustomField(
            gift.key,
            gift.instance_id,
            gift.folder_id,
            FIELD_NUM,
            giver,
            (msg) => {
              console.log(msg); // BUG misleading.  stale values, but POSTs OK
          });
        } else {
          console.log(`No match '${fields[i].value}' (${gift.key})`);
        }
        break;
      }
      await delay();
    }
  });
})();