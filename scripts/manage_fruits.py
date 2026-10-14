#!/usr/bin/env python3
"""
Cfruit 水果資料庫管理工具 (Fruit Database Manager & TFDA Sync Tool)

功能：
1. python3 scripts/manage_fruits.py list
   -> 列出目前收錄之所有水果項目與基本營養數值
2. python3 scripts/manage_fruits.py sync
   -> 將 src/data/fruits.json 的變更同步生成至 src/data/fruitsData.js
3. python3 scripts/manage_fruits.py add
   -> 互動式引導新增水果項目，輸入衛福部 TFDA 營養數值並自動儲存同步
4. python3 scripts/manage_fruits.py query-tfda <水果關鍵字>
   -> 透過衛福部食藥署 Open Data API 查詢官方樣品檢驗資料
"""

import os
import sys
import json
import urllib.request
import urllib.parse
import urllib.error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(BASE_DIR, 'src', 'data', 'fruits.json')
JS_PATH = os.path.join(BASE_DIR, 'src', 'data', 'fruitsData.js')

def load_fruits():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_fruits(fruits):
    # 1. 寫入 fruits.json
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(fruits, f, ensure_ascii=False, indent=2)
    
    # 2. 自動同步生成 fruitsData.js
    js_content = f"""(function() {{
  const root = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
  root.FRUITS_DATA = {json.dumps(fruits, ensure_ascii=False, indent=2)};
}})();
"""
    with open(JS_PATH, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"✅ 已成功更新 {JSON_PATH}")
    print(f"✅ 已同步更新 {JS_PATH} (共收錄 {len(fruits)} 款水果)")

def list_fruits():
    fruits = load_fruits()
    print(f"\n🍎 Cfruit 目前收錄的水果百科清單 (共 {len(fruits)} 款)：")
    print("-" * 88)
    print(f"{'ID':<18} {'名稱':<10} {'熱量(kcal)':<10} {'糖分(g)':<8} {'纖維(g)':<8} {'GI等級':<8} {'衛福部官方樣品連結'}")
    print("-" * 88)
    for f in fruits:
        nut = f.get('nutrition_per_100g', {})
        tfda_name = f.get('tfda_sample_name', '已對照') if f.get('tfda_url') else '未設定'
        print(f"{f['id']:<18} {f['emoji']} {f['name']:<8} {nut.get('calories', 0):<10} {nut.get('sugar', 0):<8} {nut.get('dietary_fiber', 0):<8} {f.get('gi_level', 'N/A'):<8} {tfda_name}")
    print("-" * 88)

def sync_data():
    fruits = load_fruits()
    save_fruits(fruits)

def query_tfda(keyword):
    """
    查詢衛福部食品藥物管理署 (TFDA) 官方營養資料庫，取得樣品名稱與直連報告網址
    """
    import ssl
    import re
    import html
    print(f"\n🔍 正在向衛福部食藥署 (TFDA) 資料庫查詢關鍵字：「{keyword}」...")
    search_url = f"https://consumer.fda.gov.tw/Food/TFND.aspx?nodeID=178&k={urllib.parse.quote(keyword)}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"
    }
    ctx = ssl._create_unverified_context()

    try:
        req = urllib.request.Request(search_url, headers=headers)
        with urllib.request.urlopen(req, timeout=12, context=ctx) as resp:
            raw_html = resp.read().decode('utf-8')
            matches = re.findall(r'href=[\"\'](tfndDetail\.aspx\?[^\"\']+)[\"\'][^>]*>(.*?)<\/a>', raw_html)
            
            if not matches:
                print(f"⚠️ 在衛福部資料庫中未找到直接相符「{keyword}」的樣品。")
                print(f"💡 官方搜尋網址：{search_url}")
                return []
            
            print(f"🎉 找到 {len(matches)} 筆衛福部檢驗樣品資料：\n")
            results = []
            for idx, (link, link_text) in enumerate(matches[:8]):
                sample_name = html.unescape(link_text).strip()
                full_url = f"https://consumer.fda.gov.tw/Food/{link}"
                results.append((sample_name, full_url))
                print(f"[{idx + 1}] 樣品名稱：{sample_name}")
                print(f"    官方直連網址：{full_url}\n")
            return results
    except Exception as e:
        print(f"⚠️ 連線查詢失敗：{e}")
        print(f"💡 可直接在瀏覽器開啟官方查詢庫：{search_url}")
        return []

