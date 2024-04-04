/*
  get_lyrics.js
*/

const Lyrics = require('../lyrics.js');
let lyrics = new Lyrics();

vals = [
  ["Here Comes the Sun", "The Beatles"],
  ["Warm Blood", "The Beths"],
  ["Dirty Deeds Done Dirt Cheap", "AC/DC"]
];

vals.forEach((val) => {
  lyrics.get(val[0], val[1], (data) => {
    console.log(data);
  });
});