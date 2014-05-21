var path = window.location.pathname, genre;
if(/^[a-x]+$/.exec(path) == null) {
  // bad path
  genre = "electro";
}
genre = path.substring(1);

$(document).ready(function() {

  // default to electronic
  if(genre == "") {
    window.location = "/login";
    return;
  }

  var allSongs = [];

  // set dropdown
  $("#genreselect").val(genre.capitalize()); 
  
  var beginningOrder = [];

  $.ajax({
    "url" : "/fetchGenre",
    "type" : "GET",
    "data" : {
      "genre" : genre,
    },
    "success" : function(data) {
      if(data.error) {
        window.location = "/login";
        return;
      }
			// do something with the loaded content
			if(data.percent >= 100) {
        window.location = "/complete?genre="+genre;
        return;
      }
			setPercentage(data.percent);
			allSongs = data.userData.players[genre];
      loadNextSongSet();
		},
		"error" : function() {
		  window.location = "/login";
      return;
		}
  });
  
  var progress = $("#progressbar"),
      progressBarText = $("#progressBarText");
  progress.progressbar();
  
  $("#doneSorting").click(function() {
    var newPercent = parseInt(progress.attr("aria-valuenow")) + 10;
    setPercentage(newPercent);
    var newOrder = getOrder();
    $.ajax({
      "url" : "/updateGenre",
      "type" : "POST",
      "data" : {
        "genre" : genre,
        "order" : {
          "start" : beginningOrder,
          "end" : newOrder
        },
        "percent" : newPercent
      },
      "success" : function(data) {
        if(newPercent >= 100) {
          window.location = "/complete?genre="+genre;
        }
        loadNextSongSet();
      }
    });
  });

   $(function() {
     $(".musicPlayer").drags();
  });
  
  function setPercentage(p) {
    progress.attr("aria-valuenow", p);
    progress.find("div").css("width", p + "%");
    progress.find("div").show();
    progressBarText.text(p + "%");
  }
  
  function loadNextSongSet() {
    var percent = parseInt(progress.attr("aria-valuenow"));
    var containers = $(".iframeMusic"), i = percent/100*30;
    beginningOrder = [];
    containers.each(function(index, iframe) {
      if(allSongs[i] == undefined) {
        return;
      }
      iframe.innerHTML = "<iframe id='" + allSongs[i].id + "' width='920' height='166' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url=" + allSongs[i].player + "&amp;color=666699&amp;auto_play=false&amp;hide_related=true&amp;show_artwork=true'></iframe>";
      beginningOrder.push(allSongs[i].id);
      i++;
    });
  }
});


// because order using absolute positioning, cannot just get the order they are
// in in the DOM, need to use our custom HTML attributes
function getOrder() {
  return [
    $(".musicPlayer[placeval='0']").find("iframe").attr("id"),
    $(".musicPlayer[placeval='1']").find("iframe").attr("id"),
    $(".musicPlayer[placeval='2']").find("iframe").attr("id")
  ];
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
