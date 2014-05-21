var path = window.location.search, genre;
genre = path.split("?genre=")[1];

$(document).ready(function() {
  if(genre == "") {
    window.location = "/login";
    return;
  }
  
  console.log(genre.capitalize());
  $("#genreselect").val(genre.capitalize());
  
  $.ajax({
    "url" : "/" + genre + "/done",
    "type" : "GET",
    "data" : {
      "genre" : genre,
    },
    "success" : function(data) {
      if(data.error) {
        window.location = "/" + genre;
        return;
      }
      console.log(data);
      var songs = data;
      var containers = $(".iframeMusic"), i=0;
      for(id in songs) {
        containers[i].innerHTML = "<iframe id='" + id + "' width='920' height='166' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url=" + songs[id] + "&amp;color=666699&amp;auto_play=false&amp;hide_related=true&amp;show_artwork=true'></iframe>";
        i++;
      }
    }
  });
});

function storeGenre(selection) {
  //var store = {"id":createID(), "genre":selection, "percentage":33.3};
  //$.cookie('soundbarrelUserSession', JSON.stringify(store), {expires:3, path:'/'});
  window.location= "/" + selection.toLowerCase();
}

String.prototype.capitalize = function() {
  return this.substr(0, 1).toUpperCase() + this.substr(1);
}
