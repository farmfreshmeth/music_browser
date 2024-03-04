const custom_fields = [
  {
    "id": 1,
    "name": "Media Condition",
    "type": "dropdown",
    "position": 1,
    "public": false,
    "options": [
      "Mint (M)",
      "Near Mint (NM or M-)",
      "Very Good Plus (VG+)",
      "Very Good (VG)",
      "Good Plus (G+)",
      "Good (G)",
      "Fair (F)",
      "Poor (P)"
    ]
  },
  {
    "id": 2,
    "name": "Sleeve Condition",
    "type": "dropdown",
    "position": 2,
    "public": false,
    "options": [
      "Generic",
      "No Cover",
      "Mint (M)",
      "Near Mint (NM or M-)",
      "Very Good Plus (VG+)",
      "Very Good (VG)",
      "Good Plus (G+)",
      "Good (G)",
      "Fair (F)",
      "Poor (P)"
    ]
  },
  {
    "id": 4,
    "name": "Collection",
    "type": "dropdown",
    "position": 3,
    "public": false,
    "options": [
      "RT Gatewood III",
      "Bob/Chris Gatewood",
      "Jay McDermott",
      "Karen & Hale Sturges",
      "Bennie/Arlene Bakowski",
      "Meg Sturges",
      "Annie Sturges",
      "Julia/Ellis Gatewood",
      "Roger LeFevre"
    ]
  },
  {
    "id": 3,
    "name": "Notes",
    "type": "textarea",
    "position": 4,
    "public": false,
    "lines": 3
  }
];

module.exports = custom_fields;
