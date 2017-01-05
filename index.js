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

		var content = $("body ul");

		var expandedPosts = [];
		content.find("li.expanded").each((i, elm) => {
			expandedPosts.push(jQuery(elm).data("id"));
		});

		content.html('');

		posts.sort((a, b) => {
			return parseInt(b.created_utc) - parseInt(a.created_utc);
		});

		for (i in posts){
			var post = jQuery('<li title="'+posts[i].title+'" data-id="'+ posts[i].id +'" class="'+ (expandedPosts.indexOf(posts[i].id) != -1 ? "expanded" : "") +'">'+
				'<div>' +
					'<div class="img" style="background-image: url(' + (posts[i].thumbnail === 'self' || posts[i].thumbnail === 'default' ? 'images/reddit.png' : posts[i].thumbnail) + ');"></div>' +
					'<h3>' +
						posts[i].title +
					'</h3>' +
					'<p>' +
						timeSince(new Date(posts[i].created_utc * 1000)) + ' ago on <b>' + posts[i].subreddit + '</b>' +
						' (<a href="'+posts[i].url+'" class="reddit">Link</a>, ' +
						' <a href="https://www.reddit.com'+posts[i].permalink+'" class="reddit">Comments</a>)' +
					'</p>' +
					'<a href="#" class="remove"><i class="fa fa-times" aria-hidden="false"></i></a>' +
				'</div>' +
				(posts[i].is_self ?
					'<p class="selftext">'+
						posts[i].selftext.replace( /\[([^\]]+)\]\(([^\)]+)\)/g, "<a href='$2'>$1</a>") +
					'</p>' : ''
				)+
			'</li>');
			post.data('link', posts[i].url);
			post.data('reddit', 'https://www.reddit.com'+posts[i].permalink);

			content.append(post);
		}

		content.find("li").on("click", function(e) {
			e.preventDefault();

			var target = jQuery(e.target);

			console.log(target)

			if (target.is('a.remove') || target.parent().is('a.remove'))
				ipcRenderer.send("remove-entry", jQuery(this).data('id'));
			else if (target.is('a'))
				shell.openExternal(target.attr("href"));
			else
				jQuery(this).toggleClass('expanded');

			return false;
		});
	});

	ipcRenderer.send("window-opened");
}

jQuery(window).on('load', init);