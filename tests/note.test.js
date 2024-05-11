/*
  note.test.js
*/

const Note = require('../note.js');

beforeAll(async () => {
  let item_note = new Note(1, 'item', 12345, `here's some item text with a #hashtag.`);
  let track_note = new Note(1, 'track', '12345:A4', `here's some track text with a #favorite! tag and a #flute tag`);
  let folder_note = new Note(1, 'folder', '01 Grateful Dead', `why is Phish in this #folder?`);

  await item_note.set();
  await track_note.set();
  await folder_note.set();
});

test('get item note', async () => {
  let note = await Note.get('item', 12345);
  expect(note.user_fullname).toBe('Farm Freshmeth');
  expect(note.note).toBe(`here's some item text with a #hashtag.`);
});

test('get track note', async () => {
  let note = await Note.get('track', '12345:A4');
  expect(note.user_fullname).toBe('Farm Freshmeth');
  expect(note.note).toBe(`here's some track text with a #favorite! tag and a #flute tag`);
});

test('get folder note', async () => {
  let note = await Note.get('folder', '01 Grateful Dead');
  expect(note.user_fullname).toBe('Farm Freshmeth');
  expect(note.note).toBe(`Exercitation anim culpa et excepteur duis dolor amet cupidatat. Eiusmod mollit eu pariatur laborum nostrud. #aute #non`);
});

test('update item note', async () => {
  let item_note = await Note.get('item', 12345);
  item_note.note = `here's some updated item text with a #hashtag.`;
  await item_note.set();

  let note = await Note.get('item', 12345);
  expect(note.user_fullname).toBe('Farm Freshmeth');
  expect(note.note).toBe(`here's some updated item text with a #hashtag.`);
});

test('allTags', async () => {
  let tags = await Note.allTags();
  expect(tags.length).toBe(39);
  expect(tags[0]).toStrictEqual({"count": "39", "token": "#nostrud"});
});
