/*
  index.js
*/

$('#folders').on('click', function() {
  $.ajax({
    method: 'GET',
    headers: {
      "Authorization": "Discogs token=kbhSABnCDoJfTmUkczKTsCjyowepIyWDgjTGiYJh"
    },
    url: 'https://api.discogs.com/users/bgatewood/collection/folders',
    success: function(data) {
      console.log(data);

      html = "<ul>"
      for (const folder of data['folders']) {
        html += "<li>" + folder['name'] + "</li>"
      }
      html += "</ul>"

       $('#results').html(html);
    }
  });
});
