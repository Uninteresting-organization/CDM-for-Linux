// utils/logger.js
const fs = require('fs');
const path = require('path');
// 假設 settings.json 在 cdm-linux/config/ 下
const settings = require('../config/settings.json'); 

function log(message) {
    if (settings.enable_logging) {
        const logFilePath = settings.log_file;
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        // 確保 log 檔案的目錄存在
        const logDir = path.dirname(logFilePath);
        try {
            fs.mkdirSync(logDir, { recursive: true });
        } catch (error) {
            console.error(`[ERROR] Failed to create log directory ${logDir}: ${error.message}`);
            // 如果無法創建目錄，則直接輸出到控制台，不嘗試寫入檔案
            console.log(logEntry);
            return;
        }
        fs.appendFileSync(logFilePath, logEntry, 'utf8'); // 同步寫入日誌檔案
    }
    console.log(message); // 同時輸出到控制台
}

module.exports = { log };
