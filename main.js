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

  // Clear any cached HTTP responses before loading, then load with a cache-busting
  // timestamp - belt-and-suspenders against Electron's persistent disk cache serving stale content.
  mainWindow.webContents.session.clearCache().then(() => {
    mainWindow.loadURL('https://mohammednaeemwork-ops.github.io/warehouse-system/?_launch=' + Date.now());
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
    // Show what URL is loaded
    dialog.showMessageBox({
      type: 'info',
      title: 'معلومات',
      message: 'التطبيق بيحمل من:\n' + mainWindow.webContents.getURL(),
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
