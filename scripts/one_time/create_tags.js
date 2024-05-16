/*
  scripts/create_tags.js dummies up a bunch of tags for dev/test
*/

const Note = require('../../note.js');
const Collection = require('../../collection.js');
const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const PG = require('../../pg.js');

let pg = new PG();
let collection = new Collection(pg);
let tags = [];

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

const randomTags = function (count) {
  let tags = [];
  for (let i = 0; i < count; i++) {
    tags.push('#' + lorem.generateWords(1));
  }
  return tags.sort();
};

const randomIndexes = function (total, requested) {
  let set = [];
  while (set.length < requested) {
    let idx = Math.floor(Math.random() * total);
    if (set.indexOf(idx) === -1) { set.push(idx); }
  }
  return set.sort((a, b) => a - b);
};

const randomText = function () {
  let text = lorem.generateSentences(2);
  let random_indexes = randomIndexes(tags.length, Math.floor(Math.random() * 4) + 1);
  random_indexes.forEach((idx) => {
    text += ' ' + tags[idx];
  });
  return text;
};

(async () => {
  await pg.client.query(`TRUNCATE TABLE notes RESTART IDENTITY`);

  tags = randomTags(50); // for use by randomText

  let folders = await collection.folders();
  let random_folder_idxs = randomIndexes(folders.length, 4);
  random_folder_idxs.forEach(async (i) => {
    let note = new Note(1, 'folder', folders[i].id, randomText());
    await note.set();
    console.log(`set note for ${folders[i].name}`);
  });

  let random_item_idxs = randomIndexes(await collection.length(), 100);
  let query = `SELECT key FROM items ORDER BY key ASC`;
  let res = await pg.client.query(query);
  random_item_idxs.forEach(async (i) => {
    let note = new Note(1, 'item', res.rows[i].key, randomText());
    await note.set();
    console.log(`set note for item ${res.rows[i].key}`);
  });

  let random_track_idxs = randomIndexes(await collection.length(), 100);
  query = `SELECT key FROM items ORDER BY key ASC`;
  res = await pg.client.query(query);
  random_track_idxs.forEach(async (i) => {
    let item = await collection.item(res.rows[i].key);
    let track_id = item.tracklist[Math.floor(Math.random() * item.tracklist.length)].position;
    let note = new Note(1, 'track', `${res.rows[i].key}:${track_id}`, randomText());
    if (track_id) {
      await note.set();
      console.log(`set note for track ${res.rows[i].key}:${track_id}`);
    }
  });
})();