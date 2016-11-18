'use strict';
import { BrowserWindow } from 'electron'
const mainWindow = BrowserWindow.getAllWindows()[0]
const electronAuth = require('electron-oauth2');
const windowOpts = {
	alwaysOnTop: true,
	title: 'Beam Authorization',
	resizeable: false,
	maximizable: false,
	autoHideMenuBar: true,
	nodeIntegration: false
};
let authWindow;
const setup = function (opts) {
	authWindow = electronAuth(opts, windowOpts);
};

const authorize = function (opts) {
	return authWindow.getAccessToken(opts);
};

module.exports = {
	setup,
	authorize
};