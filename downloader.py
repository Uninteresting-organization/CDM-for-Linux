import requests
import os
from utils.logger import log
from PyQt5.QtCore import QThread, pyqtSignal

class DownloadWorker(QThread):
    progress = pyqtSignal(int)
    finished = pyqtSignal(str)

    def __init__(self, url, save_path):
        super().__init__()
        self.url = url
        self.save_path = save_path

    def run(self):
        try:
            r = requests.get(self.url, stream=True, timeout=30)
            total = int(r.headers.get('content-length', 0))
            filename = os.path.join(self.save_path, self.url.split("/")[-1])
            log(f"Start downloading: {self.url} -> {filename}")
            with open(filename, 'wb') as f:
                downloaded = 0
                if total == 0:
                    # 沒有 content-length，直接寫入
                    for data in r.iter_content(1024):
                        f.write(data)
                        downloaded += len(data)
                        self.progress.emit(0)
                else:
                    for data in r.iter_content(1024):
                        f.write(data)
                        downloaded += len(data)
                        self.progress.emit(int(downloaded * 100 / total))
            log(f"Downloaded: {filename}")
            self.finished.emit(f"Downloaded: {filename}")
        except Exception as e:
            log(f"Error: {str(e)}")
            self.finished.emit(f"Download failed: {str(e)}")
