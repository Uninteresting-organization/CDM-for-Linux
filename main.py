import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from gui.main_ui import CDMApp
from PyQt5.QtWidgets import QApplication

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = CDMApp()
    window.show()
    sys.exit(app.exec_())

