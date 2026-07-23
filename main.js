const { app, BrowserWindow, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#0f1117',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
    },
    title: 'نظام المخازن - شركة العمار للتوسع العمراني',
    show: false,
  });

  // Force every response to be treated as non-cacheable, so Electron's disk cache
  // never stores a copy to serve stale on the next launch (clearCache() alone only
  // wipes PAST cache entries - it doesn't stop the page just loaded from being cached).
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders };
    headers['Cache-Control'] = ['no-store, no-cache, must-revalidate, max-age=0'];
    delete headers['ETag']; delete headers['Etag'];
    delete headers['Last-Modified'];
    callback({ responseHeaders: headers });
  });

  mainWindow.webContents.session.clearCache().then(() => {
    mainWindow.loadURL('https://mohammednaeemwork-ops.github.io/warehouse-system/?_launch=' + Date.now());
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
    // Show what URL is loaded AND the installed app version - use this to verify
    // you're actually running the latest build, not a stale cached page.
    dialog.showMessageBox({
      type: 'info',
      title: 'معلومات',
      message: 'إصدار التطبيق: v' + app.getVersion() + '\nالتطبيق بيحمل من:\n' + mainWindow.webContents.getURL(),
      buttons: ['تمام'],
    });
  });

  Menu.setApplicationMenu(null);
  mainWindow.on('closed', () => { mainWindow = null; });

  // Enable F12 for DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(err => console.error('Update error:', err));
  }, 5000);
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'تحديث متاح',
    message: 'في تحديث جديد v' + info.version + '، جاري التحميل في الخلفية...',
    buttons: ['تمام'],
  });
});

autoUpdater.on('update-downloaded', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'التحديث جاهز',
    message: 'تم تحميل التحديث v' + info.version + '. هيتم إعادة التشغيل لتثبيته.',
    buttons: ['إعادة التشغيل الآن'],
  }).then(() => { autoUpdater.quitAndInstall(); });
});

autoUpdater.on('error', (err) => {
  dialog.showMessageBox({
    type: 'error',
    title: 'خطأ في التحديث',
    message: 'خطأ: ' + err.message,
    buttons: ['تمام'],
  });
});
