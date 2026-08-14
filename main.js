const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");

function createWindow() {
    const window = new BrowserWindow({
        width: 1000,
        height: 700
    });

    window.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow();

    // Only check for updates in the packaged application.
    if (app.isPackaged) {
        autoUpdater.checkForUpdatesAndNotify();
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});