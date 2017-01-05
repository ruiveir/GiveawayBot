const {ipcRenderer, remote, shell} = require("electron");

function pad(num, size) {
	var s = num + "";
	while (s.length < size) s = "0" + s;
	return s;
}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

function init() {
	ipcRenderer.on('scan-update', (event, posts) => {
		console.log('Got scan results.');

		var content = $("body ul").html('');

		posts.sort((a, b) => {
			return parseInt(b.created_utc) - parseInt(a.created_utc);
		});

		for (i in posts){
			var post = jQuery('<li title="'+posts[i].title+'">'+
				'<div class="img" style="background-image: url(' + (posts[i].thumbnail === 'self' || posts[i].thumbnail === 'default' ? 'images/reddit.png' : posts[i].thumbnail) + ');"></div>' +
				'<h3>' +
					posts[i].title +
				'</h3>' +
				'<p>' +
					timeSince(new Date(posts[i].created_utc * 1000)) + ' ago on <b>' + posts[i].subreddit + '</b>' +
					' (<a href="#" class="reddit">Comments</a>)' +
				'</p>' +
					'<a href="#" class="remove"><i class="fa fa-times" aria-hidden="false"></i></a>' +
			'</li>');
			post.data('id', posts[i].id);
			post.data('link', posts[i].url);
			post.data('reddit', 'https://www.reddit.com'+posts[i].permalink);

			content.append(post);
		}

		content.find("li").on("click", function(e) {
			e.preventDefault();

			var target = jQuery(e.target);

			if (target.is('a.reddit'))
				shell.openExternal(jQuery(this).data('reddit'));
			else if (target.is('a.remove') || target.parent().is('a.remove'))
				ipcRenderer.send("remove-entry", jQuery(this).data('id'));
			else
				shell.openExternal(jQuery(this).data('link'));

			return false;
		});
	});

	ipcRenderer.send("window-opened");
}

jQuery(window).on('load', init);