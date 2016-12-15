window.$ = window.jQuery = require('jquery');
const {ipcRenderer, remote} = require("electron");


//jQuery(document).on('ready', () => {
	ipcRenderer.on('scan-update', (event, posts) => {
		var content = $("body ul").html('');

		for (i in posts){
			var post = jQuery('<li>' + posts[i].title + '</li>');
			post.data('target', posts[i].url);

			content.append(post);
		}

		content.find("li").on("click", function(e) {
			remote.shell.openExternal(jQuery(this).data('target'));
		});
	});

	ipcRenderer.send("window-opened");
//});