// downloader.js
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // 記得要 npm install axios
const { log } = require('./utils/logger'); // 引入日誌模組

class DownloadWorker {
    constructor(url, savePath) {
        this.url = url;
        this.savePath = savePath;
        this.progressCallbacks = []; // 模擬 pyqtSignal(int)
        this.finishedCallbacks = []; // 模擬 pyqtSignal(str)
    }

    // 模擬 pyqtSignal.connect()
    onProgress(callback) {
        this.progressCallbacks.push(callback);
    }

    onFinished(callback) {
        this.finishedCallbacks.push(callback);
    }

    // 模擬 pyqtSignal.emit()
    emitProgress(value) {
        this.progressCallbacks.forEach(callback => callback(value));
    }

    emitFinished(message) {
        this.finishedCallbacks.forEach(callback => callback(message));
    }

    async run() {
        try {
            // 確保儲存目錄存在
            try {
                fs.mkdirSync(this.savePath, { recursive: true });
            } catch (error) {
                log(`[ERROR] Failed to create save directory: ${error.message}`);
                this.emitFinished("Download failed: Could not create save directory.");
                return;
            }

            const response = await axios({
                method: 'get',
                url: this.url,
                responseType: 'stream' // 以串流方式獲取響應
            });

            const totalLength = parseInt(response.headers['content-length']) || 0; // 獲取總內容長度
            // 從 URL 中提取檔案名稱，如果 URL 沒有包含檔案名稱，則使用一個默認名稱
            const urlParts = this.url.split("/");
            let filename = urlParts[urlParts.length - 1];
            if (!filename || filename.indexOf('?') !== -1) { // 處理帶有查詢參數的 URL 或沒有明確檔案名的情況
                filename = 'downloaded_file_' + Date.now();
                // 嘗試從 Content-Disposition 頭獲取更準確的檔案名
                const contentDisposition = response.headers['content-disposition'];
                if (contentDisposition) {
                    const match = /filename="?([^"]+)"?/.exec(contentDisposition);
                    if (match && match[1]) {
                        filename = match[1];
                    }
                }
            }
            
            const fullFilePath = path.join(this.savePath, filename);
            const writer = fs.createWriteStream(fullFilePath); // 建立寫入串流

            let downloaded = 0;

            response.data.on('data', (chunk) => {
                writer.write(chunk); // 將數據塊寫入檔案
                downloaded += chunk.length;
                if (totalLength > 0) {
                    this.emitProgress(parseInt((downloaded * 100) / totalLength)); // 發射進度信號
                }
            });

            response.data.on('end', () => {
                writer.end();
                log(`Downloaded: ${fullFilePath}`); // 記錄下載完成
                this.emitFinished(`Downloaded to: ${fullFilePath}`); // 發射完成信號
            });

            response.data.on('error', (err) => {
                writer.destroy(); // 銷毀寫入串流
                log(`Error during download stream: ${err.message}`); // 記錄串流錯誤
                this.emitFinished("Download failed"); // 發射失敗信號
                // 如果下載失敗，可以考慮刪除不完整的檔案
                if (fs.existsSync(fullFilePath)) {
                    fs.unlinkSync(fullFilePath);
                    log(`Incomplete file ${fullFilePath} removed.`);
                }
            });

        } catch (e) {
            log(`Error in DownloadWorker.run: ${e.message}`); // 記錄錯誤
            this.emitFinished("Download failed: " + e.message); // 發射失敗信號，包含錯誤信息
        }
    }

    start() {
        this.run();
    }
}

module.exports = { DownloadWorker };
