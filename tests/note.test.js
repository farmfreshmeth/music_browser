/*
  note.test.js
*/

const Note = require('../note.js');

beforeAll(async () => {
  let item_note = new Note(1, 'item', 628042, `here's some item text with a #hashtag.`);
  let track_note = new Note(1, 'track', '12345:A4', `here's some track text with a #favorite! tag and a #flute tag`);
  let folder_note = new Note(1, 'folder', 5424199, `why is Phish in this #folder?`); // 01 Grateful Dead

  await item_note.set();
  await track_note.set();
  await folder_note.set();
});

test('getNotesForResource item', async () => {
  let notes = await Note.getNotesForResource('item', 628042);
  expect(notes[0].user_fullname).toBe('Farm Freshmeth');
  expect(notes[0].note).toBe(`here's some item text with a #hashtag.`);

  let resource = await notes[0].getResource();
  expect(resource.title).toBe('Saving Grace');
});

test('getNotesForResource track note', async () => {
  let notes = await Note.getNotesForResource('track', '5755683:B5');
  expect(notes[0].user_fullname).toBe('Farm Freshmeth');
  expect(notes[0].note).toBe(`Mollit aliquip amet elit anim. Minim magna officia adipisicing velit ad ullamco laboris nostrud elit. #aliquip #consectetur #enim`);

  let resource = await notes[0].getResource();
  expect(resource.title).toBe('We May Never Pass This Way (Again)');
  expect(resource.position).toBe('B5');
  expect(resource.item.title).toBe('Greatest Hits');
  expect(resource.item.artists[0].name).toBe('Seals & Crofts');
});

test('getNotesForResource folder note', async () => {
  let notes = await Note.getNotesForResource('folder', 5424199);
  expect(notes[0].user_fullname).toBe('Farm Freshmeth');
  expect(notes[0].note).toBe(`why is Phish in this #folder?`);

  let resource = await notes[0].getResource();
  expect(resource.name).toBe('01 Grateful Dead');
});

test('update item note', async () => {
  let item_note = await Note.getNotesForResource('item', 628042);
  item_note[0].note = `here's some updated item text with a #hashtag.`;
  await item_note[0].set();

  let note = await Note.getNotesForResource('item', 628042);
  expect(note[0].user_fullname).toBe('Farm Freshmeth');
  expect(note[0].note).toBe(`here's some updated item text with a #hashtag.`);
});

test('allTags', async () => {
  let tags = await Note.allTags();
  expect(tags.length >= 37);
  expect(tags[0]).toStrictEqual({"count": "31", "token": "#qui"});
});

test('getNotesForTag', async () => {
  let notes = await Note.getNotesForTag('#pariatur');
  expect(notes.length).toBe(4);
});
