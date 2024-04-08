/*
  tracklist.js view
*/

$('a.lyrics').click((event) => {
  event.preventDefault();
  let position = $(event.target).data('position');
  let old_item_detail = null;

  if ($('#track-container-' + position).is(':hidden')) {
    old_item_detail = $('#item-detail').replaceWith($('#track-container-' + position));
    window.scrollTo(0, 0);
    $('#track-container-' + position).show();
  } else {
    location.reload(); // I don't love it. requires another query
    window.scrollTo(0, 0);
  }
});
