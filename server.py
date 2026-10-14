#!/usr/bin/env python3
"""
Cfruit 水果營養計算機 - 本地輕量 Web 伺服器
執行方式：python3 server.py
"""
import http.server
import socketserver
import webbrowser
import os
import sys
import functools

PORT = 3000

def main():
    web_dir = os.path.dirname(os.path.abspath(__file__))
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=web_dir)
    
    # 嘗試綁定埠號，若被佔用則自動遞增測試 (3000, 3001, ...)
    port = PORT
    for attempt in range(10):
        try:
            with socketserver.TCPServer(("", port), handler) as httpd:
                url = f"http://localhost:{port}/index.html"
                print("=" * 60)
                print(f"🍊 Cfruit 水果營養成分計算機已在本地啟動！")
                print(f"🌐 請在瀏覽器開啟：{url}")
                print("=" * 60)
                print("提示：在終端機按下 Ctrl+C 即可停止伺服器。")
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
                httpd.serve_forever()
                break
        except OSError as e:
            if "Address already in use" in str(e):
                port += 1
            else:
                raise e

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 伺服器已正常停止。")
        sys.exit(0)
