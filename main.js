const { app, BrowserWindow, dialog, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");

function createWindow() {
    const window = new BrowserWindow({
        width: 1000,
        height: 700
    });

    window.loadFile("index.html");
}

// ============================================================
// AUTO UPDATER
// ============================================================

function setupAutoUpdater() {

    // Don't run the updater when using npm start / development mode.
    if (!app.isPackaged) {
        console.log("StudyFlow is running in development mode. Updater skipped.");
        return;
    }

    // Check for updates when the app starts.
    autoUpdater.checkForUpdates();

    // Checking
    autoUpdater.on("checking-for-update", () => {
        console.log("Checking for StudyFlow updates...");
    });

    // Update found
    autoUpdater.on("update-available", (info) => {
        console.log("Update available:", info.version);

        dialog.showMessageBox({
            type: "info",
            title: "StudyFlow Update",
            message: `StudyFlow ${info.version} is available.`,
            detail: "The update is being downloaded in the background."
        });
    });

    // Already up to date
    autoUpdater.on("update-not-available", (info) => {
        console.log(
            "StudyFlow is up to date. Current version:",
            info.version
        );
    });

    // Download progress
    autoUpdater.on("download-progress", (progress) => {
        console.log(
            `Downloading update: ${Math.round(progress.percent)}%`
        );
    });

    // Update finished downloading
    autoUpdater.on("update-downloaded", () => {

        console.log("StudyFlow update downloaded.");

        dialog.showMessageBox({
            type: "info",
            title: "StudyFlow Update Ready",
            message: "A new version of StudyFlow is ready to install.",
            detail: "StudyFlow will restart and install the update when you choose Restart.",
            buttons: [
                "Restart and Update",
                "Later"
            ]
        }).then((result) => {

            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }

        });

    });

    // Error
    autoUpdater.on("error", (error) => {

        console.error(
            "StudyFlow auto-update error:",
            error
        );

    });
}


// ============================================================
// SEPARATE TEST USER DATA
// ============================================================

if (!app.isPackaged) {
    app.setPath(
        "userData",
        `${app.getPath("userData")}-test`
    );
}
console.log(
    "StudyFlow TEST userData:",
    app.getPath("userData")
);

// ============================================================
// APP START
// ============================================================

app.whenReady().then(() => {

    Menu.setApplicationMenu(null);

    createWindow();

    setupAutoUpdater();

});


// ============================================================
// CLOSE
// ============================================================

app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    }

});