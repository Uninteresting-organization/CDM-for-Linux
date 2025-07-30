// renderer.js
const { CDMApp } = require('./gui/main_ui');
const path = require('path');
const settings = require('./config/settings.json'); // 確保路徑正確
const { ipcRenderer } = require('electron'); // <-- 關鍵：引入 ipcRenderer

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const pathLabel = document.getElementById('pathLabel');
    const statusLabel = document.getElementById('statusLabel');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');

    const app = new CDMApp();

    // 將 GUI 元素與 CDMApp 模擬的屬性連接
    app.urlInput = urlInput;
    app.pathLabel = {
        set text(val) { pathLabel.textContent = val; },
        get text() { return pathLabel.textContent; }
    };
    app.statusLabel = {
        set text(val) { statusLabel.textContent = val; },
        get text() { return statusLabel.textContent; }
    };
    app.progressBar = {
        set value(val) {
            progressFill.style.width = `${val}%`;
            progressFill.textContent = `${val}%`;
        },
        get value() {
            return parseInt(progressFill.style.width);
        }
    };

    // 初始化 pathLabel 顯示 (這裡不需要再設置，因為 CDMApp 構造函數已經處理)
    // app.pathLabel.text = `Save Path: (default: ${path.join(__dirname, settings.default_save_path)})`;

    // 事件監聽器：現在通過 IPC 啟動下載
    downloadBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (!url) {
            app.statusLabel.text = "❗ URL cannot be empty";
            return;
        }
        
        // 1. 更新 UI 狀態 (由 gui/main_ui.js 的 startDownload 方法處理)
        app.startDownload(url); 

        // 2. 關鍵：發送訊息給主進程來開始下載，傳遞 URL 和儲存路徑
        ipcRenderer.send('start-download', { url, savePath: app.savePath });
    });

    // -------- IPC 渲染器進程監聽器 --------
    // 關鍵：監聽來自主進程的進度更新和完成訊息
    ipcRenderer.on('download-progress', (event, progress) => {
        app.progressBar.value = progress;
        // console.log(`[Renderer Process] Download progress: ${progress}%`); // 可以在開發者工具查看
    });

    ipcRenderer.on('download-finished', (event, message) => {
        app.downloadFinished(message); // 調用 CDMApp 的完成處理方法
        // console.log(`[Renderer Process] Download finished: ${message}`); // 可以在開發者工具查看
    });
    // ----------------------------------

    console.log("Electron Renderer Process Ready.");
});
