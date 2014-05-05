var path = window.location.pathname, genre, userid = "1";
if(/^[a-x]+$/.exec(path) == null) {
  // bad path
  genre = "electro";
}
genre = path.substring(1);

$(document).ready(function() {

  // set dropdown
  log(genre.capitalize());
  $("#genreselect").val(genre.capitalize());

  $.ajax({
    "url" : "/fetchGenre",
    "type" : "GET",
    "data" : {
      "genre" : genre,
      "id" : userid
    },
    "success" : function(data) {
    log(data);
			// do something with the loaded content
			var songs = data.userData.players[genre];//JSON.parse(request.responseText);
      var containers = $(".iframeMusic"), i=0;
      log(data);
      log(songs);
      for(id in songs) {
      log(id);
      log(songs[id]);
        containers[i].innerHTML = "<iframe id='" + id + "' width='920' height='166' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url=" + songs[id] + "&amp;color=666699&amp;auto_play=false&amp;hide_related=true&amp;show_artwork=true'></iframe>";
        i++;
      }
		}
  });
  
  var progress = $("#progressbar"),
      progressBarText = $("#progressBarText");
  
  $("#doneSorting").click(function() {
    
    var newPercent = parseInt(progress.attr("aria-valuenow")) + 10;
    if(newPercent >= 100) {
        window.location = "/complete?genre="+genre;
    }
    var newOrder = getOrder();
    log("ord");
    log(newOrder);
    $.ajax({
      "url" : "/updateGenre",
      "type" : "POST",
      "data" : {
        "genre" : genre,
        "id" : userid,
        "order" : newOrder,
        "percent" : newPercent
      },
      "success" : function(data) {
        // do something with the loaded content
        var songs = data.userData.players[genre];
        var containers = $(".iframeMusic"), i=0;
        for(id in songs) {
          containers[i].innerHTML = "<iframe id='" + id + "' width='920' height='166' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url=" + songs[id] + "&amp;color=666699&amp;auto_play=false&amp;hide_related=true&amp;show_artwork=true'></iframe>";
          i++;
        }
        progress.progressbar({value: newPercent});
        progressBarText.text(newPercent + "%");
      }
    });
  });

   $(function() {
      $("#progressbar").progressbar({value: 0});
      $(".musicPlayer").drags();
  });
});

function getOrder() {
  var frames = $("iframe"), ids = [];
  $.each(frames, function(key, iframe) {
    ids.push($(iframe).attr("id"));
  });
  return ids;
}

function storeGenre(selection) {
  //var store = {"id":createID(), "genre":selection, "percentage":33.3};
  //$.cookie('soundbarrelUserSession', JSON.stringify(store), {expires:3, path:'/'});
  window.location= "/" + selection.toLowerCase();
}

String.prototype.capitalize = function() {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
}

function log(s) { console.log(s); }