def add_fruit_interactive():
    print("\n🍎 Cfruit 水果百科 - 新增水果項目精靈")
    print("--------------------------------------------------")
    print("請依序輸入該水果的各項屬性（標註 * 為必填）：\n")
    
    fid = input("1. 水果唯一英文 ID * (如 pitaya_red): ").strip()
    if not fid:
        print("❌ ID 不能為空！")
        return
    
    fruits = load_fruits()
    if any(f['id'] == fid for f in fruits):
        print(f"❌ ID '{fid}' 已經存在！")
        return
    
    name = input("2. 中文名稱 * (如 紅肉火龍果): ").strip()
    en_name = input("3. 英文名稱 * (如 Red Dragon Fruit): ").strip()
    cat = input("4. 分類 [本土瓜果/熱帶水果/柑橘類/漿果與小水果/核果與仁果] (預設: 熱帶水果): ").strip() or "熱帶水果"
    emoji = input("5. 圖示 Emoji (預設: 🍎): ").strip() or "🍎"
    gi_level = input("6. GI 升糖指數等級 [low/medium/high] (預設: low): ").strip() or "low"
    gi_val = float(input("7. GI 數值 (預設: 38): ").strip() or 38)
    
    serv_name = input("8. 生活常規份量名稱 (預設: 顆 (中)): ").strip() or "顆 (中)"
    serv_grams = float(input("9. 生活常規份量公克數 (預設: 200): ").strip() or 200)
    
    print("\n📊 接下來請輸入【每 100g】衛福部營養成分數值：")
    cal = float(input("  - 熱量 Calories (kcal) *: ").strip())
    water = float(input("  - 水分 Water (g) [預設 85.0]: ").strip() or 85.0)
    prot = float(input("  - 粗蛋白質 Protein (g) *: ").strip())
    fat = float(input("  - 粗脂肪 Total Fat (g) *: ").strip())
    sat_fat = float(input("  - 飽和脂肪 Saturated Fat (g) [預設 0.0]: ").strip() or 0.0)
    trans_fat = float(input("  - 反式脂肪 Trans Fat (g) [預設 0.0]: ").strip() or 0.0)
    carb = float(input("  - 總碳水化合物 Carbohydrates (g) *: ").strip())
    sugar = float(input("  - 糖分 Sugar (g) *: ").strip())
    fiber = float(input("  - 膳食纖維 Dietary Fiber (g) *: ").strip())
    sod = float(input("  - 鈉 Sodium (mg) *: ").strip())
    vit_c = float(input("  - 維生素 C Vitamin C (mg) *: ").strip())
    pot = float(input("  - 鉀 Potassium (mg) *: ").strip())
    
    desc = input("\n10. 營養特點說明: ").strip() or f"{name}營養豐富，口感甜美。"
    raw_tags = input("11. 標籤 (逗號分隔，如 低GI推薦,高纖維): ").strip()
    tags = [t.strip() for t in raw_tags.split(',') if t.strip()] if raw_tags else ["低GI推薦"]

    tfda_url_input = input(f"12. 衛福部官方檢驗直連網址 (選填，直接 Enter 預設搜尋「{name}」): ").strip()
    tfda_url = tfda_url_input or f"https://consumer.fda.gov.tw/Food/TFND.aspx?nodeID=178&k={urllib.parse.quote(name)}"
    tfda_sample = input(f"13. 衛福部樣品名稱 (選填，直接 Enter 預設為「{name}」): ").strip() or name

    new_fruit = {
        "id": fid,
        "name": name,
        "english_name": en_name,
        "category": cat,
        "emoji": emoji,
        "themeColor": "emerald",
        "serving_unit": {
            "name": serv_name,
            "grams": serv_grams
        },
        "gi_level": gi_level,
        "gi_value": gi_val,
        "tags": tags,
        "description": desc,
        "tfda_url": tfda_url,
        "tfda_sample_name": tfda_sample,
        "nutrition_per_100g": {
            "calories": cal,
            "water": water,
            "protein": prot,
            "fat": fat,
            "carbohydrates": carb,
            "sugar": sugar,
            "dietary_fiber": fiber,
            "vitamin_c": vit_c,
            "potassium": pot,
            "magnesium": 10.0,
            "calcium": 10.0,
            "sodium": sod,
            "saturated_fat": sat_fat,
            "trans_fat": trans_fat
        }
    }
    
    fruits.append(new_fruit)
    save_fruits(fruits)
    print(f"\n🎉 成功新增水果「{emoji} {name}」！重新整理網頁即可在水果百科與水果搭配中立即使用！")

def main():
    if len(sys.argv) < 2 or sys.argv[1] in ['-h', '--help', 'help']:
        print(__doc__)
        return
    
    cmd = sys.argv[1]
    if cmd == 'list':
        list_fruits()
    elif cmd == 'sync':
        sync_data()
    elif cmd == 'add':
        add_fruit_interactive()
    elif cmd == 'query-tfda':
        if len(sys.argv) < 3:
            print("請輸入要查詢的水果名稱，例如：python3 scripts/manage_fruits.py query-tfda 芭樂")
            return
        query_tfda(sys.argv[2])
    else:
        print(f"未知指令：{cmd}")
        print("可用指令：list, sync, add, query-tfda <名稱>")

if __name__ == '__main__':
    main()
