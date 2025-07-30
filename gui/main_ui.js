// gui/main_ui.js (只處理 GUI 邏輯和狀態更新)
const fs = require('fs'); // 為了創建預設下載目錄
const path = require('path');
const settings = require('../config/settings.json'); // 載入設定檔
const { log } = require('../utils/logger.js'); // 引入日誌模組


class CDMApp {
    constructor() {
        // 模擬 GUI 元素，這些在實際的 Electron 渲染器進程中會對應到 HTML 元素
        this.urlInput = { value: "" };
        this.pathLabel = { text: "" }; // 將在下面初始化
        this.statusLabel = { text: "" };
        this.progressBar = { value: 0 };

        // 設定預設儲存路徑
        this.savePath = path.join(process.cwd(), settings.default_save_path);
        // 確保目錄存在，recursive: true 表示如果父目錄不存在也會一併創建
        try {
            if (!fs.existsSync(this.savePath)) { // 檢查目錄是否存在，如果不存在則創建
                fs.mkdirSync(this.savePath, { recursive: true });
            }
        } catch (error) {
            log(`[ERROR] Failed to create save directory: ${error.message}`);
        }
        
        // 初始化 pathLabel 的文字
        if (this.pathLabel) {
            this.pathLabel.text = `Save Path: (default: ${this.savePath})`;
        }
        
        this.setWindowTitle("CDM - Custom Download Manager");
        this.setGeometry(200, 200, 400, 200);
    }

    setWindowTitle(title) {
        log(`[GUI] Setting window title: ${title}`);
    }

    setGeometry(x, y, width, height) {
        log(`[GUI] Setting geometry: ${x}, ${y}, ${width}, ${height}`);
    }

    choosePath(folderPath) {
        if (folderPath) {
            this.savePath = folderPath;
            if (this.pathLabel && typeof this.pathLabel.text === 'string') {
                this.pathLabel.text = `Save Path: ${folderPath}`;
            }
            log(`[GUI] Save path updated to: ${folderPath}`);
        }
    }

    // 這個方法現在主要負責更新 UI 狀態，不再直接啟動下載
    // 實際的下載啟動會通過 IPC 在 renderer.js 中完成
    startDownload(url) {
        // 這裡不再有 this.worker 的創建和啟動，這些都在 main.js 中處理
        if (this.statusLabel && typeof this.statusLabel.text === 'string') {
            this.statusLabel.text = "⬇️ Downloading...";
        }
        if (this.progressBar && typeof this.progressBar.value === 'number') {
            this.progressBar.value = 0; // 重置進度條
        }
        log("[GUI] Downloading started... (via IPC)"); // 更新日誌訊息
    }

    downloadFinished(message) {
        if (this.statusLabel && typeof this.statusLabel.text === 'string') {
            this.statusLabel.text = `${message.startsWith('Download failed') ? '❌' : '✅'} ${message}`; // 根據訊息判斷顯示符號
        }
        log(`[GUI] Download finished: ${message}`);
    }
}

module.exports = { CDMApp };
