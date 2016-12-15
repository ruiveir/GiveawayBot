window.$ = window.jQuery = require('jquery');
const {ipcRenderer, remote} = require("electron");

function pad(num, size) {
	var s = num + "";
	while (s.length < size) s = "0" + s;
	return s;
}

//jQuery(document).on('ready', () => {
	ipcRenderer.on('scan-update', (event, posts) => {
		var content = $("body ul").html('');

		posts.sort((a, b) => {
			return parseInt(a.created_utc) < parseInt(b.created_utc);
		});

		for (i in posts){
			var dateCreated = new Date(posts[i].created_utc * 1000);

			var post = jQuery('<li><a href="www.reddit.com'+posts[i].permalink+'" class="reddit">Reddit</a> <a href="'+posts[i].url+'" class="link">Link</a> ' + pad(dateCreated.getHours(), 2) + ':' + pad(dateCreated.getMinutes(), 2) + ':' + pad(dateCreated.getSeconds(), 2) + ' ' + pad(dateCreated.getDate(), 2) + '/' + pad(dateCreated.getMonth()+1, 2) + ' /r/' + posts[i].subreddit + ' - ' + posts[i].title + '</li>');
			post.data('link', posts[i].url);
			post.data('reddit', 'www.reddit.com'+posts[i].permalink);

			content.append(post);
		}

		content.find("li a").on("click", function(e) {
			e.preventDefault();
			var target = jQuery(e.target);

			remote.shell.openExternal(jQuery(this).attr('href'));

			return false;
		});
	});

	ipcRenderer.send("window-opened");
//});