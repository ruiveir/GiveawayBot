const {app, BrowserWindow, Tray, Menu} = require('electron')

let win

function createWindow () {
	win = new BrowserWindow({width: 1050, height: 600})

	win.loadURL(`file://${__dirname}/index.html`)

	win.on('closed', () => {
		win = null
	})

	const tray = new Tray('icon.png')

	tray.on('click', () => {
		win.isVisible() ? win.hide() : win.show()
	})
	win.on('show', () => {
		tray.setHighlightMode('always')
	})
	win.on('hide', () => {
		tray.setHighlightMode('never')
	})

	const contextMenu = Menu.buildFromTemplate([
		{label: 'Show', click: function() {
			win.show();
		}},
		{label: 'Close', click: function() {
			app.quit();
		}}
	])

	tray.setToolTip('GiveawayBot engaged')

	tray.setContextMenu(contextMenu)
}
app.on('ready', createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (win === null) {
		createWindow()
	}
})