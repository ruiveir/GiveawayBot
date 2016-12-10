const KEY_REGEX = /(key|giveaways?)/g

window.$ = window.jQuery = require('jquery');

$.ajax("https://www.reddit.com/r/FreeGamesOnSteam+SteamGifts+pcmasterrace+steamgiveaway/new/.json", {success: function(r){
	var content = $("<ul>");

	for (i in r.data.children){
		var post = r.data.children[i].data;


		if (post.title.match(KEY_REGEX)){
			console.log(post)
			content.append('<li>' + post.title + new Date(1000*post.created_utc).toISOString() + '</li>');
		}
	}

	$("body").html(content);
}});