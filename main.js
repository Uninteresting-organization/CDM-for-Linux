// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { DownloadWorker } = require('./downloader.js'); // 正確路徑
const { log } = require('./utils/logger.js');       // 正確路徑
const settings = require('./config/settings.json'); // 正確路徑

// 建議：在 app.whenReady() 之前添加這行，如果之前有遇到顯示錯誤
// app.disableHardwareAcceleration();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'), // 如果你沒有 preload.js，請繼續註解或移除這行
      nodeIntegration: true, // 允許在渲染器進程中使用 Node.js API (這會導致安全警告，但對學習和除錯方便)
      contextIsolation: false // 禁用上下文隔離 (這會導致安全警告，但對學習和除錯方便)
    }
  });

  mainWindow.loadFile('index.html'); // 載入 HTML 介面
  //mainWindow.webContents.openDevTools(); // 開啟開發者工具

  // -------- IPC 主進程監聽器 --------
  ipcMain.on('start-download', (event, { url, savePath }) => {
    log(`[Main Process] Received download request for: ${url} to ${savePath}`);

    const worker = new DownloadWorker(url, savePath);

    worker.onProgress(progress => {
      // 將進度發送回渲染器進程
      event.sender.send('download-progress', progress);
    });

    worker.onFinished(message => {
      // 將完成訊息發送回渲染器進程
      event.sender.send('download-finished', message);
    });

    worker.start(); // 啟動下載
  });
  // ----------------------------------
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
