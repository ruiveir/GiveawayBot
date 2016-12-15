const {app, BrowserWindow, dialog, ipcMain, Tray, Menu} = require('electron')
const request = require('request')
const notifier = require('node-notifier');


const UPDATE_INTERVAL = 60;
const KEY_REGEX = /(key|giveaways?|serial|free|giving)/g
const UNFILTERED_SUBS = ["FreeGamesOnSteam", "steam_giveaway", "pcgiveaways", "steamgiveaway"]

let tray, mainWindow;

var scannedList = [], filteredPosts = [];

function createWindow () {
	win = new BrowserWindow({width: 1050, height: 600})

	win.loadURL(`file://${__dirname}/index.html`)

	win.on('show', () => {
		tray.setHighlightMode('always')
	})
	win.on('hide', () => {
		tray.setHighlightMode('never')
	})

	win.on('closed', () => {

	})

	return win;
}

function showMainWindow() {
	if (!mainWindow || mainWindow.isDestroyed())
		mainWindow = createWindow();
	else if (mainWindow && !mainWindow.isVisible())
		mainWindow.show()
}

function runScan(){
	console.log('Scanning...')
	var options = {
    	url     : 'http://www.reddit.com/r/FreeGamesOnSteam+SteamGifts+pcmasterrace+steamgiveaway+steam_giveaway+pcgiveaways/new/.json?limit=75',
      	headers : {
        	'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:41.0) Gecko/20100101 Firefox/41.0',
      	},
      	method  : 'GET'
  	};

	request(options, function (err, res, body) {
	    if (err) {
	      	console.log(err);
	    } else {
	    	var posts = JSON.parse(body).data.children;

	    	for (i in posts){
				var post = posts[i].data;

				if (scannedList.indexOf(post.id) == -1 &&
					(
						UNFILTERED_SUBS.indexOf(post.subreddit) != -1 ||
						post.title.match(KEY_REGEX) ||
						(post.is_self && post.selftext.match(KEY_REGEX))
					)
				){

					filteredPosts.unshift(post); //push to 1st position

					notifier.notify({
					  	title: 'New Hit',
					  	message: post.title,
					  	icon: app.getAppPath() + '/icon.png', // Absolute path (doesn't work on balloons)
					  	sound: true, // Only Notification Center or Windows Toasters
					  	wait: true // Wait with callback, until user action is taken against notification
					}, function (err, response) {
					  	// Response is response from notification
					});
				}

				scannedList.push(post.id);
			}

			if (mainWindow && !mainWindow.isDestroyed())
				mainWindow.webContents.send('scan-update', filteredPosts)
	    }

	    console.log('Scan finnished, waiting ' + UPDATE_INTERVAL + ' seconds.')

		setTimeout(runScan, UPDATE_INTERVAL * 1000);
	});
}

app.on('ready', () => {
	tray = new Tray('icon.png')

	tray.on('click', showMainWindow)

	const contextMenu = Menu.buildFromTemplate([
		{label: 'Show', click: showMainWindow},
		{label: 'Close', click: function() {
			app.quit();
		}}
	])

	tray.setToolTip('GiveawayBot engaged')

	tray.setContextMenu(contextMenu)

	runScan();

	ipcMain.on('error', function(e){
		console.log(e);
	});

	ipcMain.on("window-opened", () => {
		if (mainWindow && !mainWindow.isDestroyed())
			mainWindow.webContents.send('scan-update', filteredPosts);
	});

	showMainWindow();
});

app.on('window-all-closed', () => {})