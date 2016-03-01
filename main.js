var Interactive = require('./interactive');
var Logger = require('./lib/Logger');
var logger = new Logger("Main");
var electron = require('electron');
// Module to control application life.
var app = electron.app;
// Module to create native browser window.
var BrowserWindow = electron.BrowserWindow;


var interactive = new Interactive(electron);
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1020,
    height: 400,
    //x: 920,
    //y: 54,
    //center: true,
    fullscreenable: false,
    resizable: false,
    frame: false
  });

  //mainWindow.setMaximizable(false);
  mainWindow.setResizable(false);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  logger.log("UserData Path: " + app.getPath("userData"));

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on('move', function() {
    //logger.log("Window Position: " + mainWindow.getPosition());
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
