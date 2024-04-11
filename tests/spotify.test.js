/*
  spotify.test.js
*/

const Spotify = require('../spotify.js');
let spotify = new Spotify();

beforeAll(() => {
});

test("isMatch positive cases", () => {
  let positive_test_cases = [
    ["The Doors", "The Doors"],
    ["Who's Next", "Who's Next (Remastered 2022)"],
    ["Who's Next", "Who's Next (Deluxe Edition)"],
    ["The Who", "The Who"],
    ["Annie (A New Musical)", "Annie (A New Musical)"],
  ];
  positive_test_cases.forEach((test_case) => {
    expect(spotify.isMatch(test_case[0], test_case[1])).toBe(true);
  });
});

test("isMatch negative cases", () => {
  let negative_test_cases = [
    ["The Doors", "Three Doors Down"],
    ["Who's Next", "Who’s Next : Life House (Super Deluxe)"],
    ["The Who", "The Guess Who"],
    ["461 Ocean Blvd. (Deluxe Edition)", "461 Ocean Boulevard"],
  ];
  negative_test_cases.forEach((test_case) => {
    expect(spotify.isMatch(test_case[0], test_case[1])).toBe(false);
  });

});