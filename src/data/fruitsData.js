(function() {
  const root = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
  root.FRUITS_DATA = [
  {
    "id": "guava_pearl",
    "name": "珍珠芭樂",
    "english_name": "Pearl Guava",
    "category": "本土瓜果",
    "emoji": "🍐",
    "themeColor": "emerald",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 250
    },
    "gi_level": "low",
    "gi_value": 31,
    "tags": [
      "超高維生素C",
      "高纖維",
      "低GI推薦",
      "減重首選"
    ],
    "description": "維生素 C 冠軍水果之一，一顆中型芭樂即可提供成人數天的維生素 C 需求，且糖分低、纖維豐富。",
    "nutrition_per_100g": {
      "calories": 42.0,
      "water": 88.1,
      "protein": 0.7,
      "fat": 0.2,
      "carbohydrates": 10.6,
      "sugar": 5.2,
      "dietary_fiber": 3.7,
      "vitamin_c": 193.7,
      "potassium": 176.0,
      "magnesium": 6.0,
      "calcium": 7.0,
      "sodium": 0.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=299",
    "tfda_sample_name": "珍珠芭樂"
  },
  {
    "id": "guava_red",
    "name": "紅心芭樂",
    "english_name": "Red-fleshed Guava",
    "category": "本土瓜果",
    "emoji": "🍈",
    "themeColor": "rose",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 240
    },
    "gi_level": "low",
    "gi_value": 30,
    "tags": [
      "超高維生素C",
      "茄紅素",
      "高纖抗氧化",
      "低糖推薦"
    ],
    "description": "果肉呈誘人珊瑚紅，富含茄紅素與類胡蘿蔔素，抗氧化力強，維生素 C 含量超越一般芭樂。",
    "nutrition_per_100g": {
      "calories": 42.0,
      "water": 88.0,
      "protein": 0.8,
      "fat": 0.1,
      "carbohydrates": 10.7,
      "sugar": 5.3,
      "dietary_fiber": 3.9,
      "vitamin_c": 214.4,
      "potassium": 166.0,
      "magnesium": 6.0,
      "calcium": 5.0,
      "sodium": 1.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=2034",
    "tfda_sample_name": "紅心芭樂"
  },
  {
    "id": "apple_fuji",
    "name": "富士蘋果 (帶皮)",
    "english_name": "Fuji Apple (with skin)",
    "category": "仁果類",
    "emoji": "🍎",
    "themeColor": "red",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 204
    },
    "gi_level": "low",
    "gi_value": 36,
    "tags": [
      "低GI推薦",
      "高果膠",
      "帶皮食用",
      "槲皮素多酚",
      "四季百搭"
    ],
    "description": "衛生福利部食品藥物管理署 (TFDA) 官方「富士蘋果(帶皮)」檢驗認證規格（樣品編號 D3200501）。前處理描述為帶皮去核打碎，廢棄率僅 7.0%。連皮食用可保留果皮中特有之膳食纖維、槲皮素與多酚抗氧化物，營養價值更完整。",
    "nutrition_per_100g": {
      "calories": 45.0,
      "water": 87.6,
      "protein": 0.2,
      "fat": 0.1,
      "carbohydrates": 11.9,
      "sugar": 9.4,
      "dietary_fiber": 1.7,
      "vitamin_c": 4.9,
      "potassium": 94.0,
      "magnesium": 4.0,
      "calcium": 6.0,
      "sodium": 3.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=2040",
    "tfda_sample_name": "富士蘋果(帶皮)"
  },
  {
    "id": "apple_green",
    "name": "青蘋果",
    "english_name": "Granny Smith Apple",
    "category": "仁果類",
    "emoji": "🍏",
    "themeColor": "lime",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 180
    },
    "gi_level": "low",
    "gi_value": 34,
    "tags": [
      "低糖首選",
      "有機酸",
      "促進消化"
    ],
    "description": "酸甜多汁，含有豐富的蘋果酸，糖分比一般紅蘋果低，是生酮或低碳控糖飲食者的熱門選擇。",
    "nutrition_per_100g": {
      "calories": 46.0,
      "water": 87.1,
      "protein": 0.3,
      "fat": 0.1,
      "carbohydrates": 12.2,
      "sugar": 9.6,
      "dietary_fiber": 1.7,
      "vitamin_c": 3.4,
      "potassium": 102.0,
      "magnesium": 3.0,
      "calcium": 3.0,
      "sodium": 3.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=415",
    "tfda_sample_name": "翠玉青蘋果"
  },
  {
    "id": "banana",
    "name": "香蕉",
    "english_name": "Banana",
    "category": "熱帶水果",
    "emoji": "🍌",
    "themeColor": "amber",
    "serving_unit": {
      "name": "根 (中)",
      "grams": 120
    },
    "gi_level": "medium",
    "gi_value": 52,
    "tags": [
      "高鉀補充電解質",
      "能量補給",
      "色胺酸好心情"
    ],
    "description": "運動前後的最佳能量補給站！富含鉀、鎂與維生素 B6，能迅速補充肝醣並預防肌肉抽筋。",
    "nutrition_per_100g": {
      "calories": 85.0,
      "water": 75.7,
      "protein": 1.5,
      "fat": 0.1,
      "carbohydrates": 22.1,
      "sugar": 18.0,
      "dietary_fiber": 1.6,
      "vitamin_c": 10.7,
      "potassium": 368.0,
      "magnesium": 24.0,
      "calcium": 5.0,
      "sodium": 0.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=1&id=24",
    "tfda_sample_name": "北蕉平均值"
  },
  {
    "id": "kiwi_green",
    "name": "綠奇異果",
    "english_name": "Green Kiwifruit",
    "category": "進口果物",
    "emoji": "🥝",
    "themeColor": "emerald",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 85
    },
    "gi_level": "low",
    "gi_value": 39,
    "tags": [
      "高纖順暢",
      "奇異果酵素",
      "高維生素C"
    ],
    "description": "含有獨特奇異果酵素（Actinidin），能分解蛋白質促進消化，纖維含量極佳，腸道蠕動好幫手。",
    "nutrition_per_100g": {
      "calories": 56.0,
      "water": 84.0,
      "protein": 1.1,
      "fat": 0.3,
      "carbohydrates": 14.0,
      "sugar": 9.3,
      "dietary_fiber": 2.7,
      "vitamin_c": 73.0,
      "potassium": 291.0,
      "magnesium": 12.0,
      "calcium": 28.0,
      "sodium": 3.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=411",
    "tfda_sample_name": "奇異果"
  },
  {
    "id": "kiwi_gold",
    "name": "黃金奇異果",
    "english_name": "Gold Kiwifruit",
    "category": "進口果物",
    "emoji": "🥝",
    "themeColor": "yellow",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 90
    },
    "gi_level": "low",
    "gi_value": 38,
    "tags": [
      "超高維生素C",
      "清甜低酸",
      "美顏抗氧化"
    ],
    "description": "維生素 C 含量高達綠奇異果的兩倍以上，口感香甜多汁且不酸澀，一顆即可滿足整日維生素 C。",
    "nutrition_per_100g": {
      "calories": 59.0,
      "water": 83.3,
      "protein": 0.8,
      "fat": 0.3,
      "carbohydrates": 15.0,
      "sugar": 10.6,
      "dietary_fiber": 1.4,
      "vitamin_c": 90.1,
      "potassium": 252.0,
      "magnesium": 11.0,
      "calcium": 22.0,
      "sodium": 2.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=412",
    "tfda_sample_name": "金黃奇異果"
  },
  {
    "id": "mango_irwin",
    "name": "愛文芒果",
    "english_name": "Irwin Mango",
    "category": "熱帶水果",
    "emoji": "🥭",
    "themeColor": "orange",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 350
    },
    "gi_level": "medium",
    "gi_value": 55,
    "tags": [
      "β胡蘿蔔素",
      "香甜濃郁",
      "高糖量留意"
    ],
    "description": "台灣夏季代表水果，香氣馥郁、果肉細緻，富含維生素 A 前驅物 β-胡蘿蔔素，甜度高宜適量攝取。",
    "nutrition_per_100g": {
      "calories": 42.0,
      "water": 88.2,
      "protein": 0.4,
      "fat": 0.2,
      "carbohydrates": 11.0,
      "sugar": 8.8,
      "dietary_fiber": 0.9,
      "vitamin_c": 23.5,
      "potassium": 106.0,
      "magnesium": 7.0,
      "calcium": 6.0,
      "sodium": 1.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=238",
    "tfda_sample_name": "愛文芒果"
  },
  {
    "id": "pineapple",
    "name": "金鑽鳳梨",
    "english_name": "Golden Diamond Pineapple",
    "category": "本土瓜果",
    "emoji": "🍍",
    "themeColor": "amber",
    "serving_unit": {
      "name": "碗 (切塊)",
      "grams": 160
    },
    "gi_level": "medium",
    "gi_value": 59,
    "tags": [
      "鳳梨酵素",
      "去油解膩",
      "促進食慾"
    ],
    "description": "含有豐富鳳梨蛋白酶，飯後食用可幫助蛋白質分解與消化，微甜帶微酸，深受大家喜愛。",
    "nutrition_per_100g": {
      "calories": 50.0,
      "water": 85.8,
      "protein": 0.5,
      "fat": 0.1,
      "carbohydrates": 13.2,
      "sugar": 9.5,
      "dietary_fiber": 1.1,
      "vitamin_c": 23.5,
      "potassium": 133.0,
      "magnesium": 12.0,
      "calcium": 5.0,
      "sodium": 1.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=366",
    "tfda_sample_name": "金鑽鳳梨"
  },
  {
    "id": "papaya",
    "name": "木瓜",
    "english_name": "Papaya",
    "category": "熱帶水果",
    "emoji": "🍈",
    "themeColor": "orange",
    "serving_unit": {
      "name": "碗 (切塊)",
      "grams": 150
    },
    "gi_level": "low",
    "gi_value": 42,
    "tags": [
      "木瓜酵素",
      "護眼維生素A",
      "溫和養胃"
    ],
    "description": "肉質軟嫩多汁，含木瓜酵素及維生素 A、葉酸，對腸胃溫和不刺激，非常適合銀髮族與兒童。",
    "nutrition_per_100g": {
      "calories": 38.0,
      "water": 89.1,
      "protein": 0.6,
      "fat": 0.1,
      "carbohydrates": 9.9,
      "sugar": 6.2,
      "dietary_fiber": 1.4,
      "vitamin_c": 58.3,
      "potassium": 186.0,
      "magnesium": 15.0,
      "calcium": 23.0,
      "sodium": 3.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=1&id=13",
    "tfda_sample_name": "木瓜平均值"
  },
  {
    "id": "watermelon_red",
    "name": "紅肉西瓜",
    "english_name": "Red Watermelon",
    "category": "本土瓜果",
    "emoji": "🍉",
    "themeColor": "red",
    "serving_unit": {
      "name": "片",
      "grams": 250
    },
    "gi_level": "high",
    "gi_value": 72,
    "tags": [
      "清涼解渴",
      "茄紅素",
      "高水分低卡"
    ],
    "description": "水分高達 91% 以上，消暑解渴首選，亦富含茄紅素與瓜胺酸，但升糖指數較高，糖友宜節制份量。",
    "nutrition_per_100g": {
      "calories": 33.0,
      "water": 90.8,
      "protein": 0.8,
      "fat": 0.1,
      "carbohydrates": 8.0,
      "sugar": 7.5,
      "dietary_fiber": 0.3,
      "vitamin_c": 6.8,
      "potassium": 121.0,
      "magnesium": 11.0,
      "calcium": 7.0,
      "sodium": 1.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=1&id=15",
    "tfda_sample_name": "西瓜平均值(紅肉小瓜)"
  },
  {
    "id": "grape_kyoho",
    "name": "巨峰葡萄",
    "english_name": "Kyoho Grape",
    "category": "漿果類",
    "emoji": "🍇",
    "themeColor": "purple",
    "serving_unit": {
      "name": "串 (約12顆)",
      "grams": 130
    },
    "gi_level": "medium",
    "gi_value": 50,
    "tags": [
      "白藜蘆醇",
      "花青素",
      "抗老化首選"
    ],
    "description": "紫黑色果皮含有滿滿的花青素與白藜蘆醇，洗淨後連皮帶籽或打汁飲用，可攝取最大抗氧化多酚。",
    "nutrition_per_100g": {
      "calories": 64.0,
      "water": 82.4,
      "protein": 0.5,
      "fat": 0.3,
      "carbohydrates": 16.6,
      "sugar": 15.6,
      "dietary_fiber": 0.2,
      "vitamin_c": 2.2,
      "potassium": 122.0,
      "magnesium": 4.0,
      "calcium": 5.0,
      "sodium": 1.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=404",
    "tfda_sample_name": "巨峰葡萄"
  },
  {
    "id": "wax_apple",
    "name": "黑珍珠蓮霧",
    "english_name": "Wax Apple",
    "category": "本土瓜果",
    "emoji": "🍎",
    "themeColor": "red",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 110
    },
    "gi_level": "low",
    "gi_value": 35,
    "tags": [
      "超低熱量",
      "清脆爽口",
      "控糖推薦"
    ],
    "description": "熱量極低且水分充足，口感爽脆清甜，是減肥中嘴饞、糖尿病患者最安心的水果之一。",
    "nutrition_per_100g": {
      "calories": 33.0,
      "water": 91.1,
      "protein": 0.3,
      "fat": 0.3,
      "carbohydrates": 8.1,
      "sugar": 7.5,
      "dietary_fiber": 0.7,
      "vitamin_c": 7.6,
      "potassium": 83.0,
      "magnesium": 5.0,
      "calcium": 2.0,
      "sodium": 2.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=2035",
    "tfda_sample_name": "蓮霧(紅寶石)"
  },
  {
    "id": "dragonfruit_red",
    "name": "紅肉火龍果",
    "english_name": "Red Dragon Fruit",
    "category": "本土仙人掌果",
    "emoji": "🪷",
    "themeColor": "pink",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 300
    },
    "gi_level": "low",
    "gi_value": 38,
    "tags": [
      "甜菜紅素",
      "高排便順暢",
      "高鉀消水腫"
    ],
    "description": "天然抗氧化甜菜紅素（Betacyanin）豐富，黑色細籽提供豐富水溶性纖維，通腸排便效果顯著。",
    "nutrition_per_100g": {
      "calories": 50.0,
      "water": 85.8,
      "protein": 1.1,
      "fat": 0.2,
      "carbohydrates": 12.3,
      "sugar": 9.2,
      "dietary_fiber": 1.3,
      "vitamin_c": 6.3,
      "potassium": 219.0,
      "magnesium": 24.0,
      "calcium": 9.0,
      "sodium": 0.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=380",
    "tfda_sample_name": "紅龍果(紅肉)"
  },
  {
    "id": "dragonfruit_white",
    "name": "白肉火龍果",
    "english_name": "White Dragon Fruit",
    "category": "本土仙人掌果",
    "emoji": "🍈",
    "themeColor": "emerald",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 320
    },
    "gi_level": "low",
    "gi_value": 36,
    "tags": [
      "膳食纖維冠軍",
      "清爽微甜",
      "促進排便"
    ],
    "description": "膳食纖維含量略高於紅肉火龍果，甜度適中，口感脆嫩，適合注重腸胃保健的人群。",
    "nutrition_per_100g": {
      "calories": 51.0,
      "water": 85.7,
      "protein": 0.9,
      "fat": 0.4,
      "carbohydrates": 12.4,
      "sugar": 8.9,
      "dietary_fiber": 1.7,
      "vitamin_c": 5.3,
      "potassium": 226.0,
      "magnesium": 28.0,
      "calcium": 4.0,
      "sodium": 0.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=379",
    "tfda_sample_name": "紅龍果(白肉)"
  },
  {
    "id": "orange_ponkan",
    "name": "椪柑 (橘子)",
    "english_name": "Ponkan Tangerine",
    "category": "柑橘類",
    "emoji": "🍊",
    "themeColor": "orange",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 150
    },
    "gi_level": "low",
    "gi_value": 40,
    "tags": [
      "橙皮苷",
      "膳食纖維",
      "潤肺止咳"
    ],
    "description": "橘絡（白色絲狀）富含柑橘多酚與橙皮苷，具有抗發炎與強化微血管之益處，建議連橘絡一同食用。",
    "nutrition_per_100g": {
      "calories": 40.0,
      "water": 88.7,
      "protein": 0.8,
      "fat": 0.2,
      "carbohydrates": 10.0,
      "sugar": 6.8,
      "dietary_fiber": 1.5,
      "vitamin_c": 25.5,
      "potassium": 74.0,
      "magnesium": 8.0,
      "calcium": 21.0,
      "sodium": 2.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=227",
    "tfda_sample_name": "椪柑"
  },
  {
    "id": "orange_sweet",
    "name": "柳橙",
    "english_name": "Sweet Orange",
    "category": "柑橘類",
    "emoji": "🍊",
    "themeColor": "orange",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 140
    },
    "gi_level": "low",
    "gi_value": 43,
    "tags": [
      "高維生素C",
      "葉酸豐富",
      "增強免疫"
    ],
    "description": "維生素 C 與葉酸的重要來源，香氣清新，直接整顆剝皮吃比榨汁更能攝取完整的纖維與控糖。",
    "nutrition_per_100g": {
      "calories": 44.0,
      "water": 87.6,
      "protein": 0.8,
      "fat": 0.1,
      "carbohydrates": 11.0,
      "sugar": 8.6,
      "dietary_fiber": 2.1,
      "vitamin_c": 41.2,
      "potassium": 145.0,
      "magnesium": 12.0,
      "calcium": 28.0,
      "sodium": 5.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=223",
    "tfda_sample_name": "柳橙"
  },
  {
    "id": "lemon",
    "name": "檸檬",
    "english_name": "Lemon",
    "category": "柑橘類",
    "emoji": "🍋",
    "themeColor": "yellow",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 100
    },
    "gi_level": "low",
    "gi_value": 25,
    "tags": [
      "極低糖",
      "高檸檬酸",
      "生酮推薦"
    ],
    "description": "含糖量極低，富含檸檬酸與類黃酮，常作為調味與檸檬水使用，能促進鐵質吸收並開胃生津。",
    "nutrition_per_100g": {
      "calories": 33.0,
      "water": 91.0,
      "protein": 0.7,
      "fat": 0.5,
      "carbohydrates": 7.4,
      "sugar": 0.9,
      "dietary_fiber": 1.2,
      "vitamin_c": 34.0,
      "potassium": 150.0,
      "magnesium": 10.0,
      "calcium": 26.0,
      "sodium": 4.0,
      "saturated_fat": 0.2,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=230",
    "tfda_sample_name": "檸檬"
  },
  {
    "id": "strawberry",
    "name": "草莓",
    "english_name": "Strawberry",
    "category": "漿果類",
    "emoji": "🍓",
    "themeColor": "red",
    "serving_unit": {
      "name": "碗 (約8顆)",
      "grams": 130
    },
    "gi_level": "low",
    "gi_value": 41,
    "tags": [
      "高維生素C",
      "低熱量",
      "葉酸好孕"
    ],
    "description": "外型討喜，熱量低且富含維生素 C 與鞣花酸（Ellagic acid），是美白護膚與抗氧化的明星水果。",
    "nutrition_per_100g": {
      "calories": 39.0,
      "water": 89.0,
      "protein": 1.0,
      "fat": 0.2,
      "carbohydrates": 9.3,
      "sugar": 6.1,
      "dietary_fiber": 1.8,
      "vitamin_c": 69.2,
      "potassium": 199.0,
      "magnesium": 14.0,
      "calcium": 16.0,
      "sodium": 7.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=434",
    "tfda_sample_name": "草莓"
  },
  {
    "id": "blueberry",
    "name": "藍莓",
    "english_name": "Blueberry",
    "category": "漿果類",
    "emoji": "🫐",
    "themeColor": "indigo",
    "serving_unit": {
      "name": "盒/碗",
      "grams": 100
    },
    "gi_level": "low",
    "gi_value": 53,
    "tags": [
      "超級抗氧化",
      "護眼花青素",
      "大腦靈活"
    ],
    "description": "被譽為「北美藍寶石」，花青素含量名列前茅，能保護視網膜健康、改善夜間視力並延緩腦部退化。",
    "nutrition_per_100g": {
      "calories": 53.0,
      "water": 85.3,
      "protein": 0.5,
      "fat": 0.3,
      "carbohydrates": 13.6,
      "sugar": 9.1,
      "dietary_fiber": 1.8,
      "vitamin_c": 6.7,
      "potassium": 75.0,
      "magnesium": 5.0,
      "calcium": 11.0,
      "sodium": 0.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=2245",
    "tfda_sample_name": "藍莓(台灣)"
  },
  {
    "id": "blueberry_wild_frozen_ca",
    "name": "冷凍加拿大藍莓",
    "english_name": "Canadian Wild Blueberry (Frozen)",
    "category": "漿果類",
    "emoji": "🫐",
    "themeColor": "indigo",
    "serving_unit": {
      "name": "碗",
      "grams": 100
    },
    "gi_level": "low",
    "gi_value": 53,
    "tags": [
      "IQF急速冷凍",
      "高纖維",
      "野生小果",
      "全年供貨"
    ],
    "description": "加拿大魁北克、新斯科細亞一帶的野生矮叢藍莓 (lowbush)，果粒小、色深、皮肉比高，採收後 IQF 急速冷凍。膳食纖維約為一般鮮藍莓的 2 倍，全年穩定供貨，適合果昔、烘焙與常態拼盤。營養數值採美國農業部 USDA FoodData Central「Blueberries, wild, frozen」(FDC 173949)；TFDA 資料庫目前無冷凍藍莓樣品。",
    "nutrition_per_100g": {
      "calories": 57.0,
      "water": 85.8,
      "protein": 0.0,
      "fat": 0.2,
      "carbohydrates": 13.8,
      "sugar": 7.0,
      "dietary_fiber": 4.4,
      "vitamin_c": 1.7,
      "potassium": 68.0,
      "magnesium": 7.0,
      "calcium": 17.0,
      "sodium": 3.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://fdc.nal.usda.gov/food-details/173949/nutrients",
    "tfda_sample_name": "USDA FDC 173949 Blueberries, wild, frozen",
    "source_label": "USDA營養成分資料庫"
  },
  {
    "id": "avocado",
    "name": "酪梨 (牛油果)",
    "english_name": "Avocado",
    "category": "優質油脂果實",
    "emoji": "🥑",
    "themeColor": "emerald",
    "serving_unit": {
      "name": "顆 (中半顆)",
      "grams": 100
    },
    "gi_level": "low",
    "gi_value": 15,
    "tags": [
      "單元不飽和脂肪",
      "極低糖高纖",
      "心血管守護"
    ],
    "description": "營養學上歸為優質油脂類，富含單元不飽和脂肪酸 Omega-9、葉黃素及鉀，幾無糖分，飽足感極長。",
    "nutrition_per_100g": {
      "calories": 65.0,
      "water": 86.1,
      "protein": 1.6,
      "fat": 3.7,
      "carbohydrates": 7.9,
      "sugar": 0.9,
      "dietary_fiber": 3.4,
      "vitamin_c": 9.9,
      "potassium": 251.0,
      "magnesium": 19.0,
      "calcium": 6.0,
      "sodium": 2.0,
      "saturated_fat": 1.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=368",
    "tfda_sample_name": "酪梨(綠皮)"
  },
  {
    "id": "cherry",
    "name": "櫻桃",
    "english_name": "Cherry",
    "category": "核果類",
    "emoji": "🍒",
    "themeColor": "rose",
    "serving_unit": {
      "name": "碗 (約10顆)",
      "grams": 100
    },
    "gi_level": "low",
    "gi_value": 22,
    "tags": [
      "褪黑激素助眠",
      "花青素消炎",
      "補鐵抗疲勞"
    ],
    "description": "含有天然褪黑激素，有助於調節生理時鐘與提升睡眠品質；花青素能減緩運動後的肌肉痠痛發炎。",
    "nutrition_per_100g": {
      "calories": 75.0,
      "water": 78.8,
      "protein": 1.2,
      "fat": 0.3,
      "carbohydrates": 19.1,
      "sugar": 12.8,
      "dietary_fiber": 1.3,
      "vitamin_c": 10.7,
      "potassium": 236.0,
      "magnesium": 13.0,
      "calcium": 15.0,
      "sodium": 2.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=257",
    "tfda_sample_name": "櫻桃"
  },
  {
    "id": "lychee",
    "name": "玉荷包荔枝",
    "english_name": "Lychee",
    "category": "熱帶水果",
    "emoji": "🫐",
    "themeColor": "rose",
    "serving_unit": {
      "name": "串 (約8顆)",
      "grams": 120
    },
    "gi_level": "medium",
    "gi_value": 57,
    "tags": [
      "高維生素C",
      "甜蜜多汁",
      "高糖警示"
    ],
    "description": "果肉半透明晶瑩剔透，維生素 C 含量頗高，但果糖與總糖分較濃縮，一次食用建議控制在 8~10 顆內。",
    "nutrition_per_100g": {
      "calories": 65.0,
      "water": 81.8,
      "protein": 1.0,
      "fat": 0.2,
      "carbohydrates": 16.5,
      "sugar": 14.1,
      "dietary_fiber": 0.8,
      "vitamin_c": 52.3,
      "potassium": 185.0,
      "magnesium": 14.0,
      "calcium": 4.0,
      "sodium": 1.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=1&id=25",
    "tfda_sample_name": "荔枝平均值"
  },
  {
    "id": "longan",
    "name": "龍眼 (桂圓)",
    "english_name": "Longan",
    "category": "熱帶水果",
    "emoji": "🟤",
    "themeColor": "amber",
    "serving_unit": {
      "name": "串 (約12顆)",
      "grams": 100
    },
    "gi_level": "medium",
    "gi_value": 60,
    "tags": [
      "高維生素C",
      "安神養血",
      "糖分偏高"
    ],
    "description": "維生素 C 高達 95mg，具有滋補安神傳統食療價值，但含糖量較高，血糖不穩定者宜分次享用。",
    "nutrition_per_100g": {
      "calories": 72.0,
      "water": 79.7,
      "protein": 1.1,
      "fat": 0.4,
      "carbohydrates": 18.0,
      "sugar": 15.2,
      "dietary_fiber": 1.8,
      "vitamin_c": 95.4,
      "potassium": 282.0,
      "magnesium": 9.0,
      "calcium": 5.0,
      "sodium": 3.0,
      "saturated_fat": 0.2,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=269",
    "tfda_sample_name": "龍眼"
  },
  {
    "id": "passion_fruit",
    "name": "百香果",
    "english_name": "Passion Fruit",
    "category": "本土瓜果",
    "emoji": "🫐",
    "themeColor": "purple",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 70
    },
    "gi_level": "low",
    "gi_value": 30,
    "tags": [
      "膳食纖維王",
      "香氣濃郁",
      "類黃酮抗發炎"
    ],
    "description": "連黑籽一起嚼食，膳食纖維高達 5.3g，酸甜風味十足，富含生物類黃酮與維生素 A、C。",
    "nutrition_per_100g": {
      "calories": 102.0,
      "water": 73.9,
      "protein": 2.0,
      "fat": 2.2,
      "carbohydrates": 21.3,
      "sugar": 11.5,
      "dietary_fiber": 4.9,
      "vitamin_c": 15.3,
      "potassium": 273.0,
      "magnesium": 23.0,
      "calcium": 8.0,
      "sodium": 2.0,
      "saturated_fat": 0.3,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=261",
    "tfda_sample_name": "百香果(台農一號)"
  },
  {
    "id": "passion_fruit_juice",
    "name": "百香果汁",
    "english_name": "Passion Fruit Juice",
    "category": "本土瓜果",
    "emoji": "🧃",
    "themeColor": "amber",
    "serving_unit": {
      "name": "杯 (中)",
      "grams": 200
    },
    "gi_level": "low",
    "gi_value": 32,
    "tags": [
      "香氣濃郁",
      "純天然原汁",
      "高鉀補充",
      "低GI推薦"
    ],
    "description": "去籽鮮榨百香果純原汁（TFDA 官方樣品 D0430101），保留酸甜濃郁香氣與豐富維生素 C 與鉀離子，糖分自然純粹，極適合鮮飲或搭配水果調配風味。",
    "nutrition_per_100g": {
      "calories": 73.0,
      "water": 79.6,
      "protein": 0.9,
      "fat": 0.4,
      "carbohydrates": 18.6,
      "sugar": 14.2,
      "dietary_fiber": 0.2,
      "vitamin_c": 18.5,
      "potassium": 239.0,
      "magnesium": 16.0,
      "calcium": 5.0,
      "sodium": 1.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=687",
    "tfda_sample_name": "百香果汁"
  },
  {
    "id": "persimmon_sweet",
    "name": "甜柿",
    "english_name": "Sweet Persimmon",
    "category": "核果類",
    "emoji": "🍊",
    "themeColor": "amber",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 180
    },
    "gi_level": "medium",
    "gi_value": 50,
    "tags": [
      "維生素A前驅物",
      "香甜清脆",
      "保護眼睛"
    ],
    "description": "秋季代表美味，清脆爽甜不咬舌，β-胡蘿蔔素與玉米黃素豐富，能減輕眼睛疲勞。",
    "nutrition_per_100g": {
      "calories": 57.0,
      "water": 84.0,
      "protein": 0.5,
      "fat": 0.1,
      "carbohydrates": 15.2,
      "sugar": 13.0,
      "dietary_fiber": 1.2,
      "vitamin_c": 44.8,
      "potassium": 131.0,
      "magnesium": 5.0,
      "calcium": 8.0,
      "sodium": 3.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=1&id=71",
    "tfda_sample_name": "甜柿平均值"
  },
  {
    "id": "peach",
    "name": "水蜜桃",
    "english_name": "Peach",
    "category": "核果類",
    "emoji": "🍑",
    "themeColor": "pink",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 160
    },
    "gi_level": "low",
    "gi_value": 42,
    "tags": [
      "低卡香甜",
      "鉀元素消腫",
      "果膠水潤"
    ],
    "description": "皮薄汁多香氣濃，熱量親民，含有豐富的果膠與多酚抗氧化物，深得大小朋友喜愛。",
    "nutrition_per_100g": {
      "calories": 40.0,
      "water": 88.6,
      "protein": 0.9,
      "fat": 0.1,
      "carbohydrates": 9.9,
      "sugar": 6.0,
      "dietary_fiber": 1.3,
      "vitamin_c": 6.6,
      "potassium": 187.0,
      "magnesium": 9.0,
      "calcium": 5.0,
      "sodium": 3.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=323",
    "tfda_sample_name": "水蜜桃"
  },
  {
    "id": "pear_asian",
    "name": "水梨 (高接梨)",
    "english_name": "Asian Pear",
    "category": "仁果類",
    "emoji": "🍐",
    "themeColor": "yellow",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 250
    },
    "gi_level": "low",
    "gi_value": 36,
    "tags": [
      "清熱潤喉",
      "水份充沛",
      "低GI推薦"
    ],
    "description": "肉質細膩爽口、多汁降火，富含水分與天門冬胺酸，適合換季潤肺與喉嚨保養。",
    "nutrition_per_100g": {
      "calories": 44.0,
      "water": 87.5,
      "protein": 0.2,
      "fat": 0.1,
      "carbohydrates": 11.9,
      "sugar": 7.8,
      "dietary_fiber": 1.4,
      "vitamin_c": 2.9,
      "potassium": 145.0,
      "magnesium": 6.0,
      "calcium": 2.0,
      "sodium": 0.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=357",
    "tfda_sample_name": "新興梨"
  },
  {
    "id": "cantaloupe",
    "name": "哈密瓜",
    "english_name": "Cantaloupe / Melon",
    "category": "本土瓜果",
    "emoji": "🍈",
    "themeColor": "emerald",
    "serving_unit": {
      "name": "碗 (切塊)",
      "grams": 160
    },
    "gi_level": "medium",
    "gi_value": 65,
    "tags": [
      "高鉀利水",
      "維生素C",
      "甜美解渴"
    ],
    "description": "含有高量鉀離子與維生素 C，能幫助體內多餘鈉離子排出、消水腫，清涼甜美。",
    "nutrition_per_100g": {
      "calories": 38.0,
      "water": 89.3,
      "protein": 0.6,
      "fat": 0.2,
      "carbohydrates": 9.5,
      "sugar": 8.5,
      "dietary_fiber": 0.6,
      "vitamin_c": 12.1,
      "potassium": 218.0,
      "magnesium": 14.0,
      "calcium": 9.0,
      "sodium": 12.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=2247",
    "tfda_sample_name": "洋香瓜(卡蜜拉)"
  },
  {
    "id": "jujube_taiwan",
    "name": "台灣蜜棗",
    "english_name": "Indian Jujube",
    "category": "本土瓜果",
    "emoji": "🍏",
    "themeColor": "lime",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 90
    },
    "gi_level": "low",
    "gi_value": 35,
    "tags": [
      "高維生素C",
      "低熱量清脆",
      "過年吉祥"
    ],
    "description": "台灣冬季特產，素有「台灣小蘋果」之稱，外皮翠綠清脆，維生素 C 含量約為蘋果的 10 倍！",
    "nutrition_per_100g": {
      "calories": 43.0,
      "water": 87.7,
      "protein": 1.1,
      "fat": 0.1,
      "carbohydrates": 10.7,
      "sugar": 7.3,
      "dietary_fiber": 1.6,
      "vitamin_c": 36.5,
      "potassium": 191.0,
      "magnesium": 5.0,
      "calcium": 7.0,
      "sodium": 2.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=1&id=31",
    "tfda_sample_name": "蜜棗平均值(大)"
  },
  {
    "id": "grapefruit_red",
    "name": "紅肉葡萄柚",
    "english_name": "Red Grapefruit",
    "category": "柑橘類",
    "emoji": "🍊",
    "themeColor": "rose",
    "serving_unit": {
      "name": "顆 (半顆)",
      "grams": 140
    },
    "gi_level": "low",
    "gi_value": 25,
    "tags": [
      "低GI燃脂",
      "高維生素C",
      "用藥注意"
    ],
    "description": "含有柚皮素與茄紅素，熱量低低升糖，深受健身控卡族喜愛。提醒：因影響肝臟代謝酶，服藥者請避免。",
    "nutrition_per_100g": {
      "calories": 37.0,
      "water": 89.9,
      "protein": 0.7,
      "fat": 0.3,
      "carbohydrates": 8.9,
      "sugar": 6.4,
      "dietary_fiber": 1.1,
      "vitamin_c": 39.7,
      "potassium": 184.0,
      "magnesium": 10.0,
      "calcium": 16.0,
      "sodium": 0.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=701",
    "tfda_sample_name": "紅寶石葡萄柚(古坑)"
  },
  {
    "id": "mulberry",
    "name": "桑葚",
    "english_name": "Mulberry",
    "category": "漿果類",
    "emoji": "🫐",
    "themeColor": "purple",
    "serving_unit": {
      "name": "碗",
      "grams": 100
    },
    "gi_level": "low",
    "gi_value": 25,
    "tags": [
      "花青素之王",
      "高鐵抗氧化",
      "滋陰明目"
    ],
    "description": "富含大量花青素、白藜蘆醇與鐵質，抗氧化力強勁，有助於紅血球生成與氣色紅潤。",
    "nutrition_per_100g": {
      "calories": 32.0,
      "water": 91.0,
      "protein": 1.1,
      "fat": 0.4,
      "carbohydrates": 7.0,
      "sugar": 3.8,
      "dietary_fiber": 1.3,
      "vitamin_c": 9.2,
      "potassium": 180.0,
      "magnesium": 11.0,
      "calcium": 41.0,
      "sodium": 1.0,
      "saturated_fat": 0.2,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=340",
    "tfda_sample_name": "桑葚"
  },
  {
    "id": "cranberry",
    "name": "蔓越莓 (小紅莓)",
    "english_name": "Cranberry",
    "category": "漿果類",
    "emoji": "🍒",
    "themeColor": "rose",
    "serving_unit": {
      "name": "杯",
      "grams": 100
    },
    "gi_level": "low",
    "gi_value": 45,
    "tags": [
      "A型前花青素",
      "泌尿守護",
      "低糖高纖"
    ],
    "description": "含有特有的 A 型前花青素（PACs），能抑制壞菌附著，是女性維持私密健康不可或缺的好夥伴。",
    "nutrition_per_100g": {
      "calories": 46.0,
      "water": 87.1,
      "protein": 0.4,
      "fat": 0.1,
      "carbohydrates": 12.0,
      "sugar": 4.3,
      "dietary_fiber": 4.6,
      "vitamin_c": 13.3,
      "potassium": 85.0,
      "magnesium": 6.0,
      "calcium": 8.0,
      "sodium": 2.0,
      "saturated_fat": 0.0,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/TFND.aspx?nodeID=178&k=%E8%94%93%E8%B6%8A%E8%8E%93",
    "tfda_sample_name": "蔓越莓"
  },
  {
    "id": "sugar_apple",
    "name": "釋迦 (番荔枝)",
    "english_name": "Sugar Apple",
    "category": "本土瓜果",
    "emoji": "🍈",
    "themeColor": "emerald",
    "serving_unit": {
      "name": "顆 (中)",
      "grams": 250
    },
    "gi_level": "high",
    "gi_value": 75,
    "tags": [
      "濃醇甘甜",
      "維生素C超高",
      "高鉀高糖注意"
    ],
    "description": "台灣台東特產，果肉綿密像牛奶冰淇淋！維生素 C 與鉀含量極高，但糖度與熱量亦居冠，建議與家人共享。",
    "nutrition_per_100g": {
      "calories": 104.0,
      "water": 70.0,
      "protein": 2.2,
      "fat": 0.1,
      "carbohydrates": 26.6,
      "sugar": 16.0,
      "dietary_fiber": 2.7,
      "vitamin_c": 99.0,
      "potassium": 390.0,
      "magnesium": 29.0,
      "calcium": 18.0,
      "sodium": 7.0,
      "saturated_fat": 0.1,
      "trans_fat": 0.0
    },
    "tfda_url": "https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=0&id=271",
    "tfda_sample_name": "釋迦"
  }
];
})();
