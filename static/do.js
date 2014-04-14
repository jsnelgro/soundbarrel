var userid;
var genre;

$(document).ready(function() {
	var cookie = JSON.parse($.cookie("soundbarrelUserSession"));
	if(cookie == undefined)
		window.location="./index.html";
	
	var path = window.location.pathname;
  if(/^[a-x]+$/.exec(path) == null) {
    // bad path
    genre = "electro";
  }
  genre = path.substring(1);
  console.log(genre);
	userid = cookie["id"];
	setprogress(cookie["percentage"]);
	
	$('#genreselect').val(genre);
	$('#genreselect').change(function()
		{
			var store = {"id":userid, "genre":$('#genreselect').val(), "percentage":(Math.random()*100)};
			$.cookie("soundbarrelUserSession", JSON.stringify(store), {expires:3, path:'/'});
			location.reload();
		});


  $.ajax({
    "url" : "/fetchGenre",
    "type" : "GET",
    "data" : {
      "genre" : genre,
      "id" : userid
    },
    "success" : function(data) {
			// do something with the loaded content
			var reply = data;//JSON.parse(request.responseText);
			reply.players.forEach(addSong);
			setprogress(reply.done);
			
			$('.songholder').sortable({
					forcePlaceholderSize: true 
				}).bind('sortupdate', function(e, ui) {
					var list = $('.songholder').children();
					var arr = new Array(list.length);
					for (var i = 0; i < list.length; i++) {
						arr[i] = list[i].id;
					}
					var json = JSON.stringify({"songs":arr, "genre":genre, "id":userid});
					var request = new XMLHttpRequest();

					request.open('GET', '/', true);
					request.addEventListener('load', function(e){
						if (request.status == 200) {
							// do something with the loaded content
							var content = request.responseText;
							setprogress(reply.done);
						} else {
							// something went wrong, check the request status
							// hint: 403 means Forbidden, maybe you forgot your username?
						}
					}, false);
					request.send(json);
				});
		}});

});

function setprogress(val)
{
	if(val > 100 || val < 0) return;
	var inner = document.getElementById("progress");
	inner.style.width = val+"%";
}

function getprogress()
{
	return $('#progress').width()/$('#progressbar').width() * 100;
}

function addSong(song)
{
console.log(song);
  
	$(".songholder").append($("<iframe src='https://w.soundcloud.com/player/?url=" + song + "&amp;color=666699&amp;auto_play=false&amp;hide_related=true&amp;show_artwork=true'></iframe>"));//'<li class="sortable" id="' + song.id + '">' + song.name + '</li>');
}