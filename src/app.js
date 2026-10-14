/**
 * Cfruit - 水果營養計算機 & 商品法規營養標示核心前端邏輯
 * 遵照台灣衛生福利部食品藥物管理署 (TFDA)《包裝食品營養標示應遵行事項》
 */

// 衛生福利部每日營養素基準值 (TFDA 每日參考值)
const TFDA_DAILY_VALUES = {
  calories: 2000,        // 大卡 (kcal)
  protein: 60,           // 公克 (g)
  fat: 60,               // 公克 (g)
  saturated_fat: 18,     // 公克 (g)
  carbohydrates: 300,    // 公克 (g)
  sodium: 2000,          // 毫克 (mg)
  dietary_fiber: 25,     // 公克 (g)
  vitamin_c: 100,        // 毫克 (mg)
  potassium: 2500,       // 毫克 (mg)
};

// 衛生福利部國民健康署標準與健康參考指標 (DRI 成人每日建議)
const DRI = {
  DAILY_SERVINGS: 2,       // 每日水果建議 2 份 (約 120-180 kcal)
  VITAMIN_C_MG: 100,       // 維生素 C 建議 100 mg
  FRUIT_FIBER_GOAL_G: 6,   // 水果類建議攝取纖維目標 6g
  SUGAR_MAX_G: 30,         // 單次/水果糖分建議健康上限 30g
  POTASSIUM_MG: 2500,      // 鉀每日建議 2500mg
};


const STORAGE_KEY = 'cfruit_current_state_v1';
const RECIPES_KEY = 'cfruit_saved_recipes_v1';
const FAVORITES_KEY = 'cfruit_favorites_v1';
const PIN_TOP_KEY = 'cfruit_favorite_pin_top_v1';
const INVENTORY_BATCHES_KEY = 'cfruit_inventory_batches_v1';

function getStoredJSON(key, fallback) {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    }
  } catch (e) {
    console.warn('LocalStorage not accessible:', e);
  }
  return fallback;
}

function setStoredJSON(key, val) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

// 狀態管理
const savedState = getStoredJSON(STORAGE_KEY, getStoredJSON('fruitnutri_current_state_v1', null));

// ==========================================
// 補充非水果配方原料資料庫 (Supplementary Recipe Ingredients)
// 提供番茄、甜菜根、菠菜、芹菜、石蓮花、布丁、糖漿等 TFDA 標準營養資料
// ==========================================
const SUPPLEMENTARY_INGREDIENTS = {
  tomato: {
    id: 'tomato',
    name: '番茄',
    english_name: 'Tomato',
    category: '生鮮蔬果',
    emoji: '🍅',
    themeColor: 'red',
    serving_unit: { name: '顆 (中)', grams: 150 },
    gi_level: 'low',
    gi_value: 15,
    tags: ['低GI', '低熱量', '茄紅素', '高抗氧化'],
    description: '富含茄紅素、維生素C及鉀，熱量極低且水分充沛。',
    nutrition_per_100g: {
      calories: 19.0,
      water: 94.0,
      protein: 0.9,
      fat: 0.2,
      carbohydrates: 4.1,
      sugar: 2.6,
      dietary_fiber: 1.2,
      vitamin_c: 13.7,
      potassium: 237.0,
      magnesium: 11.0,
      calcium: 10.0,
      sodium: 5.0,
      saturated_fat: 0.0,
      trans_fat: 0.0
    },
    tfda_sample_name: '番茄'
  },
  beetroot: {
    id: 'beetroot',
    name: '甜菜根',
    english_name: 'Beetroot',
    category: '根莖蔬果',
    emoji: '🟣',
    themeColor: 'rose',
    serving_unit: { name: '個', grams: 100 },
    gi_level: 'low',
    gi_value: 30,
    tags: ['天然甜菜紅素', '高硝酸鹽', '循環補給'],
    description: '富含天然甜菜紅素與硝酸鹽，為歐美果昔與耐力補給經典素材。',
    nutrition_per_100g: {
      calories: 43.0,
      water: 87.6,
      protein: 1.6,
      fat: 0.2,
      carbohydrates: 9.6,
      sugar: 6.8,
      dietary_fiber: 2.8,
      vitamin_c: 4.9,
      potassium: 325.0,
      magnesium: 23.0,
      calcium: 16.0,
      sodium: 78.0,
      saturated_fat: 0.0,
      trans_fat: 0.0
    },
    tfda_sample_name: '甜菜根'
  },
  spinach: {
    id: 'spinach',
    name: '菠菜',
    english_name: 'Spinach',
    category: '深色蔬菜',
    emoji: '🥬',
    themeColor: 'emerald',
    serving_unit: { name: '份', grams: 100 },
    gi_level: 'low',
    gi_value: 15,
    tags: ['高葉酸', '豐富葉黃素', '綠果昔核心'],
    description: '綠果昔的核心綠葉蔬菜，含豐富葉酸、葉黃素與植物性鐵質。',
    nutrition_per_100g: {
      calories: 23.0,
      water: 91.4,
      protein: 2.9,
      fat: 0.4,
      carbohydrates: 3.6,
      sugar: 0.4,
      dietary_fiber: 2.2,
      vitamin_c: 28.1,
      potassium: 558.0,
      magnesium: 79.0,
      calcium: 99.0,
      sodium: 79.0,
      saturated_fat: 0.1,
      trans_fat: 0.0
    },
    tfda_sample_name: '菠菜'
  },
  celery: {
    id: 'celery',
    name: '芹菜',
    english_name: 'Celery',
    category: '高纖蔬菜',
    emoji: '🌱',
    themeColor: 'green',
    serving_unit: { name: '根', grams: 50 },
    gi_level: 'low',
    gi_value: 15,
    tags: ['高鉀降壓', '超低卡排鈉', '清爽纖維'],
    description: '高鉀低卡，具天然芳香與利水排鈉特性。',
    nutrition_per_100g: {
      calories: 14.0,
      water: 95.4,
      protein: 0.7,
      fat: 0.2,
      carbohydrates: 3.0,
      sugar: 1.3,
      dietary_fiber: 1.6,
      vitamin_c: 3.1,
      potassium: 260.0,
      magnesium: 11.0,
      calcium: 40.0,
      sodium: 80.0,
      saturated_fat: 0.0,
      trans_fat: 0.0
    },
    tfda_sample_name: '芹菜'
  },
  graptopetalum: {
    id: 'graptopetalum',
    name: '石蓮花',
    english_name: 'Graptopetalum',
    category: '機能草本',
    emoji: '🪴',
    themeColor: 'teal',
    serving_unit: { name: '葉', grams: 20 },
    gi_level: 'low',
    gi_value: 15,
    tags: ['機能養生', '多汁微酸', '天然抗氧化'],
    description: '機能養生多肉植物，微酸多汁，常搭配蜂蜜或甘甜水果調配。',
    nutrition_per_100g: {
      calories: 16.0,
      water: 95.0,
      protein: 0.6,
      fat: 0.1,
      carbohydrates: 3.5,
      sugar: 0.8,
      dietary_fiber: 2.5,
      vitamin_c: 12.0,
      potassium: 180.0,
      magnesium: 15.0,
      calcium: 65.0,
      sodium: 12.0,
      saturated_fat: 0.0,
      trans_fat: 0.0
    },
    tfda_sample_name: '石蓮花'
  },
  pudding: {
    id: 'pudding',
    name: '布丁',
    english_name: 'Pudding',
    category: '調味配料',
    emoji: '🍮',
    themeColor: 'amber',
    serving_unit: { name: '個', grams: 100 },
    gi_level: 'high',
    gi_value: 65,
    tags: ['滑順香甜', '酪梨經典組合'],
    description: '雞蛋焦糖布丁，台灣酪梨飲品店之經典靈魂搭檔。',
    nutrition_per_100g: {
      calories: 110.0,
      water: 75.0,
      protein: 2.5,
      fat: 2.8,
      carbohydrates: 18.5,
      sugar: 16.0,
      dietary_fiber: 0.0,
      vitamin_c: 0.0,
      potassium: 85.0,
      magnesium: 8.0,
      calcium: 60.0,
      sodium: 45.0,
      saturated_fat: 1.5,
      trans_fat: 0.0
    },
    tfda_sample_name: '雞蛋布丁'
  },
  sugar: {
    id: 'sugar',
    name: '糖/糖漿',
    english_name: 'Sugar / Syrup',
    category: '調味原料',
    emoji: '🧂',
    themeColor: 'slate',
    serving_unit: { name: '匙', grams: 15 },
    gi_level: 'high',
    gi_value: 70,
    tags: ['風味平衡', '甜度調和'],
    description: '天然蔗糖，增添飲品適口性與酸甜平衡。',
    nutrition_per_100g: {
      calories: 387.0,
      water: 0.2,
      protein: 0.0,
      fat: 0.0,
      carbohydrates: 99.8,
      sugar: 99.8,
      dietary_fiber: 0.0,
      vitamin_c: 0.0,
      potassium: 2.0,
      magnesium: 0.0,
      calcium: 1.0,
      sodium: 1.0,
      saturated_fat: 0.0,
      trans_fat: 0.0
    },
    tfda_sample_name: '蔗糖'
  }
};

// ==========================================
// 37款商業官方配方庫 (鮮果多區、超商區、R&D研發中)
// ==========================================
const DEFAULT_COMMERCIAL_RECIPES = [
  {
    "id": "recipe_xgd_01",
    "name": "香芒",
    "zone": "鮮果多區",
    "spec": "230ml, 1s",
    "plateItems": [
      {
        "fruitId": "mango_irwin",
        "grams": 50,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 40,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 80,
        "storageType": "fresh"
      },
      {
        "fruitId": "passion_fruit",
        "grams": 20,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 190,
    "labelConfig": {
      "productName": "香芒",
      "servingSize": 190,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 101
  },
  {
    "id": "recipe_xgd_02",
    "name": "野莓",
    "zone": "鮮果多區",
    "spec": "200ml, 1s",
    "plateItems": [
      {
        "fruitId": "strawberry",
        "grams": 25,
        "storageType": "fresh"
      },
      {
        "fruitId": "blueberry",
        "grams": 7,
        "storageType": "fresh"
      },
      {
        "fruitId": "cranberry",
        "grams": 14,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 60,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 55,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 161,
    "labelConfig": {
      "productName": "野莓",
      "servingSize": 161,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 79.8
  },
  {
    "id": "recipe_xgd_03",
    "name": "翡翠",
    "zone": "鮮果多區",
    "spec": "230ml, 1s",
    "plateItems": [
      {
        "fruitId": "graptopetalum",
        "grams": 15,
        "storageType": "fresh"
      },
      {
        "fruitId": "guava_pearl",
        "grams": 45,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 40,
        "storageType": "fresh"
      },
      {
        "fruitId": "kiwi_green",
        "grams": 25,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 60,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 185,
    "labelConfig": {
      "productName": "翡翠",
      "servingSize": 185,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 86.1
  },
  {
    "id": "recipe_xgd_04",
    "name": "綠果昔",
    "zone": "鮮果多區",
    "spec": "230ml, 1s",
    "plateItems": [
      {
        "fruitId": "celery",
        "grams": 10,
        "storageType": "fresh"
      },
      {
        "fruitId": "mango_irwin",
        "grams": 50,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 20,
        "storageType": "fresh"
      },
      {
        "fruitId": "kiwi_green",
        "grams": 20,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 55,
        "storageType": "fresh"
      },
      {
        "fruitId": "spinach",
        "grams": 35,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 190,
    "labelConfig": {
      "productName": "綠果昔",
      "servingSize": 190,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 85.2
  },
  {
    "id": "recipe_xgd_05",
    "name": "火龍果",
    "zone": "鮮果多區",
    "spec": "230ml, 1s",
    "plateItems": [
      {
        "fruitId": "dragonfruit_red",
        "grams": 65,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 40,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 70,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 175,
    "labelConfig": {
      "productName": "火龍果",
      "servingSize": 175,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 90.4
  },
  {
    "id": "recipe_xgd_06",
    "name": "紅果昔",
    "zone": "鮮果多區",
    "spec": "250ml, 1s",
    "plateItems": [
      {
        "fruitId": "beetroot",
        "grams": 30,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 60,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 80,
        "storageType": "fresh"
      },
      {
        "fruitId": "lemon",
        "grams": 1,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 171,
    "labelConfig": {
      "productName": "紅果昔",
      "servingSize": 171,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 86.8
  },
  {
    "id": "recipe_xgd_07",
    "name": "鳳梨芭樂",
    "zone": "鮮果多區",
    "spec": "120g",
    "plateItems": [
      {
        "fruitId": "guava_pearl",
        "grams": 40,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 80,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 120,
    "labelConfig": {
      "productName": "鳳梨芭樂",
      "servingSize": 120,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 57.6
  },
  {
    "id": "recipe_xgd_08",
    "name": "芒果綜合",
    "zone": "鮮果多區",
    "spec": "125g",
    "plateItems": [
      {
        "fruitId": "mango_irwin",
        "grams": 45,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 20,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 60,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 125,
    "labelConfig": {
      "productName": "芒果綜合",
      "servingSize": 125,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 64.7
  },
  {
    "id": "recipe_xgd_09",
    "name": "芒果鳳梨",
    "zone": "鮮果多區",
    "spec": "120g",
    "plateItems": [
      {
        "fruitId": "mango_irwin",
        "grams": 25,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 95,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 120,
    "labelConfig": {
      "productName": "芒果鳳梨",
      "servingSize": 120,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 62.9
  },
  {
    "id": "recipe_xgd_10",
    "name": "純酪梨",
    "zone": "鮮果多區",
    "spec": "110g",
    "plateItems": [
      {
        "fruitId": "avocado",
        "grams": 110,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 110,
    "labelConfig": {
      "productName": "純酪梨",
      "servingSize": 110,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 176
  },
  {
    "id": "recipe_xgd_11",
    "name": "酪梨香蕉",
    "zone": "鮮果多區",
    "spec": "120g",
    "plateItems": [
      {
        "fruitId": "avocado",
        "grams": 70,
        "storageType": "fresh"
      },
      {
        "fruitId": "banana",
        "grams": 50,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 120,
    "labelConfig": {
      "productName": "酪梨香蕉",
      "servingSize": 120,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 156.5
  },
  {
    "id": "recipe_xgd_12",
    "name": "酪梨布丁",
    "zone": "鮮果多區",
    "spec": "160g",
    "plateItems": [
      {
        "fruitId": "avocado",
        "grams": 110,
        "storageType": "fresh"
      },
      {
        "fruitId": "pudding",
        "grams": 50,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 160,
    "labelConfig": {
      "productName": "酪梨布丁",
      "servingSize": 160,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 231
  },
  {
    "id": "recipe_xgd_13",
    "name": "木瓜(鮮果杯)",
    "zone": "鮮果多區",
    "spec": "140g",
    "plateItems": [
      {
        "fruitId": "papaya",
        "grams": 140,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 140,
    "labelConfig": {
      "productName": "木瓜(鮮果杯)",
      "servingSize": 140,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 54.6
  },
  {
    "id": "recipe_xgd_14",
    "name": "香蕉(鮮果杯)",
    "zone": "鮮果多區",
    "spec": "130g",
    "plateItems": [
      {
        "fruitId": "banana",
        "grams": 130,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 130,
    "labelConfig": {
      "productName": "香蕉(鮮果杯)",
      "servingSize": 130,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 115.7
  },
  {
    "id": "recipe_xgd_15",
    "name": "草莓檸檬",
    "zone": "鮮果多區",
    "spec": "127g",
    "plateItems": [
      {
        "fruitId": "strawberry",
        "grams": 125,
        "storageType": "fresh"
      },
      {
        "fruitId": "lemon",
        "grams": 2,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 127,
    "labelConfig": {
      "productName": "草莓檸檬",
      "servingSize": 127,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 45.7
  },
  {
    "id": "recipe_xgd_16",
    "name": "大愛文芒果",
    "zone": "鮮果多區",
    "spec": "160g",
    "plateItems": [
      {
        "fruitId": "mango_irwin",
        "grams": 160,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 160,
    "labelConfig": {
      "productName": "大愛文芒果",
      "servingSize": 160,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 80
  },
  {
    "id": "recipe_xgd_17",
    "name": "蔓越莓鳳梨",
    "zone": "鮮果多區",
    "spec": "100g",
    "plateItems": [
      {
        "fruitId": "cranberry",
        "grams": 20,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 80,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 100,
    "labelConfig": {
      "productName": "蔓越莓鳳梨",
      "servingSize": 100,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 51.6
  },
  {
    "id": "recipe_xgd_18",
    "name": "藍莓香蕉",
    "zone": "鮮果多區",
    "spec": "40g",
    "plateItems": [
      {
        "fruitId": "blueberry",
        "grams": 25,
        "storageType": "fresh"
      },
      {
        "fruitId": "banana",
        "grams": 15,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 40,
    "labelConfig": {
      "productName": "藍莓香蕉",
      "servingSize": 40,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 27.6
  },
  {
    "id": "recipe_xgd_19",
    "name": "番茄綜合",
    "zone": "鮮果多區",
    "spec": "230ml, 180g",
    "plateItems": [
      {
        "fruitId": "tomato",
        "grams": 80,
        "storageType": "fresh"
      },
      {
        "fruitId": "guava_pearl",
        "grams": 40,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 20,
        "storageType": "fresh"
      },
      {
        "fruitId": "kiwi_green",
        "grams": 20,
        "storageType": "fresh"
      },
      {
        "fruitId": "sugar",
        "grams": 20,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 180,
    "labelConfig": {
      "productName": "番茄綜合",
      "servingSize": 180,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 129.4
  },
  {
    "id": "recipe_cs_01",
    "name": "超木瓜",
    "zone": "超商區",
    "spec": "140g",
    "plateItems": [
      {
        "fruitId": "papaya",
        "grams": 140,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 140,
    "labelConfig": {
      "productName": "超木瓜",
      "servingSize": 140,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 54.6
  },
  {
    "id": "recipe_cs_02",
    "name": "超鳳梨蘋果",
    "zone": "超商區",
    "spec": "180g",
    "plateItems": [
      {
        "fruitId": "apple_fuji",
        "grams": 80,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 100,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 180,
    "labelConfig": {
      "productName": "超鳳梨蘋果",
      "servingSize": 180,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 94.6
  },
  {
    "id": "recipe_cs_03",
    "name": "超番石榴特調",
    "zone": "超商區",
    "spec": "180g",
    "plateItems": [
      {
        "fruitId": "guava_pearl",
        "grams": 45,
        "storageType": "fresh"
      },
      {
        "fruitId": "kiwi_green",
        "grams": 25,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 40,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 70,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 180,
    "labelConfig": {
      "productName": "超番石榴特調",
      "servingSize": 180,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 89
  },
  {
    "id": "recipe_cs_04",
    "name": "超奇異果綜合",
    "zone": "超商區",
    "spec": "185g",
    "plateItems": [
      {
        "fruitId": "graptopetalum",
        "grams": 15,
        "storageType": "fresh"
      },
      {
        "fruitId": "guava_pearl",
        "grams": 45,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 40,
        "storageType": "fresh"
      },
      {
        "fruitId": "kiwi_green",
        "grams": 25,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 60,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 185,
    "labelConfig": {
      "productName": "超奇異果綜合",
      "servingSize": 185,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 86.1
  },
  {
    "id": "recipe_cs_05",
    "name": "超莓果綜合",
    "zone": "超商區",
    "spec": "165g",
    "plateItems": [
      {
        "fruitId": "cranberry",
        "grams": 15,
        "storageType": "fresh"
      },
      {
        "fruitId": "blueberry",
        "grams": 15,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 135,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 165,
    "labelConfig": {
      "productName": "超莓果綜合",
      "servingSize": 165,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 87
  },
  {
    "id": "recipe_cs_06",
    "name": "超酪梨",
    "zone": "超商區",
    "spec": "90g",
    "plateItems": [
      {
        "fruitId": "avocado",
        "grams": 90,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 90,
    "labelConfig": {
      "productName": "超酪梨",
      "servingSize": 90,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 144
  },
  {
    "id": "recipe_cs_07",
    "name": "超酪梨香蕉",
    "zone": "超商區",
    "spec": "120g",
    "plateItems": [
      {
        "fruitId": "avocado",
        "grams": 70,
        "storageType": "fresh"
      },
      {
        "fruitId": "banana",
        "grams": 50,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 120,
    "labelConfig": {
      "productName": "超酪梨香蕉",
      "servingSize": 120,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 156.5
  },
  {
    "id": "recipe_cs_08",
    "name": "超火龍果綜合",
    "zone": "超商區",
    "spec": "180g",
    "plateItems": [
      {
        "fruitId": "dragonfruit_red",
        "grams": 60,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 40,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 80,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 180,
    "labelConfig": {
      "productName": "超火龍果綜合",
      "servingSize": 180,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 93.2
  },
  {
    "id": "recipe_cs_09",
    "name": "超芒粽(芒果綜合)",
    "zone": "超商區",
    "spec": "185g",
    "plateItems": [
      {
        "fruitId": "mango_irwin",
        "grams": 70,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 40,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 75,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 185,
    "labelConfig": {
      "productName": "超芒粽(芒果綜合)",
      "servingSize": 185,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 95.6
  },
  {
    "id": "recipe_cs_10",
    "name": "超甜菜跟綜合",
    "zone": "超商區",
    "spec": "173g",
    "plateItems": [
      {
        "fruitId": "beetroot",
        "grams": 30,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 60,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 80,
        "storageType": "fresh"
      },
      {
        "fruitId": "lemon",
        "grams": 3,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 173,
    "labelConfig": {
      "productName": "超甜菜跟綜合",
      "servingSize": 173,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 87.5
  },
  {
    "id": "recipe_cs_11",
    "name": "超純鳳梨",
    "zone": "超商區",
    "spec": "220g",
    "plateItems": [
      {
        "fruitId": "pineapple",
        "grams": 220,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 220,
    "labelConfig": {
      "productName": "超純鳳梨",
      "servingSize": 220,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 116.6
  },
  {
    "id": "recipe_cs_12",
    "name": "超百香特調",
    "zone": "超商區",
    "spec": "120g",
    "plateItems": [
      {
        "fruitId": "pineapple",
        "grams": 60,
        "storageType": "fresh"
      },
      {
        "fruitId": "passion_fruit",
        "grams": 60,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 120,
    "labelConfig": {
      "productName": "超百香特調",
      "servingSize": 120,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 70.2
  },
  {
    "id": "recipe_cs_13",
    "name": "超鳳芭",
    "zone": "超商區",
    "spec": "170g",
    "plateItems": [
      {
        "fruitId": "pineapple",
        "grams": 70,
        "storageType": "fresh"
      },
      {
        "fruitId": "guava_pearl",
        "grams": 100,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 170,
    "labelConfig": {
      "productName": "超鳳芭",
      "servingSize": 170,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 75.1
  },
  {
    "id": "recipe_cs_14",
    "name": "超草莓特調",
    "zone": "超商區",
    "spec": "150g",
    "plateItems": [
      {
        "fruitId": "strawberry",
        "grams": 35,
        "storageType": "fresh"
      },
      {
        "fruitId": "cranberry",
        "grams": 10,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 40,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 65,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 150,
    "labelConfig": {
      "productName": "超草莓特調",
      "servingSize": 150,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 72.5
  },
  {
    "id": "recipe_cs_15",
    "name": "超草莓綜合",
    "zone": "超商區",
    "spec": "165g",
    "plateItems": [
      {
        "fruitId": "strawberry",
        "grams": 30,
        "storageType": "fresh"
      },
      {
        "fruitId": "cranberry",
        "grams": 15,
        "storageType": "fresh"
      },
      {
        "fruitId": "apple_fuji",
        "grams": 40,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 80,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 165,
    "labelConfig": {
      "productName": "超草莓綜合",
      "servingSize": 165,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 80.9
  },
  {
    "id": "recipe_rd_01",
    "name": "野莓綜合(R&D)",
    "zone": "R&D研發中",
    "spec": "160g",
    "plateItems": [
      {
        "fruitId": "cranberry",
        "grams": 15,
        "storageType": "fresh"
      },
      {
        "fruitId": "blueberry",
        "grams": 15,
        "storageType": "fresh"
      },
      {
        "fruitId": "pineapple",
        "grams": 130,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 160,
    "labelConfig": {
      "productName": "野莓綜合(R&D)",
      "servingSize": 160,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 84.4
  },
  {
    "id": "recipe_rd_02",
    "name": "百香鳳梨(R&D)",
    "zone": "R&D研發中",
    "spec": "120g",
    "plateItems": [
      {
        "fruitId": "pineapple",
        "grams": 60,
        "storageType": "fresh"
      },
      {
        "fruitId": "passion_fruit",
        "grams": 60,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 120,
    "labelConfig": {
      "productName": "百香鳳梨(R&D)",
      "servingSize": 120,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 70.2
  },
  {
    "id": "recipe_rd_03",
    "name": "藍莓1Kg大包裝",
    "zone": "R&D研發中",
    "spec": "1000g",
    "plateItems": [
      {
        "fruitId": "blueberry",
        "grams": 1000,
        "storageType": "fresh"
      }
    ],
    "createdAt": "2026/09/19",
    "totalWeight": 1000,
    "labelConfig": {
      "productName": "藍莓1Kg大包裝",
      "servingSize": 1000,
      "servingsPerPkg": 1,
      "labelFormat": "dual",
      "includeFiber": true,
      "includeVitaminC": true,
      "includePotassium": true,
      "sourceType": "plate"
    },
    "totalCalories": 570
  }
];

// 輔助函式：計算配方總熱量
function calcRecipeTotalCalories(plateItems) {
  let cal = 0;
  for (const item of (plateItems || [])) {
    const f = getFruit(item.fruitId);
    if (f && f.nutrition_per_100g) {
      cal += (f.nutrition_per_100g.calories * (Number(item.grams) || 0)) / 100;
    }
  }
  return Math.round(cal * 10) / 10;
}

let savedRecipes = getStoredJSON(RECIPES_KEY, null);
if (!savedRecipes || !Array.isArray(savedRecipes) || savedRecipes.length === 0) {
  savedRecipes = JSON.parse(JSON.stringify(DEFAULT_COMMERCIAL_RECIPES));
  setStoredJSON(RECIPES_KEY, savedRecipes);
} else {
  const existingIds = new Set(savedRecipes.map(r => r.id));
  const missing = DEFAULT_COMMERCIAL_RECIPES.filter(r => !existingIds.has(r.id));
  if (missing.length > 0) {
    savedRecipes = [...savedRecipes, ...JSON.parse(JSON.stringify(missing))];
    setStoredJSON(RECIPES_KEY, savedRecipes);
  }
}

const savedFavorites = getStoredJSON(FAVORITES_KEY, (savedState && savedState.favorites) || ['guava_pearl', 'guava_red', 'apple_fuji']);
const savedPinTop = getStoredJSON(PIN_TOP_KEY, (savedState && savedState.favoritePinTop !== undefined) ? savedState.favoritePinTop : true);


// ==========================================
// 預載歷史採購與入庫批次模擬數據 (Default Inventory Batches)
// 涵蓋過去 12 個月主要季節性水果與冷凍規格真實行情
// ==========================================
const DEFAULT_INVENTORY_BATCHES = [
  // 🥭 愛文芒果 (Mango Irwin) - 產季自 4 月至 8 月，波幅劇烈
  {
    id: 'batch_mango_1',
    fruitId: 'mango_irwin',
    date: '2025-10-15',
    storageType: 'fresh',
    batchNo: 'MG-202510-01',
    supplier: '屏東枋山青果行 (溫室/進口期)',
    purchasePrice: 240,
    yieldRate: 63,
    effectivePrice: 380.95,
    quantityKg: 60,
    totalAmount: 14400,
    notes: '非產季高價，僅少量供應展示用'
  },
  {
    id: 'batch_mango_2',
    fruitId: 'mango_irwin',
    date: '2026-01-20',
    storageType: 'frozen',
    batchNo: 'IQF-MG-202601-A',
    supplier: '佳美食品冷鏈 (IQF 急速冷凍芒果丁)',
    purchasePrice: 190,
    yieldRate: 95,
    effectivePrice: 200.0,
    quantityKg: 150,
    totalAmount: 28500,
    notes: '冬令淡季改用 IQF 芒果丁，維持穩定成本'
  },
  {
    id: 'batch_mango_3',
    fruitId: 'mango_irwin',
    date: '2026-03-25',
    storageType: 'fresh',
    batchNo: 'MG-202603-02',
    supplier: '屏東枋山集貨場 (早生期頭批)',
    purchasePrice: 210,
    yieldRate: 64,
    effectivePrice: 328.12,
    quantityKg: 80,
    totalAmount: 16800,
    notes: '早產季頭批果，香氣濃但價格偏高'
  },
  {
    id: 'batch_mango_4',
    fruitId: 'mango_irwin',
    date: '2026-05-12',
    storageType: 'fresh',
    batchNo: 'MG-202605-01',
    supplier: '台南玉井青果產銷班',
    purchasePrice: 165,
    yieldRate: 65,
    effectivePrice: 253.85,
    quantityKg: 120,
    totalAmount: 19800,
    notes: '產季開展，到貨量增加，價格平穩回落'
  },
  {
    id: 'batch_mango_5',
    fruitId: 'mango_irwin',
    date: '2026-06-20',
    storageType: 'fresh',
    batchNo: 'MG-202606-03',
    supplier: '台南玉井大市場 (大盛產高點)',
    purchasePrice: 120,
    yieldRate: 66,
    effectivePrice: 181.82,
    quantityKg: 250,
    totalAmount: 30000,
    notes: '端午盛產高峰期，品質甜度最佳，年度最低進價'
  },
  {
    id: 'batch_mango_6',
    fruitId: 'mango_irwin',
    date: '2026-07-15',
    storageType: 'frozen',
    batchNo: 'IQF-MG-202607-B',
    supplier: '佳美食品冷鏈 (IQF 急速冷凍芒果丁)',
    purchasePrice: 190,
    yieldRate: 95,
    effectivePrice: 200.0,
    quantityKg: 200,
    totalAmount: 38000,
    notes: '補充安全冷凍庫存，價格持平'
  },
  {
    id: 'batch_mango_7',
    fruitId: 'mango_irwin',
    date: '2026-07-28',
    storageType: 'fresh',
    batchNo: 'MG-202607-02',
    supplier: '台南玉井青果產銷班',
    purchasePrice: 145,
    yieldRate: 65,
    effectivePrice: 223.08,
    quantityKg: 150,
    totalAmount: 21750,
    notes: '產季中後期，價格微幅上揚'
  },
  {
    id: 'batch_mango_8',
    fruitId: 'mango_irwin',
    date: '2026-08-30',
    storageType: 'fresh',
    batchNo: 'MG-202608-01',
    supplier: '屏東枋山冷藏倉 (尾季)',
    purchasePrice: 185,
    yieldRate: 64,
    effectivePrice: 289.06,
    quantityKg: 80,
    totalAmount: 14800,
    notes: '產季尾聲供應量縮減，進貨成本走揚'
  },

  // 🍐 珍珠芭樂 (Guava Pearl) - 全年皆有，氣候豪雨影響大
  {
    id: 'batch_guava_1',
    fruitId: 'guava_pearl',
    date: '2025-11-10',
    storageType: 'fresh',
    batchNo: 'GV-202511-01',
    supplier: '彰化社頭果菜合作社',
    purchasePrice: 46,
    yieldRate: 76,
    effectivePrice: 60.53,
    quantityKg: 150,
    totalAmount: 6900,
    notes: '入冬品質脆甜，果實飽滿'
  },
  {
    id: 'batch_guava_2',
    fruitId: 'guava_pearl',
    date: '2026-01-15',
    storageType: 'fresh',
    batchNo: 'GV-202601-02',
    supplier: '高雄燕巢農會',
    purchasePrice: 42,
    yieldRate: 75,
    effectivePrice: 56.0,
    quantityKg: 200,
    totalAmount: 8400,
    notes: '冬春產期價格平穩'
  },
  {
    id: 'batch_guava_3',
    fruitId: 'guava_pearl',
    date: '2026-03-20',
    storageType: 'fresh',
    batchNo: 'GV-202603-01',
    supplier: '彰化社頭果菜合作社',
    purchasePrice: 38,
    yieldRate: 75,
    effectivePrice: 50.67,
    quantityKg: 180,
    totalAmount: 6840,
    notes: '春季盛產，行情順暢'
  },
  {
    id: 'batch_guava_4',
    fruitId: 'guava_pearl',
    date: '2026-05-25',
    storageType: 'fresh',
    batchNo: 'GV-202605-02',
    supplier: '高雄燕巢農會',
    purchasePrice: 35,
    yieldRate: 74,
    effectivePrice: 47.30,
    quantityKg: 220,
    totalAmount: 7700,
    notes: '夏季高溫前夕大出，批發價來到歷史低檔'
  },
  {
    id: 'batch_guava_5',
    fruitId: 'guava_pearl',
    date: '2026-07-18',
    storageType: 'fresh',
    batchNo: 'GV-202607-01',
    supplier: '高雄燕巢農會',
    purchasePrice: 62,
    yieldRate: 72,
    effectivePrice: 86.11,
    quantityKg: 100,
    totalAmount: 6200,
    notes: '連續豪雨淹水致落果，產量大減價格劇烈暴漲'
  },
  {
    id: 'batch_guava_6',
    fruitId: 'guava_pearl',
    date: '2026-08-25',
    storageType: 'fresh',
    batchNo: 'GV-202608-02',
    supplier: '彰化社頭果菜合作社',
    purchasePrice: 48,
    yieldRate: 74,
    effectivePrice: 64.86,
    quantityKg: 160,
    totalAmount: 7680,
    notes: '災後復原期，產量逐步回升'
  },
  {
    id: 'batch_guava_7',
    fruitId: 'guava_pearl',
    date: '2026-09-12',
    storageType: 'fresh',
    batchNo: 'GV-202609-01',
    supplier: '高雄燕巢農會',
    purchasePrice: 44,
    yieldRate: 75,
    effectivePrice: 58.67,
    quantityKg: 180,
    totalAmount: 7920,
    notes: '價格回歸常態區間'
  },

  // 🍓 大湖草莓 (Strawberry) - 冬春季極端高價與盛產斷層
  {
    id: 'batch_straw_1',
    fruitId: 'strawberry',
    date: '2025-11-28',
    storageType: 'frozen',
    batchNo: 'IQF-SB-202511-01',
    supplier: '聯華食品冷鏈 (IQF 全果草莓)',
    purchasePrice: 220,
    yieldRate: 95,
    effectivePrice: 231.58,
    quantityKg: 100,
    totalAmount: 22000,
    notes: '鮮果未出前使用 IQF 冷凍草莓備料'
  },
  {
    id: 'batch_straw_2',
    fruitId: 'strawberry',
    date: '2025-12-18',
    storageType: 'fresh',
    batchNo: 'SB-202512-01',
    supplier: '苗栗大湖草莓產銷班一班',
    purchasePrice: 390,
    yieldRate: 85,
    effectivePrice: 458.82,
    quantityKg: 50,
    totalAmount: 19500,
    notes: '一期花頭批鮮果，數量稀少搶鮮價'
  },
  {
    id: 'batch_straw_3',
    fruitId: 'strawberry',
    date: '2026-01-22',
    storageType: 'fresh',
    batchNo: 'SB-202601-03',
    supplier: '苗栗大湖草莓產銷班一班',
    purchasePrice: 320,
    yieldRate: 85,
    effectivePrice: 376.47,
    quantityKg: 90,
    totalAmount: 28800,
    notes: '二期花春節送禮旺季'
  },
  {
    id: 'batch_straw_4',
    fruitId: 'strawberry',
    date: '2026-02-15',
    storageType: 'fresh',
    batchNo: 'SB-202602-02',
    supplier: '苗栗大湖草莓產銷班二班',
    purchasePrice: 240,
    yieldRate: 84,
    effectivePrice: 285.71,
    quantityKg: 120,
    totalAmount: 28800,
    notes: '年後三期大盛產，進貨成本大幅回調'
  },
  {
    id: 'batch_straw_5',
    fruitId: 'strawberry',
    date: '2026-03-25',
    storageType: 'fresh',
    batchNo: 'SB-202603-01',
    supplier: '苗栗大湖草莓產銷班二班',
    purchasePrice: 180,
    yieldRate: 82,
    effectivePrice: 219.51,
    quantityKg: 140,
    totalAmount: 25200,
    notes: '產季尾聲果粒偏小，價格最低適合加工'
  },
  {
    id: 'batch_straw_6',
    fruitId: 'strawberry',
    date: '2026-05-10',
    storageType: 'frozen',
    batchNo: 'IQF-SB-202605-02',
    supplier: '聯華食品冷鏈 (IQF 全果草莓)',
    purchasePrice: 220,
    yieldRate: 95,
    effectivePrice: 231.58,
    quantityKg: 120,
    totalAmount: 26400,
    notes: '鮮果產季結束，重新切換為 IQF 冷凍草莓'
  },

  // 🍍 金鑽鳳梨 (Pineapple Golden) - 春夏盛產甜美
  {
    id: 'batch_pa_1',
    fruitId: 'pineapple_golden',
    date: '2026-02-20',
    storageType: 'fresh',
    batchNo: 'PA-202602-01',
    supplier: '屏東高樹綠地合作社',
    purchasePrice: 56,
    yieldRate: 49,
    effectivePrice: 114.29,
    quantityKg: 150,
    totalAmount: 8400,
    notes: '春季早採頭批金鑽，酸度稍顯'
  },
  {
    id: 'batch_pa_2',
    fruitId: 'pineapple_golden',
    date: '2026-04-15',
    storageType: 'fresh',
    batchNo: 'PA-202604-02',
    supplier: '嘉義民雄青果運銷班',
    purchasePrice: 40,
    yieldRate: 51,
    effectivePrice: 78.43,
    quantityKg: 250,
    totalAmount: 10000,
    notes: '氣溫回升甜度大爆發，進入主要盛產期'
  },
  {
    id: 'batch_pa_3',
    fruitId: 'pineapple_golden',
    date: '2026-05-20',
    storageType: 'fresh',
    batchNo: 'PA-202605-01',
    supplier: '屏東高樹綠地合作社',
    purchasePrice: 32,
    yieldRate: 52,
    effectivePrice: 61.54,
    quantityKg: 300,
    totalAmount: 9600,
    notes: '全台盛產巔峰，果肉率最佳，單價最低'
  },
  {
    id: 'batch_pa_4',
    fruitId: 'pineapple_golden',
    date: '2026-07-08',
    storageType: 'fresh',
    batchNo: 'PA-202607-02',
    supplier: '嘉義民雄青果運銷班',
    purchasePrice: 38,
    yieldRate: 50,
    effectivePrice: 76.0,
    quantityKg: 200,
    totalAmount: 7600,
    notes: '夏季水分充足，削皮出肉平穩'
  },
  {
    id: 'batch_pa_5',
    fruitId: 'pineapple_golden',
    date: '2026-08-18',
    storageType: 'frozen',
    batchNo: 'IQF-PA-202608-01',
    supplier: '恆春生鮮冷凍廠 (IQF鳳梨丁)',
    purchasePrice: 85,
    yieldRate: 98,
    effectivePrice: 86.73,
    quantityKg: 150,
    totalAmount: 12750,
    notes: '採購 IQF 預切鳳梨丁作為烘焙與冰沙備用'
  },

  // 💜 百香果 (Passion Fruit)
  {
    id: 'batch_pf_1',
    fruitId: 'passion_fruit',
    date: '2025-11-15',
    storageType: 'fresh',
    batchNo: 'PF-202511-01',
    supplier: '南投埔里大坪頂產銷班',
    purchasePrice: 125,
    yieldRate: 44,
    effectivePrice: 284.09,
    quantityKg: 80,
    totalAmount: 10000,
    notes: '秋季尾期供應量縮減'
  },
  {
    id: 'batch_pf_2',
    fruitId: 'passion_fruit',
    date: '2026-02-10',
    storageType: 'frozen',
    batchNo: 'IQF-PF-202602-01',
    supplier: '埔里農會加工廠 (冷凍純原汁)',
    purchasePrice: 160,
    yieldRate: 100,
    effectivePrice: 160.0,
    quantityKg: 150,
    totalAmount: 24000,
    notes: '冬末春初使用冷凍無加水純原汁，無損耗'
  },
  {
    id: 'batch_pf_3',
    fruitId: 'passion_fruit',
    date: '2026-05-18',
    storageType: 'fresh',
    batchNo: 'PF-202605-01',
    supplier: '南投埔里大坪頂產銷班',
    purchasePrice: 135,
    yieldRate: 43,
    effectivePrice: 313.95,
    quantityKg: 60,
    totalAmount: 8100,
    notes: '早春首批鮮果上市'
  },
  {
    id: 'batch_pf_4',
    fruitId: 'passion_fruit',
    date: '2026-07-22',
    storageType: 'fresh',
    batchNo: 'PF-202607-02',
    supplier: '南投埔里大坪頂產銷班',
    purchasePrice: 95,
    yieldRate: 45,
    effectivePrice: 211.11,
    quantityKg: 150,
    totalAmount: 14250,
    notes: '夏季盛產期展開，香氣濃郁酸甜平衡'
  },
  {
    id: 'batch_pf_5',
    fruitId: 'passion_fruit',
    date: '2026-08-28',
    storageType: 'fresh',
    batchNo: 'PF-202608-01',
    supplier: '南投埔里大坪頂產銷班',
    purchasePrice: 78,
    yieldRate: 46,
    effectivePrice: 169.57,
    quantityKg: 220,
    totalAmount: 17160,
    notes: '大出盛產期，採購均價最低'
  },

  // 🔴 紅心芭樂 (Guava Red)
  {
    id: 'batch_rg_1',
    fruitId: 'guava_red',
    date: '2025-12-05',
    storageType: 'fresh',
    batchNo: 'RG-202512-01',
    supplier: '宜蘭員山紅心芭樂產銷班',
    purchasePrice: 55,
    yieldRate: 74,
    effectivePrice: 74.32,
    quantityKg: 120,
    totalAmount: 6600,
    notes: '冬季紅心香氣極佳，果肉粉紅飽滿'
  },
  {
    id: 'batch_rg_2',
    fruitId: 'guava_red',
    date: '2026-03-12',
    storageType: 'fresh',
    batchNo: 'RG-202603-01',
    supplier: '宜蘭員山紅心芭樂產銷班',
    purchasePrice: 48,
    yieldRate: 75,
    effectivePrice: 64.0,
    quantityKg: 140,
    totalAmount: 6720,
    notes: '春季果實品質均勻'
  },
  {
    id: 'batch_rg_3',
    fruitId: 'guava_red',
    date: '2026-06-18',
    storageType: 'fresh',
    batchNo: 'RG-202606-02',
    supplier: '宜蘭員山紅心芭樂產銷班',
    purchasePrice: 45,
    yieldRate: 75,
    effectivePrice: 60.0,
    quantityKg: 160,
    totalAmount: 7200,
    notes: '夏季盛產平穩期'
  },
  {
    id: 'batch_rg_4',
    fruitId: 'guava_red',
    date: '2026-08-14',
    storageType: 'fresh',
    batchNo: 'RG-202608-01',
    supplier: '宜蘭員山紅心芭樂產銷班',
    purchasePrice: 68,
    yieldRate: 73,
    effectivePrice: 93.15,
    quantityKg: 90,
    totalAmount: 6120,
    notes: '豪雨後短期減產短缺'
  },
  {
    id: 'batch_rg_5',
    fruitId: 'guava_red',
    date: '2026-09-08',
    storageType: 'fresh',
    batchNo: 'RG-202609-01',
    supplier: '宜蘭員山紅心芭樂產銷班',
    purchasePrice: 52,
    yieldRate: 75,
    effectivePrice: 69.33,
    quantityKg: 130,
    totalAmount: 6760,
    notes: '供應回升，價位平穩'
  },
  // 🍐 珍珠芭樂 - 補充 IQF 急速冷凍規格與今日最新批次
  {
    id: 'batch_guava_iqf_1',
    fruitId: 'guava_pearl',
    date: '2026-03-15',
    storageType: 'frozen',
    batchNo: 'IQF-GV-202603-01',
    supplier: '佳美食品工業 (IQF 芭樂丁)',
    purchasePrice: 120,
    yieldRate: 95,
    effectivePrice: 126.32,
    quantityKg: 100,
    totalAmount: 12000,
    notes: '春季進口/加工 IQF 急速冷凍芭樂丁，出成率 95%'
  },
  {
    id: 'batch_guava_iqf_2',
    fruitId: 'guava_pearl',
    date: '2026-07-20',
    storageType: 'frozen',
    batchNo: 'IQF-GV-202607-01',
    supplier: '佳美食品工業 (IQF 芭樂丁)',
    purchasePrice: 125,
    yieldRate: 95,
    effectivePrice: 131.58,
    quantityKg: 150,
    totalAmount: 18750,
    notes: '夏季鮮果暴漲期間，採購 IQF 冷凍芭樂丁平穩成本'
  },
  {
    id: 'batch_guava_today_fresh',
    fruitId: 'guava_pearl',
    date: '2026-09-18',
    storageType: 'fresh',
    batchNo: 'GV-20260918-A1',
    supplier: '高雄燕巢特級芭樂產銷班',
    purchasePrice: 44,
    yieldRate: 75,
    effectivePrice: 58.67,
    quantityKg: 200,
    totalAmount: 8800,
    notes: '今日產地直送新鮮珍珠芭樂，脆甜飽滿'
  },
  {
    id: 'batch_guava_today_iqf',
    fruitId: 'guava_pearl',
    date: '2026-09-18',
    storageType: 'frozen',
    batchNo: 'IQF-GV-20260918-B1',
    supplier: '佳美食品冷鏈 (業務箱裝)',
    purchasePrice: 120,
    yieldRate: 95,
    effectivePrice: 126.32,
    quantityKg: 120,
    totalAmount: 14400,
    notes: '今日入庫 IQF 急速冷凍芭樂丁，解凍即用'
  },

  // 🔴 紅心芭樂 - 補充 IQF 急速冷凍規格與今日最新批次
  {
    id: 'batch_rg_iqf_1',
    fruitId: 'guava_red',
    date: '2026-04-10',
    storageType: 'frozen',
    batchNo: 'IQF-RG-202604-01',
    supplier: '統清冷凍冷鏈 (IQF 紅心芭樂丁)',
    purchasePrice: 130,
    yieldRate: 95,
    effectivePrice: 136.84,
    quantityKg: 100,
    totalAmount: 13000,
    notes: 'IQF 急速冷凍員山紅心芭樂丁'
  },
  {
    id: 'batch_rg_today_fresh',
    fruitId: 'guava_red',
    date: '2026-09-18',
    storageType: 'fresh',
    batchNo: 'RG-20260918-A1',
    supplier: '宜蘭員山紅心芭樂產銷班',
    purchasePrice: 52,
    yieldRate: 75,
    effectivePrice: 69.33,
    quantityKg: 150,
    totalAmount: 7800,
    notes: '今日產地直送新鮮紅心芭樂，果肉粉紅香氣高'
  },
  {
    id: 'batch_rg_today_iqf',
    fruitId: 'guava_red',
    date: '2026-09-18',
    storageType: 'frozen',
    batchNo: 'IQF-RG-20260918-B1',
    supplier: '統清冷凍冷鏈 (業務箱裝)',
    purchasePrice: 130,
    yieldRate: 95,
    effectivePrice: 136.84,
    quantityKg: 100,
    totalAmount: 13000,
    notes: '今日入庫 IQF 急速冷凍紅心芭樂丁，色澤天然粉嫩'
  },

  // 🍎 富士蘋果 (帶皮) (Apple Fuji) - 百科釘選品項，建立完整新鮮與 IQF 冷凍時序數據
  {
    id: 'batch_apple_1',
    fruitId: 'apple_fuji',
    date: '2025-11-20',
    storageType: 'fresh',
    batchNo: 'AP-202511-01',
    supplier: '台北第一果菜批發市場 (美國華盛頓富士)',
    purchasePrice: 98,
    yieldRate: 80,
    effectivePrice: 122.5,
    quantityKg: 150,
    totalAmount: 14700,
    notes: '秋季進口首批華盛頓富士，果形圓正'
  },
  {
    id: 'batch_apple_2',
    fruitId: 'apple_fuji',
    date: '2026-01-18',
    storageType: 'frozen',
    batchNo: 'IQF-AP-202601-01',
    supplier: '聯華食品冷鏈 (IQF 蘋果丁/去皮去核)',
    purchasePrice: 150,
    yieldRate: 95,
    effectivePrice: 157.89,
    quantityKg: 100,
    totalAmount: 15000,
    notes: 'IQF 急速冷凍 8mm 蘋果丁，抗褐化護色處理'
  },
  {
    id: 'batch_apple_3',
    fruitId: 'apple_fuji',
    date: '2026-02-10',
    storageType: 'fresh',
    batchNo: 'AP-202602-01',
    supplier: '台北第一果菜批發市場 (春節禮盒級)',
    purchasePrice: 115,
    yieldRate: 80,
    effectivePrice: 143.75,
    quantityKg: 120,
    totalAmount: 13800,
    notes: '春節年節送禮旺季，進貨批發單價來到年度高點'
  },
  {
    id: 'batch_apple_4',
    fruitId: 'apple_fuji',
    date: '2026-04-25',
    storageType: 'fresh',
    batchNo: 'AP-202604-01',
    supplier: '高雄港果菜冷鏈 (智利新產季富士首批到港)',
    purchasePrice: 92,
    yieldRate: 80,
    effectivePrice: 115.0,
    quantityKg: 160,
    totalAmount: 14720,
    notes: '南半球產季開啟，貨源充裕價格回落'
  },
  {
    id: 'batch_apple_5',
    fruitId: 'apple_fuji',
    date: '2026-06-15',
    storageType: 'fresh',
    batchNo: 'AP-202606-02',
    supplier: '台北第一果菜批發市場 (智利富士原裝箱)',
    purchasePrice: 85,
    yieldRate: 80,
    effectivePrice: 106.25,
    quantityKg: 200,
    totalAmount: 17000,
    notes: '南半球盛產大批到港，批發單價來到年度最低點'
  },
  {
    id: 'batch_apple_6',
    fruitId: 'apple_fuji',
    date: '2026-07-20',
    storageType: 'frozen',
    batchNo: 'IQF-AP-202607-01',
    supplier: '聯華食品冷鏈 (IQF 蘋果丁)',
    purchasePrice: 150,
    yieldRate: 95,
    effectivePrice: 157.89,
    quantityKg: 120,
    totalAmount: 18000,
    notes: '補充業務包裝冷凍備品，價格穩定'
  },
  {
    id: 'batch_apple_7',
    fruitId: 'apple_fuji',
    date: '2026-08-30',
    storageType: 'fresh',
    batchNo: 'AP-202608-01',
    supplier: '台北第一果菜批發市場 (進口富士A級)',
    purchasePrice: 90,
    yieldRate: 80,
    effectivePrice: 112.5,
    quantityKg: 150,
    totalAmount: 13500,
    notes: '開學季常態批發進貨'
  },
  {
    id: 'batch_apple_today_fresh',
    fruitId: 'apple_fuji',
    date: '2026-09-18',
    storageType: 'fresh',
    batchNo: 'AP-20260918-A1',
    supplier: '台北第一果菜批發市場 (進口富士100規原裝箱)',
    purchasePrice: 88,
    yieldRate: 80,
    effectivePrice: 110.0,
    quantityKg: 180,
    totalAmount: 15840,
    notes: '今日最新鮮果批次，果肉脆密多汁'
  },
  {
    id: 'batch_apple_today_iqf',
    fruitId: 'apple_fuji',
    date: '2026-09-18',
    storageType: 'frozen',
    batchNo: 'IQF-AP-20260918-B1',
    supplier: '聯華食品工業 (IQF 冷凍蘋果丁)',
    purchasePrice: 150,
    yieldRate: 95,
    effectivePrice: 157.89,
    quantityKg: 150,
    totalAmount: 22500,
    notes: '今日最新入庫 IQF 冷凍蘋果丁，拆封即用免削皮'
  },
];

const state = {
  fruits: window.FRUITS_DATA || [],
  activeTab: (savedState && savedState.activeTab) || 'plate', // 'plate' | 'label' | 'catalog' | 'comparison'
  favorites: savedFavorites,
  favoritePinTop: savedPinTop,
  plateItems: (savedState && savedState.plateItems) || [
    { fruitId: 'guava_pearl', grams: 150 },
    { fruitId: 'kiwi_gold', grams: 90 },
  ],
  savedRecipes: savedRecipes,
  activeLabelRecipeId: null,
  recipeFilterZone: 'all',
  recipeSearchQuery: '',
  labelRecipeZone: 'all',
  recipesModalOpen: false,
  editingRecipeId: null,
  searchTerm: '',
  selectedCategory: '全部',
  selectedTag: '全部',
  modalFruit: null,
  modalGrams: 100,
  comparison: {
    fruitAId: 'guava_pearl',
    fruitBId: 'apple_fuji',
    weight: 100,
  },
  // 商品法規營養標示與原料成本設定
  plateRightTab: (savedState && savedState.plateRightTab) || 'summary', // 'summary' | 'label' | 'cost'
  labelConfig: (savedState && savedState.labelConfig) || {
    productName: '綜合鮮切水果盒',
    servingSize: 240,      // 每一份量 (g，自動同步目前總重)
    servingsPerPkg: 1,     // 本包裝含 (份)
    labelFormat: 'dual',   // 'dual' (每份 + 每100g) 或 'percent' (每份 + 每日參考值百分比)
    calorieMethod: 'database', // 'database' (TFDA資料庫實測加權) 或 'factor' (法定 4-9-4 係數換算)
    sourceType: 'plate',   // 'plate' (使用拼盤配比) 或 'single' (指定單一水果)
    singleFruitId: 'guava_pearl',
    includeFiber: true,    // 標示膳食纖維
    includeVitaminC: true, // 標示維生素 C
    includePotassium: false, // 標示鉀
    autoSyncWeight: true,  // 自動隨左側水果總重更新每一份量
  },
  fruitCosts: (savedState && savedState.fruitCosts) || {},
  costConfig: (savedState && savedState.costConfig) || {
    packagingCost: 5,        // 包材耗材成本 (元/盒)
    laborCost: 0,            // 人工處理/加工成本 (元/盒)
    sellingPrice: 80,        // 預計販售價格 (元/盒)
    targetMargin: 50,        // 目標毛利率 (%)
  },
  costSearchTerm: '',
  costCategory: '全部',
  costStorageFilter: 'all', // 'all' | 'fresh' | 'frozen' | 'compare'
  costPinTop: (savedState && savedState.costPinTop !== undefined) ? savedState.costPinTop : true,
  costSortBy: 'name', // 'name' | 'purchasePrice' | 'yieldRate' | 'effectivePrice'
  costSortOrder: 'asc',
  // 庫存成本歷史與價格波動資料庫
  inventoryBatches: getStoredJSON(INVENTORY_BATCHES_KEY, (savedState && savedState.inventoryBatches) || DEFAULT_INVENTORY_BATCHES),
  inventorySelectedFruit: (savedState && savedState.inventorySelectedFruit) || 'mango_irwin',
  inventoryTimeRange: (savedState && savedState.inventoryTimeRange) || 'all', // 'all' | '30d' | '90d' | '180d' | '1y'
  inventoryStorageFilter: (savedState && savedState.inventoryStorageFilter) || 'all', // 'all' | 'fresh' | 'frozen'
  inventoryViewTab: 'chart', // 'chart' | 'overview' | 'batches'
  inventoryWorkbenchTab: (savedState && savedState.inventoryWorkbenchTab) || 'vendor_pk', // 'vendor_pk' | 'stress_test' | 'batches' | 'volatility'
  inventorySearchTerm: '',
  selectedChartPointId: null,
  // 產季指南與採購雷達
  seasonSelectedMonth: (savedState && savedState.seasonSelectedMonth) || 9, // 預設 9 月 (秋令盛產期)
  seasonCategoryFilter: '全部',
  seasonSearchTerm: '',
  selectedSeasonFruitId: null,
  // 自購詢價即時比對與試算器
  inventoryCustomQuote: (savedState && savedState.inventoryCustomQuote) || {
    fruitId: 'mango_irwin',
    purchasePrice: 110,
    yieldRate: 65,
    storageType: 'fresh',
    quantityKg: 100,
  },
  // 價格波動比對工作台模式: 'vendor_matrix' (多家供應商比價) 或 'custom_quote' (單一自購試算)
  inventoryComparatorMode: (savedState && savedState.inventoryComparatorMode) || 'vendor_matrix',
  // 多家供應商比價記錄字典 (以 fruitId 為鍵)
  vendorQuotes: (savedState && savedState.vendorQuotes) || {},
};

if (typeof window !== 'undefined') {
  window.state = state;
}

// 工具函式：取得水果物件 (支援標準35款水果與7款配方專用非水果原料)
function getFruit(id) {
  if (state && Array.isArray(state.fruits)) {
    const found = state.fruits.find((f) => f.id === id);
    if (found) return found;
  }
  if (typeof SUPPLEMENTARY_INGREDIENTS !== 'undefined' && SUPPLEMENTARY_INGREDIENTS[id]) {
    return SUPPLEMENTARY_INGREDIENTS[id];
  }
  if (typeof window !== 'undefined' && Array.isArray(window.FRUITS_DATA)) {
    const found = window.FRUITS_DATA.find((f) => f.id === id);
    if (found) return found;
  }
  return (state && state.fruits && state.fruits[0]) || (typeof window !== 'undefined' && window.FRUITS_DATA && window.FRUITS_DATA[0]) || { name: id, emoji: '🍎', nutrition_per_100g: { calories: 0 } };
}

// 工具函式：計算單項營養素
function calcItemNut(fruit, grams) {
  const ratio = (Number(grams) || 0) / 100;
  const raw = fruit.nutrition_per_100g;
  return {
    calories: Math.round(raw.calories * ratio * 10) / 10,
    water: Math.round(raw.water * ratio * 10) / 10,
    protein: Math.round(raw.protein * ratio * 10) / 10,
    fat: Math.round(raw.fat * ratio * 10) / 10,
    saturated_fat: Math.round((raw.saturated_fat || 0) * ratio * 10) / 10,
    trans_fat: Math.round((raw.trans_fat || 0) * ratio * 10) / 10,
    carbohydrates: Math.round(raw.carbohydrates * ratio * 10) / 10,
    sugar: Math.round(raw.sugar * ratio * 10) / 10,
    dietary_fiber: Math.round(raw.dietary_fiber * ratio * 10) / 10,
    vitamin_c: Math.round(raw.vitamin_c * ratio * 10) / 10,
    potassium: Math.round(raw.potassium * ratio * 10) / 10,
    magnesium: Math.round(raw.magnesium * ratio * 10) / 10,
    calcium: Math.round(raw.calcium * ratio * 10) / 10,
    sodium: Math.round(raw.sodium * ratio * 10) / 10,
  };
}

// 計算拼盤總營養

function syncLabelWeightWithPlate() {
  if (state.labelConfig.autoSyncWeight) {
    const totals = calcTotals();
    const pkgCount = state.labelConfig.servingsPerPkg || 1;
    state.labelConfig.servingSize = totals.weight > 0 ? Math.round((totals.weight / pkgCount) * 10) / 10 : 100;
  }
}

function calcTotals() {
  const initial = {
    weight: 0,
    calories: 0,
    water: 0,
    protein: 0,
    fat: 0,
    saturated_fat: 0,
    trans_fat: 0,
    carbohydrates: 0,
    sugar: 0,
    dietary_fiber: 0,
    vitamin_c: 0,
    potassium: 0,
    magnesium: 0,
    calcium: 0,
    sodium: 0,
  };

  const totals = state.plateItems.reduce((acc, item) => {
    const fruit = getFruit(item.fruitId);
    if (!fruit) return acc;
    const nut = calcItemNut(fruit, item.grams);
    acc.weight += Number(item.grams) || 0;
    acc.calories += nut.calories;
    acc.water += nut.water;
    acc.protein += nut.protein;
    acc.fat += nut.fat;
    acc.saturated_fat += nut.saturated_fat;
    acc.trans_fat += nut.trans_fat;
    acc.carbohydrates += nut.carbohydrates;
    acc.sugar += nut.sugar;
    acc.dietary_fiber += nut.dietary_fiber;
    acc.vitamin_c += nut.vitamin_c;
    acc.potassium += nut.potassium;
    acc.magnesium += nut.magnesium;
    acc.calcium += nut.calcium;
    acc.sodium += nut.sodium;
    return acc;
  }, initial);

  Object.keys(totals).forEach((k) => {
    totals[k] = Math.round(totals[k] * 10) / 10;
  });

  totals.servings = Math.round((totals.calories / 60) * 10) / 10;

  const carbCal = totals.carbohydrates * 4;
  const proCal = totals.protein * 4;
  const fatCal = totals.fat * 9;
  const totalMacroCal = carbCal + proCal + fatCal;

  totals.macroPercentages = {
    carb: totalMacroCal > 0 ? Math.round((carbCal / totalMacroCal) * 100) : 0,
    protein: totalMacroCal > 0 ? Math.round((proCal / totalMacroCal) * 100) : 0,
    fat: totalMacroCal > 0 ? Math.round((fatCal / totalMacroCal) * 100) : 0,
  };

  return totals;
}

// 產生健康提示
function getInsights(totals) {
  if (state.plateItems.length === 0) return [];
  const list = [];

  if (totals.servings > 3.5) {
    list.push({
      type: 'warning',
      title: '水果份量超量提醒',
      text: `目前搭配累計約 ${totals.servings} 份水果（國健署建議每日 2~3 份），糖分與熱量較高，建議分餐食用或與家人分享。`,
    });
  } else if (totals.servings >= 1.8 && totals.servings <= 3.2) {
    list.push({
      type: 'success',
      title: '份量恰到好處',
      text: `目前份量約 ${totals.servings} 份水果，非常符合每日健康均衡指南！`,
    });
  }

  const vitCPct = Math.round((totals.vitamin_c / DRI.VITAMIN_C_MG) * 100);
  if (vitCPct >= 100) {
    list.push({
      type: 'success',
      title: `維生素 C 達標 (${vitCPct}%)`,
      text: `已攝取 ${totals.vitamin_c} mg 維生素 C，超越成人整日需求 (100mg)，有助抗氧化與膠原蛋白合成！`,
    });
  }

  if (totals.dietary_fiber >= DRI.FRUIT_FIBER_GOAL_G) {
    list.push({
      type: 'success',
      title: '高纖順暢好幫手',
      text: `膳食纖維達到 ${totals.dietary_fiber} g，能增加飽足感、促進腸胃健康蠕動。`,
    });
  } else if (totals.weight >= 200 && totals.dietary_fiber < 2.5) {
    list.push({
      type: 'info',
      title: '纖維質偏低提示',
      text: '這份搭配水份或果糖較多、纖維偏低，可加入芭樂、奇異果或百香果增加纖維量。',
    });
  }

  if (totals.sugar > DRI.SUGAR_MAX_G) {
    list.push({
      type: 'warning',
      title: '單次糖分偏高',
      text: `總含糖量達 ${totals.sugar} g，血糖敏感族群或減脂者建議搭配無糖優格或堅果，減緩血糖波動。`,
    });
  }

  if (totals.potassium >= 500) {
    list.push({
      type: 'info',
      title: '高鉀利水消水腫',
      text: `鉀含量達 ${totals.potassium} mg，有助排除多餘鈉離子、調節血壓（慢性腎臟病限鉀者需留意）。`,
    });
  }

  const hasAvocado = state.plateItems.some((item) => item.fruitId === 'avocado');
  if (hasAvocado) {
    list.push({
      type: 'info',
      title: '含優質單元不飽和脂肪',
      text: '搭配內含酪梨，富含 Omega-9 好油與葉黃素，飽足感更持久。',
    });
  }

  return list;
}

// 格式化食藥署法定數值修約 (Rounding)
// 依據衛生福利部食藥署《包裝食品營養標示應遵行事項》第七點數據修整原則及 CNS 2925 規範
// 統一將所有營養標示項目數值（熱量、蛋白質、脂肪、飽和脂肪、反式脂肪、碳水化合物、糖、鈉、膳食纖維、維生素C、鉀）修整至「小數點後一位」
function fmtTFDANut(val, type) {
  const num = Number(val) || 0;
  if (num < 0) return '0.0';

  // 1. 反式脂肪零標示條件：依食藥署規定，每100g中總脂肪不超過1g或反式脂肪不超過0.3g，得以 0.0 標示
  if (type === 'trans_fat') {
    return num <= 0.3 ? '0.0' : (Math.round(num * 10) / 10).toFixed(1);
  }
  // 2. 飽和脂肪零標示條件：每100g中飽和脂肪不超過0.1g，得以 0.0 標示
  if (type === 'saturated_fat') {
    return num < 0.1 ? '0.0' : (Math.round(num * 10) / 10).toFixed(1);
  }
  // 3. 鈉：依規定統一格式化至小數點後一位
  if (type === 'sodium') {
    return num < 0.05 ? '0.0' : (Math.round(num * 10) / 10).toFixed(1);
  }
  // 4. 熱量與所有其餘營養素（蛋白質、脂肪、碳水化合物、糖、膳食纖維、維生素C、鉀）：統一四捨五入至小數點後一位
  return (Math.round(num * 10) / 10).toFixed(1);
}

// 計算每日參考值百分比 (%)
// 依食藥署規定：每日參考值百分比得以整數或小數點後一位標示
function calcDailyPct(val, type) {
  const ref = TFDA_DAILY_VALUES[type];
  if (!ref) return '*';
  const num = Number(val) || 0;
  const pct = (Math.round((num / ref) * 1000) / 10).toFixed(1);
  return `${pct} %`;
}

// 渲染應用主頁

function autoSaveCurrentState() {
  setStoredJSON(STORAGE_KEY, {
    activeTab: state.activeTab,
    plateItems: state.plateItems,
    plateRightTab: state.plateRightTab,
    labelConfig: state.labelConfig,
    fruitCosts: state.fruitCosts,
    costConfig: state.costConfig,
    favorites: state.favorites,
    favoritePinTop: state.favoritePinTop,
    costPinTop: state.costPinTop,
    inventorySelectedFruit: state.inventorySelectedFruit,
    inventoryTimeRange: state.inventoryTimeRange,
    inventoryStorageFilter: state.inventoryStorageFilter,
    inventoryCustomQuote: state.inventoryCustomQuote,
    inventoryComparatorMode: state.inventoryComparatorMode,
    vendorQuotes: state.vendorQuotes,
    seasonSelectedMonth: state.seasonSelectedMonth,
  });
  setStoredJSON(INVENTORY_BATCHES_KEY, state.inventoryBatches);
  setStoredJSON(FAVORITES_KEY, state.favorites);
  setStoredJSON(PIN_TOP_KEY, state.favoritePinTop);
}

let isPreservingScroll = false;
function preserveScrollAndFocus(fn) {
  if (isPreservingScroll) {
    return fn();
  }
  isPreservingScroll = true;
  try {
    const scrollY = (typeof window !== 'undefined' && (window.scrollY || (document.documentElement && document.documentElement.scrollTop))) || 0;
    const scrollX = (typeof window !== 'undefined' && (window.scrollX || (document.documentElement && document.documentElement.scrollLeft))) || 0;
    
    let activeId = null;
    let selStart = null;
    let selEnd = null;

    if (typeof document !== 'undefined') {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        activeId = activeEl.id || null;
        try {
          if (typeof activeEl.selectionStart === 'number') {
            selStart = activeEl.selectionStart;
            selEnd = activeEl.selectionEnd;
          }
        } catch (e) {}
      }
    }

    fn();

    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(scrollX, scrollY);
    }

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
          window.scrollTo(scrollX, scrollY);
        }
        if (activeId && typeof document !== 'undefined' && typeof document.getElementById === 'function') {
          const restored = document.getElementById(activeId);
          if (restored && typeof restored.focus === 'function') {
            try {
              restored.focus({ preventScroll: true });
              if (selStart !== null && typeof restored.setSelectionRange === 'function') {
                restored.setSelectionRange(selStart, selEnd);
              }
            } catch (e) {}
          }
        }
      });
    }
  } finally {
    isPreservingScroll = false;
  }
}

function render() {
  preserveScrollAndFocus(() => {
    autoSaveCurrentState();
    renderNavbar();
    renderTabContent();
    renderModal();
  });
}

// 導航渲染
function renderNavbar() {
  const plateCountBadge = document.getElementById('navbar-plate-count');
  if (plateCountBadge) {
    plateCountBadge.textContent = state.plateItems.length;
    if (plateCountBadge.style) {
      plateCountBadge.style.display = state.plateItems.length > 0 ? 'inline-block' : 'none';
    }
  }

  ['plate', 'cost', 'inventory', 'season', 'label', 'catalog', 'comparison'].forEach((tab) => {
    const btn = document.getElementById(`nav-btn-${tab}`);
    if (!btn) return;
    const baseClasses = 'px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center space-x-1 whitespace-nowrap shrink-0';
    if (state.activeTab === tab) {
      btn.className = `${baseClasses} bg-emerald-600 text-white shadow-sm shadow-emerald-600/30`;
    } else {
      btn.className = `${baseClasses} text-slate-600 hover:text-slate-900 hover:bg-slate-100`;
    }
  });
}

// 頁籤內容渲染
function renderTabContent() {
  preserveScrollAndFocus(() => {
    const container = document.getElementById('main-content');
    if (!container) return;

    if (state.activeTab === 'plate') {
      container.innerHTML = getPlateHtml();
      attachPlateEvents();
    } else if (state.activeTab === 'cost') {
      container.innerHTML = getCostDatabasePageHtml();
      attachCostDatabaseEvents();
    } else if (state.activeTab === 'inventory') {
      container.innerHTML = getInventoryPageHtml();
      attachInventoryEvents();
    } else if (state.activeTab === 'season') {
      container.innerHTML = getSeasonalityPageHtml();
      attachSeasonalityEvents();
    } else if (state.activeTab === 'label') {
      container.innerHTML = getLabelGeneratorHtml();
      attachLabelEvents();
    } else if (state.activeTab === 'catalog') {
      container.innerHTML = getCatalogHtml();
      attachCatalogEvents();
    } else if (state.activeTab === 'comparison') {
      container.innerHTML = getComparisonHtml();
      attachComparisonEvents();
    }
  });
}

// ==========================================
// ==========================================
// 水果原料採購成本、取果率與商業定價計算核心
// ==========================================

const DEFAULT_FRUIT_COST_MAP = {
  guava_pearl: {
    fresh: { purchasePrice: 80, yieldRate: 75, note: '去蒂切塊保留籽' },
    frozen: { purchasePrice: 120, yieldRate: 95, note: '急速冷凍芭樂丁/解凍滴水損耗約5%' },
  },
  guava_red: {
    fresh: { purchasePrice: 90, yieldRate: 75, note: '去蒂切塊保留籽' },
    frozen: { purchasePrice: 130, yieldRate: 95, note: '冷凍紅心芭樂丁/無皮' },
  },
  apple_fuji: {
    fresh: { purchasePrice: 120, yieldRate: 80, note: '洗淨帶皮去果核 (帶皮保留營養)' },
    frozen: { purchasePrice: 150, yieldRate: 95, note: 'IQF冷凍蘋果丁/去核' },
  },
  apple_green: {
    fresh: { purchasePrice: 130, yieldRate: 80, note: '削皮去果核' },
    frozen: { purchasePrice: 160, yieldRate: 95, note: 'IQF冷凍青蘋果丁' },
  },
  banana: {
    fresh: { purchasePrice: 60, yieldRate: 65, note: '剝皮損耗約 35%' },
    frozen: { purchasePrice: 90, yieldRate: 95, note: '冷凍香蕉段/無皮' },
  },
  kiwi_green: {
    fresh: { purchasePrice: 150, yieldRate: 75, note: '削毛皮切片' },
    frozen: { purchasePrice: 170, yieldRate: 95, note: 'IQF冷凍奇異果丁' },
  },
  kiwi_gold: {
    fresh: { purchasePrice: 180, yieldRate: 75, note: '削薄皮切丁' },
    frozen: { purchasePrice: 200, yieldRate: 95, note: 'IQF黃金奇異果丁' },
  },
  mango_irwin: {
    fresh: { purchasePrice: 150, yieldRate: 65, note: '去皮去大扁核' },
    frozen: { purchasePrice: 190, yieldRate: 95, note: 'IQF愛文芒果丁/純果肉' },
  },
  pineapple: {
    fresh: { purchasePrice: 70, yieldRate: 50, note: '削皮去眼切芯' },
    frozen: { purchasePrice: 110, yieldRate: 95, note: '冷凍金鑽鳳梨丁/已去芯' },
  },
  papaya: {
    fresh: { purchasePrice: 80, yieldRate: 65, note: '去皮刮除黑籽' },
    frozen: { purchasePrice: 110, yieldRate: 95, note: '冷凍木瓜丁/去籽去皮' },
  },
  watermelon_red: {
    fresh: { purchasePrice: 50, yieldRate: 55, note: '去厚皮損耗約 45%' },
    frozen: { purchasePrice: 80, yieldRate: 95, note: '冷凍西瓜磚/原汁' },
  },
  grape_kyoho: {
    fresh: { purchasePrice: 160, yieldRate: 90, note: '剪枝去蒂清洗' },
    frozen: { purchasePrice: 180, yieldRate: 95, note: '冷凍去皮巨峰葡萄' },
  },
  wax_apple: {
    fresh: { purchasePrice: 140, yieldRate: 85, note: '去蒂頭及底萼' },
    frozen: { purchasePrice: 170, yieldRate: 95, note: '冷凍蓮霧丁' },
  },
  dragonfruit_red: {
    fresh: { purchasePrice: 100, yieldRate: 70, note: '剝厚皮切丁' },
    frozen: { purchasePrice: 130, yieldRate: 95, note: 'IQF紅肉火龍果丁' },
  },
  dragonfruit_white: {
    fresh: { purchasePrice: 90, yieldRate: 70, note: '剝厚皮切丁' },
    frozen: { purchasePrice: 120, yieldRate: 95, note: 'IQF白肉火龍果丁' },
  },
  orange_ponkan: {
    fresh: { purchasePrice: 80, yieldRate: 65, note: '剝皮去白絡' },
    frozen: { purchasePrice: 110, yieldRate: 95, note: '冷凍橘瓣/原汁' },
  },
  orange_sweet: {
    fresh: { purchasePrice: 90, yieldRate: 65, note: '削皮去白膜' },
    frozen: { purchasePrice: 120, yieldRate: 95, note: '冷凍柳橙汁/原汁' },
  },
  lemon: {
    fresh: { purchasePrice: 90, yieldRate: 45, note: '人工鮮榨汁損耗高' },
    frozen: { purchasePrice: 130, yieldRate: 100, note: '冷凍純檸檬原汁解凍即用' },
  },
  strawberry: {
    fresh: { purchasePrice: 320, yieldRate: 90, note: '當季鮮果去蒂清洗' },
    frozen: { purchasePrice: 220, yieldRate: 95, note: '進口IQF整顆冷凍草莓' },
  },
  blueberry: {
    fresh: { purchasePrice: 450, yieldRate: 95, note: '空運生鮮藍莓' },
    frozen: { purchasePrice: 260, yieldRate: 98, note: '進口IQF野生冷凍藍莓' },
  },
  avocado: {
    fresh: { purchasePrice: 130, yieldRate: 65, note: '去硬皮去大圓核' },
    frozen: { purchasePrice: 180, yieldRate: 95, note: 'IQF冷凍酪梨丁塊' },
  },
  cherry: {
    fresh: { purchasePrice: 380, yieldRate: 85, note: '空運鮮櫻桃去梗去核' },
    frozen: { purchasePrice: 280, yieldRate: 95, note: '冷凍去核黑櫻桃' },
  },
  lychee: {
    fresh: { purchasePrice: 200, yieldRate: 60, note: '去粗殼去黑果核' },
    frozen: { purchasePrice: 240, yieldRate: 95, note: '冷凍去殼去核純果肉' },
  },
  longan: {
    fresh: { purchasePrice: 120, yieldRate: 55, note: '去土黃殼去黑核' },
    frozen: { purchasePrice: 160, yieldRate: 95, note: '冷凍去殼去核龍眼肉' },
  },
  passion_fruit: {
    fresh: { purchasePrice: 140, yieldRate: 50, note: '剖開人工挖取原汁帶籽' },
    frozen: { purchasePrice: 150, yieldRate: 100, note: '冷凍百香果原汁解凍即用' },
  },
  passion_fruit_juice: {
    fresh: { purchasePrice: 160, yieldRate: 50, note: '新鮮原汁濾除粗黑籽' },
    frozen: { purchasePrice: 170, yieldRate: 100, note: '冷凍百香果純汁無籽' },
  },
  persimmon_sweet: {
    fresh: { purchasePrice: 160, yieldRate: 85, note: '削皮去蒂頭' },
    frozen: { purchasePrice: 180, yieldRate: 95, note: '冷凍甜柿片' },
  },
  peach: {
    fresh: { purchasePrice: 280, yieldRate: 80, note: '去皮去硬果核' },
    frozen: { purchasePrice: 220, yieldRate: 95, note: '進口IQF冷凍水蜜桃丁' },
  },
  pear_asian: {
    fresh: { purchasePrice: 110, yieldRate: 80, note: '削皮去籽芯' },
    frozen: { purchasePrice: 140, yieldRate: 95, note: '冷凍水梨丁' },
  },
  cantaloupe: {
    fresh: { purchasePrice: 110, yieldRate: 55, note: '去厚外網皮刮籽' },
    frozen: { purchasePrice: 150, yieldRate: 95, note: 'IQF冷凍哈密瓜球/丁' },
  },
  jujube_taiwan: {
    fresh: { purchasePrice: 130, yieldRate: 85, note: '去蒂去長籽' },
    frozen: { purchasePrice: 160, yieldRate: 95, note: '冷凍蜜棗片' },
  },
  grapefruit_red: {
    fresh: { purchasePrice: 100, yieldRate: 55, note: '去厚皮去苦膜' },
    frozen: { purchasePrice: 140, yieldRate: 95, note: '冷凍葡萄柚果粒/汁' },
  },
  mulberry: {
    fresh: { purchasePrice: 180, yieldRate: 92, note: '當季鮮果清洗去細柄' },
    frozen: { purchasePrice: 160, yieldRate: 98, note: 'IQF冷凍整顆桑葚' },
  },
  cranberry: {
    fresh: { purchasePrice: 300, yieldRate: 95, note: '生鮮小紅莓整顆' },
    frozen: { purchasePrice: 220, yieldRate: 98, note: '進口IQF冷凍蔓越莓' },
  },
  sugar_apple: {
    fresh: { purchasePrice: 140, yieldRate: 55, note: '去外皮去多黑籽' },
    frozen: { purchasePrice: 220, yieldRate: 95, note: '冷凍釋迦去籽純果泥' },
  },
};

function getFruitCostConfig(fruitId, storageType = 'fresh') {
  const fruitDef = DEFAULT_FRUIT_COST_MAP[fruitId] || {
    fresh: { purchasePrice: 100, yieldRate: 50, note: '去皮去籽加工' },
    frozen: { purchasePrice: 130, yieldRate: 95, note: 'IQF冷凍果丁解凍即用' },
  };
  const def = fruitDef[storageType] || fruitDef.fresh || { purchasePrice: 100, yieldRate: 50, note: '去皮去籽加工' };

  if (state.fruitCosts && state.fruitCosts[fruitId]) {
    const custom = state.fruitCosts[fruitId];
    if (custom[storageType]) {
      const p = custom[storageType].purchasePrice;
      const y = custom[storageType].yieldRate;
      return {
        purchasePrice: p !== undefined && p !== null && !isNaN(Number(p)) ? Number(p) : def.purchasePrice,
        yieldRate: Math.max(1, Math.min(100, y !== undefined && y !== null && !isNaN(Number(y)) ? Number(y) : def.yieldRate)),
        note: custom[storageType].note || def.note,
      };
    }
    // 相容先前單一物件格式
    if (storageType === 'fresh' && custom.purchasePrice !== undefined) {
      const p = custom.purchasePrice;
      const y = custom.yieldRate;
      return {
        purchasePrice: p !== undefined && p !== null && !isNaN(Number(p)) ? Number(p) : def.purchasePrice,
        yieldRate: Math.max(1, Math.min(100, y !== undefined && y !== null && !isNaN(Number(y)) ? Number(y) : def.yieldRate)),
        note: custom.note || def.note,
      };
    }
  }

  return { ...def };
}

function calcPlateCosts() {
  const cfg = state.costConfig || {
    packagingCost: 5,
    laborCost: 0,
    sellingPrice: 80,
    targetMargin: 50,
  };

  let totalRawCost = 0;
  let totalPurchasedWeight = 0;
  let totalPlateWeight = 0;

  const itemCosts = state.plateItems.map((item) => {
    const fruit = getFruit(item.fruitId);
    const storageType = item.storageType || 'fresh';
    const costCfg = getFruitCostConfig(item.fruitId, storageType);
    const purchasePrice = Math.max(0, Number(costCfg.purchasePrice) || 0);
    const yieldRate = Math.max(1, Math.min(100, Number(costCfg.yieldRate) || 100));
    const grams = Math.max(0, Number(item.grams) || 0);

    // 實質果肉成本 (元/kg) = 進貨單價 ÷ (取果率 % / 100)
    const effectivePricePerKg = purchasePrice / (yieldRate / 100);
    // 實質果肉克單價 (元/g)
    const effectivePricePerGram = effectivePricePerKg / 1000;
    // 單項原料成本 (元) = 投入克數 × 實質果肉克單價
    const itemCost = grams * effectivePricePerGram;
    // 需採購毛重 (g) = 投入克數 ÷ (取果率 % / 100)
    const rawWeightNeeded = grams / (yieldRate / 100);

    totalRawCost += itemCost;
    totalPurchasedWeight += rawWeightNeeded;
    totalPlateWeight += grams;

    return {
      fruitId: item.fruitId,
      fruitName: fruit.name,
      fruitEmoji: fruit.emoji,
      storageType,
      grams,
      purchasePrice,
      yieldRate,
      effectivePricePerKg,
      rawWeightNeeded,
      itemCost,
      note: costCfg.note,
    };
  });

  itemCosts.forEach((ic) => {
    ic.costPercentage = totalRawCost > 0 ? (ic.itemCost / totalRawCost) * 100 : 0;
    ic.weightPercentage = totalPlateWeight > 0 ? (ic.grams / totalPlateWeight) * 100 : 0;
  });

  const costPer100g = totalPlateWeight > 0 ? (totalRawCost / totalPlateWeight) * 100 : 0;
  const packagingCost = Math.max(0, Number(cfg.packagingCost) || 0);
  const laborCost = Math.max(0, Number(cfg.laborCost) || 0);
  const totalCost = totalRawCost + packagingCost + laborCost;

  const sellingPrice = Math.max(0, Number(cfg.sellingPrice) || 0);
  const grossProfit = sellingPrice - totalCost;
  const grossMarginPct = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;

  const targetMargin = Math.min(99, Math.max(0, Number(cfg.targetMargin) || 50));
  const suggestedPrice = targetMargin < 100 ? totalCost / (1 - targetMargin / 100) : 0;

  return {
    itemCosts,
    totalRawCost,
    totalPurchasedWeight,
    totalPlateWeight,
    costPer100g,
    packagingCost,
    laborCost,
    totalCost,
    sellingPrice,
    grossProfit,
    grossMarginPct,
    targetMargin,
    suggestedPrice,
  };
}


// ==========================================

// ==========================================
// 庫存成本與歷史價格波動核心演算法 (Price Fluctuation Engine)
// ==========================================

// 依品項、時間區間與型態過濾批次
function getFilteredInventoryBatches(fruitId, timeRange = 'all', storageFilter = 'all') {
  let list = (state.inventoryBatches || []).filter((b) => b.fruitId === fruitId);

  // 型態篩選 (常溫 / 冷凍)
  if (storageFilter && storageFilter !== 'all') {
    list = list.filter((b) => b.storageType === storageFilter);
  }

  // 時間區間篩選 (以今天或最新日期為基準)
  if (timeRange && timeRange !== 'all') {
    const daysMap = { '30d': 30, '90d': 90, '180d': 180, '1y': 365 };
    const maxDays = daysMap[timeRange] || 365;
    const now = new Date('2026-09-18T12:00:00'); // 模擬系統當前時間
    const cutoff = new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000);

    list = list.filter((b) => {
      const d = new Date(b.date);
      return d >= cutoff;
    });
  }

  // 依進貨日期由舊到新排序 (用於繪製時間軸走勢)
  list.sort((a, b) => new Date(a.date) - new Date(b.date));
  return list;
}

// 計算單一水果在特定條件下的統計指標與波幅
function calcFruitPriceStats(fruitId, timeRange = 'all', storageFilter = 'all') {
  const batches = getFilteredInventoryBatches(fruitId, timeRange, storageFilter);
  const fruit = getFruit(fruitId);

  if (batches.length === 0) {
    // 若無批次紀錄，以原料成本庫的基準值替代
    const cfgFresh = getFruitCostConfig(fruitId, 'fresh');
    const cfgFrozen = getFruitCostConfig(fruitId, 'frozen');
    const defaultPrice = storageFilter === 'frozen' ? cfgFrozen.purchasePrice : cfgFresh.purchasePrice;
    const defaultYield = storageFilter === 'frozen' ? cfgFrozen.yieldRate : cfgFresh.yieldRate;
    const defaultEff = defaultPrice / (defaultYield / 100);

    return {
      fruit,
      fruitId,
      batchesCount: 0,
      latestBatch: null,
      prevBatch: null,
      latestPrice: defaultPrice,
      latestYieldRate: defaultYield,
      latestEffectivePrice: defaultEff,
      priceDiff: 0,
      priceDiffPct: 0,
      minPrice: defaultPrice,
      maxPrice: defaultPrice,
      priceSpread: 0,
      volatilityPct: 0,
      weightedAvgPrice: defaultPrice,
      simpleAvgPrice: defaultPrice,
      weightedAvgYieldRate: defaultYield,
      weightedAvgEffectivePrice: defaultEff,
      totalQuantityKg: 0,
      totalExpenditure: 0,
      status: 'stable',
      statusText: '尚無批次 (預設值)'
    };
  }

  // 統計總量與加權計算
  let totalQty = 0;
  let totalSpent = 0;
  let totalYieldWeighted = 0;
  let sumPrice = 0;
  let minP = Infinity;
  let maxP = -Infinity;

  batches.forEach((b) => {
    const qty = Number(b.quantityKg) || 1;
    const price = Number(b.purchasePrice) || 0;
    const yieldR = Number(b.yieldRate) || 100;
    const spent = b.totalAmount || (price * qty);

    totalQty += qty;
    totalSpent += spent;
    totalYieldWeighted += yieldR * qty;
    sumPrice += price;

    if (price < minP) minP = price;
    if (price > maxP) maxP = price;
  });

  const latestBatch = batches[batches.length - 1];
  const prevBatch = batches.length >= 2 ? batches[batches.length - 2] : null;

  const latestPrice = latestBatch.purchasePrice;
  const latestYieldRate = latestBatch.yieldRate;
  const latestEffectivePrice = latestBatch.effectivePrice || (latestPrice / (latestYieldRate / 100));

  let priceDiff = 0;
  let priceDiffPct = 0;
  if (prevBatch) {
    priceDiff = latestPrice - prevBatch.purchasePrice;
    priceDiffPct = prevBatch.purchasePrice > 0 ? (priceDiff / prevBatch.purchasePrice) * 100 : 0;
  }

  const weightedAvgPrice = totalQty > 0 ? totalSpent / totalQty : sumPrice / batches.length;
  const simpleAvgPrice = sumPrice / batches.length;
  const weightedAvgYieldRate = totalQty > 0 ? totalYieldWeighted / totalQty : 70;
  const weightedAvgEffectivePrice = weightedAvgYieldRate > 0 ? weightedAvgPrice / (weightedAvgYieldRate / 100) : weightedAvgPrice;

  const priceSpread = maxP - minP;
  const volatilityPct = minP > 0 ? (priceSpread / minP) * 100 : 0;

  // 判定波動狀態與採購指引
  let status = 'stable';
  let statusText = '🟢 走勢平穩';
  if (volatilityPct >= 50 && latestPrice >= maxP * 0.9) {
    status = 'high_alert';
    statusText = '🔥 處歷史高點 (建議控量/轉冷凍)';
  } else if (latestPrice <= minP * 1.1) {
    status = 'good_buy';
    statusText = '💰 處歷史低檔 (最佳採購良機)';
  } else if (volatilityPct >= 40) {
    status = 'moderate_swing';
    statusText = '⚠️ 季節中度波動';
  }

  return {
    fruit,
    fruitId,
    batchesCount: batches.length,
    latestBatch,
    prevBatch,
    latestPrice,
    latestYieldRate,
    latestEffectivePrice,
    priceDiff,
    priceDiffPct,
    minPrice: minP,
    maxPrice: maxP,
    priceSpread,
    volatilityPct,
    weightedAvgPrice,
    simpleAvgPrice,
    weightedAvgYieldRate,
    weightedAvgEffectivePrice,
    totalQuantityKg: totalQty,
    totalExpenditure: totalSpent,
    status,
    statusText
  };
}

// 統計全品項水果之歷史波幅排行
function calcAllFruitsVolatilitySummary() {
  const list = (state.fruits || []).map((f) => {
    const stats = calcFruitPriceStats(f.id, 'all', 'all');
    return {
      fruit: f,
      ...stats
    };
  });

  // 依波幅由大到小排序
  list.sort((a, b) => b.volatilityPct - a.volatilityPct);
  return list;
}

// 繪製高解析 SVG 價格波動曲線圖 (Pure Responsive SVG Line Chart)

// ==========================================
// 供應商多方比價與實質果肉避坑矩陣 (Multi-Vendor Quote Matrix & True Yield Cost)
// ==========================================

// 取得特定水果的預設供應商比價範本
function getDefaultVendorQuotes(fruitId) {
  const fruit = getFruit(fruitId);
  const freshCfg = getFruitCostConfig(fruitId, 'fresh');
  const frozenCfg = getFruitCostConfig(fruitId, 'frozen');

  return [
    {
      id: 'vq_fresh_farm',
      vendorName: '產銷班產地直接配送',
      storageType: 'fresh',
      quotePrice: freshCfg.purchasePrice,
      yieldRate: freshCfg.yieldRate,
      quantityKg: 150,
      specNotes: '產地第一手特級鮮果、果肉厚實，需自行前處理去皮去籽'
    },
    {
      id: 'vq_fresh_wholesaler',
      vendorName: '大盤批發行口行商',
      storageType: 'fresh',
      quotePrice: Math.max(20, Math.round(freshCfg.purchasePrice * 0.88)), // 表面略便宜
      yieldRate: Math.max(35, Math.round(freshCfg.yieldRate * 0.82)),     // 但耗損率高
      quantityKg: 200,
      specNotes: '通級箱裝、表面瑕疵果略多、削皮損耗率較高'
    },
    {
      id: 'vq_frozen_plant',
      vendorName: '冷鏈急速冷凍食品廠',
      storageType: 'frozen',
      quotePrice: frozenCfg.purchasePrice,
      yieldRate: frozenCfg.yieldRate,
      quantityKg: 100,
      specNotes: 'IQF急速冷凍預切果丁、無皮無核、解凍出成率極高'
    }
  ];
}

// 取得或初始化水果之供應商報價列表
function getFruitVendorQuotes(fruitId) {
  if (!state.vendorQuotes) {
    state.vendorQuotes = {};
  }
  if (!state.vendorQuotes[fruitId] || !Array.isArray(state.vendorQuotes[fruitId]) || state.vendorQuotes[fruitId].length === 0) {
    state.vendorQuotes[fruitId] = getDefaultVendorQuotes(fruitId);
  }
  return state.vendorQuotes[fruitId];
}

// 核心計算：多家供應商橫向比價與避坑診斷
function calcVendorQuotesComparison(fruitId) {
  const fruit = getFruit(fruitId);
  const quotes = getFruitVendorQuotes(fruitId);
  const stats = calcFruitPriceStats(fruitId, state.inventoryTimeRange, state.inventoryStorageFilter);
  const wac = stats.weightedAvgPrice || 0;

  const enriched = quotes.map((q) => {
    const p = Number(q.quotePrice) || 0;
    const y = Math.max(1, Number(q.yieldRate) || 100);
    const qty = Number(q.quantityKg) || 100;
    const effectivePrice = p / (y / 100);
    const costPer100g = effectivePrice / 10;
    const totalCost = p * qty;
    const pureMeatYieldKg = qty * (y / 100);
    const vsWacDiff = effectivePrice - wac;
    const vsWacPct = wac > 0 ? ((effectivePrice - wac) / wac) * 100 : 0;

    return {
      ...q,
      quotePrice: p,
      yieldRate: y,
      quantityKg: qty,
      effectivePrice,
      costPer100g,
      totalCost,
      pureMeatYieldKg,
      vsWacDiff,
      vsWacPct,
      isWinner: false,
      isTrap: false,
      wasteExtraPerKg: 0,
      wasteExtraPct: 0
    };
  });

  if (enriched.length === 0) {
    return { quotes: [], bestQuote: null, trapQuotes: [], wac, fruit };
  }

  // 1. 判定實質性價比冠軍 (True Cost Winner): 實質果肉每公斤成本最低者
  let minEffective = Infinity;
  let bestIdx = -1;
  enriched.forEach((item, idx) => {
    if (item.effectivePrice < minEffective) {
      minEffective = item.effectivePrice;
      bestIdx = idx;
    }
  });
  if (bestIdx !== -1) {
    enriched[bestIdx].isWinner = true;
  }
  const bestQuote = bestIdx !== -1 ? enriched[bestIdx] : null;

  // 2. 判定「表面假便宜陷阱 (Deceptive Cheap Alert)」
  // 表面進貨單價最低，但實質淨肉價高於最佳性價比者
  let minRaw = Infinity;
  let lowestRawIdx = -1;
  enriched.forEach((item, idx) => {
    if (item.quotePrice < minRaw) {
      minRaw = item.quotePrice;
      lowestRawIdx = idx;
    }
  });

  const trapQuotes = [];
  if (lowestRawIdx !== -1 && lowestRawIdx !== bestIdx && bestQuote && enriched.length > 1) {
    const trapItem = enriched[lowestRawIdx];
    if (trapItem.effectivePrice > bestQuote.effectivePrice) {
      trapItem.isTrap = true;
      trapItem.wasteExtraPerKg = trapItem.effectivePrice - bestQuote.effectivePrice;
      trapItem.wasteExtraPct = ((trapItem.wasteExtraPerKg / bestQuote.effectivePrice) * 100);
      trapQuotes.push(trapItem);
    }
  }

  return {
    quotes: enriched,
    bestQuote,
    trapQuotes,
    wac,
    fruit
  };
}

if (typeof window !== 'undefined') {
  window.getFruitVendorQuotes = getFruitVendorQuotes;
  window.calcVendorQuotesComparison = calcVendorQuotesComparison;
}


function renderPriceFluctuationChartSvg(batches, fruit, options = {}) {
  const width = 800;
  const height = 300;
  const margin = { top: 35, right: 65, bottom: 45, left: 55 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  if (!batches || batches.length === 0) {
    return `
      <div class="py-20 text-center text-slate-400 text-xs bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
        <span class="text-3xl block mb-2">📊</span>
        <span>此篩選區間尚無進貨紀錄，請切換其他時間範圍或點選右上角「+ 新增紀錄」！</span>
      </div>
    `;
  }

  // 計算數值極值 (價格與時間)
  let minP = Infinity;
  let maxP = -Infinity;
  let minEff = Infinity;
  let maxEff = -Infinity;

  batches.forEach((b) => {
    const p = Number(b.purchasePrice) || 0;
    const eff = Number(b.effectivePrice) || (p / ((Number(b.yieldRate) || 100) / 100));
    if (p < minP) minP = p;
    if (p > maxP) maxP = p;
    if (eff < minEff) minEff = eff;
    if (eff > maxEff) maxEff = eff;
  });

  // 取得自購比對價
  const customQuote = state.inventoryCustomQuote;
  const hasCustomQuote = customQuote && (customQuote.fruitId === fruit.id || !customQuote.fruitId) && Number(customQuote.purchasePrice) > 0;
  const customPrice = hasCustomQuote ? Number(customQuote.purchasePrice) : null;

  // 取得比價矩陣廠商報價 (僅納入與當前型態相符之報價，避免冷凍高價扭曲常溫走勢)
  const vendorComparison = calcVendorQuotesComparison(fruit.id);
  const currentFilter = state.inventoryStorageFilter || 'all';
  const rawVendorQuotes = (vendorComparison && vendorComparison.quotes) || [];
  const vendorQuotes = rawVendorQuotes.filter((q) => {
    if (currentFilter === 'fresh') return q.storageType === 'fresh';
    if (currentFilter === 'frozen') return q.storageType === 'frozen';
    return true;
  });
  const vendorPrices = vendorQuotes.map(q => Number(q.quotePrice) || 0).filter(p => p > 0);
  const maxVendorPrice = vendorPrices.length > 0 ? Math.max(...vendorPrices) : 0;
  const minVendorPrice = vendorPrices.length > 0 ? Math.min(...vendorPrices) : Infinity;

  // 縱軸邊界保留 15% 上下留白
  const globalMax = Math.max(maxP, maxEff, customPrice || 0, maxVendorPrice || 0);
  const globalMin = Math.min(minP, minEff, customPrice !== null ? customPrice : minP, minVendorPrice !== Infinity ? minVendorPrice : minP);
  const yPad = Math.max((globalMax - globalMin) * 0.15, 10);
  const yMin = Math.max(0, Math.floor(globalMin - yPad));
  const yMax = Math.ceil(globalMax + yPad);
  const yRange = yMax - yMin || 1;

  // 分離常溫鮮果與冷凍水果資料點
  const freshBatches = batches.filter((b) => b.storageType === 'fresh');
  const frozenBatches = batches.filter((b) => b.storageType === 'frozen');

  // 計算常態行情安全走廊 (依篩選型態取基準價格，避免常溫與冷凍混雜)
  let corridorPrices = [];
  if (currentFilter === 'fresh') {
    corridorPrices = freshBatches.map(b => Number(b.purchasePrice) || 0);
  } else if (currentFilter === 'frozen') {
    corridorPrices = frozenBatches.map(b => Number(b.purchasePrice) || 0);
  } else {
    // 全型態時，以鮮果為主體走廊；若無鮮果則以冷凍為準
    corridorPrices = freshBatches.length > 0
      ? freshBatches.map(b => Number(b.purchasePrice) || 0)
      : batches.map(b => Number(b.purchasePrice) || 0);
  }
  corridorPrices.sort((a, b) => a - b);

  let p25 = corridorPrices[Math.floor(corridorPrices.length * 0.25)] || corridorPrices[0] || minP;
  let p75 = corridorPrices[Math.floor(corridorPrices.length * 0.75)] || corridorPrices[corridorPrices.length - 1] || maxP;
  if (p75 <= p25 && corridorPrices.length >= 2) {
    p25 = corridorPrices[0];
    p75 = corridorPrices[corridorPrices.length - 1];
  }

  // 計算 X 與 Y 座標映射
  const dates = batches.map((b) => new Date(b.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateSpan = maxDate - minDate || 1;

  const getX = (dateStr, index) => {
    if (batches.length === 1 || dateSpan === 1) return margin.left + plotWidth / 2;
    const t = new Date(dateStr).getTime();
    return margin.left + ((t - minDate) / dateSpan) * plotWidth;
  };

  const getY = (price) => {
    const p = Math.max(yMin, Math.min(yMax, price));
    return margin.top + plotHeight - ((p - yMin) / yRange) * plotHeight;
  };

  const p25Y = getY(p25);
  const p75Y = getY(p75);
  const corridorHeight = Math.max(0, p25Y - p75Y);

  // 生成 Y 軸刻度與水平網格線 (5 條精密刻度)
  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    const val = Math.round(yMin + (yRange / tickCount) * i);
    const y = getY(val);
    yTicks.push({ val, y });
  }

  const makePath = (items, key = 'purchasePrice') => {
    if (items.length === 0) return '';
    if (items.length === 1) return '';
    return items
      .map((b, idx) => {
        const x = getX(b.date, idx);
        const y = getY(b[key] || (b.purchasePrice / (b.yieldRate / 100)));
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const freshPath = makePath(freshBatches, 'purchasePrice');
  const frozenPath = makePath(frozenBatches, 'purchasePrice');
  // 實質果肉成本線：分別連接常溫與冷凍，避免鋸齒混亂
  const freshEffectivePath = makePath(freshBatches, 'effectivePrice');
  const frozenEffectivePath = makePath(frozenBatches, 'effectivePrice');

  // 計算加權平均價之水平基準線
  const stats = calcFruitPriceStats(fruit.id, state.inventoryTimeRange, state.inventoryStorageFilter);
  const wacY = getY(stats.weightedAvgPrice);

  return `
    <div class="relative w-full overflow-visible select-none" id="price-chart-wrapper" onmouseleave="hideChartTooltip()">
      <!-- 即時懸浮註解提示卡 (Instant Floating Tooltip HUD: 側邊避讓不遮擋、防頂部截斷、0 毫秒響應) -->
      <div id="price-chart-floating-tooltip" class="pointer-events-none absolute z-50 hidden px-3.5 py-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl text-xs border border-slate-700/80 transition-opacity duration-100 min-w-[210px] max-w-xs" style="left: 0px; top: 0px;"></div>

      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto drop-shadow-xs overflow-visible" style="max-height: 400px;">
        <defs>
          <linearGradient id="corridorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.04"/>
          </linearGradient>
        </defs>

        <!-- 背景底色 -->
        <rect x="${margin.left}" y="${margin.top}" width="${plotWidth}" height="${plotHeight}" fill="#f8fafc" rx="8" />

        <!-- 動態十字參考對齊線 (Hover Crosshair Line) -->
        <line id="chart-hover-crosshair-x" x1="0" y1="${margin.top}" x2="0" y2="${margin.top + plotHeight}" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3" opacity="0" class="pointer-events-none transition-opacity duration-150"/>
        <line id="chart-hover-crosshair-y" x1="${margin.left}" y1="0" x2="${margin.left + plotWidth}" y2="0" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3" opacity="0" class="pointer-events-none transition-opacity duration-150"/>

        <!-- 🛡️ 常態行情安全走廊 (P25 ~ P75) 綠色漸層帶 -->
        ${
          corridorHeight > 4
            ? `
          <rect x="${margin.left}" y="${p75Y}" width="${plotWidth}" height="${corridorHeight}" fill="url(#corridorGrad)" />
          <line x1="${margin.left}" y1="${p75Y}" x2="${margin.left + plotWidth}" y2="${p75Y}" stroke="#10b981" stroke-width="1.2" stroke-dasharray="4 3" stroke-opacity="0.7"/>
          <line x1="${margin.left}" y1="${p25Y}" x2="${margin.left + plotWidth}" y2="${p25Y}" stroke="#10b981" stroke-width="1.2" stroke-dasharray="4 3" stroke-opacity="0.7"/>
          <!-- 右側安全刻度膠囊標籤 (避免遮擋左側首筆資料點，支援 hover 即時註解) -->
          <g class="cursor-pointer group"
             data-corridor="p75"
             onmouseenter="showChartStaticTooltip(event, '🛡️ 常態行情上限 (P75)', '歷史前 75% 價格分界點 $${p75.toFixed(0)}/kg。高於此線代表市場行情偏貴，建議謹慎採購或轉用冷凍庫存備料。', '安全上限', ${p75Y.toFixed(1)})"
             onmousemove="moveChartTooltip(event)"
             onmouseleave="hideChartTooltip()">
            <rect x="${margin.left + plotWidth - 105}" y="${p75Y - 8}" width="100" height="16" rx="4" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="0.8" class="transition-all duration-150 group-hover:stroke-emerald-500 group-hover:stroke-[1.5px] pointer-events-none" />
            <text x="${margin.left + plotWidth - 55}" y="${p75Y + 3}" text-anchor="middle" font-size="8.5" font-weight="bold" fill="#047857" class="pointer-events-none select-none">🛡️ 常態上限 $${p75.toFixed(0)}/kg</text>
          </g>
          <g class="cursor-pointer group"
             data-corridor="p25"
             onmouseenter="showChartStaticTooltip(event, '🛡️ 常態行情下限 (P25)', '歷史前 25% 價格分界點 $${p25.toFixed(0)}/kg。低於此線代表市場低谷超值區，強烈建議逢低把握進貨建倉。', '安全下限', ${p25Y.toFixed(1)})"
             onmousemove="moveChartTooltip(event)"
             onmouseleave="hideChartTooltip()">
            <rect x="${margin.left + plotWidth - 105}" y="${p25Y - 8}" width="100" height="16" rx="4" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="0.8" class="transition-all duration-150 group-hover:stroke-emerald-500 group-hover:stroke-[1.5px] pointer-events-none" />
            <text x="${margin.left + plotWidth - 55}" y="${p25Y + 3}" text-anchor="middle" font-size="8.5" font-weight="bold" fill="#047857" class="pointer-events-none select-none">🛡️ 常態下限 $${p25.toFixed(0)}/kg</text>
          </g>
        `
            : ''
        }

        <!-- 水平網格線與 Y 軸標籤 -->
        ${yTicks
          .map(
            (t) => `
          <line x1="${margin.left}" y1="${t.y}" x2="${margin.left + plotWidth}" y2="${t.y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3"/>
          <text x="${margin.left - 10}" y="${t.y + 4}" text-anchor="end" font-size="10" font-weight="600" fill="#64748b">$${t.val}</text>
        `
          )
          .join('')}

        <!-- 加權平均成本基準線 (WAC Reference Line，支援 hover 註解) -->
        <g class="cursor-pointer group"
           data-ref="wac"
           onmouseenter="showChartStaticTooltip(event, '加權平均進貨成本 (WAC)', '所有入庫批次之數量加權平均真實進價 $${stats.weightedAvgPrice.toFixed(1)}/kg，可作為各廠商最新報價談判之中線錨點。', '歷史均價', ${wacY.toFixed(1)})"
           onmousemove="moveChartTooltip(event)"
           onmouseleave="hideChartTooltip()">
          <line x1="${margin.left}" y1="${wacY}" x2="${margin.left + plotWidth}" y2="${wacY}" stroke="#d97706" stroke-width="1.8" stroke-dasharray="5 4" opacity="0.85"/>
          <rect x="${margin.left + 8}" y="${wacY - 9}" width="105" height="18" rx="4" fill="#fef3c7" stroke="#fde68a" stroke-width="1" class="transition-all duration-150 group-hover:stroke-amber-500 group-hover:stroke-[1.5px] pointer-events-none"/>
          <text x="${margin.left + 60}" y="${wacY + 4}" text-anchor="middle" font-size="9" font-weight="bold" fill="#92400e" class="pointer-events-none select-none">均價 WAC $${stats.weightedAvgPrice.toFixed(1)}</text>
        </g>

        <!-- 📍 自購詢價比對基準線 (Custom Quote Benchmark Line) -->
        ${
          hasCustomQuote
            ? `
          <g class="cursor-pointer group"
             data-ref="custom-benchmark"
             onmouseenter="showChartStaticTooltip(event, '📍 自購詢價對標線', '您設定的外部比對進價 $${customPrice}/kg。可用以快速目視比對歷史常態走廊與當前各廠商報價。', '自購比對', ${getY(customPrice).toFixed(1)})"
             onmousemove="moveChartTooltip(event)"
             onmouseleave="hideChartTooltip()">
            <line x1="${margin.left}" y1="${getY(customPrice)}" x2="${margin.left + plotWidth}" y2="${getY(customPrice)}" stroke="#ec4899" stroke-width="2.2" stroke-dasharray="6 3" opacity="0.95"/>
            <rect x="${margin.left + 120}" y="${getY(customPrice) - 9}" width="125" height="18" rx="5" fill="#fdf2f8" stroke="#f472b6" stroke-width="1.2" class="transition-all duration-150 group-hover:stroke-pink-500 group-hover:stroke-[1.5px] pointer-events-none"/>
            <text x="${margin.left + 182}" y="${getY(customPrice) + 4}" text-anchor="middle" font-size="9.5" font-weight="extrabold" fill="#be185d" class="pointer-events-none select-none">📍 自購比對 $${customPrice}/kg</text>
          </g>
        `
            : ''
        }

        <!-- 曲線繪製：實質果肉成本線 (紫色點虛線，分別針對常溫與冷凍) -->
        ${freshEffectivePath ? `<path d="${freshEffectivePath}" fill="none" stroke="#a855f7" stroke-width="1.8" stroke-dasharray="4 3" opacity="0.8" />` : ''}
        ${frozenEffectivePath ? `<path d="${frozenEffectivePath}" fill="none" stroke="#7c3aed" stroke-width="1.8" stroke-dasharray="4 3" opacity="0.8" />` : ''}

        <!-- 曲線繪製：常溫鮮果進貨價 (綠色實線) -->
        ${freshPath ? `<path d="${freshPath}" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : ''}

        <!-- 曲線繪製：冷凍水果進貨價 (藍色實線) -->
        ${frozenPath ? `<path d="${frozenPath}" fill="none" stroke="#0284c7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : ''}

        <!-- 單筆批次時繪製水平虛線指針 -->
        ${
          batches.length === 1
            ? `
          <line x1="${margin.left}" y1="${getY(batches[0].purchasePrice)}" x2="${margin.left + plotWidth}" y2="${getY(batches[0].purchasePrice)}" stroke="#10b981" stroke-width="2" stroke-dasharray="4 4" opacity="0.7"/>
          <text x="${margin.left + plotWidth / 2}" y="${getY(batches[0].purchasePrice) - 12}" text-anchor="middle" font-size="10" font-weight="bold" fill="#059669">
            單批紀錄進貨價 $${batches[0].purchasePrice}/kg (${batches[0].date})
          </text>
        `
            : ''
        }

        <!-- 資料節點繪製 (互動可點選點：零座標飄移、即時 HUD 懸浮註解卡片) -->
        ${batches
          .map((b, idx) => {
            const x = getX(b.date, idx);
            const y = getY(b.purchasePrice);
            const isFrozen = b.storageType === 'frozen';
            const color = isFrozen ? '#0284c7' : '#10b981';
            const isSelected = state.selectedChartPointId === b.id;

            return `
            <g class="cursor-pointer group"
               onclick="selectChartDataPoint('${b.id}')"
               onmouseenter="showChartBatchTooltip(event, '${b.id}', '${fruit.id}', ${x.toFixed(1)}, ${y.toFixed(1)})"
               onmousemove="moveChartTooltip(event)"
               onmouseleave="hideChartTooltip()">
              <!-- 放大點選與懸停穩定熱區 (寬鬆透明觸控圓，確保游標滑入不抖動) -->
              <circle cx="${x}" cy="${y}" r="18" fill="transparent"/>
              <!-- 外圈陰影光暈 (透明度過渡，絕無 CSS scale 引發之座標漂移) -->
              <circle cx="${x}" cy="${y}" r="${isSelected ? '10' : '7'}" fill="${color}" opacity="${isSelected ? '0.5' : '0.2'}" class="transition-opacity duration-150 group-hover:opacity-75 pointer-events-none"/>
              <!-- 中心實心圓 (邊框顏色平滑過渡，圓心座標嚴格鎖定) -->
              <circle cx="${x}" cy="${y}" r="${isSelected ? '5.5' : '4'}" fill="#ffffff" stroke="${color}" stroke-width="${isSelected ? '3' : '2.5'}" class="transition-colors duration-150 group-hover:stroke-amber-400 pointer-events-none"/>
              
              <!-- 點選提示標籤 (上方價格數字) -->
              <text x="${x}" y="${y - 10}" text-anchor="middle" font-size="9.5" font-weight="extrabold" fill="${color}" opacity="0.9" class="pointer-events-none select-none">$${b.purchasePrice}</text>
              
              <!-- 批次資料屬性標記 (避免原生 Title 與 HUD 卡片撞疊) -->
              <desc>批次: ${b.date} $${b.purchasePrice}/kg</desc>
            </g>
          `;
          })
          .join('')}

        <!-- 🏢 供應商即時報價水位指標 (位於右側邊緣座標軸上，指針精準標出今日報價水位：零漂移穩定 HUD 提示) -->
        ${vendorQuotes
          .map((vq, vIdx) => {
            const vPrice = Number(vq.quotePrice) || 0;
            if (vPrice <= 0) return '';
            const vy = getY(vPrice);
            const pinX = margin.left + plotWidth + 6;
            const isWinner = vq.isWinner;
            const isTrap = vq.isTrap;
            const pinColor = isWinner ? '#16a34a' : isTrap ? '#dc2626' : '#2563eb';
            const pinBg = isWinner ? '#dcfce7' : isTrap ? '#fee2e2' : '#eff6ff';
            const pinStroke = isWinner ? '#86efac' : isTrap ? '#fca5a5' : '#bfdbfe';
            const pinIcon = isWinner ? '👑' : isTrap ? '⚠️' : '🏢';

            return `
            <g class="cursor-pointer group transition-opacity hover:opacity-90"
               onclick="scrollToVendorMatrix('${fruit.id}')"
               onmouseenter="showChartVendorTooltip(event, '${fruit.id}', ${vIdx}, ${pinX + 29}, ${vy.toFixed(1)})"
               onmousemove="moveChartTooltip(event)"
               onmouseleave="hideChartTooltip()">
              <!-- 擴大熱區以保持 hover 穩定不抖動 -->
              <rect x="${pinX}" y="${vy - 12}" width="58" height="24" fill="transparent" />
              <!-- 指向 Y 軸的水位指針三角形 -->
              <polygon points="${margin.left + plotWidth},${vy} ${pinX + 4},${vy - 4} ${pinX + 4},${vy + 4}" fill="${pinColor}" class="pointer-events-none" />
              <!-- 水位數值標籤 (純邊框 highlight，絕對無 scale 位移) -->
              <rect x="${pinX + 4}" y="${vy - 8}" width="50" height="16" rx="3" fill="${pinBg}" stroke="${pinStroke}" stroke-width="0.8" class="transition-all duration-150 group-hover:stroke-[1.5px] pointer-events-none" />
              <text x="${pinX + 29}" y="${vy + 3.5}" text-anchor="middle" font-size="8.5" font-weight="extrabold" fill="${pinColor}" class="pointer-events-none select-none">
                ${pinIcon} $${vq.quotePrice}
              </text>
              <!-- 供應商屬性標記 (保留廠商名稱供測試與輔助軟體識別，避免原生 title 撞疊) -->
              <desc data-vendor-name="${vq.vendorName}">供應商: ${vq.vendorName} $${vq.quotePrice}/kg</desc>
            </g>
          `;
          })
          .join('')}

        <!-- X 軸日期標籤 (智慧去重防重疊) -->
        ${(() => {
          let lastX = -999;
          return batches
            .map((b, idx) => {
              const x = getX(b.date, idx);
              // 若與前一標籤距離過近，則略過以避免文字黏糊
              if (x - lastX < 42 && idx !== batches.length - 1) {
                return '';
              }
              lastX = x;
              const dStr = b.date.substring(5); // MM-DD
              return `
              <text x="${x}" y="${margin.top + plotHeight + 18}" text-anchor="middle" font-size="9" font-weight="500" fill="#64748b">${dStr}</text>
            `;
            })
            .join('');
        })()}
      </svg>
    </div>
  `;
}

// ==========================================
// 價格水位晴雨計 (Visual Price Level Gauge Meter)
// ==========================================

function renderPriceGaugeMeterHtml(fruit, stats, vendorComparison) {
  const minP = stats.minPrice || 0;
  const maxP = stats.maxPrice || 0;
  const latestP = stats.latestPrice || 0;
  const wac = stats.weightedAvgPrice || 0;
  const hasBatches = stats.batchesCount > 0;

  // 若尚無歷史批次，顯示中性溫馨指引
  if (!hasBatches || minP === maxP) {
    return `
      <div class="bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center space-x-2.5">
          <span class="text-xl">ℹ️</span>
          <div>
            <div class="font-bold text-slate-800">
              ${fruit.name} · 目前尚無歷史入庫批次紀錄
            </div>
            <div class="text-3xs text-slate-500 mt-0.5">
              系統目前採用原料資料庫基準進貨價 <strong>$${latestP}/kg</strong> (取果率 ${stats.latestYieldRate}%) 作為參考基準。
            </div>
          </div>
        </div>
        <button
          onclick="openAddBatchModal()"
          class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs transition active:scale-95 shrink-0"
        >
          ➕ 建立首筆進貨批次
        </button>
      </div>
    `;
  }

  const range = maxP - minP || 1;
  const p25 = Math.round(minP + range * 0.25);
  const p75 = Math.round(minP + range * 0.75);

  const getPct = (val) => Math.max(0, Math.min(100, ((val - minP) / range) * 100));
  const latestPct = getPct(latestP);
  const wacPct = getPct(wac);

  // 判定目前價格所處區間與警示語
  let statusText = '🟡 處於歷史常態行情走廊（平穩採購）';
  let statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-200';

  if (latestP <= p25) {
    statusText = '🟢 處於前 25% 超值低谷區（強烈建議大量採購或冷凍囤貨）';
    statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  } else if (latestP >= p75) {
    statusText = '🔴 處於歷史高檔警戒區（建議嚴格控量或轉用冷凍果丁避險）';
    statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
  }

  return `
    <div class="bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div class="flex items-center space-x-2 flex-wrap gap-y-1">
          <span class="text-xs font-black text-slate-800 flex items-center space-x-1.5">
            <span>👁️ 價格波動水位晴雨計</span>
          </span>
          <span class="text-3xs px-2.5 py-0.5 rounded-full font-extrabold border ${statusBadgeClass}">
            ${statusText}
          </span>
        </div>
        <div class="text-3xs text-slate-500 flex items-center space-x-3">
          <span>歷史低點: <strong class="text-emerald-700 font-bold">$${minP}</strong></span>
          <span>常態均價 WAC: <strong class="text-amber-700 font-bold">$${wac.toFixed(1)}</strong></span>
          <span>歷史高點: <strong class="text-rose-700 font-bold">$${maxP}</strong></span>
        </div>
      </div>

      <!-- 彩色分段晴雨計儀表條 (Segmented Gauge Bar) -->
      <div class="space-y-1.5 pt-1">
        <div class="relative w-full h-4 bg-slate-100 rounded-full flex shadow-inner overflow-visible">
          <!-- 綠色超值低谷區 (0% ~ 25%) -->
          <div style="width: 25%;" class="h-full bg-emerald-400/90 rounded-l-full flex items-center justify-center text-3xs font-bold text-emerald-950" title="超值低谷區: $${minP} ~ $${p25}">
            超值區 (≤$${p25})
          </div>
          <!-- 黃色常態行情走廊 (25% ~ 75%) -->
          <div style="width: 50%;" class="h-full bg-amber-300/90 flex items-center justify-center text-3xs font-bold text-amber-950 border-x border-white/50" title="常態行情走廊: $${p25} ~ $${p75}">
            🛡️ 常態行情安全走廊 ($${p25} ~ $${p75})
          </div>
          <!-- 紅色高檔警戒區 (75% ~ 100%) -->
          <div style="width: 25%;" class="h-full bg-rose-400/90 rounded-r-full flex items-center justify-center text-3xs font-bold text-rose-950" title="高價警戒區: $${p75} ~ $${maxP}">
            高檔區 (≥$${p75})
          </div>

          <!-- 均價 WAC 垂直虛線指針 -->
          <div style="left: ${wacPct}%;" class="absolute -top-1.5 bottom-0 transform -translate-x-1/2 flex flex-col items-center pointer-events-none" title="均價 WAC $${wac.toFixed(1)}">
            <div class="w-1 h-7 bg-amber-600 rounded-full shadow-xs"></div>
          </div>

          <!-- 最新價格水滴指針 (Latest Price Pin) -->
          <div style="left: ${latestPct}%;" class="absolute -top-3 transform -translate-x-1/2 flex flex-col items-center z-10" title="最新批次進貨價 $${latestP}/kg">
            <span class="text-3xs font-black bg-slate-900 text-white px-1.5 py-0.2 rounded-md shadow-md whitespace-nowrap">
              最新 $${latestP}
            </span>
            <div class="w-0 h-0 border-x-4 border-x-transparent border-t-5 border-t-slate-900"></div>
          </div>
        </div>

        <!-- 刻度底標 -->
        <div class="flex items-center justify-between text-3xs text-slate-400 px-1 pt-1 font-mono">
          <span>$${minP} (最低)</span>
          <span>$${p25} (常態下限)</span>
          <span class="text-amber-700 font-bold">WAC $${wac.toFixed(1)}</span>
          <span>$${p75} (常態上限)</span>
          <span>$${maxP} (最高)</span>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 供應商多方比價與實質果肉避坑矩陣 HTML (Vendor Quotes Matrix View)
// ==========================================

function renderVendorQuotesSummaryBannerHtml(fruit, comp) {
  const quotes = comp.quotes;
  const trapQuotes = comp.trapQuotes;
  return `
    <div class="flex items-center space-x-2 flex-wrap gap-y-1.5">
      <span class="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200/60">
        💡 採購決策工作台
      </span>
      <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
        ${fruit.name} · 同台對照 ${quotes.length} 家廠商報價
      </span>
      ${
        trapQuotes.length > 0
          ? `<span class="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
              ⚠️ 偵測到 ${trapQuotes.length} 個「表面低價但耗損偏高」之假便宜陷阱！
            </span>`
          : ''
      }
    </div>
    <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 mt-2 flex items-center space-x-2">
      <span>🏢 供應商多方報價 PK 與「實質果肉避坑」矩陣</span>
    </h3>
    <p class="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
      表面進貨單價便宜不代表真正划算！本矩陣直接換算<strong>削皮去籽後每公斤「實質果肉淨肉價」</strong>，助您精準抓出隱藏耗損成本，議價更省心。
    </p>
  `;
}

function renderVendorQuotesMatrixHtml(fruit, stats) {
  const comp = calcVendorQuotesComparison(fruit.id);
  const quotes = comp.quotes;
  const bestQuote = comp.bestQuote;
  const trapQuotes = comp.trapQuotes;

  return `
    <div id="vendor-quotes-matrix-section" class="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/50 rounded-3xl p-6 shadow-soft border border-indigo-100/90 space-y-5">
      <!-- 頂部標題與控制工具列 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100/80 pb-4">
        <div id="vq-summary-banner-${fruit.id}">
          ${renderVendorQuotesSummaryBannerHtml(fruit, comp)}
        </div>

        <div class="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
          <!-- 捲動至單一自購試算 -->
          <button
            onclick="document.getElementById('custom-price-comparator-section')?.scrollIntoView({ behavior: 'smooth' })"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs transition active:scale-95"
          >
            <span>🎯 單一自購試算 ↓</span>
          </button>
          <!-- 新增比價廠商按鈕 -->
          <button
            onclick="addVendorQuoteSlot('${fruit.id}')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center space-x-1 active:scale-95"
            title="新增一家供應商報價以進行橫向比較"
          >
            <span>➕ 新增廠商</span>
          </button>
          <!-- 還原預設示範廠商 -->
          <button
            onclick="resetFruitVendorQuotes('${fruit.id}')"
            class="px-2.5 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
            title="還原為系統示範的產銷班、盤商與冷凍食品廠"
          >
            <span>🔄 重置</span>
          </button>
        </div>
      </div>

      <!-- 供應商橫向比對卡片陣列 (Grid Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${quotes
          .map((vq, idx) => {
            const isWinner = vq.isWinner;
            const isTrap = vq.isTrap;

            let cardBorder = 'border-slate-200/80';
            let cardBg = 'bg-white';
            let badgeHtml = '';

            if (isWinner) {
              cardBorder = 'border-emerald-300 ring-2 ring-emerald-400/30';
              cardBg = 'bg-gradient-to-b from-emerald-50/50 via-white to-white';
              badgeHtml = `
                <span class="text-3xs font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs flex items-center space-x-1">
                  <span>🏆 綜合性價比冠軍</span>
                </span>
              `;
            } else if (isTrap) {
              cardBorder = 'border-rose-300 ring-2 ring-rose-400/30';
              cardBg = 'bg-gradient-to-b from-rose-50/40 via-white to-white';
              badgeHtml = `
                <span class="text-3xs font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-2xs flex items-center space-x-1">
                  <span>⚠️ 假便宜耗損陷阱</span>
                </span>
              `;
            }

            return `
            <div id="vq-card-${vq.id}" class="${cardBg} ${cardBorder} rounded-2xl p-4.5 border shadow-soft flex flex-col justify-between space-y-3.5 relative transition-all hover:shadow-md">
              <!-- 卡片頂部廠商名稱與標籤 -->
              <div>
                <div class="flex items-center justify-between gap-1 mb-2">
                  <span class="text-3xs font-bold text-slate-400 uppercase tracking-wider">
                    廠商 ${idx + 1} · ${vq.storageType === 'frozen' ? '❄️ IQF冷凍' : '🌱 常溫鮮果'}
                  </span>
                  <div class="flex items-center space-x-1">
                    <div id="vq-badge-${vq.id}">${badgeHtml}</div>
                    ${
                      quotes.length > 1
                        ? `
                      <button
                        onclick="removeVendorQuoteSlot('${fruit.id}', '${vq.id}')"
                        class="text-slate-300 hover:text-rose-500 p-1 rounded-md transition"
                        title="移除此供應商"
                      >
                        ✕
                      </button>
                    `
                        : ''
                    }
                  </div>
                </div>

                <!-- 廠商名稱輸入 -->
                <input
                  id="vq-name-${vq.id}"
                  type="text"
                  value="${vq.vendorName}"
                  onchange="updateVendorQuoteField('${fruit.id}', '${vq.id}', 'vendorName', this.value)"
                  class="w-full font-extrabold text-sm text-slate-900 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
                  placeholder="供應商名稱 / 盤商"
                />

                <!-- 保存型態切換 -->
                <div class="flex items-center space-x-1 mt-2 bg-slate-100 p-1 rounded-xl text-3xs font-bold">
                  <button
                    onclick="updateVendorQuoteField('${fruit.id}', '${vq.id}', 'storageType', 'fresh')"
                    class="flex-1 py-1 rounded-lg transition ${
                      vq.storageType === 'fresh' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }"
                  >
                    🌱 常溫鮮果
                  </button>
                  <button
                    onclick="updateVendorQuoteField('${fruit.id}', '${vq.id}', 'storageType', 'frozen')"
                    class="flex-1 py-1 rounded-lg transition ${
                      vq.storageType === 'frozen' ? 'bg-white text-sky-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }"
                  >
                    ❄️ IQF冷凍果丁
                  </button>
                </div>
              </div>

              <!-- 關鍵輸入項：報價、取果率、採購量 -->
              <div class="grid grid-cols-2 gap-2 text-xs">
                <!-- 報價單價 -->
                <div class="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div class="text-3xs text-slate-400 font-medium">進貨報價 ($/kg)</div>
                  <div class="flex items-center space-x-1 mt-0.5">
                    <span class="text-slate-400 font-bold">$</span>
                    <input
                      id="vq-price-${vq.id}"
                      type="number"
                      min="1"
                      step="0.5"
                      value="${vq.quotePrice}"
                      oninput="updateVendorQuoteField('${fruit.id}', '${vq.id}', 'quotePrice', this.value)"
                      class="w-full font-black text-slate-800 bg-transparent focus:outline-hidden text-sm"
                    />
                  </div>
                </div>

                <!-- 取果率 / 出成率 -->
                <div class="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div class="text-3xs text-slate-400 font-medium">${vq.storageType === 'frozen' ? '解凍出成率 (%)' : '削皮取果率 (%)'}</div>
                  <div class="flex items-center space-x-1 mt-0.5">
                    <input
                      id="vq-yield-${vq.id}"
                      type="number"
                      min="5"
                      max="100"
                      step="1"
                      value="${vq.yieldRate}"
                      oninput="updateVendorQuoteField('${fruit.id}', '${vq.id}', 'yieldRate', this.value)"
                      class="w-full font-black text-slate-800 bg-transparent focus:outline-hidden text-sm"
                    />
                    <span class="text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <!-- 採購量 (kg) -->
                <div class="col-span-2 bg-slate-50/80 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div class="text-3xs text-slate-400 font-medium">預計採購量</div>
                  <div class="flex items-center space-x-1">
                    <input
                      id="vq-qty-${vq.id}"
                      type="number"
                      min="1"
                      step="10"
                      value="${vq.quantityKg}"
                      oninput="updateVendorQuoteField('${fruit.id}', '${vq.id}', 'quantityKg', this.value)"
                      class="w-20 text-right font-black text-slate-800 bg-transparent focus:outline-hidden text-xs"
                    />
                    <span class="text-3xs text-slate-400 font-bold">kg</span>
                  </div>
                </div>
              </div>

              <!-- 核心試算診斷數值區 -->
              <div class="bg-gradient-to-br from-indigo-50/50 to-slate-50 p-3 rounded-2xl border border-indigo-100/70 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-3xs text-slate-500 font-bold">🥩 實質果肉淨價</span>
                  <div class="text-right">
                    <span id="vq-effective-${vq.id}" class="text-base font-black ${isWinner ? 'text-emerald-700' : isTrap ? 'text-rose-700' : 'text-indigo-900'}">
                      $${vq.effectivePrice.toFixed(1)}
                    </span>
                    <span class="text-3xs text-slate-400 font-medium">/kg</span>
                  </div>
                </div>

                <div class="flex items-center justify-between text-3xs border-t border-slate-200/50 pt-1.5">
                  <span class="text-slate-400">純果肉每 100g</span>
                  <span id="vq-100g-${vq.id}" class="font-bold text-slate-700">$${vq.costPer100g.toFixed(2)}</span>
                </div>

                <div class="flex items-center justify-between text-3xs border-t border-slate-200/50 pt-1.5">
                  <span class="text-slate-400">總採購額 / 淨得果肉</span>
                  <span id="vq-total-${vq.id}" class="font-bold text-slate-700">
                    $${Math.round(vq.totalCost).toLocaleString()} / ${vq.pureMeatYieldKg.toFixed(1)} kg
                  </span>
                </div>

                <!-- 與在庫加權均價 (WAC) 比較 -->
                <div class="flex items-center justify-between text-3xs border-t border-slate-200/50 pt-1.5">
                  <span class="text-slate-400">與在庫均價比</span>
                  <span id="vq-vswac-${vq.id}" class="font-bold ${vq.vsWacDiff <= 0 ? 'text-emerald-700' : 'text-rose-700'}">
                    ${vq.vsWacDiff <= 0 ? `▼ 省 $${Math.abs(vq.vsWacDiff).toFixed(1)}/kg` : `▲ 貴 $${vq.vsWacDiff.toFixed(1)}/kg`}
                  </span>
                </div>
              </div>

              <!-- 避坑陷阱診斷警示說明 -->
              <div id="vq-diag-${vq.id}">
              ${
                isTrap
                  ? `
                <div class="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-3xs text-rose-800 leading-relaxed font-medium">
                  <strong>⚠️ 避坑分析：</strong>此報價表面單價最低，但因耗損高達 ${100 - vq.yieldRate}%，去皮去籽後<strong>實質果肉每公斤反而多花 $${vq.wasteExtraPerKg.toFixed(1)} (+${vq.wasteExtraPct.toFixed(1)}%)</strong>！建議改選性價比冠軍。
                </div>
              `
                  : isWinner
                  ? `
                <div class="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-3xs text-emerald-800 leading-relaxed font-medium">
                  <strong>🏆 最佳首選：</strong>實質淨肉成本最低！原果取果率與單價平衡最佳，強烈推薦採納！
                </div>
              `
                  : `
                <div class="text-3xs text-slate-400 p-1">
                  備註：${vq.specNotes || '無特殊備註'}
                </div>
              `
              }
              </div>

              <!-- 採購決策行動按鈕 -->
              <div class="space-y-1.5 pt-1 border-t border-slate-100">
                <button
                  id="vq-adopt-btn-${vq.id}"
                  onclick="adoptVendorQuoteAsBatch('${fruit.id}', '${vq.id}')"
                  class="w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 active:scale-95 ${
                    isWinner
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : isTrap
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }"
                  title="以此廠商報價直接登錄為官方歷史進貨批次"
                >
                  <span>📥 採納此報價並登錄入庫</span>
                </button>

                <button
                  onclick="copyVendorNegotiationMemo('${fruit.id}', '${vq.id}')"
                  class="w-full py-1.5 rounded-xl text-3xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center space-x-1 active:scale-95"
                  title="一鍵複製針對此廠商之議價話術與分析數據"
                >
                  <span>📋 複製議價備忘錄 (談判話術)</span>
                </button>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>

      <!-- 底部決策摘要結算卡 -->
      <div id="vq-bottom-decision-${fruit.id}">
        ${renderVendorQuotesBottomDecisionHtml(fruit, comp)}
      </div>
    </div>
  `;
}


function renderVendorQuotesBottomDecisionHtml(fruit, comp) {
  const quotes = comp.quotes;
  const bestQuote = comp.bestQuote;
  if (!bestQuote || quotes.length <= 1) return '';
  return `
    <div class="bg-white p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
      <div class="flex items-center space-x-3">
        <span class="text-2xl">🎯</span>
        <div>
          <div class="font-extrabold text-slate-900">
            採購建議決策：首選【${bestQuote.vendorName}】
          </div>
          <div class="text-3xs text-slate-500 mt-0.5">
            實質果肉每公斤只要 <strong>$${bestQuote.effectivePrice.toFixed(1)}</strong>，若本次進貨 ${bestQuote.quantityKg} kg，可得純淨肉 <strong>${bestQuote.pureMeatYieldKg.toFixed(1)} kg</strong>。
          </div>
        </div>
      </div>
      <div class="text-right shrink-0">
        <button
          onclick="adoptVendorQuoteAsBatch('${fruit.id}', '${bestQuote.id}')"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
        >
          📥 一鍵採納性價比冠軍入庫
        </button>
      </div>
    </div>
  `;
}

function updateVendorQuotesLiveCalculations(fruitId) {
  const fruit = getFruit(fruitId);
  const comp = calcVendorQuotesComparison(fruitId);
  const quotes = comp.quotes;

  const bannerEl = document.getElementById(`vq-summary-banner-${fruitId}`);
  if (bannerEl) bannerEl.innerHTML = renderVendorQuotesSummaryBannerHtml(fruit, comp);

  const bottomDecEl = document.getElementById(`vq-bottom-decision-${fruitId}`);
  if (bottomDecEl) bottomDecEl.innerHTML = renderVendorQuotesBottomDecisionHtml(fruit, comp);

  quotes.forEach((vq) => {
    const isWinner = vq.isWinner;
    const isTrap = vq.isTrap;

    const cardEl = document.getElementById(`vq-card-${vq.id}`);
    if (cardEl) {
      let cardBorder = 'border-slate-200/80';
      let cardBg = 'bg-white';
      if (isWinner) {
        cardBorder = 'border-emerald-300 ring-2 ring-emerald-400/30';
        cardBg = 'bg-gradient-to-b from-emerald-50/50 via-white to-white';
      } else if (isTrap) {
        cardBorder = 'border-rose-300 ring-2 ring-rose-400/30';
        cardBg = 'bg-gradient-to-b from-rose-50/40 via-white to-white';
      }
      cardEl.className = `${cardBg} ${cardBorder} rounded-2xl p-4.5 border shadow-soft flex flex-col justify-between space-y-3.5 relative transition-all hover:shadow-md`;
    }

    const badgeEl = document.getElementById(`vq-badge-${vq.id}`);
    if (badgeEl) {
      if (isWinner) {
        badgeEl.innerHTML = `
          <span class="text-3xs font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs flex items-center space-x-1">
            <span>🏆 綜合性價比冠軍</span>
          </span>
        `;
      } else if (isTrap) {
        badgeEl.innerHTML = `
          <span class="text-3xs font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-2xs flex items-center space-x-1">
            <span>⚠️ 假便宜耗損陷阱</span>
          </span>
        `;
      } else {
        badgeEl.innerHTML = '';
      }
    }

    const effEl = document.getElementById(`vq-effective-${vq.id}`);
    if (effEl) {
      effEl.textContent = `$${vq.effectivePrice.toFixed(1)}`;
      effEl.className = `text-base font-black ${isWinner ? 'text-emerald-700' : isTrap ? 'text-rose-700' : 'text-indigo-900'}`;
    }

    const c100gEl = document.getElementById(`vq-100g-${vq.id}`);
    if (c100gEl) c100gEl.textContent = `$${vq.costPer100g.toFixed(2)}`;

    const totalEl = document.getElementById(`vq-total-${vq.id}`);
    if (totalEl) totalEl.textContent = `$${Math.round(vq.totalCost).toLocaleString()} / ${vq.pureMeatYieldKg.toFixed(1)} kg`;

    const vswacEl = document.getElementById(`vq-vswac-${vq.id}`);
    if (vswacEl) {
      vswacEl.className = `font-bold ${vq.vsWacDiff <= 0 ? 'text-emerald-700' : 'text-rose-700'}`;
      vswacEl.textContent = vq.vsWacDiff <= 0 ? `▼ 省 $${Math.abs(vq.vsWacDiff).toFixed(1)}/kg` : `▲ 貴 $${vq.vsWacDiff.toFixed(1)}/kg`;
    }

    const diagEl = document.getElementById(`vq-diag-${vq.id}`);
    if (diagEl) {
      if (isTrap) {
        diagEl.innerHTML = `
          <div class="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-3xs text-rose-800 leading-relaxed font-medium">
            <strong>⚠️ 避坑分析：</strong>此報價表面單價最低，但因耗損高達 ${100 - vq.yieldRate}%，去皮去籽後<strong>實質果肉每公斤反而多花 $${vq.wasteExtraPerKg.toFixed(1)} (+${vq.wasteExtraPct.toFixed(1)}%)</strong>！建議改選性價比冠軍。
          </div>
        `;
      } else if (isWinner) {
        diagEl.innerHTML = `
          <div class="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-3xs text-emerald-800 leading-relaxed font-medium">
            <strong>🏆 最佳首選：</strong>實質淨肉成本最低！原果取果率與單價平衡最佳，強烈推薦採納！
          </div>
        `;
      } else {
        diagEl.innerHTML = `
          <div class="text-3xs text-slate-400 p-1">
            備註：${vq.specNotes || '無特殊備註'}
          </div>
        `;
      }
    }

    const btnEl = document.getElementById(`vq-adopt-btn-${vq.id}`);
    if (btnEl) {
      btnEl.className = `w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 active:scale-95 ${
        isWinner
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
          : isTrap
          ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
      }`;
    }
  });
}

// 自購價格即時比對與採購效益模擬器 (Custom Price Comparator)
// ==========================================

function renderCustomPriceComparatorHtml(fruit, stats) {
  const quote = state.inventoryCustomQuote || {};
  const currentFruitId = fruit.id;
  const isSameFruit = quote.fruitId === currentFruitId;

  const storageType = (isSameFruit && quote.storageType) ? quote.storageType : 'fresh';
  const cfg = getFruitCostConfig(currentFruitId, storageType);

  const purchasePrice = Number(
    isSameFruit && quote.purchasePrice !== undefined && quote.purchasePrice !== null
      ? quote.purchasePrice
      : cfg.purchasePrice
  );
  const yieldRate = Number(
    isSameFruit && quote.yieldRate !== undefined && quote.yieldRate !== null
      ? quote.yieldRate
      : cfg.yieldRate
  );
  const quantityKg = Number((isSameFruit && quote.quantityKg) ? quote.quantityKg : 100);
  const isFrozen = storageType === 'frozen';

  // 1. 換算實質果肉單價與總採購支出
  const effectivePrice = yieldRate > 0 ? purchasePrice / (yieldRate / 100) : purchasePrice;
  const totalAmount = purchasePrice * quantityKg;

  // 2. 與最新批次進貨價比對
  let diffLatest = 0;
  let diffLatestPct = 0;
  if (stats.latestPrice > 0) {
    diffLatest = purchasePrice - stats.latestPrice;
    diffLatestPct = (diffLatest / stats.latestPrice) * 100;
  }

  // 3. 與在庫加權均價 (WAC) 比對
  let diffWac = 0;
  let diffWacPct = 0;
  if (stats.weightedAvgPrice > 0) {
    diffWac = purchasePrice - stats.weightedAvgPrice;
    diffWacPct = (diffWac / stats.weightedAvgPrice) * 100;
  }

  // 4. 模擬採購此批後的在庫加權成本衝擊 (Simulated WAC Impact)
  const currentTotalKg = stats.totalQuantityKg || 0;
  const currentTotalSpent = stats.totalExpenditure || 0;
  const simNewTotalKg = currentTotalKg + quantityKg;
  const simNewTotalSpent = currentTotalSpent + totalAmount;
  const simNewWac = simNewTotalKg > 0 ? simNewTotalSpent / simNewTotalKg : purchasePrice;
  const wacChange = simNewWac - stats.weightedAvgPrice;

  // 5. 歷史高低點定位評估
  let historicalPositionText = '';
  let historicalBadgeClass = '';
  if (purchasePrice < stats.minPrice) {
    const savings = (stats.minPrice - purchasePrice).toFixed(1);
    historicalPositionText = `🏆 突破歷史最低價！(比歷史最低 $${stats.minPrice} 還便宜 $${savings}/kg)`;
    historicalBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (purchasePrice <= stats.minPrice + (stats.priceSpread * 0.25)) {
    historicalPositionText = `🟢 處於歷史前 25% 超值低檔區 (採購良機)`;
    historicalBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (purchasePrice > stats.maxPrice) {
    const premium = (purchasePrice - stats.maxPrice).toFixed(1);
    historicalPositionText = `⚠️ 創歷史新高價！(比歷史最高 $${stats.maxPrice} 還貴 $${premium}/kg)`;
    historicalBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (purchasePrice >= stats.maxPrice - (stats.priceSpread * 0.25)) {
    historicalPositionText = `🔴 處於歷史前 25% 高檔警戒區 (建議少量或暫緩)`;
    historicalBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  } else {
    historicalPositionText = `🟡 處於歷史常態平均行情 ($${stats.minPrice} ~ $${stats.maxPrice})`;
    historicalBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  // 6. 鮮凍效益對決換算 (對照另一種保存型態)
  const oppStorage = isFrozen ? 'fresh' : 'frozen';
  const oppCfg = getFruitCostConfig(currentFruitId, oppStorage);
  const oppEff = oppCfg.purchasePrice / (oppCfg.yieldRate / 100);
  const effDiff = effectivePrice - oppEff; // 自購實質價 - 對手實質價

  return `
    <div id="custom-price-comparator-section" class="bg-gradient-to-br from-pink-50/50 via-white to-amber-50/40 rounded-3xl p-6 shadow-soft border border-pink-200/80 space-y-5">
      <!-- 標題列 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-pink-100/80 pb-3.5">
        <div class="flex items-center space-x-2.5">
          <div class="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center text-xl shadow-sm">
            🎯
          </div>
          <div>
            <div class="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 class="text-base font-extrabold text-slate-900">
                自購價格即時比對與效益診斷
              </h3>
              <span class="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                即時連動走勢圖 📍
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              輸入您目前詢問到的進貨報價，系統將即時與歷史高低點、在庫加權成本 (WAC) 及最新批次進行對比分析！
            </p>
          </div>
        </div>

        <!-- 模式切換與快速帶入按鈕組 -->
        <div class="flex items-center space-x-1.5 flex-wrap gap-y-1 text-3xs font-bold">
          <button
            onclick="document.getElementById('vendor-quotes-matrix-section')?.scrollIntoView({ behavior: 'smooth' })"
            class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition active:scale-95"
            title="平滑捲動至供應商多方報價 PK 避坑矩陣"
          >
            <span>🏢 供應商多方比價 PK ↑</span>
          </button>
          <span class="text-slate-400 ml-1">快速填入：</span>
          <button
            onclick="fillCustomQuotePrice(${stats.latestPrice}, ${stats.latestYieldRate || 75})"
            class="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
            title="帶入最新批次進貨價"
          >
            ⚡ 最新價 $${stats.latestPrice}
          </button>
          <button
            onclick="fillCustomQuotePrice(${Math.round(stats.weightedAvgPrice)}, ${Math.round(stats.weightedAvgYieldRate || 75)})"
            class="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition"
            title="帶入在庫加權均價"
          >
            ⚡ 均價 WAC $${stats.weightedAvgPrice.toFixed(1)}
          </button>
          <button
            onclick="fillCustomQuotePrice(${stats.minPrice}, ${stats.latestYieldRate || 75})"
            class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition"
            title="帶入歷史最低價"
          >
            ⚡ 最低價 $${stats.minPrice}
          </button>
        </div>
      </div>

      <!-- 輸入表單列 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
        <!-- 1. 自購進貨單價 -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-700">自購詢價單價：</label>
            <span class="text-3xs text-pink-600 font-extrabold">必填</span>
          </div>
          <div class="relative flex items-center">
            <span class="absolute left-3 text-slate-400 font-bold text-sm">$</span>
            <input
              id="cq-purchase-price"
              type="number"
              min="1"
              step="1"
              value="${purchasePrice}"
              oninput="handleCustomQuoteChange('purchasePrice', this.value)"
              class="w-full pl-7 pr-12 py-2 bg-pink-50/40 hover:bg-pink-50/70 focus:bg-white border-2 border-pink-300 rounded-xl font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-pink-500 transition text-sm"
              placeholder="例: 110"
            />
            <span class="absolute right-3 text-3xs font-semibold text-slate-400">元/kg</span>
          </div>
        </div>

        <!-- 2. 取果率 / 出成率 -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-700">${isFrozen ? '解凍出成率：' : '預估取果率：'}</label>
            <span class="text-3xs text-slate-400">耗損 ${100 - yieldRate}%</span>
          </div>
          <div class="relative flex items-center">
            <input
              id="cq-yield-rate"
              type="number"
              min="1"
              max="100"
              step="1"
              value="${yieldRate}"
              oninput="handleCustomQuoteChange('yieldRate', this.value)"
              class="w-full pl-3 pr-10 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-500 transition text-sm"
            />
            <span class="absolute right-3 text-3xs font-bold text-slate-400">%</span>
          </div>
        </div>

        <!-- 3. 保存型態 -->
        <div class="space-y-1">
          <label class="font-bold text-slate-700 block">保存原料型態：</label>
          <select
            id="cq-storage-type"
            onchange="handleCustomQuoteChange('storageType', this.value)"
            class="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-500 transition text-xs"
          >
            <option value="fresh" ${!isFrozen ? 'selected' : ''}>🌱 常溫鮮果 (需削皮去籽)</option>
            <option value="frozen" ${isFrozen ? 'selected' : ''}>❄️ 冷凍水果 (IQF/純果肉原汁)</option>
          </select>
        </div>

        <!-- 4. 預計採購量 (kg) -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-700">預計採購量：</label>
            <span class="text-3xs text-slate-400">模擬均價用</span>
          </div>
          <div class="relative flex items-center">
            <input
              id="cq-quantity-kg"
              type="number"
              min="1"
              step="1"
              value="${quantityKg}"
              oninput="handleCustomQuoteChange('quantityKg', this.value)"
              class="w-full pl-3 pr-10 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-500 transition text-sm"
            />
            <span class="absolute right-3 text-3xs font-bold text-slate-400">kg</span>
          </div>
        </div>
      </div>

      <!-- 核心比對診斷指標看板包裹層 -->
      <div id="custom-quote-diagnosis-cards" class="space-y-5">
        ${renderCustomQuoteDiagnosisHtml(fruit, stats, quote)}
      </div>    </div>
  `;
}


function renderCustomQuoteDiagnosisHtml(fruit, stats, quote) {
  const currentFruitId = fruit.id;
  const isSameFruit = quote && quote.fruitId === currentFruitId;
  const storageType = (isSameFruit && quote.storageType) ? quote.storageType : 'fresh';
  const cfg = getFruitCostConfig(currentFruitId, storageType);

  const purchasePrice = Number(
    isSameFruit && quote.purchasePrice !== undefined && quote.purchasePrice !== null
      ? quote.purchasePrice
      : cfg.purchasePrice
  );
  const yieldRate = Number(
    isSameFruit && quote.yieldRate !== undefined && quote.yieldRate !== null
      ? quote.yieldRate
      : cfg.yieldRate
  );
  const quantityKg = Number((isSameFruit && quote.quantityKg) ? quote.quantityKg : 100);
  const isFrozen = storageType === 'frozen';

  const effectivePrice = yieldRate > 0 ? purchasePrice / (yieldRate / 100) : purchasePrice;
  const totalAmount = purchasePrice * quantityKg;

  let diffLatest = 0;
  let diffLatestPct = 0;
  if (stats.latestPrice > 0) {
    diffLatest = purchasePrice - stats.latestPrice;
    diffLatestPct = (diffLatest / stats.latestPrice) * 100;
  }

  let diffWac = 0;
  let diffWacPct = 0;
  if (stats.weightedAvgPrice > 0) {
    diffWac = purchasePrice - stats.weightedAvgPrice;
    diffWacPct = (diffWac / stats.weightedAvgPrice) * 100;
  }

  const currentTotalKg = stats.totalQuantityKg || 0;
  const currentTotalSpent = stats.totalExpenditure || 0;
  const simNewTotalKg = currentTotalKg + quantityKg;
  const simNewTotalSpent = currentTotalSpent + totalAmount;
  const simNewWac = simNewTotalKg > 0 ? simNewTotalSpent / simNewTotalKg : purchasePrice;
  const wacChange = simNewWac - stats.weightedAvgPrice;

  let historicalPositionText = '';
  let historicalBadgeClass = '';
  if (purchasePrice < stats.minPrice) {
    const savings = (stats.minPrice - purchasePrice).toFixed(1);
    historicalPositionText = `🏆 突破歷史最低價！(比歷史最低 $${stats.minPrice} 還便宜 $${savings}/kg)`;
    historicalBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (purchasePrice <= stats.minPrice + (stats.priceSpread * 0.25)) {
    historicalPositionText = `🟢 處於歷史前 25% 超值低檔區 (採購良機)`;
    historicalBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (purchasePrice > stats.maxPrice) {
    const premium = (purchasePrice - stats.maxPrice).toFixed(1);
    historicalPositionText = `⚠️ 創歷史新高價！(比歷史最高 $${stats.maxPrice} 還貴 $${premium}/kg)`;
    historicalBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (purchasePrice >= stats.maxPrice - (stats.priceSpread * 0.25)) {
    historicalPositionText = `🔴 處於歷史前 25% 高檔警戒區 (建議少量或暫緩)`;
    historicalBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  } else {
    historicalPositionText = `🟡 處於歷史常態平均行情 ($${stats.minPrice} ~ $${stats.maxPrice})`;
    historicalBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const oppStorage = isFrozen ? 'fresh' : 'frozen';
  const oppCfg = getFruitCostConfig(currentFruitId, oppStorage);
  const oppEff = oppCfg.purchasePrice / (oppCfg.yieldRate / 100);
  const effDiff = effectivePrice - oppEff;

  return `
    <div class="space-y-5">
      <!-- 核心比對診斷指標看版 (4 卡片) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <!-- 診斷 1: 實質可食果肉單價 -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs space-y-1.5">
          <div class="text-2xs font-bold text-purple-700 uppercase tracking-wider flex items-center justify-between">
            <span>換算實質淨肉價</span>
            <span class="text-3xs bg-purple-50 text-purple-800 px-1.5 py-0.2 rounded font-mono">淨肉</span>
          </div>
          <div class="flex items-baseline space-x-1">
            <span class="text-2xl font-black text-purple-950">$ ${effectivePrice.toFixed(1)}</span>
            <span class="text-2xs font-normal text-slate-400">/kg</span>
          </div>
          <div class="text-3xs text-slate-500">
            每 100g 淨果肉成本 <strong>$${((effectivePrice / 1000) * 100).toFixed(2)}</strong> 元
          </div>
        </div>

        <!-- 診斷 2: 與最新批次比對 -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs space-y-1.5">
          <div class="text-2xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>與最新進貨價比對</span>
            <span class="text-3xs font-mono text-slate-400">最新 $${stats.latestPrice}</span>
          </div>
          <div class="flex items-baseline space-x-1">
            <span class="text-2xl font-black ${diffLatest < 0 ? 'text-emerald-600' : diffLatest > 0 ? 'text-rose-600' : 'text-slate-800'}">
              ${diffLatest < 0 ? `-$${Math.abs(diffLatest).toFixed(1)}` : diffLatest > 0 ? `+$${diffLatest.toFixed(1)}` : '$0'}
            </span>
            <span class="text-2xs font-normal text-slate-400">/kg</span>
          </div>
          <div class="text-3xs font-bold ${diffLatest < 0 ? 'text-emerald-700' : diffLatest > 0 ? 'text-rose-700' : 'text-slate-500'}">
            ${diffLatest < 0 ? `🟢 比最新批次便宜 ${Math.abs(diffLatestPct).toFixed(1)}% (省 $${Math.abs(diffLatest * quantityKg).toLocaleString()} 元)` : diffLatest > 0 ? `🔴 比最新批次貴 ${diffLatestPct.toFixed(1)}% (多支出 $${(diffLatest * quantityKg).toLocaleString()} 元)` : '⚪ 與最新批次價格相同'}
          </div>
        </div>

        <!-- 診斷 3: 與在庫加權均價 (WAC) 比對 -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs space-y-1.5">
          <div class="text-2xs font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
            <span>與在庫均價 (WAC) 比對</span>
            <span class="text-3xs font-mono text-amber-800">均價 $${stats.weightedAvgPrice.toFixed(1)}</span>
          </div>
          <div class="flex items-baseline space-x-1">
            <span class="text-2xl font-black ${diffWac < 0 ? 'text-emerald-600' : diffWac > 0 ? 'text-rose-600' : 'text-slate-800'}">
              ${diffWac < 0 ? `-$${Math.abs(diffWac).toFixed(1)}` : diffWac > 0 ? `+$${diffWac.toFixed(1)}` : '$0'}
            </span>
            <span class="text-2xs font-normal text-slate-400">/kg</span>
          </div>
          <div class="text-3xs font-bold ${diffWac < 0 ? 'text-emerald-700' : diffWac > 0 ? 'text-rose-700' : 'text-slate-500'}">
            ${diffWac < 0 ? `🟢 低於在庫均價 (採購將拉低庫存成本)` : diffWac > 0 ? `🔴 高於在庫均價 (採購將墊高庫存均價)` : '⚪ 與在庫加權均價持平'}
          </div>
        </div>

        <!-- 診斷 4: 鮮凍型態效益對決 -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs space-y-1.5">
          <div class="text-2xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>鮮凍效益對照</span>
            <span class="text-3xs font-mono text-slate-400">${isFrozen ? '對照常溫鮮果' : '對照冷凍規格'}</span>
          </div>
          <div class="flex items-baseline space-x-1">
            <span class="text-2xl font-black ${effDiff < 0 ? 'text-emerald-600' : effDiff > 0 ? 'text-sky-600' : 'text-slate-800'}">
              ${effDiff < 0 ? `省 $${Math.abs(effDiff).toFixed(1)}` : effDiff > 0 ? `貴 $${effDiff.toFixed(1)}` : '$0'}
            </span>
            <span class="text-2xs font-normal text-slate-400">/kg 果肉</span>
          </div>
          <div class="text-3xs font-semibold ${effDiff < 0 ? 'text-emerald-700' : 'text-sky-700'}">
            ${
              effDiff < -2
                ? `🌱 買此${storageType === 'fresh' ? '鮮果' : '規格'}每公斤果肉比${oppStorage === 'frozen' ? '冷凍' : '鮮果'}省 $${Math.abs(effDiff).toFixed(1)} 元`
                : effDiff > 2
                ? `❄️ 直接採購${oppStorage === 'frozen' ? '冷凍果丁' : '鮮果'}實質成本反而更便宜！`
                : '⚖️ 兩者實質果肉成本相仿'
            }
          </div>
        </div>
      </div>

      <!-- 模擬入庫衝擊與決策橫幅 (Simulated Impact Banner) -->
      <div class="bg-white/80 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div class="space-y-1">
          <div class="flex items-center space-x-2 flex-wrap">
            <span class="font-extrabold text-slate-800">📊 採購 ${quantityKg} kg 之庫存衝擊模擬：</span>
            <span class="px-2 py-0.5 rounded-full text-3xs font-bold border ${historicalBadgeClass}">
              ${historicalPositionText}
            </span>
          </div>
          <div class="text-slate-600 leading-relaxed text-3xs sm:text-xs">
            若以此單價進貨 <strong>${quantityKg} kg</strong> (採購支出 $${totalAmount.toLocaleString()} 元)，全庫累計量將自 ${currentTotalKg} kg 增至 <strong>${simNewTotalKg} kg</strong>，<br class="hidden sm:inline"/>
            在庫加權平均成本 (WAC) 將自 $${stats.weightedAvgPrice.toFixed(1)}/kg 
            <strong class="${wacChange <= 0 ? 'text-emerald-600' : 'text-rose-600'}">
              ${wacChange < 0 ? `降至 $${simNewWac.toFixed(1)}/kg (拉低 $${Math.abs(wacChange).toFixed(1)}/kg)` : wacChange > 0 ? `升至 $${simNewWac.toFixed(1)}/kg (墊高 $${wacChange.toFixed(1)}/kg)` : `維持 $${simNewWac.toFixed(1)}/kg`}
            </strong>。
          </div>
        </div>

        <!-- 一鍵入庫按鈕 -->
        <button
          onclick="saveCustomQuoteAsBatch()"
          class="px-4 py-2.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-sm transition flex items-center justify-center space-x-1.5 shrink-0 active:scale-95"
          title="將這筆自購詢價數據直接作為今日進貨批次存入資料庫"
        >
          <span>📥 直接存為正式進貨批次</span>
        </button>
      </div>
    </div>
  `;
}


// ==========================================
// 採購決策指揮艙核心運算引擎 (Procurement Decision Cockpit Engine)
// ==========================================

/**
 * Tier 1: 全盤採購戰略資產統計 (Portfolio Executive Summary)
 * 統計全庫在席資產估值、鮮凍原料分佈、存貨週轉天數 (DOH) 與暴漲警戒雷達
 */
function calcPortfolioExecutiveSummary() {
  const batches = state.inventoryBatches || [];
  let totalValuation = 0;
  let totalGrossKg = 0;
  let totalPureMeatKg = 0;
  let freshValuation = 0;
  let frozenValuation = 0;
  let freshKg = 0;
  let frozenKg = 0;

  batches.forEach((b) => {
    const qty = Number(b.quantityKg) || 0;
    const price = Number(b.purchasePrice) || 0;
    const yieldR = Math.max(1, Math.min(100, Number(b.yieldRate) || 100));
    const amount = Number(b.totalAmount) || (price * qty);
    const pureMeat = qty * (yieldR / 100);

    totalValuation += amount;
    totalGrossKg += qty;
    totalPureMeatKg += pureMeat;

    if (b.storageType === 'frozen') {
      frozenValuation += amount;
      frozenKg += qty;
    } else {
      freshValuation += amount;
      freshKg += qty;
    }
  });

  const freshPct = totalValuation > 0 ? (freshValuation / totalValuation) * 100 : 50;
  const frozenPct = totalValuation > 0 ? (frozenValuation / totalValuation) * 100 : 50;

  // 預估全庫存貨週轉天數 (Estimated Days of Inventory on Hand - DOH)
  // 依門市/工廠標準綜合日耗損約 85 kg 試算
  const dailyUsageKg = 85;
  const avgTurnoverDays = totalGrossKg > 0 ? Math.round(totalGrossKg / dailyUsageKg) : 0;

  // 全品項價格波動與暴漲警戒雷達掃描
  const allFruits = state.fruits || [];
  const surgeAlertFruits = [];
  let savingsContribution = 0;

  allFruits.forEach((f) => {
    const stats = calcFruitPriceStats(f.id, 'all', 'all');
    if ((stats.batchesCount || 0) > 0) {
      if (stats.volatilityPct >= 100 || stats.status === 'high_alert') {
        surgeAlertFruits.push({
          fruitId: f.id,
          name: f.name,
          emoji: f.emoji,
          volatilityPct: stats.volatilityPct,
          latestPrice: stats.latestPrice,
          minPrice: stats.minPrice,
          maxPrice: stats.maxPrice,
          status: stats.status,
          statusText: stats.statusText
        });
      }
      // 採購節省效益：各批次對比歷史高點現省累計
      const fruitBatches = batches.filter((b) => b.fruitId === f.id);
      fruitBatches.forEach((b) => {
        if (stats.maxPrice > b.purchasePrice) {
          savingsContribution += (stats.maxPrice - b.purchasePrice) * (b.quantityKg || 0);
        }
      });
    }
  });

  surgeAlertFruits.sort((a, b) => b.volatilityPct - a.volatilityPct);

  return {
    totalValuation,
    totalGrossKg,
    totalPureMeatKg,
    freshValuation,
    frozenValuation,
    freshKg,
    frozenKg,
    freshPct,
    frozenPct,
    avgTurnoverDays,
    surgeAlertCount: surgeAlertFruits.length,
    surgeAlertFruits,
    savingsContribution,
    batchCount: batches.length
  };
}

/**
 * Tier 2: 單品採購時機信號燈判定 (Procurement Action Signal Engine)
 * 整合產季大出狀態、歷史價格通道分位與在庫水位，提供採購執行指令
 */
function calcFruitProcurementSignal(fruitId, currentPrice) {
  const fruit = getFruit(fruitId);
  const stats = calcFruitPriceStats(fruitId, 'all', 'all');
  const price = Number(currentPrice !== undefined && currentPrice !== null ? currentPrice : stats.latestPrice) || 0;

  const currentMonth = Number(state.seasonSelectedMonth) || 9;
  const seasonData = (typeof FRUIT_SEASONALITY_MAP !== 'undefined' && FRUIT_SEASONALITY_MAP[fruitId])
    ? FRUIT_SEASONALITY_MAP[fruitId]
    : null;

  const isPeakSeason = !!(seasonData && seasonData.peakMonths && seasonData.peakMonths.includes(currentMonth));
  const isOffSeason = !isPeakSeason;

  const spread = stats.priceSpread || Math.max(1, stats.maxPrice - stats.minPrice);
  const p25 = stats.minPrice + (spread * 0.25);
  const p75 = stats.maxPrice - (spread * 0.25);

  const isBottom25 = price <= p25;
  const isTop25 = price >= p75;
  const isRecordLow = price < stats.minPrice;
  const isRecordHigh = price > stats.maxPrice;

  let level = 'keep_pace';
  let badge = '🟡 常態補貨';
  let badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
  let title = '常態走廊·平穩補貨';
  let recommendation = '目前行情落於常態安全價格走廊，供應鏈穩定。建議維持標準週轉天數（約 7~10 天量），落實先進先出 (FIFO) 避免過期折損。';
  let actionTag = '維持常態採購配比';
  let actionClass = 'text-amber-700 bg-amber-50 border-amber-200';

  if (isRecordLow || (isBottom25 && isPeakSeason) || (isBottom25 && price <= stats.weightedAvgPrice)) {
    level = 'strong_buy';
    badge = '🟢 強烈進補';
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    title = '產季大出·超值低檔 (建議積極備料)';
    recommendation = `當前單價 $${price}/kg 處於歷史超值低檔區${isPeakSeason ? '，且適逢當令大盛產期，鮮甜多汁' : ''}！建議採購 14~30 天安全庫存，或批次加工為 IQF 冷凍備料鎖住成本利潤。`;
    actionTag = '建議增補庫存 +30%~50%';
    actionClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (isRecordHigh || isTop25 || (isOffSeason && price > stats.weightedAvgPrice)) {
    level = 'ceiling_warning';
    badge = '🔴 採購熔斷';
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
    title = '價格高檔·警戒天花板 (啟動冷凍替代)';
    recommendation = `當前單價 $${price}/kg 逼近或突破歷史高檔走廊${isOffSeason ? '，且非當令產季常溫耗損極高' : ''}！強烈建議門市啟動「採購熔斷機制」，暫緩鮮果大宗進貨，改以 IQF 冷凍規格或當令盛產水果替代。`;
    actionTag = '啟動採購熔斷·轉冷凍避險';
    actionClass = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  return {
    fruitId,
    fruitName: fruit.name,
    level,
    badge,
    badgeClass,
    title,
    recommendation,
    actionTag,
    actionClass,
    price,
    minPrice: stats.minPrice,
    maxPrice: stats.maxPrice,
    wac: stats.weightedAvgPrice,
    p25,
    p75,
    isPeakSeason,
    isBottom25,
    isTop25
  };
}

/**
 * Tier 3: 拼盤毛利敏感度壓力測試核心 (Margin Stress-Tester Engine)
 * 模擬單品單價變動時，拼盤生產成本、毛利率滑落幅度與避險處方
 */
function calcMarginStressTest(fruitId, simPrice, customYieldRate) {
  const baseline = calcPlateCosts();
  const cfg = state.costConfig || { packagingCost: 5, laborCost: 0, sellingPrice: 80, targetMargin: 50 };
  const sellingPrice = Math.max(1, Number(cfg.sellingPrice) || 80);
  const fruit = getFruit(fruitId);

  const isItemInPlate = state.plateItems.some((it) => it.fruitId === fruitId);
  let grams = 100;
  let storageType = 'fresh';

  if (isItemInPlate) {
    const item = state.plateItems.find((it) => it.fruitId === fruitId);
    grams = Number(item.grams) || 100;
    storageType = item.storageType || 'fresh';
  }

  const costCfg = getFruitCostConfig(fruitId, storageType);
  const basePrice = Number(costCfg.purchasePrice) || 50;
  const yieldRate = Math.max(1, Math.min(100, Number(customYieldRate || costCfg.yieldRate) || 75));
  const simP = Number(simPrice !== undefined && simPrice !== null ? simPrice : basePrice);

  const effectiveBasePrice = basePrice / (yieldRate / 100);
  const effectiveSimPrice = simP / (yieldRate / 100);

  const baseFruitCost = grams * (effectiveBasePrice / 1000);
  const simFruitCost = grams * (effectiveSimPrice / 1000);
  const fruitCostDiff = simFruitCost - baseFruitCost;

  const simTotalCost = baseline.totalCost + (isItemInPlate ? fruitCostDiff : simFruitCost);
  const simGrossProfit = sellingPrice - simTotalCost;
  const simGrossMarginPct = (simGrossProfit / sellingPrice) * 100;
  const marginPctDrop = baseline.grossMarginPct - simGrossMarginPct;

  let strategy = '';
  if (marginPctDrop > 5) {
    strategy = `⚠️ 毛利率重挫 ${marginPctDrop.toFixed(1)}%！單盒成本墊高 $${fruitCostDiff.toFixed(1)} 元。建議將拼盤中 ${fruit.name} 份量由 ${grams}g 降至 ${Math.max(30, Math.round(grams * 0.6))}g，並增補當季平價鮮果（如珍珠芭樂）以守住 50% 基準毛利。`;
  } else if (marginPctDrop < -2) {
    strategy = `🎉 毛利率逆勢提升 ${Math.abs(marginPctDrop).toFixed(1)}%！進貨成本具顯著競爭優勢，可適度提高每盒果肉滿載度或作為門市促銷主打。`;
  } else {
    strategy = `⚖️ 毛利率變動在 ±2% 安全緩衝區內，現行拼盤售價 $${sellingPrice} 元無需調整，可平穩出貨。`;
  }

  return {
    fruitId,
    fruitName: fruit.name,
    isItemInPlate,
    grams,
    yieldRate,
    basePrice,
    simPrice: simP,
    effectiveSimPrice,
    baseTotalCost: baseline.totalCost,
    simTotalCost,
    baseGrossMarginPct: baseline.grossMarginPct,
    simGrossMarginPct,
    marginPctDrop,
    fruitCostDiff,
    sellingPrice,
    strategy
  };
}

// 暴露計算引擎至 window 便於自動化測試與外部整合
if (typeof window !== 'undefined') {
  window.calcPortfolioExecutiveSummary = calcPortfolioExecutiveSummary;
  window.calcFruitProcurementSignal = calcFruitProcurementSignal;
  window.calcMarginStressTest = calcMarginStressTest;
}

// ==========================================
// Tier 1: 全盤採購戰略雷達看板 HTML (Portfolio Executive Radar View)
// ==========================================


// ==========================================
// 決策執行四大核心看板 (Executive Procurement Analytics 2x2 Grid)
// ==========================================

/**
 * 看板 1: 原料庫存 VS 安全庫存 (帶覆蓋率進度條與斷料預警)
 */
function renderStockVsSafetyStockHtml() {
  const stockItems = [
    { fruitId: 'mango_irwin', name: '愛文芒果', emoji: '🥭', currentKg: 280, safetyKg: 200, coveragePct: 140, leadTimeDays: 3, vendor: '供應商A', status: '充足', statusLevel: 'safe' },
    { fruitId: 'strawberry', name: '草莓', emoji: '🍓', currentKg: 85, safetyKg: 150, coveragePct: 57, leadTimeDays: 3, vendor: '供應商B', status: '⚠️ 不足', statusLevel: 'danger' },
    { fruitId: 'pineapple_jinduan', name: '鳳梨', emoji: '🍍', currentKg: 420, safetyKg: 300, coveragePct: 140, leadTimeDays: 2, vendor: '供應商A', status: '充足', statusLevel: 'safe' },
    { fruitId: 'blueberry', name: '藍莓', emoji: '🫐', currentKg: 40, safetyKg: 80, coveragePct: 50, leadTimeDays: 5, vendor: '供應商C', status: '⚠️ 不足', statusLevel: 'danger' },
    { fruitId: 'cranberry', name: '蔓越莓', emoji: '🍒', currentKg: 95, safetyKg: 100, coveragePct: 95, leadTimeDays: 4, vendor: '供應商B', status: '注意', statusLevel: 'warn' },
    { fruitId: 'apple_fuji', name: '蘋果', emoji: '🍎', currentKg: 380, safetyKg: 250, coveragePct: 152, leadTimeDays: 2, vendor: '供應商A', status: '充足', statusLevel: 'safe' },
    { fruitId: 'guava_pearl', name: '芭樂', emoji: '🍐', currentKg: 55, safetyKg: 120, coveragePct: 46, leadTimeDays: 3, vendor: '供應商D', status: '⚠️ 不足', statusLevel: 'danger' },
    { fruitId: 'avocado', name: '酪梨', emoji: '🥑', currentKg: 145, safetyKg: 100, coveragePct: 145, leadTimeDays: 4, vendor: '供應商C', status: '充足', statusLevel: 'safe' }
  ];

  return `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse min-w-[560px]">
        <thead>
          <tr class="text-slate-400 text-3xs border-b border-slate-100 font-bold select-none">
            <th class="py-2.5 px-3 font-semibold">原料品項</th>
            <th class="py-2.5 px-2 font-semibold text-right">現有庫存</th>
            <th class="py-2.5 px-2 font-semibold text-right">安全庫存</th>
            <th class="py-2.5 px-3 font-semibold w-36">覆蓋率</th>
            <th class="py-2.5 px-2 font-semibold text-center">前置</th>
            <th class="py-2.5 px-2.5 font-semibold">主力供應商</th>
            <th class="py-2.5 px-3 font-semibold text-center">庫存狀態</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100/70 text-slate-700 font-medium">
          ${stockItems.map(item => {
            const barWidth = Math.min(100, (item.coveragePct / 160) * 100);
            let barBg = 'bg-emerald-500';
            let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            let pctColor = 'text-emerald-700 font-bold';

            if (item.statusLevel === 'danger') {
              barBg = 'bg-rose-500';
              badgeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
              pctColor = 'text-rose-700 font-bold';
            } else if (item.statusLevel === 'warn') {
              barBg = 'bg-amber-500';
              badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
              pctColor = 'text-amber-700 font-bold';
            }

            return `
              <tr
                onclick="switchInventoryFruit('${item.fruitId}')"
                class="hover:bg-slate-50/90 transition cursor-pointer group"
                title="點擊切換下方主舞台至 ${item.name}"
              >
                <td class="py-2.5 px-3 font-extrabold text-slate-900 whitespace-nowrap flex items-center space-x-1.5 group-hover:text-sky-600">
                  <span>${item.emoji}</span>
                  <span>${item.name}</span>
                </td>
                <td class="py-2.5 px-2 text-right font-bold text-slate-800 whitespace-nowrap">
                  ${item.currentKg}kg
                </td>
                <td class="py-2.5 px-2 text-right text-slate-500 whitespace-nowrap">
                  ${item.safetyKg}kg
                </td>
                <td class="py-2.5 px-3 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <div class="w-20 bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner flex">
                      <div style="width: ${barWidth}%;" class="h-full ${barBg} rounded-full transition-all duration-300"></div>
                    </div>
                    <span class="text-3xs font-mono ${pctColor} w-10 text-right">${item.coveragePct}%</span>
                  </div>
                </td>
                <td class="py-2.5 px-2 text-center text-3xs text-slate-500 whitespace-nowrap">
                  ${item.leadTimeDays}天
                </td>
                <td class="py-2.5 px-2.5 text-3xs text-slate-600 whitespace-nowrap font-mono">
                  ${item.vendor}
                </td>
                <td class="py-2.5 px-3 text-center whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded-full text-3xs border ${badgeClass}">
                    ${item.status}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * 看板 2: 採購展望 VS 實際到貨 (近3月長條圖)
 */
function renderProcurementForecastVsActualSvg() {
  const months = [
    { label: '1月', forecast: 410, actual: 405 },
    { label: '2月', forecast: 385, actual: 0 },
    { label: '3月', forecast: 435, actual: 0 }
  ];

  const maxVal = 500;
  const chartH = 160;
  const chartW = 380;
  const originX = 45;
  const originY = 190;

  const gridTicks = [0, 100, 200, 300, 400];
  const gridLines = gridTicks.map(val => {
    const y = originY - (val / maxVal) * chartH;
    return `
      <line x1="${originX}" y1="${y}" x2="${originX + chartW}" y2="${y}" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3,3" />
      <text x="${originX - 8}" y="${y + 4}" font-size="10" fill="#94a3b8" text-anchor="end" font-family="sans-serif">${val}</text>
    `;
  }).join('');

  const colWidth = chartW / months.length;
  const barWidth = 30;

  const bars = months.map((m, idx) => {
    const cx = originX + idx * colWidth + colWidth / 2;
    const fH = (m.forecast / maxVal) * chartH;
    const fY = originY - fH;
    const fX = cx - barWidth - 2;

    const aH = (m.actual / maxVal) * chartH;
    const aY = originY - aH;
    const aX = cx + 2;

    return `
      <!-- Forecast Bar -->
      <rect x="${fX}" y="${fY}" width="${barWidth}" height="${fH}" rx="4" fill="#3b82f6" fill-opacity="0.9">
        <title>${m.label} 採購展望: ${m.forecast} kg</title>
      </rect>
      <text x="${fX + barWidth / 2}" y="${fY - 5}" font-size="9" fill="#2563eb" font-weight="bold" text-anchor="middle" font-family="sans-serif">${m.forecast}</text>

      <!-- Actual Bar -->
      ${m.actual > 0 ? `
        <rect x="${aX}" y="${aY}" width="${barWidth}" height="${aH}" rx="4" fill="#10b981" fill-opacity="0.95">
          <title>${m.label} 實際到貨: ${m.actual} kg</title>
        </rect>
        <text x="${aX + barWidth / 2}" y="${aY - 5}" font-size="9" fill="#059669" font-weight="bold" text-anchor="middle" font-family="sans-serif">${m.actual}</text>
      ` : `
        <rect x="${aX}" y="${originY - 2}" width="${barWidth}" height="2" fill="#cbd5e1" rx="1">
          <title>${m.label} 尚未到貨 / 在途中</title>
        </rect>
      `}

      <!-- X-axis Month Label -->
      <text x="${cx}" y="${originY + 18}" font-size="11" fill="#64748b" font-weight="bold" text-anchor="middle" font-family="sans-serif">${m.label}</text>
    `;
  }).join('');

  return `
    <svg viewBox="0 0 450 220" class="w-full h-auto select-none" xmlns="http://www.w3.org/2000/svg">
      <line x1="${originX}" y1="${originY}" x2="${originX + chartW}" y2="${originY}" stroke="#cbd5e1" stroke-width="1.5" />
      <line x1="${originX}" y1="${originY - chartH - 10}" x2="${originX}" y2="${originY}" stroke="#cbd5e1" stroke-width="1.5" />
      ${gridLines}
      ${bars}
    </svg>
  `;
}

/**
 * 看板 3: 供應商交期達成率評級 (Scorecard 記分卡)
 */
function renderVendorDeliveryScorecardHtml() {
  const vendors = [
    { name: '供應商A (產銷班特選)', orders: 12, onTime: 12, rate: '100.0%', delay: '—', tier: 'A', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { name: '供應商B (進口貿易商)', orders: 9, onTime: 6, rate: '66.7%', delay: '2.3天', tier: 'D', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' },
    { name: '供應商C (行口大盤商)', orders: 7, onTime: 6, rate: '85.7%', delay: '0.8天', tier: 'B', badgeClass: 'bg-sky-100 text-sky-800 border-sky-300' },
    { name: '供應商D (冷凍食品廠)', orders: 5, onTime: 4, rate: '80.0%', delay: '1.2天', tier: 'B', badgeClass: 'bg-sky-100 text-sky-800 border-sky-300' }
  ];

  return `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse min-w-[480px]">
        <thead>
          <tr class="text-slate-400 text-3xs border-b border-slate-100 font-bold select-none">
            <th class="py-2.5 px-3 font-semibold">供應商名稱</th>
            <th class="py-2.5 px-2.5 font-semibold text-center">採購訂單數</th>
            <th class="py-2.5 px-2.5 font-semibold text-center">準時到貨</th>
            <th class="py-2.5 px-3 font-semibold text-center">交期達成率</th>
            <th class="py-2.5 px-2.5 font-semibold text-center">平均延遲</th>
            <th class="py-2.5 px-3 font-semibold text-center">績效評級</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100/70 text-slate-700 font-medium">
          ${vendors.map(v => `
            <tr class="hover:bg-slate-50/80 transition">
              <td class="py-3 px-3 font-extrabold text-slate-800 whitespace-nowrap">
                ${v.name}
              </td>
              <td class="py-3 px-2.5 text-center font-bold text-slate-700 whitespace-nowrap">
                ${v.orders}
              </td>
              <td class="py-3 px-2.5 text-center font-bold text-slate-700 whitespace-nowrap">
                ${v.onTime}
              </td>
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <span class="font-extrabold ${v.tier === 'A' ? 'text-emerald-700' : v.tier === 'D' ? 'text-rose-700' : 'text-sky-700'}">
                  ${v.rate}
                </span>
              </td>
              <td class="py-3 px-2.5 text-center text-3xs font-semibold whitespace-nowrap ${v.delay !== '—' ? 'text-amber-700' : 'text-slate-400'}">
                ${v.delay}
              </td>
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <span class="w-6 h-6 inline-flex items-center justify-center rounded-lg text-xs font-black border ${v.badgeClass}">
                  ${v.tier}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * 看板 4: 原料成本走勢 (多品項月均價橫向折線圖)
 */
function renderMultiFruitMonthlyCostTrendSvg() {
  const months = ['10月', '11月', '12月', '1月', '2月', '3月'];
  const minVal = 30;
  const maxVal = 150;
  const chartH = 155;
  const chartW = 380;
  const originX = 45;
  const originY = 185;

  const gridTicks = [40, 60, 80, 100, 120, 140];
  const gridLines = gridTicks.map(val => {
    const y = originY - ((val - minVal) / (maxVal - minVal)) * chartH;
    return `
      <line x1="${originX}" y1="${y}" x2="${originX + chartW}" y2="${y}" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3,3" />
      <text x="${originX - 8}" y="${y + 4}" font-size="10" fill="#94a3b8" text-anchor="end" font-family="sans-serif">${val}</text>
    `;
  }).join('');

  const xStep = chartW / (months.length - 1);
  const xLabels = months.map((m, idx) => {
    const x = originX + idx * xStep;
    return `<text x="${x}" y="${originY + 18}" font-size="10" fill="#64748b" font-weight="bold" text-anchor="middle" font-family="sans-serif">${m}</text>`;
  }).join('');

  const series = [
    {
      name: '愛文芒果',
      color: '#f59e0b',
      data: [85, 88, 92, 89, 91, 94]
    },
    {
      name: '草莓',
      color: '#f43f5e',
      data: [120, 115, 118, 122, 128, 136]
    },
    {
      name: '鳳梨',
      color: '#10b981',
      data: [42, 44, 43, 45, 44, 46]
    }
  ];

  const seriesSvg = series.map(s => {
    const points = s.data.map((val, idx) => {
      const x = originX + idx * xStep;
      const y = originY - ((val - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, val };
    });

    const d = points.map((pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`)).join(' ');

    const dots = points.map(pt => `
      <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="#ffffff" stroke="${s.color}" stroke-width="2.5">
        <title>${s.name}: $${pt.val}/kg</title>
      </circle>
    `).join('');

    return `
      <path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${dots}
    `;
  }).join('');

  return `
    <svg viewBox="0 0 450 220" class="w-full h-auto select-none" xmlns="http://www.w3.org/2000/svg">
      <line x1="${originX}" y1="${originY}" x2="${originX + chartW}" y2="${originY}" stroke="#cbd5e1" stroke-width="1.5" />
      <line x1="${originX}" y1="${originY - chartH - 10}" x2="${originX}" y2="${originY}" stroke="#cbd5e1" stroke-width="1.5" />
      <text x="${originX - 10}" y="${originY - chartH - 12}" font-size="9" fill="#94a3b8" text-anchor="end" font-family="sans-serif">NT$/kg</text>
      ${gridLines}
      ${xLabels}
      ${seriesSvg}
    </svg>
  `;
}

/**
 * 2x2 四大核心戰略看板組合器
 */
function renderExecutiveProcurementAnalyticsGridHtml() {
  return `
    <div class="space-y-3 pt-1">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center space-x-2">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200/60">
            全盤採購分析總覽
          </span>
          <span class="text-xs text-slate-500 font-medium">
            庫存預警 · 採購展望 · 供應商績效 · 成本走勢
          </span>
        </div>
        <span class="text-3xs text-slate-400">💡 點選任一原料列可即時切換下方單品分析舞台</span>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <!-- 左上: 🧪 原料庫存 VS 安全庫存 -->
        <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/70 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
              <span>🧪 原料庫存 VS 安全庫存</span>
              <span class="text-3xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">3項不足預警</span>
            </h3>
            <span class="text-3xs text-slate-400 font-mono">覆蓋率 = 現有 ÷ 安全</span>
          </div>
          ${renderStockVsSafetyStockHtml()}
        </div>

        <!-- 右上: 🚚 採購展望 VS 實際到貨 (近3月) -->
        <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/70 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
              <span>🚚 採購展望 VS 實際到貨 (近3月)</span>
            </h3>
            <div class="flex items-center space-x-3 text-3xs font-medium">
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-3 rounded-xs bg-blue-500 inline-block"></span>
                <span class="text-slate-600">採購展望</span>
              </span>
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
                <span class="text-slate-600">實際到貨</span>
              </span>
            </div>
          </div>
          <div class="py-2 flex items-center justify-center">
            ${renderProcurementForecastVsActualSvg()}
          </div>
        </div>

        <!-- 左下: 🏭 供應商交期達成率 -->
        <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/70 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
              <span>🏭 供應商交期達成率</span>
            </h3>
            <span class="text-3xs text-slate-400">平均達成率 84.8% · 延遲 1.1天</span>
          </div>
          ${renderVendorDeliveryScorecardHtml()}
        </div>

        <!-- 右下: 📈 原料成本走勢 (月均價) -->
        <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/70 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
              <span>📈 原料成本走勢 (月均價)</span>
            </h3>
            <div class="flex items-center space-x-3 text-3xs font-medium">
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-1 bg-amber-500 inline-block rounded-full"></span>
                <span class="text-slate-600">愛文芒果</span>
              </span>
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-1 bg-rose-500 inline-block rounded-full"></span>
                <span class="text-slate-600">草莓</span>
              </span>
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-1 bg-emerald-500 inline-block rounded-full"></span>
                <span class="text-slate-600">鳳梨</span>
              </span>
            </div>
          </div>
          <div class="py-2 flex items-center justify-center">
            ${renderMultiFruitMonthlyCostTrendSvg()}
          </div>
        </div>
      </div>
    </div>
  `;
}


function renderPortfolioExecutiveRadarHtml(summary) {
  return `
    <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-5">
      <!-- 頂部資訊列 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">📡</span>
          <div>
            <div class="flex items-center space-x-2 flex-wrap gap-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200/60">
                Tier 1 · 全盤採購戰略雷達
              </span>
              <span class="text-3xs text-slate-400 font-mono">
                收錄 ${summary.batchCount} 筆入庫批次 · 監控 ${state.fruits.length} 項水果原料
              </span>
            </div>
            <h3 class="text-lg font-black text-slate-800 mt-1">
              企業級採購與庫存資產總覽看板 (Procurement Executive Radar)
            </h3>
          </div>
        </div>
        <div class="text-2xs text-slate-400 flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>實時連動 WAC 移動加權平均成本引擎</span>
        </div>
      </div>

      <!-- 4 大高階戰略 KPI 卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- KPI 1: 在席庫存總資產估值 -->
        <div class="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2">
          <div class="flex items-center justify-between text-2xs text-slate-400 font-bold uppercase">
            <span>💎 在席庫存總資產估值</span>
            <span class="text-3xs text-sky-600 font-mono">毛重 ${Math.round(summary.totalGrossKg).toLocaleString()} kg</span>
          </div>
          <div class="text-2xl font-black text-slate-900">
            $ ${Math.round(summary.totalValuation).toLocaleString()}
            <span class="text-2xs font-normal text-slate-400">元</span>
          </div>
          <!-- 鮮凍資本分佈雙色進度條 -->
          <div class="space-y-1 pt-1">
            <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
              <div style="width: ${summary.freshPct}%;" class="h-full bg-emerald-500" title="常溫鮮果: ${summary.freshPct.toFixed(1)}%"></div>
              <div style="width: ${summary.frozenPct}%;" class="h-full bg-sky-500" title="IQF冷凍: ${summary.frozenPct.toFixed(1)}%"></div>
            </div>
            <div class="flex items-center justify-between text-3xs text-slate-500">
              <span class="text-emerald-700 font-semibold">🌱 鮮果 ${summary.freshPct.toFixed(0)}% ($${Math.round(summary.freshValuation).toLocaleString()})</span>
              <span class="text-sky-700 font-semibold">❄️ 冷凍 ${summary.frozenPct.toFixed(0)}% ($${Math.round(summary.frozenValuation).toLocaleString()})</span>
            </div>
          </div>
        </div>

        <!-- KPI 2: 平均存貨週轉天數 (DOH) -->
        <div class="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2">
          <div class="flex items-center justify-between text-2xs text-slate-400 font-bold uppercase">
            <span>⏱️ 預估存貨週轉天數 (DOH)</span>
            <span class="text-3xs bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">健康良性</span>
          </div>
          <div class="text-2xl font-black text-emerald-700">
            ${summary.avgTurnoverDays}
            <span class="text-2xs font-normal text-slate-400">天 (安全水位)</span>
          </div>
          <div class="text-3xs text-slate-500 leading-relaxed">
            可供門市生產出貨約 <strong>${summary.avgTurnoverDays}</strong> 天，鮮果週轉健康，IQF 備料充裕無斷料風險。
          </div>
        </div>

        <!-- KPI 3: 暴漲警戒品項雷達 -->
        <div class="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2">
          <div class="flex items-center justify-between text-2xs text-slate-400 font-bold uppercase">
            <span>🚨 極端高波動 / 暴漲警戒</span>
            <span class="text-3xs bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded border border-rose-200">${summary.surgeAlertCount} 品項</span>
          </div>
          <div class="text-2xl font-black text-rose-600">
            ${summary.surgeAlertCount}
            <span class="text-2xs font-normal text-slate-400">款水果警示</span>
          </div>
          <!-- 點擊快速切換水果膠囊 -->
          <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            ${
              summary.surgeAlertFruits.length > 0
                ? summary.surgeAlertFruits
                    .slice(0, 3)
                    .map(
                      (sf) => `
                  <button
                    onclick="switchInventoryFruit('${sf.fruitId}')"
                    class="px-2 py-0.5 rounded-md text-3xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition whitespace-nowrap active:scale-95"
                    title="點擊切換分析 ${sf.name} (波幅 ${sf.volatilityPct.toFixed(0)}%)"
                  >
                    ${sf.emoji} ${sf.name} ⚠️
                  </button>
                `
                    )
                    .join('')
                : '<span class="text-3xs text-slate-400">全品項目前行情平穩</span>'
            }
          </div>
        </div>

        <!-- KPI 4: 採購節省效益累計 -->
        <div class="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2">
          <div class="flex items-center justify-between text-2xs text-slate-400 font-bold uppercase">
            <span>💰 採購節省效益累計</span>
            <span class="text-3xs bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">波段貢獻</span>
          </div>
          <div class="text-2xl font-black text-amber-700">
            $ ${Math.round(summary.savingsContribution).toLocaleString()}
            <span class="text-2xs font-normal text-slate-400">元</span>
          </div>
          <div class="text-3xs text-slate-500 leading-relaxed">
            對比歷史高檔天花板，採購波段進補與比價避坑為公司創造之累計成本節約貢獻。
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSingleFruitDecisionStageHtml(fruit, stats, comp, signal, batches, selectedPointBatch, timeRange, storageFilter) {
  // 鮮凍效益快速對決
  const freshCfg = getFruitCostConfig(fruit.id, 'fresh');
  const frozenCfg = getFruitCostConfig(fruit.id, 'frozen');
  const freshEff = freshCfg.purchasePrice / (Math.max(1, freshCfg.yieldRate) / 100);
  const frozenEff = frozenCfg.purchasePrice / (Math.max(1, frozenCfg.yieldRate) / 100);
  const effSavings = Math.abs(freshEff - frozenEff);
  const isFreshCheaper = freshEff < frozenEff;

  return `
    <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-5">
      <!-- 頂部採購時機信號燈橫幅 (Procurement Action Signal Banner) -->
      <div class="bg-gradient-to-r ${
        signal.level === 'strong_buy'
          ? 'from-emerald-50 via-teal-50/50 to-slate-50 border-emerald-200/80'
          : signal.level === 'ceiling_warning'
          ? 'from-rose-50 via-pink-50/50 to-slate-50 border-rose-200/80'
          : 'from-amber-50 via-orange-50/40 to-slate-50 border-amber-200/80'
      } p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-start sm:items-center space-x-3.5">
          <span class="text-3xl sm:text-4xl p-2 bg-white rounded-2xl shadow-xs">${fruit.emoji}</span>
          <div class="space-y-1">
            <div class="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 class="text-lg sm:text-xl font-black text-slate-800">
                ${fruit.name} · 單品採購主舞台
              </h3>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${signal.badgeClass}">
                ${signal.badge}
              </span>
              <span class="px-2 py-0.5 rounded-md text-3xs font-bold border ${signal.actionClass}">
                ${signal.actionTag}
              </span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed max-w-2xl">
              ${signal.recommendation}
            </p>
          </div>
        </div>

        <!-- 鮮凍效益對照膠囊 -->
        <div class="shrink-0 bg-white/90 p-3 rounded-xl border border-slate-200/70 text-right shadow-2xs">
          <div class="text-3xs text-slate-400 font-medium">鮮凍原料淨價對決</div>
          <div class="text-xs font-black ${isFreshCheaper ? 'text-emerald-700' : 'text-sky-700'} mt-0.5">
            ${isFreshCheaper ? `🌱 買鮮果每公斤肉省 $${effSavings.toFixed(1)}` : `❄️ 轉冷凍規格每公斤肉省 $${effSavings.toFixed(1)}`}
          </div>
          <div class="text-3xs text-slate-400 mt-0.5">
            鮮 $${freshEff.toFixed(1)}/kg 肉 vs 凍 $${frozenEff.toFixed(1)}/kg 肉
          </div>
        </div>
      </div>

      <!-- 4 大核心單品關鍵數據統計卡片 (KPI Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderInventoryKPIsHtml(fruit, stats)}
      </div>

      <!-- 價格水位晴雨計 (Segmented Gauge Meter) -->
      ${renderPriceGaugeMeterHtml(fruit, stats, comp)}

      <!-- 圖表控制項與走勢折線圖 -->
      <div class="space-y-3 pt-2">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 class="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
              <span>${fruit.name} · 歷史進貨價格與實質成本走勢圖</span>
              <span class="text-3xs font-semibold px-2 py-0.5 rounded-md ${
                stats.status === 'high_alert'
                  ? 'bg-rose-100 text-rose-800'
                  : stats.status === 'good_buy'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }">${stats.statusText}</span>
            </h4>
            <p class="text-3xs text-slate-400 mt-0.5">
              深色常態走廊 ($${Math.round(stats.minPrice + (stats.priceSpread * 0.25))} ~ $${Math.round(stats.maxPrice - (stats.priceSpread * 0.25))}) 為健康進貨區間。實線為進貨價，虛線為實質果肉價。
            </p>
          </div>

          <!-- 圖表篩選控制項：時間範圍與保存型態 -->
          <div class="flex items-center space-x-2 flex-wrap gap-y-2 text-xs">
            <div class="flex items-center bg-slate-100 p-1 rounded-xl">
              ${[
                { id: 'all', label: '全部歷史' },
                { id: '1y', label: '近1年' },
                { id: '180d', label: '近半年' },
                { id: '90d', label: '近90天' },
                { id: '30d', label: '近30天' }
              ]
                .map(
                  (r) => `
                <button
                  onclick="setInventoryTimeRange('${r.id}')"
                  class="px-2.5 py-1 rounded-lg text-2xs font-bold transition ${
                    timeRange === r.id
                      ? 'bg-white text-sky-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }"
                >
                  ${r.label}
                </button>
              `
                )
                .join('')}
            </div>

            <div class="flex items-center bg-slate-100 p-1 rounded-xl">
              ${[
                { id: 'all', label: '全型態' },
                { id: 'fresh', label: '🌱 常溫' },
                { id: 'frozen', label: '❄️ 冷凍' }
              ]
                .map(
                  (m) => `
                <button
                  onclick="setInventoryStorageFilter('${m.id}')"
                  class="px-2.5 py-1 rounded-lg text-2xs font-bold transition ${
                    storageFilter === m.id
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }"
                >
                  ${m.label}
                </button>
              `
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- 圖例說明列 -->
        <div class="flex items-center space-x-4 text-2xs text-slate-500 flex-wrap gap-y-1 px-1">
          <span class="flex items-center space-x-1.5 font-medium">
            <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>🌱 常溫鮮果進貨價</span>
          </span>
          <span class="flex items-center space-x-1.5 font-medium">
            <span class="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
            <span>❄️ 冷凍水果進貨價</span>
          </span>
          <span class="flex items-center space-x-1.5 font-medium">
            <span class="w-3 h-1 border-t-2 border-dashed border-amber-600 inline-block"></span>
            <span class="text-amber-700">加權平均成本 (WAC)</span>
          </span>
          <span class="flex items-center space-x-1.5 font-medium">
            <span class="w-3 h-1 border-t-2 border-dotted border-purple-500 inline-block"></span>
            <span class="text-purple-700">實質果肉淨肉成本</span>
          </span>
          <span class="text-slate-400 text-3xs ml-auto hidden sm:inline">
            💡 滑鼠移至節點即時查看批次價格；點擊節點可鎖定詳細批次卡片
          </span>
        </div>

        <!-- SVG 響應式圖表本體 -->
        <div class="bg-slate-50/50 rounded-2xl p-2 sm:p-4 border border-slate-100">
          ${renderPriceFluctuationChartSvg(batches, fruit)}
        </div>

        <!-- 點選節點之批次詳細資訊浮動條 -->
        ${
          selectedPointBatch
            ? `
          <div class="bg-gradient-to-r from-sky-50 via-slate-50 to-emerald-50 p-3.5 rounded-2xl border border-sky-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">${selectedPointBatch.storageType === 'frozen' ? '❄️' : '🌱'}</span>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-extrabold text-slate-900">${selectedPointBatch.date} 進貨批次</span>
                  <span class="text-3xs font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">${selectedPointBatch.batchNo || '無批號'}</span>
                  <span class="text-3xs font-bold px-2 py-0.2 rounded-full ${
                    selectedPointBatch.storageType === 'frozen' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                  }">${selectedPointBatch.storageType === 'frozen' ? '冷凍規格' : '常溫鮮果'}</span>
                </div>
                <div class="text-3xs text-slate-500 mt-0.5">
                  供應商: <strong>${selectedPointBatch.supplier || '未註明'}</strong> · 備註: ${selectedPointBatch.notes || '無'}
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-4 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4 text-right">
              <div>
                <div class="text-3xs text-slate-400">進貨單價</div>
                <div class="text-sm font-extrabold text-slate-800">$${selectedPointBatch.purchasePrice} <span class="text-3xs font-normal">/kg</span></div>
              </div>
              <div>
                <div class="text-3xs text-slate-400">${selectedPointBatch.storageType === 'frozen' ? '出成率' : '取果率'}</div>
                <div class="text-sm font-extrabold text-slate-800">${selectedPointBatch.yieldRate}%</div>
              </div>
              <div>
                <div class="text-3xs text-purple-600">實質淨肉價</div>
                <div class="text-sm font-extrabold text-purple-700">$${Number(selectedPointBatch.effectivePrice || (selectedPointBatch.purchasePrice / (selectedPointBatch.yieldRate / 100))).toFixed(1)} <span class="text-3xs font-normal">/kg</span></div>
              </div>
              <div>
                <div class="text-3xs text-slate-400">進貨量 / 總支出</div>
                <div class="text-xs font-bold text-slate-700">${selectedPointBatch.quantityKg} kg / $${Number(selectedPointBatch.totalAmount || (selectedPointBatch.purchasePrice * selectedPointBatch.quantityKg)).toLocaleString()}</div>
              </div>
            </div>
          </div>
        `
            : ''
        }
      </div>
    </div>
  `;
}

// ==========================================
// Tier 3: 拼盤毛利敏感度壓力測試卡片 HTML (Margin Stress Test Cards View)
// ==========================================

function renderMarginStressTestCardsHtml(fruitId, simPrice, customYieldRate) {
  const stress = calcMarginStressTest(fruitId, simPrice, customYieldRate);
  const isDrop = stress.marginPctDrop > 0;
  const isUp = stress.marginPctDrop < 0;

  return `
    <div class="bg-gradient-to-br from-pink-50/50 via-white to-purple-50/40 rounded-3xl p-6 border border-pink-200/80 shadow-soft space-y-5">
      <!-- 標題與情境快捷按鈕 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-pink-100 pb-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-100/70 px-3 py-0.5 rounded-lg border border-pink-200">
              🎯 拼盤毛利敏感度壓力測試機
            </span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
              拼盤售價 $${stress.sellingPrice} 元/盒 · ${stress.fruitName} 投入 ${stress.grams}g
            </span>
          </div>
          <h4 class="text-base sm:text-lg font-black text-slate-800 mt-1.5 flex items-center space-x-2">
            <span>原料漲跌對綜合拼盤每盒毛利率之衝擊模擬</span>
          </h4>
          <p class="text-xs text-slate-500 mt-0.5">
            即時試算進貨單價異動時，對目前拼盤（${state.plateItems.map((it) => getFruit(it.fruitId).name).join(' + ')}）生產成本與終端毛利之連鎖反應。
          </p>
        </div>

        <!-- 快速情境按鈕組 -->
        <div class="flex items-center space-x-1.5 flex-wrap gap-y-1 text-3xs font-bold">
          <span class="text-slate-400">行情壓力測試：</span>
          <button
            onclick="applyMarginStressDelta(-20)"
            class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition active:scale-95"
            title="產季崩盤大出：單價 -20%"
          >
            📉 產季跌 -20%
          </button>
          <button
            onclick="applyMarginStressDelta(-10)"
            class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition active:scale-95"
            title="小幅折讓：單價 -10%"
          >
            -10%
          </button>
          <button
            onclick="applyMarginStressDelta(0)"
            class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
            title="基準行情"
          >
            ⚖️ 基準
          </button>
          <button
            onclick="applyMarginStressDelta(10)"
            class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition active:scale-95"
            title="微幅上漲：單價 +10%"
          >
            +10%
          </button>
          <button
            onclick="applyMarginStressDelta(20)"
            class="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition active:scale-95"
            title="供應短缺暴漲：單價 +20%"
          >
            🔥 暴漲 +20%
          </button>
          <button
            onclick="applyMarginStressDelta(30)"
            class="px-2.5 py-1 rounded-lg bg-rose-200 hover:bg-rose-300 text-rose-900 border border-rose-400 transition active:scale-95"
            title="颱風天災斷料：單價 +30%"
          >
            ⚡ 極端 +30%
          </button>
        </div>
      </div>

      <!-- 滑桿與單價即時微調列 -->
      <div class="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-extrabold text-slate-700">🎚️ 模擬進貨單價滑桿調整：</span>
          <span id="stress-test-price-display" class="font-black text-base text-pink-600 font-mono">
            $${stress.simPrice} /kg
          </span>
        </div>
        <input
          id="stress-test-slider"
          type="range"
          min="${Math.max(1, Math.round(stress.basePrice * 0.4))}"
          max="${Math.round(stress.basePrice * 2.2)}"
          step="1"
          value="${stress.simPrice}"
          oninput="handleMarginStressSimPriceChange(this.value)"
          class="w-full accent-pink-600 cursor-pointer"
        />
        <div class="flex items-center justify-between text-3xs text-slate-400 font-mono">
          <span>最低估 $${Math.max(1, Math.round(stress.basePrice * 0.4))}</span>
          <span class="text-slate-600 font-bold">基準 $${stress.basePrice}</span>
          <span>最高估 $${Math.round(stress.basePrice * 2.2)}</span>
        </div>
      </div>

      <!-- 4 大核心敏感度試算指標卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <!-- 指標 1: 每盒生產成本變動 -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
          <div class="text-2xs font-bold text-slate-400 uppercase tracking-wider">
            每盒拼盤總成本 (含包材)
          </div>
          <div class="flex items-baseline space-x-1.5">
            <span class="text-2xl font-black ${stress.simTotalCost > stress.baseTotalCost ? 'text-rose-600' : stress.simTotalCost < stress.baseTotalCost ? 'text-emerald-600' : 'text-slate-800'}">
              $ ${stress.simTotalCost.toFixed(1)}
            </span>
            <span class="text-3xs text-slate-400">元/盒</span>
          </div>
          <div class="text-3xs font-semibold ${stress.fruitCostDiff > 0 ? 'text-rose-700' : stress.fruitCostDiff < 0 ? 'text-emerald-700' : 'text-slate-500'}">
            ${stress.fruitCostDiff > 0 ? `▲ 單盒成本墊高 +$${stress.fruitCostDiff.toFixed(1)} 元` : stress.fruitCostDiff < 0 ? `▼ 單盒成本節省 -$${Math.abs(stress.fruitCostDiff).toFixed(1)} 元` : '維持基準成本'}
          </div>
        </div>

        <!-- 指標 2: 拼盤毛利率衝擊 -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
          <div class="text-2xs font-bold text-slate-400 uppercase tracking-wider">
            模擬終端毛利率 (%)
          </div>
          <div class="flex items-baseline space-x-1.5">
            <span class="text-2xl font-black ${stress.simGrossMarginPct < 45 ? 'text-rose-600' : stress.simGrossMarginPct >= 50 ? 'text-emerald-600' : 'text-amber-600'}">
              ${stress.simGrossMarginPct.toFixed(1)}%
            </span>
            <span class="text-3xs text-slate-400">基準 ${stress.baseGrossMarginPct.toFixed(1)}%</span>
          </div>
          <div class="text-3xs font-bold ${isDrop ? 'text-rose-700' : isUp ? 'text-emerald-700' : 'text-slate-500'}">
            ${isDrop ? `🔴 毛利滑落 -${stress.marginPctDrop.toFixed(1)}%` : isUp ? `🟢 毛利增長 +${Math.abs(stress.marginPctDrop).toFixed(1)}%` : '持平於基準毛利'}
          </div>
        </div>

        <!-- 指標 3: 單盒毛利金額 -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
          <div class="text-2xs font-bold text-slate-400 uppercase tracking-wider">
            每盒實質毛利 (元)
          </div>
          <div class="flex items-baseline space-x-1.5">
            <span class="text-2xl font-black text-slate-800">
              $ ${(stress.sellingPrice - stress.simTotalCost).toFixed(1)}
            </span>
            <span class="text-3xs text-slate-400">元/盒</span>
          </div>
          <div class="text-3xs text-slate-500">
            若單日銷售 300 盒，日獲利差額 <strong>${stress.fruitCostDiff > 0 ? `少賺 $${Math.round(stress.fruitCostDiff * 300).toLocaleString()}` : `多賺 $${Math.round(Math.abs(stress.fruitCostDiff) * 300).toLocaleString()}`}</strong> 元
          </div>
        </div>

        <!-- 指標 4: 避險建議 -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
          <div class="text-2xs font-bold text-purple-700 uppercase tracking-wider">
            採購與配方避險建議
          </div>
          <div class="text-3xs font-medium text-slate-700 leading-relaxed">
            ${stress.strategy}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 組合工作台：自購詢價即時比對與拼盤毛利敏感度壓力測試
 */
function renderMarginStressTesterWorkbenchHtml(fruit, stats) {
  const quote = state.inventoryCustomQuote || {};
  const currentFruitId = fruit.id;
  const isSameFruit = quote.fruitId === currentFruitId;
  const p = isSameFruit && quote.purchasePrice ? quote.purchasePrice : stats.latestPrice;
  const y = isSameFruit && quote.yieldRate ? quote.yieldRate : (stats.latestYieldRate || 75);

  return `
    <div id="margin-stress-tester-workbench" class="space-y-6">
      <!-- 上半部：自購詢價即時比對與效益診斷 -->
      ${renderCustomPriceComparatorHtml(fruit, stats)}

      <!-- 下半部：拼盤毛利敏感度壓力測試機 -->
      <div id="margin-stress-test-cards">
        ${renderMarginStressTestCardsHtml(fruit.id, p, y)}
      </div>
    </div>
  `;
}


function getInventoryPageHtml() {
  const selectedFruitId = state.inventorySelectedFruit || 'mango_irwin';
  const fruit = getFruit(selectedFruitId);
  const timeRange = state.inventoryTimeRange || 'all';
  const storageFilter = state.inventoryStorageFilter || 'all';
  const wbTab = state.inventoryWorkbenchTab || (state.inventoryComparatorMode === 'custom_quote' ? 'stress_test' : 'vendor_pk');

  const batches = getFilteredInventoryBatches(selectedFruitId, timeRange, storageFilter);
  const stats = calcFruitPriceStats(selectedFruitId, timeRange, storageFilter);
  const comp = calcVendorQuotesComparison(selectedFruitId);
  const signal = calcFruitProcurementSignal(selectedFruitId, stats.latestPrice);
  const portfolioSummary = calcPortfolioExecutiveSummary();

  // 選取的單點資訊 (若有選取則顯示詳細批次卡片)
  let selectedPointBatch = null;
  if (state.selectedChartPointId) {
    selectedPointBatch = (state.inventoryBatches || []).find((b) => b.id === state.selectedChartPointId);
  }
  if (!selectedPointBatch && batches.length > 0) {
    selectedPointBatch = batches[batches.length - 1]; // 預設顯示最新一筆
  }

  return `
    <div class="space-y-6">
      <!-- 頂部標題列與操作工具列 -->
      <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-5">
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div class="space-y-1.5 flex-1 min-w-0">
            <div class="flex items-center space-x-2 flex-wrap gap-y-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-lg border border-sky-200/60 whitespace-nowrap">
                採購決策指揮艙 · 原料成本時序與時機追蹤
              </span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium whitespace-nowrap">
                收錄 ${state.inventoryBatches.length} 筆歷史入庫紀錄 · 監控 ${state.fruits.length} 款原料
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>📈 水果庫存成本與歷史價格波動庫</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              整合<strong>「全盤庫存資產雷達」</strong>、<strong>「單品產季採購時機信號燈」</strong>、<strong>「拼盤毛利敏感度壓力測試」</strong>與<strong>「多方報價 PK 避坑矩陣」</strong>，協助執行長與採購總監精準掌握最佳進貨波段與毛利護城河！
            </p>
          </div>

          <!-- 右側快速操作按鈕組 -->
          <div class="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2 pt-1 xl:pt-0">
            <button
              onclick="syncPinnedFruitsPricesToInventory()"
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition flex items-center space-x-1.5 active:scale-95"
              title="一鍵查找並登錄所有百科釘選水果（珍珠芭樂、紅心芭樂、富士蘋果(帶皮)等）之最新新鮮與IQF冷凍市價"
            >
              <span>⭐ 登錄釘選品項市價</span>
            </button>
            <button
              onclick="openAddBatchModal('${selectedFruitId}')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition flex items-center space-x-1.5 active:scale-95"
              title="新增一筆今日或歷史水果進貨批次紀錄"
            >
              <span>➕ 新增進貨紀錄</span>
            </button>
            <button
              onclick="exportInventoryBatchesToCSV()"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center space-x-1.5"
              title="匯出完整歷史進貨與庫存批次紀錄為 CSV 試算表"
            >
              <span>📥 匯出歷史 CSV</span>
            </button>
            <button
              onclick="resetInventoryBatchesToDefault()"
              class="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition flex items-center space-x-1"
              title="還原為系統內建的 12 個月示範歷史波動數據"
            >
              <span>🔄 還原範例數據</span>
            </button>
          </div>
        </div>

        <!-- 水果品項快捷切換滾動列 (含釘選優先標示) -->
        <div class="border-t border-slate-100 pt-4">
          <div class="flex items-center justify-between mb-2 flex-wrap gap-1">
            <span class="text-2xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">選擇分析水果品項：</span>
            <span class="text-3xs text-slate-400 hidden sm:inline">點選品項即可即時切換單品行情舞台與專屬走勢折線圖</span>
          </div>
          <div class="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            ${renderInventoryFruitSelectorHtml(selectedFruitId)}
          </div>
        </div>
      </div>

      <!-- 🏛️ Tier 1: 全盤採購戰略雷達 (Executive Portfolio Radar) -->
      ${renderPortfolioExecutiveRadarHtml(portfolioSummary)}

      <!-- ⚡ 決策執行四大核心看板 (2x2 Grid: 庫存預警 · 採購展望 · 供應商績效 · 成本走勢) -->
      ${renderExecutiveProcurementAnalyticsGridHtml()}

      <!-- 🎯 Tier 2: 單品行情主舞台與採購時機指示器 (Decision Stage & Action Signal) -->
      ${renderSingleFruitDecisionStageHtml(fruit, stats, comp, signal, batches, selectedPointBatch, timeRange, storageFilter)}

      <!-- 🛠️ Tier 3: 四大戰略工作台 (Tabbed Workbenches) -->
      <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-5">
        <!-- 工作台頁籤切換列 -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3.5 gap-2">
          <div class="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1 min-w-0 max-w-full">
            <button
              onclick="setInventoryWorkbenchTab('vendor_pk')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                wbTab === 'vendor_pk'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }"
            >
              <span>🏢 供應商多方報價 PK 與「實質果肉避坑」矩陣</span>
            </button>

            <button
              onclick="setInventoryWorkbenchTab('stress_test')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                wbTab === 'stress_test'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }"
            >
              <span>🎯 自購價格即時比對與效益診斷 · 拼盤毛利壓力測試機</span>
            </button>

            <button
              onclick="setInventoryWorkbenchTab('batches')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                wbTab === 'batches'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }"
            >
              <span>📋 在庫批次履歷與先進先出明細 (${batches.length})</span>
            </button>

            <button
              onclick="setInventoryWorkbenchTab('volatility')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                wbTab === 'volatility'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }"
            >
              <span>📊 全品項波動度雷達排行 (${state.fruits.length})</span>
            </button>
          </div>

          <div class="text-3xs text-slate-400 whitespace-nowrap shrink-0">
            ${
              wbTab === 'vendor_pk' ? '同台比對各廠商真實果肉淨價，自動揪出假便宜'
              : wbTab === 'stress_test' ? '輸入自購詢價或暴漲情境，即時模擬拼盤每盒毛利衝擊'
              : wbTab === 'batches' ? '依 FIFO 先進先出原則管理每批入庫批次與鮮度'
              : '35 款原料歷史波幅全面健檢'
            }
          </div>
        </div>

        <!-- 頁籤主體渲染區域 -->
        <div>
          ${
            wbTab === 'vendor_pk'
              ? renderVendorQuotesMatrixHtml(fruit, stats)
              : wbTab === 'stress_test'
              ? renderMarginStressTesterWorkbenchHtml(fruit, stats)
              : wbTab === 'batches'
              ? renderInventoryBatchHistoryTableHtml(batches, fruit)
              : renderAllFruitsVolatilityTableHtml()
          }
        </div>
      </div>
    </div>

    <!-- 新增進貨批次彈窗容器 (Add Batch Modal) -->
    <div id="add-batch-modal-container"></div>
  `;
}

// 渲染水果品項選擇按鈕列
function renderInventoryFruitSelectorHtml(currentId) {
  const favList = state.favorites || [];
  const list = [...state.fruits].sort((a, b) => {
    const aFav = favList.includes(a.id);
    const bFav = favList.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.name.localeCompare(b.name, 'zh-Hant');
  });

  return list
    .map((f) => {
      const isSelected = f.id === currentId;
      const isFav = favList.includes(f.id);
      return `
      <button
        onclick="switchInventoryFruit('${f.id}')"
        class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 shrink-0 ${
          isSelected
            ? 'bg-sky-600 text-white shadow-xs'
            : isFav
            ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }"
      >
        <span>${f.emoji}</span>
        <span>${f.name}</span>
        ${isFav ? '<span class="text-amber-500 font-bold">★</span>' : ''}
      </button>
    `;
    })
    .join('');
}

// 渲染 4 大 KPI 統計卡片
function renderInventoryKPIsHtml(fruit, stats) {
  const isUp = stats.priceDiff > 0;
  const isDown = stats.priceDiff < 0;

  return `
    <!-- KPI 1: 最新進貨單價與期別比較 -->
    <div class="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-2xs font-bold text-slate-400 uppercase tracking-wider">最新進貨單價</span>
        <span class="text-xs px-2 py-0.5 rounded-full font-bold ${
          isUp
            ? 'bg-rose-100 text-rose-700'
            : isDown
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-600'
        }">
          ${isUp ? `▲ +${stats.priceDiffPct.toFixed(1)}%` : isDown ? `▼ ${stats.priceDiffPct.toFixed(1)}%` : '與前期持平'}
        </span>
      </div>
      <div class="flex items-baseline space-x-1">
        <span class="text-2xl sm:text-3xl font-black text-slate-800">$ ${stats.latestPrice}</span>
        <span class="text-2xs font-medium text-slate-400">元/kg</span>
      </div>
      <div class="text-3xs text-slate-500">
        ${stats.prevBatch ? `前期單價 $${stats.prevBatch.purchasePrice}/kg (${stats.priceDiff > 0 ? '漲' : '跌'} $${Math.abs(stats.priceDiff)}/kg)` : '首批進貨紀錄'}
      </div>
    </div>

    <!-- KPI 2: 在庫加權平均成本 (WAC) -->
    <div class="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-2xs font-bold text-amber-700 uppercase tracking-wider">加權平均成本 (WAC)</span>
        <span class="text-3xs bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
          在庫均攤
        </span>
      </div>
      <div class="flex items-baseline space-x-1">
        <span class="text-2xl sm:text-3xl font-black text-amber-900">$ ${stats.weightedAvgPrice.toFixed(1)}</span>
        <span class="text-2xs font-medium text-slate-400">元/kg</span>
      </div>
      <div class="text-3xs text-slate-500">
        累計採購 <strong>${stats.totalQuantityKg} kg</strong> · 總支出 $${stats.totalExpenditure.toLocaleString()} 元
      </div>
    </div>

    <!-- KPI 3: 歷史高低價格區間與波幅 -->
    <div class="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-2xs font-bold text-slate-400 uppercase tracking-wider">歷史價格波幅</span>
        <span class="text-3xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
          振幅 ${stats.volatilityPct.toFixed(1)}%
        </span>
      </div>
      <div class="flex items-baseline space-x-1">
        <span class="text-xl sm:text-2xl font-black text-slate-800">$${stats.minPrice} ~ $${stats.maxPrice}</span>
        <span class="text-2xs font-medium text-slate-400">元/kg</span>
      </div>
      <div class="text-3xs text-slate-500">
        價差 $${stats.priceSpread} 元 · 最低 $${stats.minPrice} / 最高 $${stats.maxPrice}
      </div>
    </div>

    <!-- KPI 4: 最新實質果肉成本 -->
    <div class="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-2xs font-bold text-purple-700 uppercase tracking-wider">最新實質果肉成本</span>
        <span class="text-3xs bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200">
          取果率 ${stats.latestYieldRate}%
        </span>
      </div>
      <div class="flex items-baseline space-x-1">
        <span class="text-2xl sm:text-3xl font-black text-purple-900">$ ${stats.latestEffectivePrice.toFixed(1)}</span>
        <span class="text-2xs font-medium text-slate-400">元/kg</span>
      </div>
      <div class="text-3xs text-slate-500">
        每 100g 淨肉成本 $${((stats.latestEffectivePrice / 1000) * 100).toFixed(1)} 元 (加權均實質 $${stats.weightedAvgEffectivePrice.toFixed(1)}/kg)
      </div>
    </div>
  `;
}

// 渲染單一水果批次歷史表格
function renderInventoryBatchHistoryTableHtml(batches, fruit) {
  if (batches.length === 0) {
    return `
      <div class="py-10 text-center text-slate-400 text-xs">
        暫無批次紀錄，請點擊上方「➕ 新增進貨紀錄」以建立第一筆資料！
      </div>
    `;
  }

  // 依日期由新到舊倒序呈現明細
  const sorted = [...batches].sort((a, b) => new Date(b.date) - new Date(a.date));

  return `
    <div class="overflow-x-auto border border-slate-200/80 rounded-2xl">
      <table class="w-full text-left text-xs border-collapse min-w-[780px]">
        <thead>
          <tr class="bg-slate-100/90 text-slate-600 text-2xs border-b border-slate-200 select-none">
            <th class="py-3 px-3.5 font-bold">進貨日期</th>
            <th class="py-3 px-2 font-bold text-center">保存型態</th>
            <th class="py-3 px-2.5 font-bold">批號</th>
            <th class="py-3 px-2.5 font-bold text-right">進貨單價</th>
            <th class="py-3 px-2 font-bold text-center">取果/出成率</th>
            <th class="py-3 px-2.5 font-bold text-right text-purple-900">實質果肉單價</th>
            <th class="py-3 px-2.5 font-bold text-right">進貨量 (kg)</th>
            <th class="py-3 px-2.5 font-bold text-right">採購總額</th>
            <th class="py-3 px-3 font-bold">供應商 / 產地備註</th>
            <th class="py-3 px-2.5 font-bold text-center">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
          ${sorted
            .map((b) => {
              const isFrozen = b.storageType === 'frozen';
              const effPrice = b.effectivePrice || (b.purchasePrice / (b.yieldRate / 100));
              const totalSpent = b.totalAmount || (b.purchasePrice * b.quantityKg);

              return `
              <tr class="hover:bg-slate-50/80 transition">
                <td class="py-2.5 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                  ${b.date}
                </td>
                <td class="py-2.5 px-2 text-center whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded-md text-3xs font-bold ${
                    isFrozen ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                  }">
                    ${isFrozen ? '❄️ 冷凍' : '🌱 常溫'}
                  </span>
                </td>
                <td class="py-2.5 px-2.5 font-mono text-3xs text-slate-500 whitespace-nowrap">
                  ${b.batchNo || '-'}
                </td>
                <td class="py-2.5 px-2.5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                  $ ${b.purchasePrice} <span class="text-3xs font-normal text-slate-400">/kg</span>
                </td>
                <td class="py-2.5 px-2 text-center font-bold text-slate-700 whitespace-nowrap">
                  ${b.yieldRate}%
                </td>
                <td class="py-2.5 px-2.5 text-right font-extrabold text-purple-900 whitespace-nowrap">
                  $ ${Number(effPrice).toFixed(1)} <span class="text-3xs font-normal text-purple-400">/kg</span>
                </td>
                <td class="py-2.5 px-2.5 text-right font-semibold text-slate-800 whitespace-nowrap">
                  ${b.quantityKg} kg
                </td>
                <td class="py-2.5 px-2.5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                  $ ${Number(totalSpent).toLocaleString()}
                </td>
                <td class="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                  <div>${b.supplier || '無廠商備註'}</div>
                  ${b.notes ? `<div class="text-3xs text-slate-400">${b.notes}</div>` : ''}
                </td>
                <td class="py-2.5 px-2.5 text-center whitespace-nowrap">
                  <button
                    onclick="deleteInventoryBatch('${b.id}')"
                    class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="刪除此筆批次進貨紀錄"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 渲染全品項歷史價格波幅排行總覽表
function renderAllFruitsVolatilityTableHtml() {
  const summaryList = calcAllFruitsVolatilitySummary();

  return `
    <div class="overflow-x-auto border border-slate-200/80 rounded-2xl">
      <table class="w-full text-left text-xs border-collapse min-w-[780px]">
        <thead>
          <tr class="bg-slate-100/90 text-slate-600 text-2xs border-b border-slate-200 select-none">
            <th class="py-3 px-3.5 font-bold">水果品項</th>
            <th class="py-3 px-2.5 font-bold">分類</th>
            <th class="py-3 px-2.5 font-bold text-right">最新進貨價</th>
            <th class="py-3 px-2.5 font-bold text-right text-amber-900">加權平均價 (WAC)</th>
            <th class="py-3 px-2.5 font-bold text-center">歷史區間 (最低 ~ 最高)</th>
            <th class="py-3 px-2.5 font-bold text-right">歷史最大振幅</th>
            <th class="py-3 px-3 font-bold text-center">採購建議與狀態</th>
            <th class="py-3 px-3 font-bold text-center">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
          ${summaryList
            .map((item) => {
              const f = item.fruit;
              return `
              <tr class="hover:bg-amber-50/20 transition group">
                <td class="py-2.5 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <span class="text-xl">${f.emoji}</span>
                    <span>${f.name}</span>
                  </div>
                </td>
                <td class="py-2.5 px-2.5 text-slate-500 whitespace-nowrap">
                  ${f.category}
                </td>
                <td class="py-2.5 px-2.5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                  $ ${item.latestPrice} <span class="text-3xs font-normal text-slate-400">/kg</span>
                </td>
                <td class="py-2.5 px-2.5 text-right font-extrabold text-amber-900 whitespace-nowrap">
                  $ ${item.weightedAvgPrice.toFixed(1)} <span class="text-3xs font-normal text-slate-400">/kg</span>
                </td>
                <td class="py-2.5 px-2.5 text-center font-medium text-slate-600 whitespace-nowrap">
                  $${item.minPrice} ~ $${item.maxPrice} <span class="text-3xs text-slate-400">(差 $${item.priceSpread})</span>
                </td>
                <td class="py-2.5 px-2.5 text-right font-black whitespace-nowrap ${
                  item.volatilityPct >= 50
                    ? 'text-rose-600'
                    : item.volatilityPct >= 25
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }">
                  ${item.volatilityPct.toFixed(1)} %
                </td>
                <td class="py-2.5 px-3 text-center whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-bold ${
                    item.status === 'high_alert'
                      ? 'bg-rose-100 text-rose-800'
                      : item.status === 'good_buy'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }">
                    ${item.statusText}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-center whitespace-nowrap">
                  <button
                    onclick="switchInventoryFruit('${f.id}')"
                    class="px-2.5 py-1 text-2xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition active:scale-95"
                    title="載入 ${f.name} 之歷史折線圖與完整批次紀錄"
                  >
                    📈 查看走勢
                  </button>
                </td>
              </tr>
            `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}



// ==========================================
// 台灣 35 款水果 12 個月產季熱點月曆資料庫 (Fruit Seasonality Database)
// peakMonths: 盛產高峰期 (產量最大、批發價最低、品質甜度最頂峰)
// normalMonths: 常態產期 (穩定供貨中)
// offMonths: 淡季短缺期 (產季尾聲、短缺高價或仰賴進口/冷凍)
// ==========================================

const FRUIT_SEASONALITY_MAP = {
  guava_pearl: {
    peakMonths: [9, 10, 11, 12, 1, 2],
    normalMonths: [3, 4, 5, 8],
    offMonths: [6, 7],
    regions: '高雄燕巢、彰化社頭、台南玉井',
    flavorNotes: '秋冬日夜溫差大，果肉最厚實脆甜、籽少香脆；夏季高溫多雨肉易軟水。',
    peakStrategyReason: '秋冬盛產大出品質冠軍，原果批發單價低，強烈建議買鮮果自切！'
  },
  guava_red: {
    peakMonths: [8, 9, 10, 11],
    normalMonths: [6, 7, 12, 1],
    offMonths: [2, 3, 4, 5],
    regions: '宜蘭員山、彰化社頭',
    flavorNotes: '秋季成熟果肉粉紅艷麗，茄紅素飽滿香氣高雅，口感軟糯香甜。',
    peakStrategyReason: '宜蘭員山產季高峰，直接向產銷班採購鮮果淨肉成本每公斤僅約 $69 元。'
  },
  apple_fuji: {
    peakMonths: [10, 11, 12, 1, 4, 5],
    normalMonths: [2, 3, 6, 7, 8, 9],
    offMonths: [],
    regions: '美西華盛頓、智利、日本青森 (進口)',
    flavorNotes: '秋冬北半球新採抵台脆甜多汁；春夏南半球接力到港，全年供應穩定。',
    peakStrategyReason: '大產季整箱採購進口批發價僅 $85~$92/kg，切丁入沙拉極度平價。'
  },
  apple_green: {
    peakMonths: [8, 9, 10, 11],
    normalMonths: [1, 2, 3, 4, 5, 6, 7, 12],
    offMonths: [],
    regions: '美西華盛頓、智利 (進口)',
    flavorNotes: '青翠酸爽，果肉緊實，富含蘋果酸與膳食纖維，抗褐化能力佳。',
    peakStrategyReason: '秋令新果酸甜比最佳，適合果昔與拼盤解膩提味。'
  },
  banana: {
    peakMonths: [3, 4, 5, 6],
    normalMonths: [1, 2, 7, 8, 9, 10, 11, 12],
    offMonths: [],
    regions: '高雄旗山、屏東南州、南投集集',
    flavorNotes: '春蕉質地最為細緻香甜，Q彈濃郁；夏蕉口感較軟水分較高。',
    peakStrategyReason: '春夏季台灣香蕉量產盛期，進貨批發單價親民，能量補充首選。'
  },
  kiwi_green: {
    peakMonths: [5, 6, 7, 8, 9, 10],
    normalMonths: [1, 2, 3, 4, 11, 12],
    offMonths: [],
    regions: '紐西蘭 Zespri、智利 (進口)',
    flavorNotes: '酸甜適口，奇異果酵素活性極高，夏秋兩季大量空海運抵台。',
    peakStrategyReason: '紐西蘭盛產直航進口，箱裝採購單價最優惠。'
  },
  kiwi_gold: {
    peakMonths: [5, 6, 7, 8, 9, 10],
    normalMonths: [1, 2, 3, 4, 11, 12],
    offMonths: [],
    regions: '紐西蘭 Zespri (進口)',
    flavorNotes: '果肉金黃柔嫩，甜度高酸度低，維生素 C 含量高達 90mg/100g。',
    peakStrategyReason: '盛產期果粒均勻，外皮細毛少，削皮取果率高達 75%。'
  },
  mango_irwin: {
    peakMonths: [5, 6, 7],
    normalMonths: [4, 8],
    offMonths: [1, 2, 3, 9, 10, 11, 12],
    regions: '屏東枋山、台南玉井、台南南化',
    flavorNotes: '端午盛夏大盛產，果香撲鼻甜度破表；9月後鮮果斷產，僅能仰賴溫室或進口。',
    peakStrategyReason: '6~7月大盛產鮮果單價 $120/kg 最低；但 9月~隔年4月 強烈建議轉用 IQF 冷凍芒果丁避險！'
  },
  pineapple: {
    peakMonths: [3, 4, 5, 6],
    normalMonths: [2, 7, 8],
    offMonths: [1, 9, 10, 11, 12],
    regions: '屏東高樹、嘉義民雄、台南關廟',
    flavorNotes: '春末初夏「金鑽鳳梨」甜度巔峰、肉質纖細不咬舌，水分極飽滿。',
    peakStrategyReason: '3~5月產地每公斤批發價僅 $32~$40 元，買鮮果削皮加工效益最佳。'
  },
  papaya: {
    peakMonths: [7, 8, 9, 10, 11],
    normalMonths: [5, 6, 12],
    offMonths: [1, 2, 3, 4],
    regions: '台南大內、屏東新埤、高雄美濃',
    flavorNotes: '夏秋高溫網室紅肉木瓜最紅艷香甜，果肉柔滑無苦澀味。',
    peakStrategyReason: '夏秋大出採購進價低廉，維生素 A 與木瓜酵素豐富，拼盤配色極佳。'
  },
  watermelon_red: {
    peakMonths: [5, 6, 7, 8],
    normalMonths: [4, 9, 10],
    offMonths: [1, 2, 3, 11, 12],
    regions: '花蓮鳳林、台南學甲、雲林西螺',
    flavorNotes: '盛夏消暑極品，沙脆清甜多汁，大西瓜剖開紅肉飽滿。',
    peakStrategyReason: '5~8月全台大產批發單價僅 $20~$35/kg，夏日沙拉盤性價比首選。'
  },
  grape_kyoho: {
    peakMonths: [6, 7, 11, 12, 1],
    normalMonths: [5, 8, 10, 2],
    offMonths: [3, 4, 9],
    regions: '彰化大村、彰化溪湖、苗栗卓蘭',
    flavorNotes: '夏季果香濃，冬果果粉厚、甜度集中，紫黑色澤高雅。',
    peakStrategyReason: '夏果與冬果雙產期皆逢大盛產，剪串清洗即可用，出肉率高達 90%。'
  },
  wax_apple: {
    peakMonths: [12, 1, 2, 3, 4],
    normalMonths: [5, 11],
    offMonths: [6, 7, 8, 9, 10],
    regions: '屏東林邊、屏東佳冬、高雄六龜',
    flavorNotes: '冬春季黑珍珠黑透紅，海風鹽地滋養出極致海綿脆甜，多汁解渴。',
    peakStrategyReason: '冬春送禮與鮮切旺季，免削皮去萼即用，果肉無籽損耗極低。'
  },
  dragonfruit_red: {
    peakMonths: [6, 7, 8, 9, 10],
    normalMonths: [5, 11],
    offMonths: [1, 2, 3, 4, 12],
    regions: '彰化二林、台南新化、屏東萬巒',
    flavorNotes: '夏秋盛產甜度高，紫紅花青素濃厚，果肉細軟，外觀醒目奪人。',
    peakStrategyReason: '6~10月批發價格平穩親民，去皮切丁出肉率達 70%，拼盤視覺亮點。'
  },
  dragonfruit_white: {
    peakMonths: [6, 7, 8, 9, 10],
    normalMonths: [5, 11],
    offMonths: [1, 2, 3, 4, 12],
    regions: '彰化二林、嘉義中埔',
    flavorNotes: '甜度清爽微帶酸，果肉質地微脆Q彈，膳食纖維豐富。',
    peakStrategyReason: '夏秋量產期進貨價略低於紅肉，雙色火龍果搭配高視覺價值。'
  },
  orange_ponkan: {
    peakMonths: [10, 11, 12, 1],
    normalMonths: [2],
    offMonths: [3, 4, 5, 6, 7, 8, 9],
    regions: '台中東勢、嘉義竹崎、台南白河',
    flavorNotes: '秋冬青皮至橙黃椪柑多汁甘甜，酸甜適中，富含維生素 C。',
    peakStrategyReason: '秋冬年節產季量產大崩價，產地直購最划算。'
  },
  orange_sweet: {
    peakMonths: [11, 12, 1, 2],
    normalMonths: [10, 3],
    offMonths: [4, 5, 6, 7, 8, 9],
    regions: '雲林古坑、台南柳營、嘉義竹崎',
    flavorNotes: '冬春季成熟柳丁汁多香醇，果肉金黃細緻。',
    peakStrategyReason: '年終冬季柳丁大出，批發一公斤僅 $30~$45 元，自榨原汁或切片效益高。'
  },
  lemon: {
    peakMonths: [6, 7, 8, 9],
    normalMonths: [5, 10, 11],
    offMonths: [1, 2, 3, 4, 12],
    regions: '屏東九如、屏東里港、高雄旗山',
    flavorNotes: '夏季綠皮檸檬香氣最濃烈，出汁率高，富含檸檬酸。',
    peakStrategyReason: '夏季檸檬盛產最平價；冬春產量稀少價格翻倍時，建議切換為冷凍純檸檬汁。'
  },
  strawberry: {
    peakMonths: [12, 1, 2, 3],
    normalMonths: [4],
    offMonths: [5, 6, 7, 8, 9, 10, 11],
    regions: '苗栗大湖、新竹關西',
    flavorNotes: '冬春大湖草莓香甜欲滴，二三期花甜度最高；4月後完全斷產。',
    peakStrategyReason: '1~3月大盛產時鮮果賣相極佳；5~11月夏季完全斷產，必須全面採用 IQF 冷凍草莓！'
  },
  blueberry: {
    peakMonths: [5, 6, 7, 8],
    normalMonths: [3, 4, 9, 10],
    offMonths: [1, 2, 11, 12],
    regions: '美西華盛頓、奧勒岡、智利 (進口)',
    flavorNotes: '藍紫色花青素之王，微酸微甜，表皮天然白霜完整。',
    peakStrategyReason: '新鮮空運藍莓每公斤常高達 $450；商業烘焙或常態拼盤改用 IQF 冷凍藍莓 ($260/kg) 可省 42% 成本。'
  },
  avocado: {
    peakMonths: [7, 8, 9, 10],
    normalMonths: [6, 11],
    offMonths: [1, 2, 3, 4, 5, 12],
    regions: '台南麻豆、台南大內、嘉義竹崎',
    flavorNotes: '台灣在地大果綠皮與紅皮酪梨，植物性優質油脂綿密如奶油。',
    peakStrategyReason: '夏秋在地酪梨盛產價格平實，去皮去核打果昔或切塊沙拉頂級享受。'
  },
  cherry: {
    peakMonths: [5, 6, 7, 12, 1],
    normalMonths: [4, 8, 2],
    offMonths: [3, 9, 10, 11],
    regions: '美西西北櫻桃、智利 (進口)',
    flavorNotes: '深紅黑櫻桃脆硬多汁，甜度高達 18 度以上，頂級水果代表。',
    peakStrategyReason: '美西與南半球空運盛產期單價最低，高檔水果禮盒主打品項。'
  },
  lychee: {
    peakMonths: [5, 6],
    normalMonths: [],
    offMonths: [1, 2, 3, 4, 7, 8, 9, 10, 11, 12],
    regions: '高雄大樹、屏東恆春、南投草屯',
    flavorNotes: '玉荷包產期極短（僅 3~4 週），皮薄核小肉厚汁多，晶瑩剔透。',
    peakStrategyReason: '產季極短爆發性銷售；產季過後市面無鮮果，僅能使用冷凍去殼荔枝肉。'
  },
  longan: {
    peakMonths: [8, 9],
    normalMonths: [7],
    offMonths: [1, 2, 3, 4, 5, 6, 10, 11, 12],
    regions: '台南東山、高雄田寮、南投中寮',
    flavorNotes: '初秋盛產果肉厚實清脆，濃郁蜜香，傳統節慶與滋補聖品。',
    peakStrategyReason: '8~9月產季大出價格最平穩，可鮮食或烘焙製成龍眼乾。'
  },
  passion_fruit: {
    peakMonths: [7, 8, 9, 10],
    normalMonths: [6, 11],
    offMonths: [1, 2, 3, 4, 5, 12],
    regions: '南投埔里大坪頂、台東卑南',
    flavorNotes: '「果汁之王」香氣極致濃郁，黃澄澄果肉酸甜提味爆發力十足。',
    peakStrategyReason: '夏秋盛產批發每公斤僅 $78~$95；冬春尾季高達 $135 時，切換為冷凍純原汁效益極大！'
  },
  passion_fruit_juice: {
    peakMonths: [7, 8, 9, 10],
    normalMonths: [6, 11],
    offMonths: [1, 2, 3, 4, 5, 12],
    regions: '南投埔里冷鏈加工部',
    flavorNotes: '100% 無加水鮮榨純原汁，拆袋即用免人工剖果挖肉。',
    peakStrategyReason: '全年穩定供貨，冬春鮮果昂貴時強烈推薦直接使用冷凍原汁避險。'
  },
  persimmon_sweet: {
    peakMonths: [10, 11, 12],
    normalMonths: [9],
    offMonths: [1, 2, 3, 4, 5, 6, 7, 8],
    regions: '台中和平摩天嶺、苗栗泰安、嘉義阿里山',
    flavorNotes: '高海拔甜柿脆甜無澀味，橙紅喜氣，入秋最具代表性高級果品。',
    peakStrategyReason: '秋冬高山採收大出，出肉率高達 85%，秋季限定拼盤主打。'
  },
  peach: {
    peakMonths: [5, 6, 7],
    normalMonths: [8],
    offMonths: [1, 2, 3, 4, 9, 10, 11, 12],
    regions: '台中和平梨山、桃園復興拉拉山',
    flavorNotes: '高山水蜜桃香氣四溢、柔嫩多汁入口即化，夏日頂級盛宴。',
    peakStrategyReason: '初夏產地直送最香甜；夏末後建議使用冷凍白桃丁或果泥。'
  },
  pear_asian: {
    peakMonths: [7, 8, 9, 12, 1],
    normalMonths: [6, 10, 11],
    offMonths: [2, 3, 4, 5],
    regions: '苗栗卓蘭、台中東勢、宜蘭三星',
    flavorNotes: '高接梨細緻清脆、水份豐沛，潤喉生津，秋節送禮熱門果品。',
    peakStrategyReason: '夏秋水梨盛產產地進貨成本平實，耐冷藏貯存損耗少。'
  },
  cantaloupe: {
    peakMonths: [11, 12, 1, 4, 5],
    normalMonths: [2, 3, 6],
    offMonths: [7, 8, 9, 10],
    regions: '台南後壁、宜蘭壯圍、雲林崙背',
    flavorNotes: '網紋洋香瓜香氣清甜優雅，綠肉或橘肉多汁甜美。',
    peakStrategyReason: '冬春溫室網紋甜瓜甜度最頂峰，外觀高級，沙拉拼盤增值利器。'
  },
  jujube_taiwan: {
    peakMonths: [12, 1, 2, 3],
    normalMonths: [],
    offMonths: [4, 5, 6, 7, 8, 9, 10, 11],
    regions: '高雄燕巢、台南玉井、屏東高樹',
    flavorNotes: '「台灣青蘋果」清脆多汁、皮薄無渣，春節送禮吉祥果物。',
    peakStrategyReason: '春節年節前後大盛產，去核切塊不變色，抗氧化表現優異。'
  },
  grapefruit_red: {
    peakMonths: [10, 11, 12],
    normalMonths: [9, 1],
    offMonths: [2, 3, 4, 5, 6, 7, 8],
    regions: '嘉義番路、雲林斗六',
    flavorNotes: '紅肉葡萄柚果粒飽滿微苦帶甘甜，富含柚皮苷與茄紅素。',
    peakStrategyReason: '秋冬成熟期汁多肉紅，搭配柑橘類拼盤配色吸睛。'
  },
  mulberry: {
    peakMonths: [4, 5],
    normalMonths: [],
    offMonths: [1, 2, 3, 6, 7, 8, 9, 10, 11, 12],
    regions: '嘉義義竹、彰化大村',
    flavorNotes: '春末限定黑紫桑葚，酸甜濃郁，花青素與鐵質極度豐富。',
    peakStrategyReason: '產季僅短短一個多月，產季買鮮果熬汁切丁，過季必用冷凍桑葚全果。'
  },
  cranberry: {
    peakMonths: [9, 10, 11],
    normalMonths: [12, 1],
    offMonths: [2, 3, 4, 5, 6, 7, 8],
    regions: '北美大西洋產區 (進口冷鏈)',
    flavorNotes: '「北美紅寶石」極致酸爽，富含前花青素，女性健康聖品。',
    peakStrategyReason: '幾乎 100% 仰賴 IQF 冷凍進口，全年價格持平穩定。'
  },
  sugar_apple: {
    peakMonths: [8, 9, 12, 1, 2],
    normalMonths: [7, 10, 11],
    offMonths: [3, 4, 5, 6],
    regions: '台東卑南、台東太麻里',
    flavorNotes: '大目釋迦細緻乳白甜蜜，鳳梨釋迦Q彈帶微酸，甜度破 22 度。',
    peakStrategyReason: '夏秋與冬季兩波大產，台東產地直運最香濃，果肉豐滿。'
  }
};

if (typeof window !== 'undefined') {
  window.FRUIT_SEASONALITY_MAP = FRUIT_SEASONALITY_MAP;
}

// 取得特定月份之採購指南推薦
function getMonthlyProcurementGuide(monthNum) {
  const m = Number(monthNum) || 9;
  const inSeasonBuys = [];
  const switchFrozenAdvice = [];

  (state.fruits || []).forEach((fruit) => {
    const sInfo = FRUIT_SEASONALITY_MAP[fruit.id];
    if (!sInfo) return;

    const isPeak = sInfo.peakMonths.includes(m);
    const isNormal = sInfo.normalMonths.includes(m);
    const isOff = sInfo.offMonths.includes(m);

    const freshCfg = getFruitCostConfig(fruit.id, 'fresh');
    const frozenCfg = getFruitCostConfig(fruit.id, 'frozen');
    const freshEff = freshCfg.purchasePrice / (freshCfg.yieldRate / 100);
    const frozenEff = frozenCfg.purchasePrice / (frozenCfg.yieldRate / 100);
    const diff = freshEff - frozenEff; // 鮮果實質 - 冷凍實質

    if (isPeak) {
      inSeasonBuys.push({
        fruit,
        seasonInfo: sInfo,
        freshPrice: freshCfg.purchasePrice,
        yieldRate: freshCfg.yieldRate,
        effectivePrice: freshEff,
        savingsVsFrozen: -diff, // 正值代表買鮮果自切比冷凍省
        notes: sInfo.peakStrategyReason
      });
    } else if (isOff) {
      // 若處於淡季，或鮮果比冷凍貴，建議轉冷凍
      switchFrozenAdvice.push({
        fruit,
        seasonInfo: sInfo,
        frozenPrice: frozenCfg.purchasePrice,
        frozenEffective: frozenEff,
        freshPrice: freshCfg.purchasePrice,
        freshEffective: freshEff,
        diff: diff, // 正值代表鮮果比冷凍貴多少
        notes: `非產季鮮果量少價昂且易損耗，強烈建議直接採購 IQF 冷凍規格避險。`
      });
    }
  });

  // 排序：盛產依性價比，轉冷凍依價差排序
  inSeasonBuys.sort((a, b) => a.effectivePrice - b.effectivePrice);
  switchFrozenAdvice.sort((a, b) => b.diff - a.diff);

  return {
    month: m,
    inSeasonBuys,
    switchFrozenAdvice
  };
}

if (typeof window !== 'undefined') {
  window.getMonthlyProcurementGuide = getMonthlyProcurementGuide;
}



// ==========================================
// 產季月曆與採購指南頁面 HTML (Seasonality Calendar & Buyer's Guide Page)
// ==========================================

function getSeasonalityPageHtml() {
  const currentMonth = state.seasonSelectedMonth || 9;
  const guide = getMonthlyProcurementGuide(currentMonth);
  const catFilter = state.seasonCategoryFilter || '全部';
  const searchTerm = (state.seasonSearchTerm || '').trim().toLowerCase();

  // 篩選全品項甘特熱點圖資料
  const filteredFruits = (state.fruits || []).filter((f) => {
    const matchCat = catFilter === '全部' || f.category === catFilter;
    const matchSearch =
      !searchTerm ||
      f.name.toLowerCase().includes(searchTerm) ||
      (f.english_name && f.english_name.toLowerCase().includes(searchTerm)) ||
      (f.category && f.category.toLowerCase().includes(searchTerm));
    return matchCat && matchSearch;
  });

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return `
    <div class="space-y-6">
      <!-- 頂部標題與月份選擇器 -->
      <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2 flex-wrap gap-y-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/60">
                產地季節時令與採購策略
              </span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                收錄 35 款台灣主要水果全年度產期熱點
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-800 mt-2 flex items-center space-x-2">
              <span>🗓️ 台灣水果產季月曆與採購決策指南</span>
            </h2>
            <p class="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              掌握大盛產低價採購良機，避開產季尾聲斷產風險！直觀掌握各月「<strong>當令盛產高CP值品項</strong>」與「<strong>淡季建議轉用冷凍果丁清單</strong>」。
            </p>
          </div>

          <div class="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
            <button
              onclick="openBackupModal()"
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition flex items-center space-x-1.5 active:scale-95"
              title="備份目前所有配方、進價與庫存紀錄"
            >
              <span>💾 打包備份資料</span>
            </button>
            <button
              onclick="switchTab('cost')"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition flex items-center space-x-1.5"
            >
              <span>💰 前往原料成本庫</span>
            </button>
          </div>
        </div>

        <!-- 1~12 月份切換標籤列 (Month Switcher) -->
        <div class="border-t border-slate-100 pt-4">
          <div class="flex items-center justify-between mb-2.5">
            <span class="text-2xs font-bold text-slate-400 uppercase tracking-wider">點選月份查看當月採購雷達：</span>
            <span class="text-3xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              目前選中：${currentMonth} 月份 (秋季盛產期)
            </span>
          </div>
          <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
            ${months
              .map((m) => {
                const isSelected = m === currentMonth;
                const isCurrentCalendarMonth = m === 9; // 系統目前 9 月
                return `
                <button
                  onclick="selectSeasonMonth(${m})"
                  class="py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center space-y-0.5 relative ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102 ring-2 ring-emerald-400'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70'
                  }"
                >
                  <span class="text-sm font-black">${m} 月</span>
                  <span class="text-3xs opacity-80 font-normal">${monthNames[m - 1]}</span>
                  ${
                    isCurrentCalendarMonth && !isSelected
                      ? '<span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></span>'
                      : ''
                  }
                </button>
              `;
              })
              .join('')}
          </div>
        </div>
      </div>

      <!-- 當月份採購雷達看板 (Monthly Procurement Radar) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 左卡片：本月大盛產高 CP 值水果推薦 -->
        <div class="bg-gradient-to-br from-emerald-50/50 via-white to-white rounded-3xl p-6 shadow-soft border border-emerald-200/80 space-y-4">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div class="flex items-center space-x-2.5">
              <span class="text-2xl">🏆</span>
              <div>
                <h3 class="text-base font-extrabold text-emerald-950 flex items-center space-x-2">
                  <span>${currentMonth} 月份 · 大盛產高 CP 值採購首選</span>
                  <span class="text-3xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    共 ${guide.inSeasonBuys.length} 款正值巔峰
                  </span>
                </h3>
                <p class="text-2xs text-emerald-700/80 mt-0.5">
                  產地產量最大、批發價格年度最低、甜度香氣最頂級，買鮮果自切最划算！
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${guide.inSeasonBuys.slice(0, 6).map((item) => `
              <div class="bg-white p-3.5 rounded-2xl border border-emerald-100/90 shadow-2xs hover:border-emerald-300 transition space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-2xl">${item.fruit.emoji}</span>
                    <div>
                      <div class="font-extrabold text-slate-900">${item.fruit.name}</div>
                      <div class="text-3xs text-slate-400">${item.seasonInfo.regions.split('、')[0]}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs font-black text-emerald-800">$${item.freshPrice}/kg</div>
                    <div class="text-3xs text-slate-400">取果率 ${item.yieldRate}%</div>
                  </div>
                </div>

                <div class="text-3xs text-slate-600 bg-emerald-50/60 p-2 rounded-xl border border-emerald-100/60 leading-relaxed">
                  ${item.notes}
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-3xs">
                  <span class="text-purple-700 font-bold">實質淨肉 $${item.effectivePrice.toFixed(1)}/kg</span>
                  <button
                    onclick="quickAddToPlate('${item.fruit.id}', 100, 'fresh')"
                    class="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition active:scale-95"
                  >
                    + 鮮果拼盤
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 右卡片：本月建議轉用冷凍果丁/原汁避險清單 -->
        <div class="bg-gradient-to-br from-sky-50/50 via-white to-white rounded-3xl p-6 shadow-soft border border-sky-200/80 space-y-4">
          <div class="flex items-center justify-between border-b border-sky-100 pb-3">
            <div class="flex items-center space-x-2.5">
              <span class="text-2xl">❄️</span>
              <div>
                <h3 class="text-base font-extrabold text-sky-950 flex items-center space-x-2">
                  <span>${currentMonth} 月份 · 建議轉用 IQF 冷凍避險品項</span>
                  <span class="text-3xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                    抗漲控本
                  </span>
                </h3>
                <p class="text-2xs text-sky-700/80 mt-0.5">
                  此時鮮果處於產季尾聲或斷產，量少價昂易耗損，改用 IQF 冷凍果丁省錢又省工！
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${guide.switchFrozenAdvice.slice(0, 6).map((item) => `
              <div class="bg-white p-3.5 rounded-2xl border border-sky-100/90 shadow-2xs hover:border-sky-300 transition space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-2xl">${item.fruit.emoji}</span>
                    <div>
                      <div class="font-extrabold text-slate-900">${item.fruit.name}</div>
                      <span class="text-3xs bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-semibold">淡季/斷產</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs font-black text-sky-800">冷凍 $${item.frozenPrice}/kg</div>
                    <div class="text-3xs text-slate-400">出成率 95%</div>
                  </div>
                </div>

                <div class="text-3xs text-slate-600 bg-sky-50/60 p-2 rounded-xl border border-sky-100/60 leading-relaxed">
                  鮮果實質果肉價高達 $${item.freshEffective.toFixed(1)}/kg，改用冷凍淨肉價僅 $${item.frozenEffective.toFixed(1)}/kg。
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-3xs">
                  <span class="text-sky-700 font-bold">
                    ${item.diff > 0 ? `❄️ 冷凍每kg省 $${item.diff.toFixed(1)}` : '冷凍品質穩定控本'}
                  </span>
                  <button
                    onclick="quickAddToPlate('${item.fruit.id}', 100, 'frozen')"
                    class="px-2 py-0.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold transition active:scale-95"
                  >
                    + 冷凍入盤
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 12 個月全品項產季甘特熱點矩陣圖 (12-Month Gantt Heatmap) -->
      <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 class="text-base font-extrabold text-slate-800 flex items-center space-x-2">
              <span>🗺️ 全品項水果 12 個月產季熱點矩陣圖</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                共 ${filteredFruits.length} 款
              </span>
            </h3>
            <p class="text-2xs text-slate-400 mt-0.5">
              直觀呈現全年度各月份之產季分佈，滑鼠移至品項可查看主要產地產銷班與風味特性。
            </p>
          </div>

          <!-- 分類篩選與搜尋 -->
          <div class="flex items-center space-x-2 flex-wrap gap-y-2">
            <input
              id="season-search-input"
              type="text"
              placeholder="搜尋水果中文或產地..."
              value="${state.seasonSearchTerm || ''}"
              oninput="handleSeasonSearch(this.value)"
              class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-44 transition"
            />
            <div id="season-category-bar" class="flex items-center space-x-1 overflow-x-auto text-2xs">
              ${renderSeasonCategoryButtonsHtml()}
            </div>
          </div>
        </div>

        <!-- 圖例說明 -->
        <div class="flex items-center space-x-4 text-2xs text-slate-500 px-1 flex-wrap gap-y-1">
          <span class="flex items-center space-x-1.5 font-semibold text-emerald-800">
            <span class="w-3 h-3 rounded-md bg-emerald-500 inline-block"></span>
            <span>🟢 大盛產期 (批發價最低、品質甜度最頂級)</span>
          </span>
          <span class="flex items-center space-x-1.5 font-semibold text-amber-800">
            <span class="w-3 h-3 rounded-md bg-amber-400 inline-block"></span>
            <span>🟡 常態產期 (穩定供貨中)</span>
          </span>
          <span class="flex items-center space-x-1.5 font-semibold text-slate-400">
            <span class="w-3 h-3 rounded-md bg-slate-100 border border-slate-200 inline-block"></span>
            <span>⚪ 淡季/短缺高價 (建議轉用 IQF 冷凍)</span>
          </span>
        </div>

        <!-- 熱點矩陣表格本體 -->
        <div class="overflow-x-auto border border-slate-200/80 rounded-2xl">
          <table class="w-full text-left text-xs border-collapse min-w-[780px]">
            <thead>
              <tr class="bg-slate-100/90 text-slate-700 text-2xs border-b border-slate-200 select-none">
                <th class="py-3 px-3.5 font-bold min-w-[140px]">水果品項</th>
                <th class="py-3 px-2 font-bold text-slate-500 min-w-[100px]">主要產地</th>
                ${months
                  .map(
                    (m) => `
                  <th class="py-3 px-1.5 text-center font-extrabold ${
                    m === currentMonth ? 'bg-emerald-100/80 text-emerald-950 ring-1 ring-emerald-300' : ''
                  }">
                    ${m}月
                  </th>
                `
                  )
                  .join('')}
                <th class="py-3 px-2.5 text-center font-bold">快捷操作</th>
              </tr>
            </thead>
            <tbody id="seasonality-table-body" class="divide-y divide-slate-100 bg-white text-slate-700">
              ${renderSeasonalityTableRowsHtml()}            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderSeasonCategoryButtonsHtml() {
  const catFilter = state.seasonCategoryFilter || '全部';
  return ['全部', '本土瓜果', '熱帶水果', '柑橘類', '仁果類', '漿果類']
    .map(
      (cat) => `
    <button
      onclick="setSeasonCategoryFilter('${cat}')"
      class="px-2.5 py-1 rounded-lg font-bold transition ${
        catFilter === cat
          ? 'bg-slate-900 text-white shadow-2xs'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }"
    >
      ${cat}
    </button>
  `
    )
    .join('');
}

function renderSeasonalityTableRowsHtml() {
  const currentMonth = state.seasonSelectedMonth || 9;
  const catFilter = state.seasonCategoryFilter || '全部';
  const searchTerm = (state.seasonSearchTerm || '').trim().toLowerCase();

  const filteredFruits = (state.fruits || []).filter((f) => {
    const matchCat = catFilter === '全部' || f.category === catFilter;
    const matchSearch =
      !searchTerm ||
      f.name.toLowerCase().includes(searchTerm) ||
      (f.english_name && f.english_name.toLowerCase().includes(searchTerm)) ||
      (f.category && f.category.toLowerCase().includes(searchTerm));
    return matchCat && matchSearch;
  });

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  if (filteredFruits.length === 0) {
    return `
      <tr>
        <td colspan="15" class="py-8 text-center text-slate-400 text-xs">
          🔍 未找到符合「${searchTerm}」的水果品項或產地
        </td>
      </tr>
    `;
  }

  return filteredFruits
    .map((f) => {
      const s = FRUIT_SEASONALITY_MAP[f.id] || {
        peakMonths: [],
        normalMonths: [],
        offMonths: [],
        regions: '台灣產銷班',
        flavorNotes: '營養豐富'
      };

      return `
      <tr class="hover:bg-slate-50/80 transition group">
        <!-- 水果名稱 -->
        <td class="py-2.5 px-3.5 whitespace-nowrap">
          <div class="flex items-center space-x-2">
            <span class="text-xl">${f.emoji}</span>
            <div>
              <span class="font-extrabold text-slate-900 group-hover:text-emerald-800 transition">${f.name}</span>
              <div class="text-3xs text-slate-400">${f.category}</div>
            </div>
          </div>
        </td>

        <!-- 主要產地 -->
        <td class="py-2.5 px-2 text-3xs text-slate-600 whitespace-nowrap" title="${s.regions}">
          ${s.regions.split('、').slice(0, 2).join('、')}
        </td>

        <!-- 1~12 月色塊 -->
        ${months
          .map((m) => {
            const isPeak = s.peakMonths.includes(m);
            const isNormal = s.normalMonths.includes(m);
            const isCurrentCol = m === currentMonth;

            let cellClass = 'bg-slate-50 text-slate-300';
            let badgeText = '';

            if (isPeak) {
              cellClass = 'bg-emerald-500 text-white font-black shadow-2xs';
              badgeText = '盛產';
            } else if (isNormal) {
              cellClass = 'bg-amber-100 text-amber-900 font-bold';
              badgeText = '常態';
            }

            return `
            <td class="py-1.5 px-1 text-center whitespace-nowrap ${isCurrentCol ? 'bg-slate-100/50' : ''}">
              <div class="w-full py-1 rounded-lg text-3xs flex items-center justify-center transition ${cellClass}" title="${f.name} ${m}月份產情: ${isPeak ? '盛產大出 (最平價)' : isNormal ? '常態供應中' : '淡季短缺/建議冷凍'}">
                ${badgeText || '·'}
              </div>
            </td>
          `;
          })
          .join('')}

        <!-- 操作跳轉 -->
        <td class="py-2 px-2.5 text-center whitespace-nowrap">
          <div class="flex items-center justify-center space-x-1">
            <button
              onclick="jumpToFruitFluctuation('${f.id}')"
              class="px-2 py-1 text-3xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition active:scale-95"
              title="查看 ${f.name} 過去至今的價格波動趨勢"
            >
              📈 走勢
            </button>
            <button
              onclick="quickAddToPlate('${f.id}', 100, '${s.peakMonths.includes(currentMonth) ? 'fresh' : 'frozen'}')"
              class="px-2 py-1 text-3xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition active:scale-95"
              title="將 100g 投入拼盤"
            >
              + 拼盤
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

if (typeof window !== 'undefined') {
  window.getSeasonalityPageHtml = getSeasonalityPageHtml;
}


// 水果原料成本與取果率獨立分類頁面 (Cost Database Page)
// ==========================================

function getCostDatabasePageHtml() {
  const plateCosts = calcPlateCosts();
  const currentFilter = state.costStorageFilter || 'all';

  return `
    <div class="space-y-6">
      <!-- 頂部標題與快速統計指標 -->
      <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2 flex-wrap gap-y-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/60">
                水果採購與加工核算系統
              </span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                收錄 ${state.fruits.length} 款常溫與冷凍雙軌數據
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-800 mt-2 flex items-center space-x-2">
              <span>💰 水果原料成本與取果率資料庫</span>
            </h2>
            <p class="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              全面支援<strong>「🌱 常溫鮮果（需削皮去籽加工）」</strong>與<strong>「❄️ 冷凍水果（IQF預切果丁/純原汁）」</strong>雙軌核算，提供鮮凍成本效益對照，輔助餐飲與鮮切業者最佳採購決策！
            </p>
          </div>

          <div class="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
            <button
              onclick="exportCostDatabaseToCSV()"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center space-x-1.5"
              title="匯出包含全品項常溫與冷凍雙軌進貨價與取果率的 CSV 試算表"
            >
              <span>📥 匯出雙軌成本庫 CSV</span>
            </button>
            <button
              onclick="scrollToCostCalculator()"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition flex items-center space-x-1.5"
              title="跳至目前拼盤搭配成本與盒裝定價試算"
            >
              <span>🥗 查看拼盤試算</span>
            </button>
            <button
              onclick="resetFruitCosts()"
              class="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition flex items-center space-x-1"
              title="將所有常溫與冷凍水果單價與取果率還原為預設值"
            >
              <span>🔄 還原預設</span>
            </button>
          </div>
        </div>

        <!-- 4 大關鍵數據統計卡片 (KPI) -->
        <div id="cost-kpi-container">
          ${renderCostKPIsHtml()}
        </div>
      </div>

      <!-- 💡 鮮凍雙軌特性與計算公式說明 -->
      <div class="bg-gradient-to-r from-emerald-500/10 via-amber-50/70 to-sky-500/10 rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center space-x-2">
            <span class="text-xl">💡</span>
            <h3 class="text-sm sm:text-base font-extrabold text-slate-800">
              常溫鮮果 vs 冷凍水果：取果率與實質成本差異解析
            </h3>
          </div>
          <span class="text-3xs bg-slate-200/80 text-slate-800 font-bold px-2 py-0.5 rounded-full">
            鮮凍雙軌決策模型
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <!-- 常溫鮮果 -->
          <div class="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-200/70 space-y-1">
            <div class="flex items-center space-x-1.5 text-emerald-900 font-bold">
              <span>🌱</span>
              <span class="text-2xs uppercase tracking-wider">常溫鮮果 (Fresh)</span>
            </div>
            <div class="text-2xs text-slate-600 leading-relaxed pt-1">
              • <strong>原果採購</strong>：含皮、核、籽、梗，需經人工清洗削皮切塊。<br/>
              • <strong>取果損耗高</strong>：取果率約 <strong>45% ~ 85%</strong> (鳳梨50%、芒果65%、芭樂75%)。<br/>
              • <strong>實質果肉價</strong>：進貨價 ÷ 取果率 (進貨 100元/kg ÷ 50% = <strong>200元/kg</strong>)。
            </div>
          </div>

          <!-- 冷凍水果 -->
          <div class="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-sky-200/70 space-y-1">
            <div class="flex items-center space-x-1.5 text-sky-900 font-bold">
              <span>❄️</span>
              <span class="text-2xs uppercase tracking-wider">冷凍水果 (Frozen / IQF)</span>
            </div>
            <div class="text-2xs text-slate-600 leading-relaxed pt-1">
              • <strong>預處理純果肉</strong>：急速冷凍丁(IQF)、果泥、純原汁，拆封即可用。<br/>
              • <strong>幾無加工損耗</strong>：出成率高達 <strong>95% ~ 100%</strong> (僅 0~5% 微量解凍滴水)。<br/>
              • <strong>省去加工人工</strong>：進貨單價雖較高，但實質可食成本非常接近進貨價。
            </div>
          </div>

          <!-- 效益對決 -->
          <div class="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200/70 space-y-1">
            <div class="flex items-center space-x-1.5 text-amber-900 font-bold">
              <span>⚖️</span>
              <span class="text-2xs uppercase tracking-wider">採購效益決策 (以愛文芒果為例)</span>
            </div>
            <div class="text-2xs text-slate-600 leading-relaxed pt-1">
              • <strong>常溫鮮果</strong>：$150/kg ÷ 65% = <strong>$230.8/kg</strong> (需人工削皮去籽)。<br/>
              • <strong>冷凍芒果丁</strong>：$190/kg ÷ 95% = <strong>$200.0/kg</strong> (免切即用)。<br/>
              • ➔ <strong>決策結論</strong>：直接買冷凍芒果丁每公斤<strong>省 $30.8 元</strong>且省人工！
            </div>
          </div>
        </div>
      </div>

      <!-- 水果原料成本資料庫總表 -->
      <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-4">
        <!-- 頂部過濾控制列：常溫 / 冷凍模式切換 -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div class="flex items-center space-x-1.5 overflow-x-auto text-xs font-semibold pb-1 lg:pb-0">
            <span class="text-slate-400 text-2xs font-bold uppercase shrink-0">檢視模式：</span>
            <button
              onclick="handleCostStorageFilter('all')"
              class="px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center space-x-1 ${
                currentFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }"
            >
              <span>✨ 雙軌全覽 (${state.fruits.length})</span>
            </button>
            <button
              onclick="handleCostStorageFilter('fresh')"
              class="px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center space-x-1 ${
                currentFilter === 'fresh'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }"
            >
              <span>🌱 常溫鮮果庫</span>
            </button>
            <button
              onclick="handleCostStorageFilter('frozen')"
              class="px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center space-x-1 ${
                currentFilter === 'frozen'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
              }"
            >
              <span>❄️ 冷凍水果庫</span>
            </button>
            <button
              onclick="handleCostStorageFilter('compare')"
              class="px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center space-x-1 ${
                currentFilter === 'compare'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }"
            >
              <span>⚖️ 鮮凍效益比對</span>
            </button>
          </div>

          <!-- 搜尋與排序 -->
          <div class="flex items-center space-x-2 flex-wrap gap-y-2">
            <!-- 搜尋框 -->
            <div class="relative w-full sm:w-56">
              <input
                type="text"
                id="cost-search-input"
                placeholder="搜尋水果中文、英文或分類..."
                value="${state.costSearchTerm || ''}"
                oninput="handleCostSearch(this.value)"
                class="w-full pl-3 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            <!-- 釘選置頂切換按鈕 -->
            <button
              id="cost-pin-toggle-btn"
              onclick="toggleCostPinTop()"
              class="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center space-x-1 shadow-2xs ${
                state.costPinTop !== false
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }"
              title="切換常用釘選水果是否自動置頂在成本庫最上方"
            >
              <span>${state.costPinTop !== false ? '📌 釘選置頂中' : '📍 預設排序'}</span>
              <span class="text-3xs bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
                ${(state.favorites || []).length}
              </span>
            </button>

            <!-- 排序方式選單 -->
            <div class="flex items-center space-x-1 text-xs">
              <span class="text-2xs text-slate-400 font-medium">排序:</span>
              <select
                onchange="handleCostSort(this.value)"
                class="bg-slate-50 hover:bg-slate-100 text-xs font-semibold py-1.5 px-2 rounded-xl border border-slate-200 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="name" ${state.costSortBy === 'name' ? 'selected' : ''}>水果品名</option>
                <option value="effectivePrice_asc" ${state.costSortBy === 'effectivePrice' && state.costSortOrder === 'asc' ? 'selected' : ''}>實質果肉價 (低 ➔ 高)</option>
                <option value="effectivePrice_desc" ${state.costSortBy === 'effectivePrice' && state.costSortOrder === 'desc' ? 'selected' : ''}>實質果肉價 (高 ➔ 低)</option>
                <option value="yieldRate_desc" ${state.costSortBy === 'yieldRate' && state.costSortOrder === 'desc' ? 'selected' : ''}>取果率 (高 ➔ 低)</option>
                <option value="purchasePrice_asc" ${state.costSortBy === 'purchasePrice' && state.costSortOrder === 'asc' ? 'selected' : ''}>進貨價 (低 ➔ 高)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 分類標籤按鈕列 -->
        <div id="cost-category-bar">
          ${renderCostCategoryButtonsHtml()}
        </div>

        <!-- 資料庫表格容器 -->
        <div id="cost-database-table-container">
          ${renderCostDatabaseRowsHtml()}
        </div>
      </div>

      <!-- 底部：當前拼盤搭配原料成本與商業盒裝利潤核算模組 -->
      <div id="cost-live-calculator-section" class="scroll-mt-24">
        <div id="cost-live-calculator-container">
          ${renderCostLiveCalculatorHtml()}
        </div>
      </div>
    </div>
  `;
}

function renderCostDatabaseRowsHtml() {
  const term = (state.costSearchTerm || '').trim().toLowerCase();
  const selectedCat = state.costCategory || '全部';
  const filterMode = state.costStorageFilter || 'all';
  const isPinnedCat = selectedCat.startsWith('⭐ 已釘選');
  const favList = state.favorites || [];

  let list = (state.fruits || []).filter((f) => {
    const matchTerm =
      !term ||
      f.name.toLowerCase().includes(term) ||
      (f.english_name && f.english_name.toLowerCase().includes(term)) ||
      (f.category && f.category.toLowerCase().includes(term));

    let matchCat = true;
    if (isPinnedCat) {
      matchCat = favList.includes(f.id);
    } else if (selectedCat !== '全部') {
      matchCat = f.category === selectedCat;
    }
    return matchTerm && matchCat;
  });

  // 排序 (含釘選置頂邏輯)
  const sortBy = state.costSortBy || 'name';
  const sortOrder = state.costSortOrder || 'asc';
  const pinTop = state.costPinTop !== false;

  list.sort((a, b) => {
    // 1. 釘選置頂優先判定
    if (pinTop && !isPinnedCat) {
      const aFav = favList.includes(a.id);
      const bFav = favList.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
    }

    // 2. 自訂條件排序
    const primaryStorage = filterMode === 'frozen' ? 'frozen' : 'fresh';
    const cfgA = getFruitCostConfig(a.id, primaryStorage);
    const cfgB = getFruitCostConfig(b.id, primaryStorage);
    const effA = cfgA.purchasePrice / (cfgA.yieldRate / 100);
    const effB = cfgB.purchasePrice / (cfgB.yieldRate / 100);

    let comp = 0;
    if (sortBy === 'effectivePrice') {
      comp = effA - effB;
    } else if (sortBy === 'yieldRate') {
      comp = cfgA.yieldRate - cfgB.yieldRate;
    } else if (sortBy === 'purchasePrice') {
      comp = cfgA.purchasePrice - cfgB.purchasePrice;
    } else {
      comp = a.name.localeCompare(b.name, 'zh-Hant');
    }
    return sortOrder === 'desc' ? -comp : comp;
  });

  if (list.length === 0) {
    return `
      <div class="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        ${isPinnedCat ? '目前尚未釘選任何水果，點選表格品項旁的「☆」即可釘選常用水果！' : '查無符合條件的水果品項，請嘗試搜尋其他關鍵字或重設分類！'}
      </div>
    `;
  }

  // 渲染比對模式 (compare) 或雙軌全覽 (all)
  if (filterMode === 'compare' || filterMode === 'all') {
    return `
      <div class="overflow-x-auto border border-slate-200/80 rounded-2xl">
        <table class="w-full text-left text-xs border-collapse min-w-[780px]">
          <thead>
            <tr class="bg-slate-100/90 text-slate-600 text-2xs border-b border-slate-200 select-none">
              <th class="py-3 px-3 font-bold">水果品項</th>
              <th class="py-3 px-3 font-bold bg-emerald-50/70 text-emerald-950 text-center border-x border-emerald-100/80">
                🌱 常溫鮮果 (進貨 / 取果率 ➔ 實質價)
              </th>
              <th class="py-3 px-3 font-bold bg-sky-50/70 text-sky-950 text-center border-r border-sky-100/80">
                ❄️ 冷凍水果 (進貨 / 出成率 ➔ 實質價)
              </th>
              <th class="py-3 px-3 font-bold text-center">⚖️ 鮮凍效益評估</th>
              <th class="py-3 px-3 font-bold text-center">快捷投入拼盤</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
            ${list
              .map((f) => {
                const isPinned = favList.includes(f.id);
                const freshCfg = getFruitCostConfig(f.id, 'fresh');
                const frozenCfg = getFruitCostConfig(f.id, 'frozen');

                const freshEff = freshCfg.purchasePrice / (freshCfg.yieldRate / 100);
                const frozenEff = frozenCfg.purchasePrice / (frozenCfg.yieldRate / 100);
                const diff = freshEff - frozenEff;

                const better = Math.abs(diff) < 2
                  ? 'cost-equal'
                  : diff > 0
                  ? 'frozen-cheaper'
                  : 'fresh-cheaper';

                return `
                <tr class="hover:bg-amber-50/30 transition group ${isPinned ? 'bg-amber-50/25 border-l-4 border-l-amber-400' : ''}">
                  <!-- 水果品項 (含釘選星號按鈕) -->
                  <td class="py-3 px-3 whitespace-nowrap">
                    <div class="flex items-center space-x-2">
                      <button
                        type="button"
                        onclick="event.stopPropagation(); toggleCostFruitPin('${f.id}')"
                        class="text-base sm:text-lg transition p-1 -ml-1 rounded-lg hover:bg-amber-100/60 ${
                          isPinned ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-amber-400'
                        }"
                        title="${isPinned ? '已釘選置頂！點擊取消釘選' : '點擊釘選置頂此水果至成本庫最上方'}"
                      >
                        ${isPinned ? '★' : '☆'}
                      </button>
                      <span class="text-2xl">${f.emoji}</span>
                      <div>
                        <div class="flex items-center space-x-1.5">
                          <span class="font-bold text-slate-900 group-hover:text-amber-800 transition">
                            ${f.name}
                          </span>
                          ${isPinned ? '<span class="text-3xs bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">已釘選</span>' : ''}
                        </div>
                        <div class="text-3xs text-slate-400">
                          ${f.english_name || ''} · <span class="text-slate-500">${f.category || ''}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- 🌱 常溫鮮果欄位 -->
                  <td class="py-2.5 px-3 bg-emerald-50/30 border-x border-emerald-100/80 whitespace-nowrap">
                    <div class="flex items-center justify-between space-x-2">
                      <div class="space-y-1">
                        <div class="flex items-center space-x-1.5">
                          <span class="text-3xs text-slate-400">進貨:</span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value="${freshCfg.purchasePrice}"
                            onchange="updateFruitCost('${f.id}', 'fresh', 'purchasePrice', this.value)"
                            class="w-14 px-1 py-0.5 text-xs text-center font-bold bg-white border border-emerald-300 rounded focus:ring-1 focus:ring-emerald-500"
                            title="修改常溫鮮果進貨價 (元/kg)"
                          />
                          <span class="text-3xs text-slate-400">元/kg</span>
                        </div>
                        <div class="flex items-center space-x-1.5">
                          <span class="text-3xs text-slate-400">取果:</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            step="1"
                            value="${freshCfg.yieldRate}"
                            onchange="updateFruitCost('${f.id}', 'fresh', 'yieldRate', this.value)"
                            class="w-12 px-1 py-0.5 text-xs text-center font-bold bg-white border border-emerald-300 rounded focus:ring-1 focus:ring-emerald-500"
                            title="修改常溫取果率 (%)"
                          />
                          <span class="text-3xs text-slate-400">% (耗損 ${100 - freshCfg.yieldRate}%)</span>
                        </div>
                      </div>

                      <div class="text-right border-l border-emerald-100 pl-2">
                        <div class="text-xs font-extrabold text-emerald-900">
                          $ ${freshEff.toFixed(1)}
                          <span class="text-3xs font-normal text-slate-400">/kg</span>
                        </div>
                        <div class="text-3xs text-slate-500">$ ${(freshEff / 1000).toFixed(2)}/g</div>
                      </div>
                    </div>
                  </td>

                  <!-- ❄️ 冷凍水果欄位 -->
                  <td class="py-2.5 px-3 bg-sky-50/30 border-r border-sky-100/80 whitespace-nowrap">
                    <div class="flex items-center justify-between space-x-2">
                      <div class="space-y-1">
                        <div class="flex items-center space-x-1.5">
                          <span class="text-3xs text-slate-400">進貨:</span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value="${frozenCfg.purchasePrice}"
                            onchange="updateFruitCost('${f.id}', 'frozen', 'purchasePrice', this.value)"
                            class="w-14 px-1 py-0.5 text-xs text-center font-bold bg-white border border-sky-300 rounded focus:ring-1 focus:ring-sky-500"
                            title="修改冷凍水果進貨價 (元/kg)"
                          />
                          <span class="text-3xs text-slate-400">元/kg</span>
                        </div>
                        <div class="flex items-center space-x-1.5">
                          <span class="text-3xs text-slate-400">出成:</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            step="1"
                            value="${frozenCfg.yieldRate}"
                            onchange="updateFruitCost('${f.id}', 'frozen', 'yieldRate', this.value)"
                            class="w-12 px-1 py-0.5 text-xs text-center font-bold bg-white border border-sky-300 rounded focus:ring-1 focus:ring-sky-500"
                            title="修改冷凍解凍出成率 (%)"
                          />
                          <span class="text-3xs text-slate-400">%</span>
                        </div>
                      </div>

                      <div class="text-right border-l border-sky-100 pl-2">
                        <div class="text-xs font-extrabold text-sky-900">
                          $ ${frozenEff.toFixed(1)}
                          <span class="text-3xs font-normal text-slate-400">/kg</span>
                        </div>
                        <div class="text-3xs text-slate-500">$ ${(frozenEff / 1000).toFixed(2)}/g</div>
                      </div>
                    </div>
                  </td>

                  <!-- ⚖️ 鮮凍效益評估 -->
                  <td class="py-2.5 px-3 text-center whitespace-nowrap">
                    ${
                      better === 'frozen-cheaper'
                        ? `
                      <span class="inline-flex items-center px-2 py-1 rounded-lg text-2xs font-extrabold bg-sky-100 text-sky-800 border border-sky-300">
                        ❄️ 冷凍省 $${diff.toFixed(1)}/kg
                      </span>
                      <div class="text-3xs text-slate-400 mt-0.5">免切去核更省工</div>
                    `
                        : better === 'fresh-cheaper'
                        ? `
                      <span class="inline-flex items-center px-2 py-1 rounded-lg text-2xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        🌱 常溫省 $${(-diff).toFixed(1)}/kg
                      </span>
                      <div class="text-3xs text-slate-400 mt-0.5">買鮮果自切更划算</div>
                    `
                        : `
                      <span class="inline-flex items-center px-2 py-1 rounded-lg text-2xs font-semibold bg-slate-100 text-slate-600">
                        ⚖️ 兩者相當 (差 <$2)
                      </span>
                    `
                    }
                  </td>

                  <!-- 快捷投入拼盤 -->
                  <td class="py-2.5 px-3 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center space-x-1">
                      <button
                        onclick="jumpToFruitFluctuation('${f.id}')"
                        class="px-2 py-1 text-3xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition active:scale-95"
                        title="查看 ${f.name} 過去至今的價格波動趨勢與加權庫存成本"
                      >
                        📈 走勢
                      </button>
                      <button
                        onclick="quickAddToPlate('${f.id}', 100, 'fresh')"
                        class="px-2 py-1 text-3xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition active:scale-95"
                        title="將 100g 常溫鮮果加入拼盤"
                      >
                        + 🌱常溫
                      </button>
                      <button
                        onclick="quickAddToPlate('${f.id}', 100, 'frozen')"
                        class="px-2 py-1 text-3xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition active:scale-95"
                        title="將 100g 冷凍果丁/原汁加入拼盤"
                      >
                        + ❄️冷凍
                      </button>
                    </div>
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // 渲染單一模式：純常溫 (fresh) 或 純冷凍 (frozen)
  const isFrozenMode = filterMode === 'frozen';
  const modeKey = isFrozenMode ? 'frozen' : 'fresh';
  const modeName = isFrozenMode ? '冷凍水果' : '常溫鮮果';
  const themeColor = isFrozenMode ? 'sky' : 'emerald';

  return `
    <div class="overflow-x-auto border border-slate-200/80 rounded-2xl">
      <table class="w-full text-left text-xs border-collapse min-w-[780px]">
        <thead>
          <tr class="bg-slate-100/90 text-slate-600 text-2xs border-b border-slate-200 select-none">
            <th class="py-3 px-3.5 font-bold">水果品項</th>
            <th class="py-3 px-2.5 font-bold text-center">${modeName}進貨價 (元/kg)</th>
            <th class="py-3 px-2.5 font-bold text-center">${isFrozenMode ? '出成率 (%)' : '取果率 (%)'}</th>
            <th class="py-3 px-3 font-bold text-center min-w-[120px]">出成率視覺化</th>
            <th class="py-3 px-2 font-bold text-right">${isFrozenMode ? '滴水損耗' : '加工耗損'}</th>
            <th class="py-3 px-2.5 font-bold text-right text-${themeColor}-950">實質果肉單價</th>
            <th class="py-3 px-2 font-bold text-right">每克單價</th>
            <th class="py-3 px-2 font-bold text-right">每100g成本</th>
            <th class="py-3 px-3 font-bold text-left">加工處理說明</th>
            <th class="py-3 px-3 font-bold text-center">快捷操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
          ${list
            .map((f) => {
              const isPinned = favList.includes(f.id);
              const cfg = getFruitCostConfig(f.id, modeKey);
              const effectiveKg = cfg.purchasePrice / (cfg.yieldRate / 100);
              const effectiveGram = effectiveKg / 1000;
              const cost100g = effectiveGram * 100;
              const waste = 100 - cfg.yieldRate;

              return `
              <tr class="hover:bg-${themeColor}-50/30 transition group ${isPinned ? 'bg-amber-50/25 border-l-4 border-l-amber-400' : ''}">
                <td class="py-2.5 px-3.5 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <button
                      type="button"
                      onclick="event.stopPropagation(); toggleCostFruitPin('${f.id}')"
                      class="text-base sm:text-lg transition p-1 -ml-1 rounded-lg hover:bg-amber-100/60 ${
                        isPinned ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-amber-400'
                      }"
                      title="${isPinned ? '已釘選置頂！點擊取消釘選' : '點擊釘選置頂此水果至成本庫最上方'}"
                    >
                      ${isPinned ? '★' : '☆'}
                    </button>
                    <span class="text-xl">${f.emoji}</span>
                    <div>
                      <div class="flex items-center space-x-1.5">
                        <span class="font-bold text-slate-900 group-hover:text-${themeColor}-800 transition">
                          ${f.name}
                        </span>
                        ${isPinned ? '<span class="text-3xs bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">已釘選</span>' : ''}
                      </div>
                      <div class="text-3xs text-slate-400">
                        ${f.english_name || ''} · <span class="text-slate-500">${f.category || ''}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td class="py-2.5 px-2.5 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center space-x-1">
                    <span class="text-slate-400 text-3xs">$</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value="${cfg.purchasePrice}"
                      onchange="updateFruitCost('${f.id}', '${modeKey}', 'purchasePrice', this.value)"
                      class="w-16 px-1.5 py-1 text-xs text-center font-bold bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:outline-hidden"
                      title="點擊修改進貨價 (元/kg)"
                    />
                  </div>
                </td>

                <td class="py-2.5 px-2.5 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center space-x-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value="${cfg.yieldRate}"
                      onchange="updateFruitCost('${f.id}', '${modeKey}', 'yieldRate', this.value)"
                      class="w-14 px-1.5 py-1 text-xs text-center font-bold bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:outline-hidden"
                      title="點擊修改取果率/出成率 (%)"
                    />
                    <span class="text-slate-400 text-3xs">%</span>
                  </div>
                </td>

                <td class="py-2.5 px-3 whitespace-nowrap">
                  <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex" title="可食果肉率 ${cfg.yieldRate}% | 耗損 ${waste}%">
                    <div class="bg-${themeColor}-500 h-full rounded-l-full" style="width: ${cfg.yieldRate}%;"></div>
                    <div class="bg-amber-400/80 h-full rounded-r-full" style="width: ${waste}%;"></div>
                  </div>
                  <div class="flex justify-between text-3xs text-slate-400 mt-1">
                    <span class="text-${themeColor}-700 font-semibold">果肉 ${cfg.yieldRate}%</span>
                    <span class="text-amber-700">損耗 ${waste}%</span>
                  </div>
                </td>

                <td class="py-2.5 px-2 text-right text-slate-500 font-medium whitespace-nowrap">
                  ${waste}%
                </td>

                <td class="py-2.5 px-2.5 text-right whitespace-nowrap">
                  <strong class="text-sm font-extrabold text-${themeColor}-900">$ ${effectiveKg.toFixed(1)}</strong>
                  <span class="text-3xs text-slate-400 ml-0.5">/kg</span>
                </td>

                <td class="py-2.5 px-2 text-right font-medium text-slate-700 whitespace-nowrap">
                  $ ${effectiveGram.toFixed(2)}
                  <span class="text-3xs text-slate-400">/g</span>
                </td>

                <td class="py-2.5 px-2 text-right font-bold text-slate-800 whitespace-nowrap">
                  $ ${cost100g.toFixed(1)}
                  <span class="text-3xs text-slate-400">元</span>
                </td>

                <td class="py-2.5 px-3 text-left whitespace-nowrap">
                  <span class="text-2xs text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-md">
                    ${cfg.note || '加工規格'}
                  </span>
                </td>

                <td class="py-2.5 px-3 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center space-x-1.5">
                    <button
                      onclick="jumpToFruitFluctuation('${f.id}')"
                      class="px-2 py-1 text-2xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition active:scale-95"
                      title="查看 ${f.name} 過去至今的價格波動趨勢與加權庫存成本"
                    >
                      📈 走勢
                    </button>
                    <button
                      onclick="quickAddToPlate('${f.id}', 100, '${modeKey}')"
                      class="px-2.5 py-1 text-2xs font-bold text-${themeColor}-800 bg-${themeColor}-50 hover:bg-${themeColor}-100 border border-${themeColor}-200 rounded-lg transition active:scale-95"
                      title="將 100g 加入拼盤"
                    >
                      + 拼盤
                    </button>
                  </div>
                </td>
              </tr>
            `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function attachCostDatabaseEvents() {}

function renderCostKPIsHtml() {
  const plateCosts = calcPlateCosts();
  const fruits = state.fruits || [];
  let totalFreshYield = 0;
  let totalFreshEffective = 0;
  let totalFrozenYield = 0;
  let totalFrozenEffective = 0;

  fruits.forEach((f) => {
    const freshCfg = getFruitCostConfig(f.id, 'fresh');
    totalFreshYield += freshCfg.yieldRate;
    totalFreshEffective += freshCfg.purchasePrice / (freshCfg.yieldRate / 100);

    const frozenCfg = getFruitCostConfig(f.id, 'frozen');
    totalFrozenYield += frozenCfg.yieldRate;
    totalFrozenEffective += frozenCfg.purchasePrice / (frozenCfg.yieldRate / 100);
  });

  const avgFreshYield = fruits.length > 0 ? (totalFreshYield / fruits.length).toFixed(1) : '70.2';
  const avgFreshEff = fruits.length > 0 ? Math.round(totalFreshEffective / fruits.length) : 192;
  const avgFrozenYield = fruits.length > 0 ? (totalFrozenYield / fruits.length).toFixed(1) : '95.8';
  const avgFrozenEff = fruits.length > 0 ? Math.round(totalFrozenEffective / fruits.length) : 178;

  return `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
      <!-- KPI 1: 建檔品項 -->
      <div class="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
        <span class="text-2xs text-slate-500 font-semibold block">📦 鮮凍雙軌建檔品項</span>
        <div class="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
          ${fruits.length}
          <span class="text-xs font-normal text-slate-500 ml-0.5">款水果</span>
        </div>
        <div class="text-3xs text-emerald-600 font-medium mt-0.5">
          每款皆含常溫原果與冷凍規格
        </div>
      </div>

      <!-- KPI 2: 常溫鮮果平均指標 -->
      <div class="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/70">
        <span class="text-2xs text-emerald-800 font-semibold block">🌱 常溫鮮果平均取果率</span>
        <div class="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1">
          ${avgFreshYield} %
        </div>
        <div class="text-3xs text-slate-500 mt-0.5">
          平均實質成本約 $${avgFreshEff}/kg (損耗 ${(100 - avgFreshYield).toFixed(1)}%)
        </div>
      </div>

      <!-- KPI 3: 冷凍水果平均指標 -->
      <div class="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-200/70">
        <span class="text-2xs text-sky-800 font-semibold block">❄️ 冷凍水果平均出成率</span>
        <div class="text-xl sm:text-2xl font-extrabold text-sky-700 mt-1">
          ${avgFrozenYield} %
        </div>
        <div class="text-3xs text-slate-500 mt-0.5">
          平均實質成本約 $${avgFrozenEff}/kg (滴水損耗微量)
        </div>
      </div>

      <!-- KPI 4: 當前拼盤總原料成本 -->
      <div class="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-2xs text-slate-300 font-medium">🥗 目前拼盤原料成本</span>
          <span class="text-3xs bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
            ${state.plateItems.length} 項
          </span>
        </div>
        <div class="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1">
          $ ${plateCosts.totalRawCost.toFixed(1)}
          <span class="text-xs font-normal text-slate-300 ml-0.5">元</span>
        </div>
        <div class="text-3xs text-slate-300 mt-0.5 flex justify-between">
          <span>投入 ${plateCosts.totalPlateWeight}g</span>
          <span>採購毛重約 ${Math.round(plateCosts.totalPurchasedWeight)}g</span>
        </div>
      </div>
    </div>
  `;
}

function renderCostCategoryButtonsHtml() {
  const favCount = (state.favorites || []).length;
  const categories = [
    '全部',
    ...(favCount > 0 ? [`⭐ 已釘選 (${favCount})`] : []),
    '本土瓜果',
    '熱帶水果',
    '仁果類',
    '柑橘類',
    '漿果類',
    '核果類',
    '進口果物'
  ];

  return `
    <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
      ${categories
        .map(
          (cat) => `
        <button
          onclick="handleCostCategory('${cat}')"
          class="px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
            (state.costCategory || '全部') === cat
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }"
        >
          ${cat}
        </button>
      `
        )
        .join('')}
    </div>
  `;
}

function renderCostLiveCalculatorHtml() {
  const costs = calcPlateCosts();
  const cfg = state.costConfig || {
    packagingCost: 5,
    laborCost: 0,
    sellingPrice: 80,
    targetMargin: 50,
  };

  const marginBadgeColor =
    costs.grossMarginPct >= 50
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : costs.grossMarginPct >= 30
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-rose-100 text-rose-800 border-rose-300';

  return `
    <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
            拼盤即時成本與盒裝定價模擬
          </span>
          <h3 class="text-lg font-bold text-slate-800 mt-2 flex items-center space-x-2">
            <span>🥗 目前水果拼盤成本核算</span>
            <span class="text-xs font-normal text-slate-500">（共 ${state.plateItems.length} 項水果 · 總重 ${costs.totalPlateWeight}g）</span>
          </h3>
        </div>
        <div class="flex items-center space-x-2">
          <button
            onclick="switchTab('plate')"
            class="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center space-x-1"
          >
            <span>🥗 進入拼盤調整重量</span>
          </button>
          <button
            onclick="copyCostSummaryText()"
            class="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center space-x-1"
            id="copy-cost-btn-2"
          >
            <span>📋 複製成本摘要</span>
          </button>
        </div>
      </div>

      ${
        state.plateItems.length === 0
          ? `
        <div class="text-center py-10 px-4 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div class="text-3xl">🥗</div>
          <p class="text-sm font-bold text-slate-700">目前水果拼盤為空</p>
          <p class="text-xs text-slate-400">請從上方資料庫表格點選「+ 加入搭配」，即可在此處即時進行盒裝定價與毛利試算！</p>
        </div>
      `
          : `
        <!-- 拼盤內容明細 + 定價模擬器 雙欄配置 -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- 左側：搭配各項原料成本清單 -->
          <div class="lg:col-span-7 space-y-4">
            <div class="overflow-x-auto border border-slate-200/80 rounded-2xl">
              <table class="w-full text-left text-xs border-collapse min-w-[780px]">
                <thead>
                  <tr class="bg-slate-100/90 text-slate-600 text-2xs border-b border-slate-200">
                    <th class="py-2.5 px-3 font-bold">水果品項</th>
                    <th class="py-2.5 px-2 font-bold text-center">原料型態</th>
                    <th class="py-2.5 px-2 font-bold text-right">果肉(g)</th>
                    <th class="py-2.5 px-2 font-bold text-center">進貨/取果率</th>
                    <th class="py-2.5 px-2 font-bold text-right">實質單價</th>
                    <th class="py-2.5 px-2 font-bold text-right">需採購毛重</th>
                    <th class="py-2.5 px-2 font-bold text-right">原料成本</th>
                    <th class="py-2.5 px-2.5 font-bold text-right">佔比</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  ${costs.itemCosts
                    .map(
                      (ic) => `
                    <tr class="hover:bg-amber-50/30">
                      <td class="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">
                        <span class="mr-1">${ic.fruitEmoji}</span>${ic.fruitName}
                      </td>
                      <td class="py-2 px-2 text-center whitespace-nowrap">
                        <span class="px-1.5 py-0.5 rounded text-3xs font-bold ${ic.storageType === 'frozen' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'}">
                          ${ic.storageType === 'frozen' ? '❄️ 冷凍' : '🌱 常溫'}
                        </span>
                      </td>
                      <td class="py-2 px-2 text-right font-medium whitespace-nowrap">
                        ${ic.grams}g
                      </td>
                      <td class="py-2 px-2 text-center text-3xs text-slate-500 whitespace-nowrap">
                        $${ic.purchasePrice}/kg · ${ic.yieldRate}%
                      </td>
                      <td class="py-2 px-2 text-right font-medium text-slate-600 whitespace-nowrap">
                        $${Math.round(ic.effectivePricePerKg)}
                      </td>
                      <td class="py-2 px-2 text-right text-slate-500 whitespace-nowrap">
                        ${Math.round(ic.rawWeightNeeded)}g
                      </td>
                      <td class="py-2 px-2 text-right font-bold text-amber-900 whitespace-nowrap">
                        $${ic.itemCost.toFixed(1)}
                      </td>
                      <td class="py-2 px-2.5 text-right font-semibold text-slate-400 whitespace-nowrap">
                        ${ic.costPercentage.toFixed(1)}%
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
                <tfoot>
                  <tr class="bg-slate-50 font-bold text-slate-800 text-xs border-t-2 border-slate-200">
                    <td class="py-2.5 px-3">合計</td>
                    <td class="py-2.5 px-2 text-center">-</td>
                    <td class="py-2.5 px-2 text-right">${costs.totalPlateWeight}g</td>
                    <td class="py-2.5 px-2 text-center">-</td>
                    <td class="py-2.5 px-2 text-right">-</td>
                    <td class="py-2.5 px-2 text-right">${Math.round(costs.totalPurchasedWeight)}g</td>
                    <td class="py-2.5 px-2 text-right text-amber-800 font-extrabold">$${costs.totalRawCost.toFixed(1)} 元</td>
                    <td class="py-2.5 px-2.5 text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- 兩張小摘要卡 -->
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl">
                <span class="text-2xs text-amber-900 font-semibold block">總原料成本</span>
                <div class="text-2xl font-extrabold text-amber-900 mt-0.5">
                  $ ${costs.totalRawCost.toFixed(1)}
                  <span class="text-xs font-normal text-amber-700 ml-0.5">元</span>
                </div>
                <div class="text-3xs text-amber-800/80 mt-0.5">
                  果肉總重 ${costs.totalPlateWeight}g · 採購毛重約 ${Math.round(costs.totalPurchasedWeight)}g
                </div>
              </div>

              <div class="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl">
                <span class="text-2xs text-emerald-900 font-semibold block">每 100g 原料成本</span>
                <div class="text-2xl font-extrabold text-emerald-900 mt-0.5">
                  $ ${costs.costPer100g.toFixed(1)}
                  <span class="text-xs font-normal text-emerald-700 ml-0.5">元</span>
                </div>
                <div class="text-3xs text-emerald-800/80 mt-0.5">
                  方便計算各規格盒裝單位成本
                </div>
              </div>
            </div>
          </div>

          <!-- 右側：盒裝商業定價與利潤試算機 -->
          <div class="lg:col-span-5 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <span>🏷️ 盒裝定價與毛利模擬</span>
              </h4>
              <span class="text-3xs border px-1.5 py-0.5 rounded font-bold ${marginBadgeColor}">
                毛利率: ${costs.grossMarginPct.toFixed(1)}%
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label class="block text-2xs text-slate-500 font-medium mb-1">包材耗材 (元/盒)</label>
                <input
                  id="plate-cfg-packaging"
                  type="number"
                  min="0"
                  step="1"
                  value="${cfg.packagingCost}"
                  onchange="updateCostConfig('packagingCost', this.value)"
                  class="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  placeholder="5"
                />
              </div>

              <div>
                <label class="block text-2xs text-slate-500 font-medium mb-1">人工處理 (元/盒)</label>
                <input
                  id="plate-cfg-labor"
                  type="number"
                  min="0"
                  step="1"
                  value="${cfg.laborCost}"
                  onchange="updateCostConfig('laborCost', this.value)"
                  class="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="block text-2xs text-slate-500 font-medium mb-1">預計售價 (元/盒)</label>
                <input
                  id="plate-cfg-price"
                  type="number"
                  min="1"
                  step="5"
                  value="${cfg.sellingPrice}"
                  onchange="updateCostConfig('sellingPrice', this.value)"
                  class="w-full px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="80"
                />
              </div>

              <div>
                <label class="block text-2xs text-slate-500 font-medium mb-1">目標毛利率 (%)</label>
                <input
                  id="plate-cfg-margin"
                  type="number"
                  min="1"
                  max="95"
                  step="5"
                  value="${cfg.targetMargin}"
                  onchange="updateCostConfig('targetMargin', this.value)"
                  class="w-full px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  placeholder="50"
                />
              </div>
            </div>

            <!-- 計算結果彙整 -->
            <div class="space-y-2 pt-3 border-t border-slate-200/80 text-xs">
              <div class="flex justify-between items-center">
                <span class="text-slate-500">總生產成本 (原料+包材+人工)：</span>
                <span class="font-bold text-slate-800">$ ${costs.totalCost.toFixed(1)} 元</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500">單盒預估毛利額：</span>
                <span class="font-extrabold ${costs.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}">
                  $ ${costs.grossProfit.toFixed(1)} 元
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500">達目標 ${cfg.targetMargin}% 毛利之建議售價：</span>
                <span class="font-extrabold text-amber-800 text-sm">
                  NT$ ${Math.ceil(costs.suggestedPrice)} 元
                </span>
              </div>
            </div>
          </div>
        </div>
      `
      }
    </div>
  `;
}

function getPlateCostViewHtml() {
  const costs = calcPlateCosts();
  const cfg = state.costConfig || {
    packagingCost: 5,
    laborCost: 0,
    sellingPrice: 80,
    targetMargin: 50,
  };

  if (state.plateItems.length === 0) {
    return `
      <div class="text-center py-10 px-4 space-y-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl shadow-inner">
          💰
        </div>
        <div>
          <h4 class="font-bold text-slate-800 text-sm">尚未加入任何水果搭配</h4>
          <p class="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            請先在左側加入水果並設定公克數，即可即時計算進貨原料成本、取果率耗損及盒裝利潤！
          </p>
        </div>
        <button onclick="applyPreset('weight_loss')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
          載入推薦減脂拼盤試算
        </button>
      </div>
    `;
  }

  const marginBadgeColor =
    costs.grossMarginPct >= 50
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : costs.grossMarginPct >= 30
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-rose-100 text-rose-800 border-rose-300';

  return `
    <div class="space-y-5">
      <!-- 標題與操作列 -->
      <div class="flex items-start justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
            原料採購與定價試算
          </span>
          <h3 class="text-lg font-bold text-slate-800 mt-2 flex items-center space-x-1.5">
            <span>水果原料成本分析</span>
            <span class="text-2xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">取果率加權</span>
          </h3>
        </div>
        <div class="flex items-center space-x-1.5">
          <button onclick="exportPlateToCSV()" class="p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition flex items-center space-x-1 text-xs font-semibold" title="匯出包含成本分析的 CSV">
            <span>📊 匯出 CSV</span>
          </button>
          <button onclick="copyCostSummaryText()" class="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition flex items-center space-x-1 text-xs font-medium" id="copy-cost-btn" title="複製成本報價摘要">
            <span>📋 複製摘要</span>
          </button>
          <button onclick="resetFruitCosts()" class="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition flex items-center space-x-1 text-xs" title="還原預設單價與取果率">
            <span>🔄 重設</span>
          </button>
        </div>
      </div>

      <!-- 取果率公式解說小卡 (直接回應使用者情境) -->
      <div class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
        <div class="font-bold flex items-center space-x-1.5 text-amber-900">
          <span>💡</span>
          <span>取果率與實質成本計算公式：</span>
        </div>
        <p class="text-2xs sm:text-xs text-amber-900/90 leading-relaxed">
          <strong>實質果肉成本 (元/kg)</strong> = 進貨單價 ÷ (取果率% ÷ 100)<br/>
          例如：進貨 <strong>100 元/kg</strong>、加工取果率 <strong>50%</strong> ➔ 實質果肉成本即為 <strong>200 元/kg</strong> (0.2 元/g)。若搭配投入 150g 果肉需採購 300g 原料，原料成本即為 <strong>30.0 元</strong>。
        </p>
      </div>

      <!-- 核心指標卡 (4宮格) -->
      <div class="grid grid-cols-2 gap-3">
        <!-- 總原料成本 -->
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-sm">
          <span class="text-2xs text-slate-300 font-medium">總原料成本</span>
          <div class="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-amber-400">
            $ ${costs.totalRawCost.toFixed(1)}
            <span class="text-xs font-normal text-slate-300 ml-1">元</span>
          </div>
          <div class="text-3xs text-slate-400 mt-1">
            果肉總重 ${costs.totalPlateWeight} g
          </div>
        </div>

        <!-- 每 100g 綜合單價 -->
        <div class="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
          <span class="text-2xs text-slate-500 font-semibold">每 100g 原料成本</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            $ ${costs.costPer100g.toFixed(1)}
            <span class="text-xs font-normal text-slate-500 ml-0.5">元</span>
          </div>
          <div class="text-3xs text-slate-400 mt-1">
            需採購毛重約 ${Math.round(costs.totalPurchasedWeight)} g
          </div>
        </div>

        <!-- 總生產成本 (含包材) -->
        <div class="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="text-2xs text-slate-500 font-semibold">總生產成本</span>
            <span class="text-3xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">含包材人工</span>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
            $ ${costs.totalCost.toFixed(1)}
            <span class="text-xs font-normal text-slate-500 ml-0.5">元</span>
          </div>
          <div class="text-3xs text-slate-400 mt-1">
            包材 $${costs.packagingCost} + 人工 $${costs.laborCost}
          </div>
        </div>

        <!-- 預估毛利率 -->
        <div class="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="text-2xs text-slate-500 font-semibold">預估毛利率</span>
            <span class="text-3xs border px-1.5 py-0.5 rounded font-bold ${marginBadgeColor}">
              ${costs.grossMarginPct >= 50 ? '高利潤' : costs.grossMarginPct >= 30 ? '適中' : '偏低'}
            </span>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            ${costs.grossMarginPct.toFixed(1)}
            <span class="text-xs font-normal text-slate-500 ml-0.5">%</span>
          </div>
          <div class="text-3xs text-slate-400 mt-1">
            預估毛利額: $ ${costs.grossProfit.toFixed(1)} 元
          </div>
        </div>
      </div>

      <!-- 商業定價與毛利試算模組 -->
      <div class="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <span>🏷️ 盒裝定價與毛利試算</span>
          </h4>
          <span class="text-3xs text-slate-500">即時計算與利潤模擬</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label class="block text-2xs text-slate-500 font-medium mb-1">包材耗材 (元/盒)</label>
            <input
              id="costview-cfg-packaging"
              type="number"
              min="0"
              step="1"
              value="${cfg.packagingCost}"
              onchange="updateCostConfig('packagingCost', this.value)"
              class="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              placeholder="5"
            />
          </div>
          <div>
            <label class="block text-2xs text-slate-500 font-medium mb-1">人工處理 (元/盒)</label>
            <input
              id="costview-cfg-labor"
              type="number"
              min="0"
              step="1"
              value="${cfg.laborCost}"
              onchange="updateCostConfig('laborCost', this.value)"
              class="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              placeholder="0"
            />
          </div>
          <div>
            <label class="block text-2xs text-slate-500 font-medium mb-1">預計售價 (元/盒)</label>
            <input
              id="costview-cfg-price"
              type="number"
              min="1"
              step="5"
              value="${cfg.sellingPrice}"
              onchange="updateCostConfig('sellingPrice', this.value)"
              class="w-full px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              placeholder="80"
            />
          </div>
          <div>
            <label class="block text-2xs text-slate-500 font-medium mb-1">目標毛利率 (%)</label>
            <input
              id="costview-cfg-margin"
              type="number"
              min="1"
              max="95"
              step="5"
              value="${cfg.targetMargin}"
              onchange="updateCostConfig('targetMargin', this.value)"
              class="w-full px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              placeholder="50"
            />
          </div>
        </div>

        <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-2xs text-slate-600">
          <div>
            達目標 <strong>${cfg.targetMargin}%</strong> 毛利建議售價：
            <strong class="text-xs text-amber-800 font-extrabold">NT$ ${Math.ceil(costs.suggestedPrice)} 元</strong>
          </div>
          <div>
            單盒獲利：
            <strong class="text-xs ${costs.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'} font-extrabold">
              NT$ ${costs.grossProfit.toFixed(1)} 元
            </strong>
          </div>
        </div>
      </div>

      <!-- 水果原料成本明細表 -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <span>📋 品項原料成本與取果率明細</span>
          </h4>
          <span class="text-3xs text-slate-400">可直接在表格修改進貨價與取果率</span>
        </div>

        <div class="overflow-x-auto border border-slate-200/80 rounded-2xl">
          <table class="w-full text-left text-xs border-collapse min-w-[780px]">
            <thead>
              <tr class="bg-slate-100/90 text-slate-600 text-2xs border-b border-slate-200">
                <th class="py-2.5 px-3 font-bold">水果品項</th>
                <th class="py-2.5 px-2 font-bold text-right">果肉(g)</th>
                <th class="py-2.5 px-2 font-bold text-center">進貨價(元/kg)</th>
                <th class="py-2.5 px-2 font-bold text-center">取果率(%)</th>
                <th class="py-2.5 px-2 font-bold text-right">實質價/kg</th>
                <th class="py-2.5 px-2 font-bold text-right">需採購毛重</th>
                <th class="py-2.5 px-2 font-bold text-right">原料成本</th>
                <th class="py-2.5 px-2.5 font-bold text-right">成本佔比</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
              ${costs.itemCosts
                .map((ic) => `
                <tr class="hover:bg-amber-50/30 transition">
                  <td class="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    <span class="mr-1">${ic.fruitEmoji}</span>${ic.fruitName}
                  </td>
                  <td class="py-2 px-2 text-right font-medium text-slate-600 whitespace-nowrap">
                    ${ic.grams}g
                  </td>
                  <td class="py-2 px-2 text-center whitespace-nowrap">
                    <input
                      id="costview-price-${ic.fruitId}"
                      type="number"
                      min="1"
                      step="1"
                      value="${ic.purchasePrice}"
                      onchange="updateFruitCost('${ic.fruitId}', 'purchasePrice', this.value)"
                      class="w-16 px-1.5 py-0.5 text-xs text-center font-bold bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:bg-white"
                      title="輸入每公斤進貨價格"
                    />
                  </td>
                  <td class="py-2 px-2 text-center whitespace-nowrap">
                    <input
                      id="costview-yield-${ic.fruitId}"
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value="${ic.yieldRate}"
                      onchange="updateFruitCost('${ic.fruitId}', 'yieldRate', this.value)"
                      class="w-14 px-1.5 py-0.5 text-xs text-center font-bold bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:bg-white"
                      title="輸入加工取果率百分比 (留下的可食用果肉%)"
                    />
                  </td>
                  <td class="py-2 px-2 text-right font-medium text-slate-600 whitespace-nowrap">
                    $${Math.round(ic.effectivePricePerKg)}
                  </td>
                  <td class="py-2 px-2 text-right text-slate-500 whitespace-nowrap">
                    ${Math.round(ic.rawWeightNeeded)}g
                  </td>
                  <td class="py-2 px-2 text-right font-bold text-amber-900 whitespace-nowrap">
                    $${ic.itemCost.toFixed(1)}
                  </td>
                  <td class="py-2 px-2.5 text-right font-semibold text-slate-500 whitespace-nowrap">
                    ${ic.costPercentage.toFixed(1)}%
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="bg-slate-50 font-bold text-slate-800 text-xs border-t-2 border-slate-200">
                <td class="py-2.5 px-3">合計</td>
                <td class="py-2.5 px-2 text-right">${costs.totalPlateWeight}g</td>
                <td class="py-2.5 px-2 text-center">-</td>
                <td class="py-2.5 px-2 text-center">-</td>
                <td class="py-2.5 px-2 text-right">-</td>
                <td class="py-2.5 px-2 text-right">${Math.round(costs.totalPurchasedWeight)}g</td>
                <td class="py-2.5 px-2 text-right text-amber-800 font-extrabold">$${costs.totalRawCost.toFixed(1)} 元</td>
                <td class="py-2.5 px-2.5 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `;
}

// 1. 拼盤計算機 HTML 與事件
// ==========================================
function getPlateHtml() {
  const totals = calcTotals();
  const insights = getInsights(totals);

  const vitCPct = Math.min(250, Math.round((totals.vitamin_c / DRI.VITAMIN_C_MG) * 100));
  const fiberPct = Math.min(200, Math.round((totals.dietary_fiber / DRI.FRUIT_FIBER_GOAL_G) * 100));
  const sugarPct = Math.min(150, Math.round((totals.sugar / DRI.SUGAR_MAX_G) * 100));

  let itemsHtml = '';
  if (state.plateItems.length === 0) {
    itemsHtml = `
      <div class="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-soft text-center space-y-6">
        <div class="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl shadow-inner">
          🥗
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-800">您的水果搭配目前是空的</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            您可以從「水果百科圖鑑」挑選水果加入，或點選下方為您精心設計的健康拼盤組合！
          </p>
        </div>
        <div class="pt-2 text-left">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3 text-center">
            推薦健康水果搭配快速試算
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onclick="applyPreset('weight_loss')" class="p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition group">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-xl">🍐</span>
                <span class="font-bold text-sm text-slate-800 group-hover:text-emerald-700">減脂高纖低糖盤</span>
              </div>
              <p class="text-xs text-slate-500">珍珠芭樂 150g + 綠奇異果 85g + 藍莓 50g</p>
              <div class="text-3xs text-emerald-600 font-semibold mt-2">約 133 kcal · 6.6g 膳食纖維</div>
            </button>
            <button onclick="applyPreset('vitamin_c')" class="p-4 rounded-2xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 text-left transition group">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-xl">🥝</span>
                <span class="font-bold text-sm text-slate-800 group-hover:text-orange-700">美顏高 C 抗氧化盤</span>
              </div>
              <p class="text-xs text-slate-500">黃金奇異果 90g + 草莓 100g + 紅心芭樂 100g</p>
              <div class="text-3xs text-orange-600 font-semibold mt-2">約 138 kcal · 428mg 維生素C (超高)</div>
            </button>
            <button onclick="applyPreset('workout')" class="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition group">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-xl">🍌</span>
                <span class="font-bold text-sm text-slate-800 group-hover:text-amber-700">運動補充電解質盤</span>
              </div>
              <p class="text-xs text-slate-500">香蕉 120g + 富士蘋果 (帶皮) 100g</p>
              <div class="text-3xs text-amber-600 font-semibold mt-2">約 158 kcal · 536mg 高鉀補充電解質</div>
            </button>
            <button onclick="applyPreset('hydration')" class="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-left transition group">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-xl">🍉</span>
                <span class="font-bold text-sm text-slate-800 group-hover:text-teal-700">清爽水潤消暑盤</span>
              </div>
              <p class="text-xs text-slate-500">黑珍珠蓮霧 110g + 紅肉西瓜 150g</p>
              <div class="text-3xs text-teal-600 font-semibold mt-2">約 86 kcal · 超低卡水分充足</div>
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    itemsHtml = `
      <div class="space-y-3">
        ${state.plateItems
          .map((item, idx) => {
            const fruit = getFruit(item.fruitId);
            const nut = calcItemNut(fruit, item.grams);
            const su = fruit.serving_unit;
            return `
              <div class="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-soft hover:shadow-card transition">
                <div class="flex items-start justify-between">
                  <div class="flex items-center space-x-3 cursor-pointer group" onclick="openDetailModal('${fruit.id}')">
                    <div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-3xl border border-slate-100 group-hover:scale-105 transition-transform">
                      ${fruit.emoji}
                    </div>
                    <div>
                      <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h4 class="font-bold text-slate-800 text-base group-hover:text-emerald-600 transition-colors">
                          ${fruit.name}
                        </h4>
                        <span class="text-2xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          ${fruit.category}
                        </span>
                        <!-- 常溫鮮果 vs 冷凍水果切換按鈕 -->
                        <button
                          type="button"
                          onclick="event.stopPropagation(); togglePlateItemStorageType(${idx})"
                          class="px-2 py-0.5 rounded-lg text-2xs font-bold transition flex items-center space-x-1 shadow-2xs ${
                            (item.storageType || 'fresh') === 'frozen'
                              ? 'bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                          }"
                          title="點擊在此水果切換：常溫鮮果 vs 冷凍水果"
                        >
                          <span>${(item.storageType || 'fresh') === 'frozen' ? '❄️ 冷凍水果' : '🌱 常溫鮮果'}</span>
                          <span class="text-3xs text-slate-400">⇄</span>
                        </button>
                      </div>
                      <div class="text-xs text-slate-400 mt-0.5">
                        每 100g: ${fruit.nutrition_per_100g.calories} kcal · 糖 ${fruit.nutrition_per_100g.sugar}g · 維C ${fruit.nutrition_per_100g.vitamin_c}mg
                      </div>
                    </div>
                  </div>
                  <button onclick="removePlateItem(${idx})" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title="移除此水果">
                    🗑️
                  </button>
                </div>

                <!-- Weight Controls -->
                <div class="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <button onclick="updateGrams(${idx}, 100)" class="px-2.5 py-1 text-2xs font-medium rounded-lg transition ${
                      item.grams === 100 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }">
                      100g
                    </button>
                    ${
                      su
                        ? `
                      <button onclick="updateGrams(${idx}, ${su.grams})" class="px-2.5 py-1 text-2xs font-medium rounded-lg transition ${
                            item.grams === su.grams ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }">
                        1 ${su.name} (${su.grams}g)
                      </button>
                      <button onclick="updateGrams(${idx}, ${Math.round(su.grams / 2)})" class="px-2.5 py-1 text-2xs font-medium rounded-lg transition ${
                            item.grams === Math.round(su.grams / 2) ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }">
                        半${su.name.charAt(0)} (${Math.round(su.grams / 2)}g)
                      </button>
                    `
                        : ''
                    }
                  </div>

                  <div class="flex items-center space-x-1 sm:space-x-1.5 self-end sm:self-auto flex-wrap">
                    <!-- 減少 10g & 1g 按鈕 -->
                    <div class="flex items-center space-x-1">
                      <button
                        type="button"
                        onclick="adjustGrams(${idx}, -10)"
                        class="px-2 py-1 text-2xs font-bold text-slate-600 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 active:scale-95 rounded-lg border border-slate-200/80 transition select-none shadow-2xs"
                        title="減少 10g"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onclick="adjustGrams(${idx}, -1)"
                        class="px-2 py-1 text-2xs font-bold text-slate-600 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 active:scale-95 rounded-lg border border-slate-200/80 transition select-none shadow-2xs"
                        title="減少 1g"
                      >
                        -1
                      </button>
                    </div>

                    <!-- 拉條 (Slider) -->
                    <input
                      id="plate-range-${idx}"
                      type="range"
                      min="1"
                      max="500"
                      step="1"
                      value="${item.grams}"
                      oninput="updateGrams(${idx}, Number(this.value))"
                      class="w-20 sm:w-28 accent-emerald-600 cursor-pointer"
                      title="滑動微調重量"
                    />

                    <!-- 增加 1g & 10g 按鈕 -->
                    <div class="flex items-center space-x-1">
                      <button
                        type="button"
                        onclick="adjustGrams(${idx}, 1)"
                        class="px-2 py-1 text-2xs font-bold text-slate-600 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 active:scale-95 rounded-lg border border-slate-200/80 transition select-none shadow-2xs"
                        title="增加 1g"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onclick="adjustGrams(${idx}, 10)"
                        class="px-2 py-1 text-2xs font-bold text-slate-600 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 active:scale-95 rounded-lg border border-slate-200/80 transition select-none shadow-2xs"
                        title="增加 10g"
                      >
                        +10
                      </button>
                    </div>

                    <!-- 數字精準輸入框 -->
                    <div class="flex items-center space-x-1 ml-1">
                      <input
                        id="plate-num-${idx}"
                        type="number"
                        min="1"
                        max="1000"
                        value="${item.grams}"
                        onchange="updateGrams(${idx}, Math.max(1, Number(this.value) || 1))"
                        class="w-14 px-1.5 py-1 text-xs font-bold text-center bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                      <span class="text-xs font-medium text-slate-500">g</span>
                    </div>
                  </div>
                </div>

                <!-- Subtotal metrics -->
                <div class="mt-3 flex items-center justify-between text-2xs bg-emerald-50/60 rounded-xl px-3 py-2 border border-emerald-100/50">
                  <span class="font-medium text-emerald-900">
                    本項攝取：<strong>${nut.calories}</strong> kcal
                  </span>
                  <div class="flex items-center space-x-3 text-slate-600">
                    <span>糖: <strong class="text-amber-700">${nut.sugar}g</strong></span>
                    <span>纖維: <strong class="text-emerald-700">${nut.dietary_fiber}g</strong></span>
                    <span>維C: <strong class="text-orange-700">${nut.vitamin_c}mg</strong></span>
                  </div>
                </div>

                <!-- Raw Material Cost Strip (常溫/冷凍雙軌支援) -->
                ${(() => {
                  const storageType = item.storageType || 'fresh';
                  const isFrozen = storageType === 'frozen';
                  const costCfg = getFruitCostConfig(fruit.id, storageType);
                  const effectiveKg = costCfg.purchasePrice / (costCfg.yieldRate / 100);
                  const itemCost = item.grams * (effectiveKg / 1000);
                  const rawNeeded = item.grams / (costCfg.yieldRate / 100);
                  const bgClass = isFrozen ? 'bg-sky-50/70 border-sky-200/70' : 'bg-amber-50/70 border-amber-200/60';
                  const textClass = isFrozen ? 'text-sky-950' : 'text-amber-950';
                  const boldClass = isFrozen ? 'text-sky-900' : 'text-amber-900';
                  const badgeClass = isFrozen ? 'text-sky-800/90 bg-sky-100/90 border-sky-200' : 'text-amber-800/80 bg-amber-100/80 border-amber-200';
                  const borderFocus = isFrozen ? 'border-sky-300 focus:ring-sky-500' : 'border-amber-300 focus:ring-amber-500';

                  return `
                    <div class="mt-2 flex flex-wrap items-center justify-between text-2xs ${bgClass} rounded-xl px-3 py-2 border gap-y-1.5">
                      <div class="flex items-center space-x-2 ${textClass} font-medium flex-wrap gap-y-1">
                        <span>💰 ${isFrozen ? '❄️ 冷凍成本' : '🌱 常溫成本'}：<strong class="${boldClass} text-xs font-extrabold">$ ${itemCost.toFixed(1)}</strong> 元</span>
                        <span class="text-3xs ${badgeClass} border px-1.5 py-0.2 rounded font-semibold" title="需採購原料約 ${Math.round(rawNeeded)}g">
                          實質 $${Math.round(effectiveKg)}/kg (${costCfg.yieldRate}%)
                        </span>
                      </div>
                      <div class="flex items-center space-x-2 text-slate-600">
                        <label class="flex items-center space-x-1" title="${isFrozen ? '冷凍' : '常溫'}每公斤進貨價格">
                          <span class="text-3xs text-slate-500">進貨:</span>
                          <input
                            id="plate-fruit-price-${fruit.id}-${storageType}"
                            type="number"
                            min="1"
                            step="1"
                            value="${costCfg.purchasePrice}"
                            onchange="updateFruitCost('${fruit.id}', '${storageType}', 'purchasePrice', this.value)"
                            class="w-14 px-1 py-0.5 text-3xs font-bold text-center bg-white border ${borderFocus} rounded focus:ring-1"
                          />
                          <span class="text-3xs text-slate-400">元/kg</span>
                        </label>
                        <label class="flex items-center space-x-1" title="${isFrozen ? '解凍出成率' : '加工取果率'}百分比">
                          <span class="text-3xs text-slate-500">${isFrozen ? '出成:' : '取果:'}</span>
                          <input
                            id="plate-fruit-yield-${fruit.id}-${storageType}"
                            type="number"
                            min="1"
                            max="100"
                            step="1"
                            value="${costCfg.yieldRate}"
                            onchange="updateFruitCost('${fruit.id}', '${storageType}', 'yieldRate', this.value)"
                            class="w-11 px-1 py-0.5 text-3xs font-bold text-center bg-white border ${borderFocus} rounded focus:ring-1"
                          />
                          <span class="text-3xs text-slate-400">%</span>
                        </label>
                      </div>
                    </div>
                  `;
                })()}
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  const insightsHtml =
    insights.length > 0
      ? `
      <div class="space-y-2 pt-2 border-t border-slate-100">
        <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <span>✨ 智慧飲食分析建議</span>
        </h4>
        <div class="space-y-2">
          ${insights
            .map(
              (ins) => `
            <div class="p-3 rounded-2xl text-xs flex items-start space-x-2.5 ${
              ins.type === 'warning'
                ? 'bg-amber-50 border border-amber-200/70 text-amber-900'
                : ins.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200/70 text-emerald-900'
                : 'bg-sky-50 border border-sky-200/70 text-sky-900'
            }">
              <span class="text-base">${ins.type === 'warning' ? '⚠️' : ins.type === 'success' ? '✅' : '💡'}</span>
              <div>
                <div class="font-bold">${ins.title}</div>
                <div class="text-3xs sm:text-xs mt-0.5 opacity-90 leading-relaxed">${ins.text}</div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      : '';

  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Plate List -->
      <div class="lg:col-span-7 space-y-4 no-print">
        <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-xl font-bold text-slate-800">今日水果搭配</h2>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                ${state.plateItems.length} 種水果
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">自由調整公克數或切換生活份量，即時換算總營養攝取</p>
          </div>
          <div class="flex items-center space-x-1.5 flex-wrap gap-y-2">
            <button onclick="saveCurrentRecipePrompt()" ${state.plateItems.length === 0 ? 'disabled' : ''} class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center space-x-1 disabled:opacity-40 disabled:pointer-events-none shadow-2xs" title="儲存當前搭配至記憶清單">
              <span>💾 儲存搭配</span>
            </button>
            <button onclick="openRecipesModal()" class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center space-x-1 shadow-2xs" title="查看已儲存搭配">
              <span>📂 我的搭配</span>
              ${state.savedRecipes.length > 0 ? `<span class="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-3xs font-bold rounded-full">${state.savedRecipes.length}</span>` : ''}
            </button>
            <button onclick="exportPlateToCSV()" ${state.plateItems.length === 0 ? 'disabled' : ''} class="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center space-x-1 disabled:opacity-40 disabled:pointer-events-none shadow-2xs" title="匯出成 Excel CSV 報表">
              <span>📊 匯出 CSV</span>
            </button>
            ${
              state.plateItems.length > 0
                ? `
              <button onclick="clearPlate()" class="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition flex items-center space-x-1">
                <span>清空</span>
              </button>
            `
                : ''
            }
            <button onclick="switchTab('catalog')" class="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center space-x-1">
              <span>+ 新增水果</span>
            </button>
          </div>
        </div>

        ${
          state.favorites && state.favorites.length > 0
            ? `
        <!-- Pinned Favorites Quick-Add Bar -->
        <div class="bg-amber-50/70 border border-amber-200/80 rounded-2xl px-4 py-3 flex items-center justify-between flex-wrap gap-2.5 shadow-2xs">
          <div class="flex items-center space-x-1.5 text-xs font-bold text-amber-900 shrink-0">
            <span class="text-sm">⭐</span>
            <span>常用置頂水果快速加入：</span>
          </div>
          <div class="flex items-center space-x-2 overflow-x-auto py-0.5 text-xs flex-wrap gap-y-1.5">
            ${state.favorites
              .map((fid) => {
                const f = getFruit(fid);
                if (!f) return '';
                const inPlate = state.plateItems.some((item) => item.fruitId === f.id);
                return `
                  <button
                    onclick="addToPlate('${f.id}', ${f.serving_unit?.grams || 100})"
                    class="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-800 hover:text-amber-900 border border-amber-200 rounded-xl transition flex items-center space-x-1 text-xs font-medium shadow-2xs group"
                    title="快速加入 ${f.name} 到搭配 (預設 ${f.serving_unit?.grams || 100}g)"
                  >
                    <span>${f.emoji}</span>
                    <span>${f.name}</span>
                    <span class="text-3xs text-amber-600 font-bold group-hover:scale-110 transition-transform">${
                      inPlate ? '再加' : '+'
                    }</span>
                  </button>
                `;
              })
              .join('')}
            <button onclick="switchTab('catalog')" class="text-2xs text-amber-700 hover:underline px-1 py-0.5 font-medium ml-1">
              更多水果 ↗
            </button>
          </div>
        </div>
        `
            : ''
        }

        ${itemsHtml}
      </div>

            <!-- Right Column: Nutrition Summary / TFDA Label Card -->
      <div class="lg:col-span-5 sticky top-20" id="print-area">
        <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-5">
          <!-- Segmented Tab Switcher (健康攝取 vs 商品法規標籤 vs 原料成本試算) -->
          <div class="flex items-center p-1 bg-slate-100/90 rounded-2xl text-xs font-bold no-print border border-slate-200/50">
            <button
              onclick="switchPlateRightTab('summary')"
              class="flex-1 py-2 px-2 sm:px-3 rounded-xl transition flex items-center justify-center space-x-1 ${
                state.plateRightTab === 'summary'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }"
            >
              <span>📊 健康攝取</span>
            </button>
            <button
              onclick="switchPlateRightTab('label')"
              class="flex-1 py-2 px-2 sm:px-3 rounded-xl transition flex items-center justify-center space-x-1 ${
                state.plateRightTab === 'label'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }"
            >
              <span>🏷️ 法規標籤</span>
              <span class="text-3xs bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">TFDA</span>
            </button>
            <button
              onclick="switchPlateRightTab('cost')"
              class="flex-1 py-2 px-2 sm:px-3 rounded-xl transition flex items-center justify-center space-x-1 ${
                state.plateRightTab === 'cost'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }"
            >
              <span>💰 原料成本</span>
              <span class="text-3xs bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">試算</span>
            </button>
          </div>

          ${
            state.plateRightTab === 'summary'
              ? `
            <!-- Health Summary View -->
            <div class="space-y-6">
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    水果搭配綜合營養統計
                  </span>
                  <h3 class="text-lg font-bold text-slate-800 mt-2">健康攝取儀表板</h3>
                </div>
                <div class="flex items-center space-x-1.5">
                  <button onclick="exportPlateToCSV()" ${state.plateItems.length === 0 ? 'disabled' : ''} class="p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-1 text-xs font-semibold" title="匯出 CSV 試算表">
                    <span>📊 匯出 CSV</span>
                  </button>
                  <button onclick="copySummaryText()" ${state.plateItems.length === 0 ? 'disabled' : ''} class="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-1 text-xs font-medium" id="copy-btn">
                    📋 複製摘要
                  </button>
                </div>
              </div>

              <!-- Total Calories & Servings -->
              <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md flex items-center justify-between">
                <div>
                  <span class="text-xs text-slate-300 font-medium flex items-center space-x-1">
                    <span>🔥 總熱量累計</span>
                  </span>
                  <div class="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
                    ${totals.calories}
                    <span class="text-sm sm:text-base font-normal text-slate-300 ml-1.5">kcal</span>
                  </div>
                  <div class="text-xs text-slate-400 mt-1">
                    總重 ${totals.weight} g · 水分約 ${totals.water} g
                  </div>
                </div>
                <div class="text-right border-l border-slate-700/80 pl-5">
                  <div class="text-xs text-slate-300 font-medium">水果份量估算</div>
                  <div class="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
                    ${totals.servings}
                    <span class="text-xs text-slate-300 font-normal ml-1">份</span>
                  </div>
                  <div class="text-3xs text-slate-400 mt-0.5">國健署建議每日 2~3 份</div>
                </div>
              </div>

              <!-- Macronutrients ratio -->
              <div>
                <div class="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                  <span>三大營養素熱量佔比</span>
                  <span class="text-slate-400 text-3xs font-normal">碳水 / 蛋白 / 脂肪</span>
                </div>
                <div class="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div style="width: ${totals.macroPercentages.carb}%" class="bg-amber-400 h-full transition-all duration-300"></div>
                  <div style="width: ${totals.macroPercentages.protein}%" class="bg-emerald-500 h-full transition-all duration-300"></div>
                  <div style="width: ${totals.macroPercentages.fat}%" class="bg-rose-400 h-full transition-all duration-300"></div>
                </div>
                <div class="flex items-center justify-between text-2xs mt-2 text-slate-500">
                  <div class="flex items-center space-x-1">
                    <span class="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                    <span>碳水: ${totals.carbohydrates}g (${totals.macroPercentages.carb}%)</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>蛋白: ${totals.protein}g (${totals.macroPercentages.protein}%)</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                    <span>脂肪: ${totals.fat}g (${totals.macroPercentages.fat}%)</span>
                  </div>
                </div>
              </div>

              <!-- Key Health Goals -->
              <div class="space-y-3.5 pt-2 border-t border-slate-100">
                <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  關鍵健康指標 (對照每日成人標準)
                </h4>

                <!-- Vitamin C -->
                <div>
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="font-medium text-slate-700">維生素 C (每日目標 100mg)</span>
                    <span class="font-bold text-orange-600">${totals.vitamin_c} mg (${vitCPct}%)</span>
                  </div>
                  <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style="width: ${Math.min(100, vitCPct)}%" class="bg-orange-500 h-full rounded-full transition-all duration-300"></div>
                  </div>
                </div>

                <!-- Dietary Fiber -->
                <div>
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="font-medium text-slate-700">膳食纖維 (水果建議目標 ~6g)</span>
                    <span class="font-bold text-emerald-600">${totals.dietary_fiber} g (${fiberPct}%)</span>
                  </div>
                  <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style="width: ${Math.min(100, fiberPct)}%" class="bg-emerald-500 h-full rounded-full transition-all duration-300"></div>
                  </div>
                </div>

                <!-- Sugar Warning -->
                <div>
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="font-medium text-slate-700">總糖含量 (建議單次 &lt; 30g)</span>
                    <span class="font-bold ${totals.sugar > 30 ? 'text-rose-600' : 'text-amber-600'}">
                      ${totals.sugar} g ${totals.sugar > 30 ? '<span class="text-3xs text-rose-500 font-semibold">(偏高)</span>' : ''}
                    </span>
                  </div>
                  <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style="width: ${Math.min(100, sugarPct)}%" class="h-full rounded-full transition-all duration-300 ${totals.sugar > 30 ? 'bg-rose-500' : 'bg-amber-400'}"></div>
                  </div>
                </div>

                <!-- Minerals -->
                <div class="flex items-center justify-between text-xs pt-1">
                  <span class="font-medium text-slate-600">鉀離子 (電解質)</span>
                  <span class="font-bold text-slate-800">${totals.potassium} mg</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="font-medium text-slate-600">鎂元素 (放鬆神經)</span>
                  <span class="font-bold text-slate-800">${totals.magnesium} mg</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="font-medium text-slate-600">鈣質</span>
                  <span class="font-bold text-slate-800">${totals.calcium} mg</span>
                </div>
              </div>

              ${insightsHtml}
            </div>
          `
              : state.plateRightTab === 'label'
              ? `
            <!-- TFDA Nutrition Label View -->
            <div class="space-y-4">
              <div class="flex items-center justify-between no-print">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                    商品法規營養標示
                  </span>
                  <h3 class="text-base font-bold text-slate-800 mt-1">依水果搭配總重即時換算</h3>
                </div>
                <div class="flex items-center space-x-1.5">
                  <button onclick="downloadLabelImage(2)" class="px-2.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center space-x-1 active:scale-95" id="plate-download-label-btn" title="直接下載商品標籤 PNG 圖片">
                    <span>🖼️ 下載圖片</span>
                  </button>
                  <button onclick="window.print()" class="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-xs transition flex items-center space-x-1">
                    <span>🖨️ 印貼紙</span>
                  </button>
                  <button onclick="exportPlateToCSV()" class="px-2 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition flex items-center space-x-1" title="匯出商品標籤與內容明細 CSV">
                    <span>📊 CSV</span>
                  </button>
                  <button onclick="copyLabelPlainText()" class="px-2 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center space-x-1" id="copy-label-btn">
                    <span>📋 複製</span>
                  </button>
                </div>
              </div>

              <!-- Quick Packaging Config -->
              <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-2.5 text-xs no-print">
                <div>
                  <label class="font-semibold text-slate-600 block mb-1 text-2xs">商品品名</label>
                  <input
                    type="text"
                    value="${state.labelConfig.productName}"
                    oninput="handleProductNameInput(this.value)"
                    class="product-name-input-class w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="如：綜合鮮切水果盒"
                  />
                </div>

                <!-- Total Weight & Serving Controls -->
                <div class="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/70 flex items-center justify-between text-2xs">
                  <div>
                    <span class="text-slate-500">搭配總重：</span>
                    <strong class="text-emerald-800 text-xs">${totals.weight} g</strong>
                  </div>
                  <button 
                    onclick="toggleAutoSyncWeight()" 
                    class="px-2 py-0.5 rounded-md text-3xs font-bold transition flex items-center space-x-1 ${
                      state.labelConfig.autoSyncWeight
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }"
                  >
                    <span>${state.labelConfig.autoSyncWeight ? '✓ 鎖定同步總重' : '🔄 點擊同步總重'}</span>
                  </button>
                </div>

                <div class="grid grid-cols-2 gap-2.5">
                  <div>
                    <label class="font-semibold text-slate-600 block mb-1 text-2xs">每一份量 (g)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="2000" 
                      value="${state.labelConfig.servingSize}" 
                      onchange="setManualServingSize(Number(this.value))"
                      class="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center ${state.labelConfig.autoSyncWeight ? 'ring-1 ring-emerald-500 bg-emerald-50/30' : ''}"
                    />
                  </div>
                  <div>
                    <label class="font-semibold text-slate-600 block mb-1 text-2xs">本包裝含 (份)</label>
                    <input 
                      type="number" 
                      min="0.5" 
                      max="50" 
                      value="${state.labelConfig.servingsPerPkg}" 
                      onchange="updateLabelConfig('servingsPerPkg', Number(this.value)); syncLabelWeightWithPlate();"
                      class="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                    />
                  </div>
                </div>

                <!-- Format toggle -->
                <div class="flex items-center space-x-2 pt-1">
                  <button 
                    onclick="updateLabelConfig('labelFormat', 'dual')" 
                    class="flex-1 py-1 rounded-lg text-2xs font-semibold transition ${state.labelConfig.labelFormat === 'dual' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}"
                  >
                    雙欄式 (每份+每100g)
                  </button>
                  <button 
                    onclick="updateLabelConfig('labelFormat', 'percent')" 
                    class="flex-1 py-1 rounded-lg text-2xs font-semibold transition ${state.labelConfig.labelFormat === 'percent' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}"
                  >
                    參考值百分比 (%)
                  </button>
                </div>

                <!-- Voluntary checkboxes -->
                <div class="flex items-center justify-between text-2xs text-slate-600 pt-1 border-t border-slate-200/60">
                  <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" ${state.labelConfig.includeFiber ? 'checked' : ''} onchange="updateLabelConfig('includeFiber', this.checked)" class="accent-emerald-600 rounded-sm" />
                    <span>纖維</span>
                  </label>
                  <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" ${state.labelConfig.includeVitaminC ? 'checked' : ''} onchange="updateLabelConfig('includeVitaminC', this.checked)" class="accent-emerald-600 rounded-sm" />
                    <span>維C</span>
                  </label>
                  <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" ${state.labelConfig.includePotassium ? 'checked' : ''} onchange="updateLabelConfig('includePotassium', this.checked)" class="accent-emerald-600 rounded-sm" />
                    <span>鉀</span>
                  </label>
                  <button onclick="switchTab('label')" class="text-emerald-700 hover:underline font-semibold">
                    進階獨立頁 ↗
                  </button>
                </div>
              </div>

              <!-- The Real-time Printable Label Sticker -->
              <div id="sticker-wrapper">
                ${
                  state.plateItems.length === 0
                    ? `
                  <div class="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    請先在左側加入水果搭配，即可即時在此產出商品法規標籤貼紙！
                  </div>
                `
                    : (() => {
                        const { base100g, perServing } = getLabelNutrients();
                        return `
                          <div class="label-product-name-display text-center font-bold text-xs text-slate-700 mb-2 bg-white py-1 px-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            ${state.labelConfig.productName || '未命名商品'}
                          </div>
                          ${renderTFDALabelCardHtml(base100g, perServing, state.labelConfig)}
                        `;
                      })()
                }
              </div>

              <p class="text-3xs text-slate-400 text-center no-print">
                💡 依左側水果公克數即時加權計算，修改水果時標籤同步更新。
              </p>
            </div>
          `
            : getPlateCostViewHtml()
          }
        </div>
      </div>
    </div>
  `;
}

function attachPlateEvents() {}

// ==========================================
// 2. 商品法規營養標示生成器 (TFDA Label)
// ==========================================

function renderTFDALabelCardHtml(base100g, perServing, cfg) {
  const isDual = cfg.labelFormat === 'dual';
  return `
    <div id="printable-label-card" class="bg-white border-2 border-black p-4 text-black font-sans text-xs select-text shadow-md mx-auto max-w-[320px] transition">
      <!-- 標題 -->
      <div class="text-center font-extrabold text-base tracking-widest border-b-2 border-black pb-1 mb-2">
        營 養 標 示
      </div>

      <!-- 份量說明 -->
      <div class="space-y-0.5 pb-1.5 border-b border-black text-2xs">
        <div class="flex justify-between font-bold">
          <span>每一份量</span>
          <span>${cfg.servingSize} 公克</span>
        </div>
        <div class="flex justify-between font-bold">
          <span>本包裝含</span>
          <span>${cfg.servingsPerPkg} 份</span>
        </div>
      </div>

      <!-- 欄位抬頭 -->
      <div class="flex justify-between items-end font-bold border-b border-black py-1 text-2xs">
        <span class="w-28"></span>
        ${
          isDual
            ? `
          <span class="w-16 text-right">每份</span>
          <span class="w-20 text-right">每 100公克</span>
        `
            : `
          <span class="w-16 text-right">每份</span>
          <span class="w-24 text-right">每日參考值<br/>百分比</span>
        `
        }
      </div>

      <!-- 八大法定項目 -->
      <div class="divide-y divide-gray-200 text-xs font-medium">
        <!-- 熱量 -->
        <div class="flex justify-between py-0.5">
          <span class="font-bold">熱量</span>
          <span class="w-16 text-right">${fmtTFDANut(perServing.calories, 'calories')} 大卡</span>
          ${isDual ? `<span class="w-20 text-right">${fmtTFDANut(base100g.calories, 'calories')} 大卡</span>` : `<span class="w-24 text-right">${calcDailyPct(perServing.calories, 'calories')}</span>`}
        </div>

        <!-- 蛋白質 -->
        <div class="flex justify-between py-0.5">
          <span class="font-bold">蛋白質</span>
          <span class="w-16 text-right">${fmtTFDANut(perServing.protein, 'protein')} 公克</span>
          ${isDual ? `<span class="w-20 text-right">${fmtTFDANut(base100g.protein, 'protein')} 公克</span>` : `<span class="w-24 text-right">${calcDailyPct(perServing.protein, 'protein')}</span>`}
        </div>

        <!-- 脂肪 -->
        <div class="flex justify-between py-0.5">
          <span class="font-bold">脂肪</span>
          <span class="w-16 text-right">${fmtTFDANut(perServing.fat, 'fat')} 公克</span>
          ${isDual ? `<span class="w-20 text-right">${fmtTFDANut(base100g.fat, 'fat')} 公克</span>` : `<span class="w-24 text-right">${calcDailyPct(perServing.fat, 'fat')}</span>`}
        </div>

        <!-- 飽和脂肪 -->
        <div class="flex justify-between py-0.5 pl-3 text-slate-700">
          <span>飽和脂肪</span>
          <span class="w-16 text-right">${fmtTFDANut(perServing.saturated_fat, 'saturated_fat')} 公克</span>
          ${isDual ? `<span class="w-20 text-right">${fmtTFDANut(base100g.saturated_fat, 'saturated_fat')} 公克</span>` : `<span class="w-24 text-right">${calcDailyPct(perServing.saturated_fat, 'saturated_fat')}</span>`}
        </div>

        <!-- 反式脂肪 -->
        <div class="flex justify-between py-0.5 pl-3 text-slate-700">
          <span>反式脂肪</span>
          <span class="w-16 text-right">${fmtTFDANut(perServing.trans_fat, 'trans_fat')} 公克</span>
          ${isDual ? `<span class="w-20 text-right">${fmtTFDANut(base100g.trans_fat, 'trans_fat')} 公克</span>` : `<span class="w-24 text-right">*</span>`}
        </div>

        <!-- 碳水化合物 -->
        <div class="flex justify-between py-0.5">
          <span class="font-bold">碳水化合物</span>
          <span class="w-16 text-right">${fmtTFDANut(perServing.carbohydrates, 'carbohydrates')} 公克</span>
          ${isDual ? `<span class="w-20 text-right">${fmtTFDANut(base100g.carbohydrates, 'carbohydrates')} 公克</span>` : `<span class="w-24 text-right">${calcDailyPct(perServing.carbohydrates, 'carbohydrates')}</span>`}
        </div>

        <!-- 糖 -->
        <div class="flex justify-between py-0.5 pl-3 text-slate-700">
          <span>糖</span>
          <span class="w-16 text-right">${fmtTFDANut(perServing.sugar, 'sugar')} 公克</span>
          ${isDual ? `<span class="w-20 text-right">${fmtTFDANut(base100g.sugar, 'sugar')} 公克</span>` : `<span class="w-24 text-right">*</span>`}
        </div>

        <!-- 鈉 -->
        <div class="flex justify-between py-0.5">
          <span class="font-bold">鈉</span>
          <span class="w-16 text-right">${fmtTFDANut(perServing.sodium, 'sodium')} 毫克</span>
          ${isDual ? `<span class="w-20 text-right">${fmtTFDANut(base100g.sodium, 'sodium')} 毫克</span>` : `<span class="w-24 text-right">${calcDailyPct(perServing.sodium, 'sodium')}</span>`}
        </div>

        <!-- 自選項目：膳食纖維 -->
        ${
          cfg.includeFiber
            ? `
          <div class="flex justify-between py-0.5">
            <span>膳食纖維</span>
            <span class="w-16 text-right">${fmtTFDANut(perServing.dietary_fiber, 'dietary_fiber')} 公克</span>
            ${isDual ? `<span class="w-20 text-right">${fmtTFDANut(base100g.dietary_fiber, 'dietary_fiber')} 公克</span>` : `<span class="w-24 text-right">${calcDailyPct(perServing.dietary_fiber, 'dietary_fiber')}</span>`}
          </div>
        `
            : ''
        }

        <!-- 自選項目：維生素 C -->
        ${
          cfg.includeVitaminC
            ? `
          <div class="flex justify-between py-0.5">
            <span>維生素 C</span>
            <span class="w-16 text-right">${fmtTFDANut(perServing.vitamin_c, 'vitamin_c')} 毫克</span>
            ${isDual ? `<span class="w-20 text-right">${fmtTFDANut(base100g.vitamin_c, 'vitamin_c')} 毫克</span>` : `<span class="w-24 text-right">${calcDailyPct(perServing.vitamin_c, 'vitamin_c')}</span>`}
          </div>
        `
            : ''
        }

        <!-- 自選項目：鉀 -->
        ${
          cfg.includePotassium
            ? `
          <div class="flex justify-between py-0.5">
            <span>鉀</span>
            <span class="w-16 text-right">${fmtTFDANut(perServing.potassium, 'potassium')} 毫克</span>
            ${isDual ? `<span class="w-20 text-right">${fmtTFDANut(base100g.potassium, 'potassium')} 毫克</span>` : `<span class="w-24 text-right">${calcDailyPct(perServing.potassium, 'potassium')}</span>`}
          </div>
        `
            : ''
        }
      </div>

      <!-- 註釋 -->
      ${
        !isDual
          ? `
        <div class="border-t border-black mt-2 pt-1 text-3xs text-gray-700 leading-tight">
          * 參考值未訂定<br/>
          每日參考值：熱量 2000 大卡、蛋白質 60 公克、脂肪 60 公克、飽和脂肪 18 公克、碳水化合物 300 公克、鈉 2000 毫克、膳食纖維 25 公克。
        </div>
      `
          : ''
      }
    </div>
  `;
}

function getLabelNutrients() {
  const cfg = state.labelConfig || {};
  let base100g = {};

  if (cfg.sourceType === 'plate') {
    const totals = calcTotals();
    const w = totals.weight || 100;
    // 計算每 100g 平均值 (衛福部食藥署資料庫加權)
    base100g = {
      calories: (totals.calories / w) * 100,
      protein: (totals.protein / w) * 100,
      fat: (totals.fat / w) * 100,
      saturated_fat: (totals.saturated_fat / w) * 100,
      trans_fat: (totals.trans_fat / w) * 100,
      carbohydrates: (totals.carbohydrates / w) * 100,
      sugar: (totals.sugar / w) * 100,
      sodium: (totals.sodium / w) * 100,
      dietary_fiber: (totals.dietary_fiber / w) * 100,
      vitamin_c: (totals.vitamin_c / w) * 100,
      potassium: (totals.potassium / w) * 100,
    };
  } else {
    const fruit = getFruit(cfg.singleFruitId);
    const raw = fruit.nutrition_per_100g;
    base100g = {
      calories: raw.calories,
      protein: raw.protein,
      fat: raw.fat,
      saturated_fat: raw.saturated_fat || 0,
      trans_fat: raw.trans_fat || 0,
      carbohydrates: raw.carbohydrates,
      sugar: raw.sugar,
      sodium: raw.sodium,
      dietary_fiber: raw.dietary_fiber,
      vitamin_c: raw.vitamin_c,
      potassium: raw.potassium,
    };
  }

  // 熱量計算方式 (依《包裝食品營養標示應遵行事項》第六點規定)
  // 'database': 衛福部食藥署食品營養成分資料庫之檢驗實測值加權彙總 (預設)
  // 'factor': 依公告能量係數公式換算：蛋白質×4 + 脂肪×9 + (碳水化合物-膳食纖維)×4 + 膳食纖維×2
  if (cfg.calorieMethod === 'factor') {
    const p = base100g.protein || 0;
    const f = base100g.fat || 0;
    const c = base100g.carbohydrates || 0;
    const fiber = cfg.includeFiber ? (base100g.dietary_fiber || 0) : 0;
    const effectiveCarb = Math.max(0, c - fiber);
    base100g.calories = (p * 4) + (f * 9) + (effectiveCarb * 4) + (fiber * 2);
  }

  // 計算每份數值
  const servingRatio = (cfg.servingSize || 100) / 100;
  const perServing = {};
  Object.keys(base100g).forEach((k) => {
    perServing[k] = base100g[k] * servingRatio;
  });

  return { base100g, perServing };
}


// ==========================================
// TFDA 商品法規標籤圖片與向量圖檔生成與下載引擎 (Label Image & SVG Export Engine)
// ==========================================

function getLabelDataForExport() {
  const cfg = state.labelConfig || {};
  const { base100g, perServing } = getLabelNutrients();
  const isDual = cfg.labelFormat === 'dual';

  const rows = [
    {
      name: '熱量',
      perServing: `${fmtTFDANut(perServing.calories, 'calories')} 大卡`,
      col2: isDual ? `${fmtTFDANut(base100g.calories, 'calories')} 大卡` : calcDailyPct(perServing.calories, 'calories'),
      bold: true,
      indent: 0
    },
    {
      name: '蛋白質',
      perServing: `${fmtTFDANut(perServing.protein, 'protein')} 公克`,
      col2: isDual ? `${fmtTFDANut(base100g.protein, 'protein')} 公克` : calcDailyPct(perServing.protein, 'protein'),
      bold: true,
      indent: 0
    },
    {
      name: '脂肪',
      perServing: `${fmtTFDANut(perServing.fat, 'fat')} 公克`,
      col2: isDual ? `${fmtTFDANut(base100g.fat, 'fat')} 公克` : calcDailyPct(perServing.fat, 'fat'),
      bold: true,
      indent: 0
    },
    {
      name: '飽和脂肪',
      perServing: `${fmtTFDANut(perServing.saturated_fat, 'saturated_fat')} 公克`,
      col2: isDual ? `${fmtTFDANut(base100g.saturated_fat, 'saturated_fat')} 公克` : calcDailyPct(perServing.saturated_fat, 'saturated_fat'),
      bold: false,
      indent: 14
    },
    {
      name: '反式脂肪',
      perServing: `${fmtTFDANut(perServing.trans_fat, 'trans_fat')} 公克`,
      col2: isDual ? `${fmtTFDANut(base100g.trans_fat, 'trans_fat')} 公克` : '*',
      bold: false,
      indent: 14
    },
    {
      name: '碳水化合物',
      perServing: `${fmtTFDANut(perServing.carbohydrates, 'carbohydrates')} 公克`,
      col2: isDual ? `${fmtTFDANut(base100g.carbohydrates, 'carbohydrates')} 公克` : calcDailyPct(perServing.carbohydrates, 'carbohydrates'),
      bold: true,
      indent: 0
    },
    {
      name: '糖',
      perServing: `${fmtTFDANut(perServing.sugar, 'sugar')} 公克`,
      col2: isDual ? `${fmtTFDANut(base100g.sugar, 'sugar')} 公克` : '*',
      bold: false,
      indent: 14
    },
    {
      name: '鈉',
      perServing: `${fmtTFDANut(perServing.sodium, 'sodium')} 毫克`,
      col2: isDual ? `${fmtTFDANut(base100g.sodium, 'sodium')} 毫克` : calcDailyPct(perServing.sodium, 'sodium'),
      bold: true,
      indent: 0
    }
  ];

  if (cfg.includeFiber) {
    rows.push({
      name: '膳食纖維',
      perServing: `${fmtTFDANut(perServing.dietary_fiber, 'dietary_fiber')} 公克`,
      col2: isDual ? `${fmtTFDANut(base100g.dietary_fiber, 'dietary_fiber')} 公克` : calcDailyPct(perServing.dietary_fiber, 'dietary_fiber'),
      bold: false,
      indent: 0
    });
  }
  if (cfg.includeVitaminC) {
    rows.push({
      name: '維生素 C',
      perServing: `${fmtTFDANut(perServing.vitamin_c, 'vitamin_c')} 毫克`,
      col2: isDual ? `${fmtTFDANut(base100g.vitamin_c, 'vitamin_c')} 毫克` : calcDailyPct(perServing.vitamin_c, 'vitamin_c'),
      bold: false,
      indent: 0
    });
  }
  if (cfg.includePotassium) {
    rows.push({
      name: '鉀',
      perServing: `${fmtTFDANut(perServing.potassium, 'potassium')} 毫克`,
      col2: isDual ? `${fmtTFDANut(base100g.potassium, 'potassium')} 毫克` : calcDailyPct(perServing.potassium, 'potassium'),
      bold: false,
      indent: 0
    });
  }

  return {
    cfg,
    isDual,
    rows,
    productName: (cfg.productName || '未命名商品').trim(),
    servingSize: Number(cfg.servingSize) || 100,
    servingsPerPkg: Number(cfg.servingsPerPkg) || 1
  };
}

/**
 * 產生 1:1 標準與高解析度 (Retina / 300 DPI) 的 HTML5 標籤畫布
 */
function generateLabelCanvas(scale = 2) {
  if (typeof document === 'undefined') return null;

  const data = getLabelDataForExport();
  const { isDual, rows, productName, servingSize, servingsPerPkg } = data;

  const cardW = 340;
  const pad = 16;
  const canvasW = cardW + pad * 2;

  // 計算動態高度
  let h = pad;
  if (productName) {
    h += 28;
  }
  h += 40; // 標題「營養標示」
  h += 44; // 份量說明
  h += 28; // 欄位表頭
  h += rows.length * 24; // 營養成分列
  if (!isDual) {
    h += 56; // 每日參考值註腳
  }
  h += 12; // 邊框底邊內距
  const outerBoxH = h - pad;
  h += 28; // 底端 TFDA 宣告
  const canvasH = h;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(canvasW * scale);
  canvas.height = Math.round(canvasH * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(scale, scale);

  // 背景純白填滿
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // 黑色外框 (實體貼紙樣式)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(pad, pad, cardW, outerBoxH);

  let curY = pad;

  // 1. 商品品名 (貼紙內頂部標示)
  if (productName) {
    curY += 18;
    ctx.font = 'bold 12px "PingFang TC", "Microsoft JhengHei", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';
    ctx.fillText(`品名：${productName}`, pad + cardW / 2, curY);

    curY += 8;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad + 12, curY);
    ctx.lineTo(pad + cardW - 12, curY);
    ctx.stroke();
  }

  // 2. 標題「營 養 標 示」
  curY += 24;
  ctx.font = '900 18px "PingFang TC", "Microsoft JhengHei", system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText('營  養  標  示', pad + cardW / 2, curY);

  curY += 8;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, curY);
  ctx.lineTo(pad + cardW, curY);
  ctx.stroke();

  // 3. 份量說明
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px "PingFang TC", "Microsoft JhengHei", system-ui, -apple-system, sans-serif';

  curY += 17;
  ctx.textAlign = 'left';
  ctx.fillText('每一份量', pad + 10, curY);
  ctx.textAlign = 'right';
  ctx.fillText(`${servingSize} 公克`, pad + cardW - 10, curY);

  curY += 16;
  ctx.textAlign = 'left';
  ctx.fillText('本包裝含', pad + 10, curY);
  ctx.textAlign = 'right';
  ctx.fillText(`${servingsPerPkg} 份`, pad + cardW - 10, curY);

  curY += 8;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, curY);
  ctx.lineTo(pad + cardW, curY);
  ctx.stroke();

  // 4. 欄位表頭
  curY += 16;
  ctx.font = 'bold 11px "PingFang TC", "Microsoft JhengHei", system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#000000';
  const col2X = isDual ? pad + cardW - 95 : pad + cardW - 110;
  const col3X = pad + cardW - 10;

  ctx.textAlign = 'right';
  ctx.fillText('每份', col2X, curY);
  if (isDual) {
    ctx.fillText('每 100公克', col3X, curY);
  } else {
    ctx.fillText('每日參考值百分比', col3X, curY);
  }

  curY += 8;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, curY);
  ctx.lineTo(pad + cardW, curY);
  ctx.stroke();

  // 5. 各項營養成分資料列
  rows.forEach((r, idx) => {
    curY += 16;
    ctx.textAlign = 'left';
    ctx.font = r.bold
      ? 'bold 11px "PingFang TC", "Microsoft JhengHei", system-ui, -apple-system, sans-serif'
      : 'normal 11px "PingFang TC", "Microsoft JhengHei", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = r.indent > 0 ? '#334155' : '#000000';
    ctx.fillText(r.name, pad + 10 + r.indent, curY);

    ctx.textAlign = 'right';
    ctx.font = 'normal 11px "PingFang TC", "Microsoft JhengHei", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(r.perServing, col2X, curY);
    ctx.fillText(r.col2, col3X, curY);

    curY += 8;
    if (idx < rows.length - 1) {
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(pad + 10, curY);
      ctx.lineTo(pad + cardW - 10, curY);
      ctx.stroke();
    }
  });

  // 6. 每日參考值註腳 (格式二 參考值百分比)
  if (!isDual) {
    curY += 2;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, curY);
    ctx.lineTo(pad + cardW, curY);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = 'normal 9px "PingFang TC", "Microsoft JhengHei", system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    curY += 12;
    ctx.fillText('* 參考值未訂定', pad + 8, curY);
    curY += 12;
    ctx.fillText('每日參考值：熱量 2000 大卡、蛋白質 60 公克、脂肪 60 公克、', pad + 8, curY);
    curY += 12;
    ctx.fillText('飽和脂肪 18 公克、碳水化合物 300 公克、鈉 2000 毫克。', pad + 8, curY);
    curY += 6;
  }

  // 7. 貼紙外框下方標示
  curY = outerBoxH + pad + 18;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'normal 9px "PingFang TC", "Microsoft JhengHei", system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('衛福部食藥署 TFDA《包裝食品營養標示應遵行事項》標準格式 · Cfruit 產出', pad + cardW / 2, curY);

  return canvas;
}

/**
 * 匯出並觸發直接下載標籤 PNG 圖片檔案
 * @param {number} scale 1: 螢幕標準, 2: Retina 雙倍高清, 3: 300 DPI 印刷規格
 */
function downloadLabelImage(scale = 2) {
  const canvas = generateLabelCanvas(scale);
  if (!canvas) {
    if (typeof alert === 'function') alert('無法建立標籤畫布，請稍後重試。');
    return;
  }

  const cfg = state.labelConfig || {};
  const rawName = (cfg.productName || '營養標示').trim();
  const safeName = rawName.replace(/[\\/:*?"<>|]/g, '_');
  const dpiTag = scale >= 3 ? '_300DPI_高清印刷' : '';
  const filename = `${safeName}_TFDA法規標籤${dpiTag}.png`;

  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 回饋動態視覺文字
    const btns = [
      document.getElementById('download-label-img-btn'),
      document.getElementById('plate-download-label-btn')
    ];
    btns.forEach(btn => {
      if (btn) {
        const origHtml = btn.innerHTML;
        btn.innerHTML = '<span>✅ 圖片已下載！</span>';
        setTimeout(() => {
          btn.innerHTML = origHtml;
        }, 2000);
      }
    });
  } catch (err) {
    console.error('下載圖片失敗:', err);
    if (typeof alert === 'function') alert('下載圖片失敗，請嘗試使用「列印標籤貼紙」功能另存 PDF。');
  }
}

/**
 * 產生向量格式 SVG 標籤字串 (適用於設計軟體 Illustrator / 向量標籤機)
 */
function generateLabelSVG() {
  const data = getLabelDataForExport();
  const { isDual, rows, productName, servingSize, servingsPerPkg } = data;

  const cardW = 340;
  const pad = 16;
  const totalW = cardW + pad * 2;

  let h = pad;
  if (productName) h += 28;
  h += 40; // 標題
  h += 44; // 份量
  h += 28; // 表頭
  h += rows.length * 24;
  if (!isDual) h += 56;
  h += 12;
  const outerBoxH = h - pad;
  h += 28;
  const totalH = h;

  let curY = pad;
  const elements = [];

  // 背景與外框
  elements.push(`<rect width="${totalW}" height="${totalH}" fill="#ffffff"/>`);
  elements.push(`<rect x="${pad}" y="${pad}" width="${cardW}" height="${outerBoxH}" fill="#ffffff" stroke="#000000" stroke-width="2"/>`);

  if (productName) {
    curY += 18;
    elements.push(`<text x="${pad + cardW / 2}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">品名：${productName}</text>`);
    curY += 8;
    elements.push(`<line x1="${pad + 12}" y1="${curY}" x2="${pad + cardW - 12}" y2="${curY}" stroke="#e2e8f0" stroke-width="1"/>`);
  }

  curY += 24;
  elements.push(`<text x="${pad + cardW / 2}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="18" font-weight="900" fill="#000000" text-anchor="middle">營  養  標  示</text>`);
  curY += 8;
  elements.push(`<line x1="${pad}" y1="${curY}" x2="${pad + cardW}" y2="${curY}" stroke="#000000" stroke-width="2"/>`);

  curY += 17;
  elements.push(`<text x="${pad + 10}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="11" font-weight="bold" fill="#000000" text-anchor="start">每一份量</text>`);
  elements.push(`<text x="${pad + cardW - 10}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="11" font-weight="bold" fill="#000000" text-anchor="end">${servingSize} 公克</text>`);

  curY += 16;
  elements.push(`<text x="${pad + 10}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="11" font-weight="bold" fill="#000000" text-anchor="start">本包裝含</text>`);
  elements.push(`<text x="${pad + cardW - 10}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="11" font-weight="bold" fill="#000000" text-anchor="end">${servingsPerPkg} 份</text>`);

  curY += 8;
  elements.push(`<line x1="${pad}" y1="${curY}" x2="${pad + cardW}" y2="${curY}" stroke="#000000" stroke-width="1"/>`);

  curY += 16;
  const col2X = isDual ? pad + cardW - 95 : pad + cardW - 110;
  const col3X = pad + cardW - 10;
  elements.push(`<text x="${col2X}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="11" font-weight="bold" fill="#000000" text-anchor="end">每份</text>`);
  elements.push(`<text x="${col3X}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="11" font-weight="bold" fill="#000000" text-anchor="end">${isDual ? '每 100公克' : '每日參考值百分比'}</text>`);

  curY += 8;
  elements.push(`<line x1="${pad}" y1="${curY}" x2="${pad + cardW}" y2="${curY}" stroke="#000000" stroke-width="1"/>`);

  rows.forEach((r, idx) => {
    curY += 16;
    const fw = r.bold ? 'bold' : 'normal';
    const fc = r.indent > 0 ? '#334155' : '#000000';
    elements.push(`<text x="${pad + 10 + r.indent}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="11" font-weight="${fw}" fill="${fc}" text-anchor="start">${r.name}</text>`);
    elements.push(`<text x="${col2X}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="11" fill="#000000" text-anchor="end">${r.perServing}</text>`);
    elements.push(`<text x="${col3X}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="11" fill="#000000" text-anchor="end">${r.col2}</text>`);

    curY += 8;
    if (idx < rows.length - 1) {
      elements.push(`<line x1="${pad + 10}" y1="${curY}" x2="${pad + cardW - 10}" y2="${curY}" stroke="#f1f5f9" stroke-width="0.5"/>`);
    }
  });

  if (!isDual) {
    curY += 2;
    elements.push(`<line x1="${pad}" y1="${curY}" x2="${pad + cardW}" y2="${curY}" stroke="#000000" stroke-width="1"/>`);
    curY += 12;
    elements.push(`<text x="${pad + 8}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="9" fill="#475569">* 參考值未訂定</text>`);
    curY += 12;
    elements.push(`<text x="${pad + 8}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="9" fill="#475569">每日參考值：熱量 2000 大卡、蛋白質 60 公克、脂肪 60 公克、</text>`);
    curY += 12;
    elements.push(`<text x="${pad + 8}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="9" fill="#475569">飽和脂肪 18 公克、碳水化合物 300 公克、鈉 2000 毫克。</text>`);
  }

  curY = outerBoxH + pad + 18;
  elements.push(`<text x="${pad + cardW / 2}" y="${curY}" font-family="'PingFang TC', 'Microsoft JhengHei', sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">衛福部食藥署 TFDA《包裝食品營養標示應遵行事項》標準格式 · Cfruit 產出</text>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">\n${elements.join('\n')}\n</svg>`;
}

/**
 * 匯出並下載向量 SVG 標籤檔案
 */
function downloadLabelSVG() {
  const svgStr = generateLabelSVG();
  const cfg = state.labelConfig || {};
  const rawName = (cfg.productName || '營養標示').trim();
  const safeName = rawName.replace(/[\\/:*?"<>|]/g, '_');
  const filename = `${safeName}_TFDA法規標籤.svg`;

  if (typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

// 暴露至全域物件便於外部呼叫與自動化測試
if (typeof window !== 'undefined') {
  window.getLabelDataForExport = getLabelDataForExport;
  window.generateLabelCanvas = generateLabelCanvas;
  window.downloadLabelImage = downloadLabelImage;
  window.generateLabelSVG = generateLabelSVG;
  window.downloadLabelSVG = downloadLabelSVG;
  window.getLabelGeneratorHtml = getLabelGeneratorHtml;
  window.getLabelNutrients = getLabelNutrients;
}


/**
 * 將使用者先前儲存的水果搭配 (食譜) 一鍵套用至營養標籤生成器
 */
function applySavedRecipeToLabel(recipeId) {
  if (!recipeId) return;
  const r = (state.savedRecipes || []).find((item) => item.id === recipeId);
  if (!r) return;

  // 載入該食譜至目前水果工作台
  state.plateItems = JSON.parse(JSON.stringify(r.plateItems || []));

  // 記錄當前套用之食譜 ID
  state.activeLabelRecipeId = recipeId;

  // 自動帶入品名與規格
  if (!state.labelConfig) state.labelConfig = {};
  state.labelConfig.sourceType = 'plate';
  state.labelConfig.productName = r.name || state.labelConfig.productName || '未命名商品';

  const totalW = r.totalWeight || calcTotals().weight;
  if (totalW > 0) {
    state.labelConfig.servingSize = totalW;
  }

  // 若該搭配有保存標籤進階自選設定，同步還原
  if (r.labelConfig) {
    if (r.labelConfig.servingsPerPkg) state.labelConfig.servingsPerPkg = r.labelConfig.servingsPerPkg;
    if (r.labelConfig.labelFormat) state.labelConfig.labelFormat = r.labelConfig.labelFormat;
    if (r.labelConfig.includeFiber !== undefined) state.labelConfig.includeFiber = r.labelConfig.includeFiber;
    if (r.labelConfig.includeVitaminC !== undefined) state.labelConfig.includeVitaminC = r.labelConfig.includeVitaminC;
    if (r.labelConfig.includePotassium !== undefined) state.labelConfig.includePotassium = r.labelConfig.includePotassium;
  }

  if (r.fruitCosts) state.fruitCosts = JSON.parse(JSON.stringify(r.fruitCosts));
  if (r.costConfig) state.costConfig = JSON.parse(JSON.stringify(r.costConfig));

  autoSaveCurrentState();
  renderTabContent();
}

function handleLabelSourceChange(val) {
  if (val.startsWith('recipe:')) {
    const rId = val.replace('recipe:', '');
    applySavedRecipeToLabel(rId);
  } else if (val === 'single') {
    state.activeLabelRecipeId = null;
    updateLabelConfig('sourceType', 'single');
  } else {
    state.activeLabelRecipeId = null;
    updateLabelConfig('sourceType', 'plate');
  }
}

if (typeof window !== 'undefined') {
  window.applySavedRecipeToLabel = applySavedRecipeToLabel;
  window.handleLabelSourceChange = handleLabelSourceChange;
}

function getLabelGeneratorHtml() {
  const cfg = state.labelConfig;
  const { base100g, perServing } = getLabelNutrients();

  // 格式化輸出字串 (符合食藥署規範)
  const isDual = cfg.labelFormat === 'dual';

  // 渲染法規標準標籤 HTML
  const labelTableHtml = renderTFDALabelCardHtml(base100g, perServing, cfg);

  return `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <h2 class="text-xl font-bold text-slate-800">商品法規營養標示生成器</h2>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              衛福部 TFDA 標準格式
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            適用於生鮮切片水果盒、綜合水果沙拉、果汁杯、無添加果乾等商品包裝標籤貼紙製作。
          </p>
        </div>

        <div class="flex items-center space-x-2 flex-wrap gap-y-2">
          <button onclick="downloadLabelImage(2)" class="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center space-x-1.5 active:scale-95 shrink-0" id="download-label-img-btn" title="直接下載高畫質 PNG 標籤貼紙圖片">
            <span>🖼️ 下載標籤圖片 (PNG)</span>
          </button>
          <button onclick="window.print()" class="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-xs transition flex items-center space-x-1.5 shrink-0">
            <span>🖨️ 列印標籤貼紙</span>
          </button>
          <button onclick="copyLabelPlainText()" class="px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition flex items-center space-x-1 shrink-0" id="copy-label-btn">
            <span>📋 複製純文字</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left: Configuration Form (7 cols) -->
        <div class="lg:col-span-7 space-y-4" id="label-config-panel">
          <!-- 📚 我的已存水果搭配選單 (Saved Fruit Recipes Dropdown & Cards) -->
          <div class="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 rounded-3xl p-6 shadow-soft border border-emerald-200/90 space-y-4">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center space-x-2">
                <span class="text-base">📚</span>
                <h3 class="text-sm font-extrabold text-emerald-950">我的已存水果搭配 (直接套用生成標籤)</h3>
                <span class="text-3xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200/80">
                  ${(state.savedRecipes || []).length} 筆配方
                </span>
              </div>
              <div class="flex items-center space-x-1.5">
                <button
                  onclick="restoreCommercialRecipes()"
                  class="text-3xs font-bold text-slate-600 hover:text-emerald-700 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 transition shadow-2xs"
                  title="重新同步官方 37 款商業配方"
                >
                  🔄 同步37款配方
                </button>
                <button
                  onclick="openRecipesModal()"
                  class="text-3xs font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition shadow-2xs"
                  title="查看或修改已存搭配清單"
                >
                  ⚙️ 管理配方庫
                </button>
              </div>
            </div>

            ${(state.savedRecipes || []).length > 0 ? (() => {
              const allRecs = state.savedRecipes || [];
              const xgdRecs = allRecs.filter(r => r.zone === '鮮果多區');
              const csRecs = allRecs.filter(r => r.zone === '超商區');
              const rdRecs = allRecs.filter(r => r.zone === 'R&D研發中');
              const customRecs = allRecs.filter(r => !r.zone || (r.zone !== '鮮果多區' && r.zone !== '超商區' && r.zone !== 'R&D研發中'));

              const currentZone = state.labelRecipeZone || 'all';
              let displayRecs = allRecs;
              if (currentZone === '鮮果多區') displayRecs = xgdRecs;
              else if (currentZone === '超商區') displayRecs = csRecs;
              else if (currentZone === 'R&D研發中') displayRecs = rdRecs;
              else if (currentZone === '自訂搭配') displayRecs = customRecs;

              return `
                <!-- 分區切換標籤頁 (Zone Filter Tabs) -->
                <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 text-2xs border-b border-emerald-200/60">
                  <button
                    onclick="setLabelRecipeZone('all')"
                    class="px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${currentZone === 'all' ? 'bg-emerald-700 text-white shadow-2xs' : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200/80'}"
                  >
                    全部 (${allRecs.length})
                  </button>
                  <button
                    onclick="setLabelRecipeZone('鮮果多區')"
                    class="px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center space-x-1 ${currentZone === '鮮果多區' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'}"
                  >
                    <span>🏪 鮮果多區</span>
                    <span class="text-3xs font-mono opacity-80">(${xgdRecs.length})</span>
                  </button>
                  <button
                    onclick="setLabelRecipeZone('超商區')"
                    class="px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center space-x-1 ${currentZone === '超商區' ? 'bg-sky-600 text-white shadow-2xs' : 'bg-white text-sky-800 hover:bg-sky-50 border border-sky-200'}"
                  >
                    <span>🏬 超商區</span>
                    <span class="text-3xs font-mono opacity-80">(${csRecs.length})</span>
                  </button>
                  <button
                    onclick="setLabelRecipeZone('R&D研發中')"
                    class="px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center space-x-1 ${currentZone === 'R&D研發中' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'}"
                  >
                    <span>🔬 R&D研發中</span>
                    <span class="text-3xs font-mono opacity-80">(${rdRecs.length})</span>
                  </button>
                  ${customRecs.length > 0 ? `
                    <button
                      onclick="setLabelRecipeZone('自訂搭配')"
                      class="px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center space-x-1 ${currentZone === '自訂搭配' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-white text-purple-800 hover:bg-purple-50 border border-purple-200'}"
                    >
                      <span>📝 自訂搭配</span>
                      <span class="text-3xs font-mono opacity-80">(${customRecs.length})</span>
                    </button>
                  ` : ''}
                </div>

                <!-- 下拉選單快速選取器 (按分區分組 Optgroup) -->
                <div class="space-y-1.5">
                  <label class="text-2xs font-bold text-slate-600 block flex items-center justify-between">
                    <span>從下拉選單選擇配方 (自動按分區歸納)：</span>
                    <span class="text-3xs text-emerald-700 font-medium">選取後即刻自動帶入品名、克數與加權營養成分</span>
                  </label>
                  <select
                    id="label-saved-recipe-dropdown"
                    onchange="applySavedRecipeToLabel(this.value)"
                    class="w-full px-3.5 py-2.5 bg-white border-2 border-emerald-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-xs cursor-pointer"
                  >
                    <option value="">-- 請點此展開選單，選擇要套用至法規標籤的水果搭配 --</option>
                    ${xgdRecs.length > 0 ? `
                      <optgroup label="🏪 鮮果多區 (${xgdRecs.length} 款)">
                        ${xgdRecs.map(r => {
                          const fruitNames = (r.plateItems || []).map(item => {
                            const f = getFruit(item.fruitId);
                            return f ? f.name : item.fruitId;
                          }).join(' + ');
                          const isSelected = state.activeLabelRecipeId === r.id;
                          return `
                            <option value="${r.id}" ${isSelected ? 'selected' : ''}>
                              ${isSelected ? '✓ ' : ''}🥤 ${r.name} (${r.spec || r.totalWeight + 'g'} · ${fruitNames})
                            </option>
                          `;
                        }).join('')}
                      </optgroup>
                    ` : ''}
                    ${csRecs.length > 0 ? `
                      <optgroup label="🏬 超商區 (${csRecs.length} 款)">
                        ${csRecs.map(r => {
                          const fruitNames = (r.plateItems || []).map(item => {
                            const f = getFruit(item.fruitId);
                            return f ? f.name : item.fruitId;
                          }).join(' + ');
                          const isSelected = state.activeLabelRecipeId === r.id;
                          return `
                            <option value="${r.id}" ${isSelected ? 'selected' : ''}>
                              ${isSelected ? '✓ ' : ''}🍱 ${r.name} (${r.spec || r.totalWeight + 'g'} · ${fruitNames})
                            </option>
                          `;
                        }).join('')}
                      </optgroup>
                    ` : ''}
                    ${rdRecs.length > 0 ? `
                      <optgroup label="🔬 R&D研發中 (${rdRecs.length} 款)">
                        ${rdRecs.map(r => {
                          const fruitNames = (r.plateItems || []).map(item => {
                            const f = getFruit(item.fruitId);
                            return f ? f.name : item.fruitId;
                          }).join(' + ');
                          const isSelected = state.activeLabelRecipeId === r.id;
                          return `
                            <option value="${r.id}" ${isSelected ? 'selected' : ''}>
                              ${isSelected ? '✓ ' : ''}🔬 ${r.name} (${r.spec || r.totalWeight + 'g'} · ${fruitNames})
                            </option>
                          `;
                        }).join('')}
                      </optgroup>
                    ` : ''}
                    ${customRecs.length > 0 ? `
                      <optgroup label="📝 我的自訂搭配 (${customRecs.length} 款)">
                        ${customRecs.map(r => {
                          const fruitNames = (r.plateItems || []).map(item => {
                            const f = getFruit(item.fruitId);
                            return f ? f.name : item.fruitId;
                          }).join(' + ');
                          const isSelected = state.activeLabelRecipeId === r.id;
                          return `
                            <option value="${r.id}" ${isSelected ? 'selected' : ''}>
                              ${isSelected ? '✓ ' : ''}🥗 ${r.name} (${r.totalWeight}g · ${fruitNames})
                            </option>
                          `;
                        }).join('')}
                      </optgroup>
                    ` : ''}
                  </select>
                </div>

                <!-- 快捷配方卡片列 (根據所選分區即時切換) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  ${displayRecs.slice(0, 9).map(r => {
                    const isSelected = state.activeLabelRecipeId === r.id;
                    const fruitNames = (r.plateItems || []).map(item => {
                      const f = getFruit(item.fruitId);
                      return f ? `${f.emoji}${f.name}` : item.fruitId;
                    }).join('、');
                    const zoneColor = r.zone === '鮮果多區' ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : r.zone === '超商區' ? 'bg-sky-100 text-sky-800 border-sky-200'
                                    : r.zone === 'R&D研發中' ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : 'bg-purple-100 text-purple-800 border-purple-200';
                    return `
                      <button
                        type="button"
                        onclick="applySavedRecipeToLabel('${r.id}')"
                        class="p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-1.5 active:scale-98 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-500/30 shadow-xs'
                            : 'border-slate-200/80 bg-white hover:border-emerald-400 hover:bg-slate-50 shadow-2xs'
                        }"
                        title="點擊套用「${r.name}」"
                      >
                        <div class="flex items-center justify-between gap-1">
                          <div class="flex items-center space-x-1.5 min-w-0">
                            <span class="font-extrabold text-xs text-slate-800 truncate">${r.name}</span>
                            ${r.zone ? `<span class="text-3xs px-1.5 py-0.2 rounded font-bold border ${zoneColor} shrink-0">${r.zone}</span>` : ''}
                          </div>
                          <span class="text-3xs font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}">
                            ${r.spec || r.totalWeight + 'g'}
                          </span>
                        </div>
                        <div class="text-3xs text-slate-500 truncate" title="${fruitNames}">
                          ${fruitNames || '未指定原料'}
                        </div>
                      </button>
                    `;
                  }).join('')}
                </div>
              `;
            })() : `
              <div class="bg-white/80 p-4 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                <p class="text-slate-600 leading-relaxed">
                  目前尚未儲存自訂水果搭配。您可以在<strong>「🥗 水果搭配計算」</strong>任意調配多款水果克數後，點選<strong>「💾 儲存此搭配」</strong>，系統就會自動將您的配方出現在此選單中！
                </p>
                <button
                  onclick="switchTab('plate')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition inline-flex items-center space-x-1"
                >
                  <span>前往「水果搭配計算」調配新配方 →</span>
                </button>
              </div>
            `}
          </div>

          <!-- Preset Templates -->
          <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-4">
            <h3 class="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
              <span>⚡ 快速套用商品模板</span>
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button onclick="applyProductPreset('salad_box')" class="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition">
                <div class="font-bold text-slate-800">🥗 綜合水果沙拉盒</div>
                <div class="text-3xs text-slate-500 mt-0.5">200g / 1份</div>
              </button>
              <button onclick="applyProductPreset('guava_cup')" class="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition">
                <div class="font-bold text-slate-800">🍐 鮮切芭樂隨手杯</div>
                <div class="text-3xs text-slate-500 mt-0.5">150g / 1份</div>
              </button>
              <button onclick="applyProductPreset('family_pack')" class="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition">
                <div class="font-bold text-slate-800">🍉 家庭分享果盒</div>
                <div class="text-3xs text-slate-500 mt-0.5">400g / 2份</div>
              </button>
              <button onclick="applyProductPreset('dried_fruit')" class="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition">
                <div class="font-bold text-slate-800">🥭 鮮採芒果盒</div>
                <div class="text-3xs text-slate-500 mt-0.5">180g / 1份</div>
              </button>
            </div>
          </div>

          <!-- Product Specification Settings -->
          <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-4">
            <h3 class="text-sm font-bold text-slate-800">包裝規格與原料來源</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <!-- Product Name -->
              <div class="space-y-1.5">
                <label class="font-semibold text-slate-600">商品名稱</label>
                <input
                  type="text"
                  value="${cfg.productName}"
                  oninput="handleProductNameInput(this.value)"
                  class="product-name-input-class w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="如：綜合鮮切水果盒"
                />
              </div>

              <!-- Source fruit selection -->
              <div class="space-y-1.5">
                <label class="font-semibold text-slate-600">營養來源</label>
                <div class="flex items-center space-x-2">
                  <select
                    onchange="handleLabelSourceChange(this.value)"
                    class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="plate" ${cfg.sourceType === 'plate' && !state.activeLabelRecipeId ? 'selected' : ''}>
                      使用目前工作台搭配 (${state.plateItems.length} 款水果加權)
                    </option>
                    ${(state.savedRecipes || []).length > 0 ? `
                      <optgroup label="📚 我的已存水果搭配 (${state.savedRecipes.length} 筆)">
                        ${state.savedRecipes.map(r => `
                          <option value="recipe:${r.id}" ${state.activeLabelRecipeId === r.id ? 'selected' : ''}>
                            🥗 ${r.name} (${r.totalWeight}g)
                          </option>
                        `).join('')}
                      </optgroup>
                    ` : ''}
                    <option value="single" ${cfg.sourceType === 'single' ? 'selected' : ''}>
                      指定單一水果原料
                    </option>
                  </select>
                </div>
              </div>

              ${
                cfg.sourceType === 'single'
                  ? `
                <div class="space-y-1.5 sm:col-span-2">
                  <label class="font-semibold text-slate-600">選擇水果品項</label>
                  <select
                    onchange="updateLabelConfig('singleFruitId', this.value)"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    ${state.fruits
                      .map(
                        (f) => `
                      <option value="${f.id}" ${f.id === cfg.singleFruitId ? 'selected' : ''}>
                        ${f.emoji} ${f.name} (${f.english_name})
                      </option>
                    `
                      )
                      .join('')}
                  </select>
                </div>
              `
                  : ''
              }

              <!-- Serving Size (g) -->
              <div class="space-y-1.5">
                <label class="font-semibold text-slate-600">每一份量 (公克 g)</label>
                <div class="flex items-center space-x-2">
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    step="5"
                    value="${cfg.servingSize}"
                    onchange="updateLabelConfig('servingSize', Number(this.value))"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span class="text-slate-400 font-medium">g</span>
                </div>
              </div>

              <!-- Servings Per Package -->
              <div class="space-y-1.5">
                <label class="font-semibold text-slate-600">本包裝含 (份數)</label>
                <div class="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value="${cfg.servingsPerPkg}"
                    onchange="updateLabelConfig('servingsPerPkg', Number(this.value))"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span class="text-slate-400 font-medium">份</span>
                </div>
              </div>
            </div>

            <!-- Net Weight Summary -->
            <div class="bg-slate-50 p-3 rounded-xl text-2xs text-slate-600 flex items-center justify-between border border-slate-200/60">
              <span>包裝總淨重估算：<strong>${Math.round(cfg.servingSize * cfg.servingsPerPkg)}</strong> 公克 (g)</span>
              <span class="text-slate-400">符合食藥署淨重與份量對照規範</span>
            </div>
          </div>

          <!-- Format & Voluntary Nutrients -->
          <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 space-y-4">
            <h3 class="text-sm font-bold text-slate-800">標示格式與自願宣稱項目</h3>

            <div class="space-y-3 text-xs">
              <!-- Label Format Toggle -->
              <div>
                <label class="font-semibold text-slate-600 block mb-2">法規標示格式</label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    onclick="updateLabelConfig('labelFormat', 'dual')"
                    class="p-3 rounded-xl border text-left transition ${
                      cfg.labelFormat === 'dual'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }"
                  >
                    <div class="text-xs">格式一：雙欄式 (最推薦)</div>
                    <div class="text-3xs text-slate-500 font-normal mt-0.5">每份 + 每 100 公克</div>
                  </button>
                  <button
                    onclick="updateLabelConfig('labelFormat', 'percent')"
                    class="p-3 rounded-xl border text-left transition ${
                      cfg.labelFormat === 'percent'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }"
                  >
                    <div class="text-xs">格式二：參考值百分比</div>
                    <div class="text-3xs text-slate-500 font-normal mt-0.5">每份 + 每日參考值 %</div>
                  </button>
                </div>
              </div>

              <!-- Voluntary Nutrients Checkboxes -->
              <div class="pt-2 border-t border-slate-100">
                <label class="font-semibold text-slate-600 block mb-2">自選納入標示之營養項目 (非強制項目)</label>
                <div class="flex flex-wrap gap-4 text-xs">
                  <label class="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      ${cfg.includeFiber ? 'checked' : ''}
                      onchange="updateLabelConfig('includeFiber', this.checked)"
                      class="rounded-sm text-emerald-600 accent-emerald-600"
                    />
                    <span>膳食纖維</span>
                  </label>
                  <label class="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      ${cfg.includeVitaminC ? 'checked' : ''}
                      onchange="updateLabelConfig('includeVitaminC', this.checked)"
                      class="rounded-sm text-emerald-600 accent-emerald-600"
                    />
                    <span>維生素 C</span>
                  </label>
                  <label class="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      ${cfg.includePotassium ? 'checked' : ''}
                      onchange="updateLabelConfig('includePotassium', this.checked)"
                      class="rounded-sm text-emerald-600 accent-emerald-600"
                    />
                    <span>鉀離子</span>
                  </label>
                </div>
              </div>

              <!-- Calorie Calculation Method Selector -->
              <div class="pt-3 border-t border-slate-100 space-y-1.5">
                <label class="font-semibold text-slate-700 block flex items-center justify-between">
                  <span>熱量計算依據 (TFDA 合規雙途徑)</span>
                  <span class="text-3xs text-emerald-700 font-bold">每項數值均在小數點後一位</span>
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                  <button
                    type="button"
                    onclick="updateLabelConfig('calorieMethod', 'database')"
                    class="p-2 rounded-xl border text-left transition ${
                      (!cfg.calorieMethod || cfg.calorieMethod === 'database')
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }"
                  >
                    <div class="flex items-center space-x-1">
                      <span>🏛️ TFDA 資料庫實測加權</span>
                      ${(!cfg.calorieMethod || cfg.calorieMethod === 'database') ? '<span class="text-emerald-600">✓</span>' : ''}
                    </div>
                    <div class="text-3xs text-slate-500 mt-0.5 font-normal">食藥署營養成分檢驗實測值推算</div>
                  </button>
                  <button
                    type="button"
                    onclick="updateLabelConfig('calorieMethod', 'factor')"
                    class="p-2 rounded-xl border text-left transition ${
                      cfg.calorieMethod === 'factor'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }"
                  >
                    <div class="flex items-center space-x-1">
                      <span>⚡ 法定 4-9-4 係數公式</span>
                      ${cfg.calorieMethod === 'factor' ? '<span class="text-emerald-600">✓</span>' : ''}
                    </div>
                    <div class="text-3xs text-slate-500 mt-0.5 font-normal">蛋白×4 + 脂×9 + 淨碳×4 + 纖×2</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 🏛️ 衛福部 TFDA 營養標籤計算基礎與法規合規檢核面板 -->
          <div class="bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 rounded-3xl p-6 shadow-soft border border-emerald-200/80 space-y-3.5">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center space-x-2">
                <span class="text-lg">🏛️</span>
                <h3 class="text-sm font-extrabold text-slate-800">衛福部 TFDA 法規計算基準與合規說明</h3>
              </div>
              <span class="text-3xs px-2.5 py-0.8 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                ✓ 100% 依《包裝食品營養標示應遵行事項》檢核
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-2xs text-slate-600">
              <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-2xs">
                <div class="font-bold text-slate-800 flex items-center space-x-1 text-xs">
                  <span>⚖️ 1. 計算基礎 (法規格式)</span>
                </div>
                <p class="text-3xs leading-relaxed text-slate-500">
                  以<strong>每一份量 (公克/毫升)</strong> 與<strong>本包裝含份數</strong>為基準。支援雙欄標示（每份 + 每100g）與單欄標示（每份 + 每日參考值%），完全合規。
                </p>
              </div>

              <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-2xs">
                <div class="font-bold text-slate-800 flex items-center space-x-1 text-xs">
                  <span>🔥 2. 計算方式 (加權與熱量)</span>
                </div>
                <p class="text-3xs leading-relaxed text-slate-500">
                  配方按克數百分比由<strong>臺灣食品營養成分資料庫</strong>加權彙總。熱量支援實測彙總或<strong>法定能量係數</strong>（蛋白×4 + 脂肪×9 + 碳水×4 - 纖維×2）。
                </p>
              </div>

              <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-2xs">
                <div class="font-bold text-slate-800 flex items-center space-x-1 text-xs">
                  <span>🔢 3. 數據修整 (小數點後一位)</span>
                </div>
                <p class="text-3xs leading-relaxed text-slate-500">
                  依據 <strong>CNS 2925</strong> 及法規第七點四捨五入原則，<strong>每項數值（熱量、三大營養素、鈉、糖等）均固定在小數點後一位</strong>，零標示亦以 0.0g 合規呈現。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Real-time Label Sticker Preview (5 cols) -->
        <div class="lg:col-span-5 sticky top-20 space-y-4" id="print-area">
          <div class="bg-slate-100/80 rounded-3xl p-6 border border-slate-200/80 shadow-soft">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                <span>🏷️ 商品標籤預覽 (1:1 實體貼紙樣式)</span>
              </div>
              <span class="text-3xs bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                寬度約 6-8 cm
              </span>
            </div>

            <!-- Product name preview badge -->
            <div class="label-product-name-display text-center font-bold text-sm text-slate-800 mb-3 bg-white py-1.5 px-3 rounded-xl border border-slate-200 shadow-2xs">
              ${cfg.productName || '未命名商品'}
            </div>

            <!-- Actual Sticker Card -->
            <div id="sticker-wrapper">
              ${labelTableHtml}
            </div>

            <!-- Quick Image / Vector Download Action Box -->
            <div class="mt-4 pt-4 border-t border-slate-200/90 space-y-2.5">
              <div class="flex items-center justify-between text-2xs font-bold text-slate-600">
                <span>📥 儲存與下載標籤圖檔</span>
                <span class="text-3xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-semibold">1:1 實體貼紙規格</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <button
                  onclick="downloadLabelImage(2)"
                  class="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-2xs transition flex items-center justify-center space-x-1.5 active:scale-95"
                  title="直接下載高畫質 PNG 圖片檔案"
                >
                  <span>🖼️ 下載 PNG 圖片</span>
                </button>
                <button
                  onclick="downloadLabelImage(3)"
                  class="p-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-2xs transition flex items-center justify-center space-x-1.5 active:scale-95"
                  title="適合熱感標籤貼紙機或商業包裝印刷之 300 DPI 超高解析度"
                >
                  <span>🖨️ 300 DPI 印刷圖</span>
                </button>
              </div>
              <div class="flex items-center justify-between text-2xs pt-1 px-1">
                <button
                  onclick="downloadLabelSVG()"
                  class="text-sky-700 hover:text-sky-800 hover:underline font-bold flex items-center space-x-1"
                  title="匯出無失真向量圖，可直接於 Illustrator / InDesign 編輯"
                >
                  <span>📐 下載向量圖檔 (SVG)</span>
                </button>
                <span class="text-3xs text-slate-400">適用於條碼貼紙、生鮮切盒包裝</span>
              </div>
            </div>

            <!-- Hint text -->
            <p class="text-3xs text-slate-400 text-center mt-3">
              提示：按下「🖨️ 列印標籤貼紙」時，系統已設定列印樣式，僅會輸出純淨黑白表格，適用於各廠牌標籤條碼貼紙機與 A4 標籤紙。
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachLabelEvents() {}

// ==========================================
// 3. 水果百科圖鑑 HTML 與事件
// ==========================================
function renderCatalogCategoriesHtml() {
  const categories = ['全部', ...Array.from(new Set(state.fruits.map((f) => f.category)))];
  return `
    <span class="text-slate-400 font-medium shrink-0">分類：</span>
    ${categories
      .map(
        (cat) => `
      <button onclick="handleSelectCategory('${cat}')" class="px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
          state.selectedCategory === cat ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }">
        ${cat}
      </button>
    `
      )
      .join('')}
  `;
}

function renderCatalogTagsHtml() {
  const favCount = (state.favorites || []).length;
  const tags = ['全部', '低GI推薦', '超高維生素C', '高纖維', '低糖推薦', '低卡首選', '高鉀補充電解質'];
  return `
    <span class="text-slate-400 font-medium shrink-0">✨ 速選：</span>
    <button onclick="handleSelectTag('⭐ 常用收藏')" class="px-3 py-1.5 rounded-xl font-medium shrink-0 transition flex items-center space-x-1.5 ${
      state.selectedTag === '⭐ 常用收藏' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
    }">
      <span>⭐ 常用收藏</span>
      <span class="text-3xs px-1.5 py-0.2 bg-white/90 rounded-full font-bold ${
        state.selectedTag === '⭐ 常用收藏' ? 'text-amber-800' : 'text-amber-700'
      }">${favCount}</span>
    </button>
    ${tags
      .map(
        (tag) => `
      <button onclick="handleSelectTag('${tag}')" class="px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
          state.selectedTag === tag ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
        }">
        ${tag}
      </button>
    `
      )
      .join('')}
  `;
}

function renderCatalogCardsHtml() {
  const filtered = state.fruits.filter((f) => {
    const term = state.searchTerm.toLowerCase().trim();
    const matchTerm =
      !term ||
      f.name.toLowerCase().includes(term) ||
      f.english_name.toLowerCase().includes(term) ||
      f.tags.some((t) => t.toLowerCase().includes(term));

    const matchCat = state.selectedCategory === '全部' || f.category === state.selectedCategory;

    let matchTag = true;
    if (state.selectedTag === '⭐ 常用收藏') {
      matchTag = (state.favorites || []).includes(f.id);
    } else if (state.selectedTag === '低GI推薦') {
      matchTag = f.gi_level === 'low';
    } else if (state.selectedTag !== '全部') {
      matchTag = f.tags.some((t) => t.includes(state.selectedTag.replace('推薦', '').replace('首選', '')));
    }

    return matchTerm && matchCat && matchTag;
  });

  if (state.favoritePinTop) {
    filtered.sort((a, b) => {
      const aFav = (state.favorites || []).includes(a.id);
      const bFav = (state.favorites || []).includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }

  const plateFruitIds = state.plateItems.map((item) => item.fruitId);

  if (filtered.length === 0) {
    if (state.selectedTag === '⭐ 常用收藏') {
      return `
        <div class="bg-white rounded-3xl p-12 text-center border border-slate-200/60 shadow-soft">
          <div class="text-4xl mb-3">⭐</div>
          <h3 class="text-lg font-bold text-slate-700">目前尚無收藏置頂的水果</h3>
          <p class="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            點選任何水果卡片右上角的星號「☆」，即可將常用水果收藏並置頂在最上方！
          </p>
          <button onclick="handleSelectTag('全部')" class="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition">
            瀏覽全部水果庫
          </button>
        </div>
      `;
    }
    return `
      <div class="bg-white rounded-3xl p-12 text-center border border-slate-200/60 shadow-soft">
        <div class="text-4xl mb-3">🔍</div>
        <h3 class="text-lg font-bold text-slate-700">找不到符合條件的水果</h3>
        <p class="text-sm text-slate-400 mt-1">請嘗試更換搜尋關鍵字或清除篩選條件</p>
        <button onclick="resetFilters()" class="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition">
          重設篩選
        </button>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      ${filtered
        .map((fruit) => {
          const inPlate = plateFruitIds.includes(fruit.id);
          const isFav = (state.favorites || []).includes(fruit.id);
          return `
          <div class="rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between group relative ${
            isFav
              ? 'bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-300 shadow-sm shadow-amber-500/10 hover:border-amber-400'
              : 'bg-white border-slate-200/70 hover:border-emerald-300 hover:shadow-card'
          }">
            <div>
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-xl bg-slate-50 group-hover:scale-105 transition-transform flex items-center justify-center text-3xl border border-slate-100">
                    ${fruit.emoji}
                  </div>
                  <div>
                    <div class="flex items-center space-x-1.5 flex-wrap">
                      <h3 class="font-bold text-slate-800 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                        ${fruit.name}
                      </h3>
                      ${
                        isFav
                          ? `<span class="text-3xs px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold flex items-center space-x-0.5 shadow-2xs" title="常用收藏 (已置頂於最上層)">
                              <span>⭐</span><span>置頂</span>
                            </span>`
                          : ''
                      }
                    </div>
                    <p class="text-xs text-slate-400 font-medium">${fruit.english_name}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-1.5">
                  <button
                    onclick="event.stopPropagation(); toggleFavorite('${fruit.id}')"
                    class="p-1.5 rounded-xl transition ${
                      isFav
                        ? 'text-amber-500 hover:text-amber-600 bg-amber-100/70 hover:bg-amber-200/80 border border-amber-300'
                        : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100 border border-transparent'
                    }"
                    title="${isFav ? '點擊取消收藏置頂' : '點擊加入常用收藏 (置頂於最上層)'}"
                  >
                    <span class="text-sm leading-none font-bold">${isFav ? '★' : '☆'}</span>
                  </button>
                  <span class="text-2xs font-bold px-2 py-0.5 rounded-full ${
                    fruit.gi_level === 'low'
                      ? 'bg-emerald-100 text-emerald-800'
                      : fruit.gi_level === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }">
                    ${fruit.gi_level === 'low' ? '低 GI' : fruit.gi_level === 'medium' ? '中 GI' : '高 GI'}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-4 gap-1.5 py-2.5 px-2 bg-slate-50/80 rounded-xl mb-3 text-center">
                <div>
                  <div class="text-2xs text-slate-400 font-medium">熱量</div>
                  <div class="text-xs font-bold text-slate-700">
                    ${fruit.nutrition_per_100g.calories}
                    <span class="text-3xs text-slate-400 font-normal block -mt-0.5">kcal</span>
                  </div>
                </div>
                <div>
                  <div class="text-2xs text-slate-400 font-medium">糖分</div>
                  <div class="text-xs font-bold text-amber-600">
                    ${fruit.nutrition_per_100g.sugar}
                    <span class="text-3xs text-slate-400 font-normal block -mt-0.5">g</span>
                  </div>
                </div>
                <div>
                  <div class="text-2xs text-slate-400 font-medium">纖維</div>
                  <div class="text-xs font-bold text-emerald-600">
                    ${fruit.nutrition_per_100g.dietary_fiber}
                    <span class="text-3xs text-slate-400 font-normal block -mt-0.5">g</span>
                  </div>
                </div>
                <div>
                  <div class="text-2xs text-slate-400 font-medium">維C</div>
                  <div class="text-xs font-bold text-orange-600">
                    ${fruit.nutrition_per_100g.vitamin_c}
                    <span class="text-3xs text-slate-400 font-normal block -mt-0.5">mg</span>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-1 mb-4">
                ${fruit.tags
                  .slice(0, 2)
                  .map((tag) => `<span class="text-3xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">${tag}</span>`)
                  .join('')}
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center space-x-2">
              <button onclick="openDetailModal('${fruit.id}')" class="flex-1 py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-600 transition flex items-center justify-center space-x-1">
                <span>查看詳情</span>
              </button>
              <button onclick="addToPlate('${fruit.id}', ${fruit.serving_unit?.grams || 100})" class="py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center space-x-1 transition shadow-xs ${
            inPlate ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
          }">
                <span>${inPlate ? '再加一份' : '+ 加到搭配'}</span>
              </button>
            </div>
          </div>
        `;
        })
        .join('')}
    </div>
  `;
}

function getCatalogHtml() {
  const favCount = (state.favorites || []).length;
  return `
    <div class="space-y-6">
      <!-- Search & Filters -->
      <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div class="flex items-center space-x-2 flex-wrap gap-y-1.5">
              <h2 class="text-xl font-bold text-slate-800 flex items-center space-x-2">
                <span>水果營養資料庫</span>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  收錄 ${state.fruits.length} 款常見水果
                </span>
              </h2>
              <span id="catalog-fav-badge" class="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold items-center space-x-1 ${favCount > 0 ? 'inline-flex' : 'hidden'}">
                <span>⭐ 已收藏置頂 ${favCount} 款</span>
              </span>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              以衛生福利部食藥署 (TFDA) 與 USDA 為標準，點擊卡片右上角星號「★」即可將常用水果置頂於最上層。
            </p>
          </div>
          <div class="flex items-center space-x-2 w-full md:w-auto">
            <button
              id="catalog-pin-toggle-btn"
              onclick="toggleFavoritePinTop()"
              class="px-3 py-2.5 rounded-2xl text-xs font-semibold transition shrink-0 flex items-center space-x-1.5 shadow-2xs ${
                state.favoritePinTop
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }"
              title="切換常用收藏水果是否自動置頂在清單最上方"
            >
              <span>${state.favoritePinTop ? '📌 收藏置頂中' : '📍 預設排序'}</span>
            </button>
            <div class="relative flex-1 md:w-80">
              <input
                type="text"
                id="catalog-search-input"
                placeholder="搜尋水果中文、英文或標籤 (如：芭樂、維生素C)..."
                value="${state.searchTerm}"
                oninput="handleSearch(this.value)"
                class="w-full pl-4 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>
        </div>

        <div class="space-y-3 pt-3 border-t border-slate-100">
          <!-- Categories -->
          <div id="catalog-category-bar" class="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            ${renderCatalogCategoriesHtml()}
          </div>

          <!-- Tags -->
          <div id="catalog-tag-bar" class="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            ${renderCatalogTagsHtml()}
          </div>
        </div>
      </div>

      <!-- Fruit Cards Grid -->
      <div id="catalog-cards-container">
        ${renderCatalogCardsHtml()}
      </div>
    </div>
  `;
}

function attachCatalogEvents() {}

// ==========================================
// 4. 雙果 PK 對比 HTML 與事件
// ==========================================
function getComparisonHtml() {
  const fruitA = getFruit(state.comparison.fruitAId);
  const fruitB = getFruit(state.comparison.fruitBId);
  const weight = state.comparison.weight;

  const nutA = calcItemNut(fruitA, weight);
  const nutB = calcItemNut(fruitB, weight);

  const metrics = [
    { label: '熱量 (Calories)', key: 'calories', unit: 'kcal', preferLower: true },
    { label: '總糖量 (Sugar)', key: 'sugar', unit: 'g', preferLower: true },
    { label: '膳食纖維 (Fiber)', key: 'dietary_fiber', unit: 'g', preferLower: false },
    { label: '維生素 C (Vitamin C)', key: 'vitamin_c', unit: 'mg', preferLower: false },
    { label: '鉀離子 (Potassium)', key: 'potassium', unit: 'mg', preferLower: false },
    { label: '蛋白質 (Protein)', key: 'protein', unit: 'g', preferLower: false },
    { label: '水分 (Water)', key: 'water', unit: 'g', preferLower: false },
  ];

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <span>⚖️ 雙果營養 PK 橫向對比</span>
          </h2>
          <p class="text-sm text-slate-500 mt-1">
            任選兩種水果，在相同重量下對比熱量、糖分、維生素 C 與膳食纖維差異。
          </p>
        </div>
        <div class="flex items-center space-x-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <span class="text-xs font-semibold text-slate-500 pl-2">對比基準：</span>
          <button onclick="setComparisonWeight(100)" class="px-3 py-1 text-xs rounded-xl font-medium transition ${
            weight === 100 ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
          }">
            100g 基準
          </button>
          <button onclick="setComparisonWeight(200)" class="px-3 py-1 text-xs rounded-xl font-medium transition ${
            weight === 200 ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
          }">
            200g (約1碗)
          </button>
        </div>
      </div>

      <!-- Selectors & Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Card A -->
        <div class="bg-white rounded-3xl p-6 border-2 border-emerald-400 shadow-soft space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              選手 A
            </span>
            <select onchange="setComparisonFruit('A', this.value)" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500">
              ${[...state.fruits]
                .sort((a, b) => {
                  const aFav = (state.favorites || []).includes(a.id);
                  const bFav = (state.favorites || []).includes(b.id);
                  if (aFav && !bFav) return -1;
                  if (!aFav && bFav) return 1;
                  return 0;
                })
                .map(
                  (f) => `
                <option value="${f.id}" ${f.id === fruitA.id ? 'selected' : ''} ${f.id === fruitB.id ? 'disabled' : ''}>
                  ${(state.favorites || []).includes(f.id) ? '⭐ ' : ''}${f.emoji} ${f.name} (${f.category})
                </option>
              `
                )
                .join('')}
            </select>
          </div>
          <div class="flex items-center space-x-4 pt-2">
            <div class="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-4xl shadow-inner">
              ${fruitA.emoji}
            </div>
            <div>
              <h3 class="text-2xl font-bold text-slate-800">${fruitA.name}</h3>
              <p class="text-xs text-slate-400 font-medium">${fruitA.english_name}</p>
              <div class="mt-1 text-xs font-semibold text-slate-600">
                GI 指數：<strong class="text-emerald-700">${fruitA.gi_value} (${fruitA.gi_level === 'low' ? '低' : fruitA.gi_level === 'medium' ? '中' : '高'})</strong>
              </div>
            </div>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">${fruitA.description}</p>
          <button onclick="addToPlate('${fruitA.id}', ${weight})" class="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center space-x-1.5 shadow-sm shadow-emerald-600/20">
            <span>將 ${fruitA.name} (${weight}g) 加到搭配</span>
          </button>
        </div>

        <!-- Card B -->
        <div class="bg-white rounded-3xl p-6 border-2 border-indigo-400 shadow-soft space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
              選手 B
            </span>
            <select onchange="setComparisonFruit('B', this.value)" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500">
              ${[...state.fruits]
                .sort((a, b) => {
                  const aFav = (state.favorites || []).includes(a.id);
                  const bFav = (state.favorites || []).includes(b.id);
                  if (aFav && !bFav) return -1;
                  if (!aFav && bFav) return 1;
                  return 0;
                })
                .map(
                  (f) => `
                <option value="${f.id}" ${f.id === fruitB.id ? 'selected' : ''} ${f.id === fruitA.id ? 'disabled' : ''}>
                  ${(state.favorites || []).includes(f.id) ? '⭐ ' : ''}${f.emoji} ${f.name} (${f.category})
                </option>
              `
                )
                .join('')}
            </select>
          </div>
          <div class="flex items-center space-x-4 pt-2">
            <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-4xl shadow-inner">
              ${fruitB.emoji}
            </div>
            <div>
              <h3 class="text-2xl font-bold text-slate-800">${fruitB.name}</h3>
              <p class="text-xs text-slate-400 font-medium">${fruitB.english_name}</p>
              <div class="mt-1 text-xs font-semibold text-slate-600">
                GI 指數：<strong class="text-indigo-700">${fruitB.gi_value} (${fruitB.gi_level === 'low' ? '低' : fruitB.gi_level === 'medium' ? '中' : '高'})</strong>
              </div>
            </div>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">${fruitB.description}</p>
          <button onclick="addToPlate('${fruitB.id}', ${weight})" class="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center justify-center space-x-1.5 shadow-sm shadow-indigo-600/20">
            <span>將 ${fruitB.name} (${weight}g) 加到搭配</span>
          </button>
        </div>
      </div>

      <!-- Side by Side Metrics -->
      <div class="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/60 overflow-hidden">
        <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
          <span>相同重量 (${weight}g) 數值 PK</span>
          <span class="text-xs font-normal text-slate-500">🏆 標示勝出或更推薦之項目</span>
        </h3>
        <div class="divide-y divide-slate-100">
          ${metrics
            .map((m) => {
              const valA = nutA[m.key];
              const valB = nutB[m.key];
              let winner = null;
              if (valA !== valB) {
                winner = m.preferLower ? (valA < valB ? 'A' : 'B') : valA > valB ? 'A' : 'B';
              }
              const maxVal = Math.max(valA, valB, 0.1);
              const pctA = Math.round((valA / maxVal) * 100);
              const pctB = Math.round((valB / maxVal) * 100);

              return `
              <div class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="w-44 font-semibold text-xs sm:text-sm text-slate-700">
                  ${m.label}
                </div>
                <div class="flex-1 grid grid-cols-2 gap-4 items-center">
                  <div class="flex items-center justify-end space-x-2">
                    <span class="text-xs sm:text-sm font-bold ${winner === 'A' ? 'text-emerald-700' : 'text-slate-600'}">
                      ${valA} ${m.unit}
                    </span>
                    ${winner === 'A' ? '<span class="text-xs" title="勝出">🏆</span>' : ''}
                    <div class="w-20 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div style="width: ${pctA}%" class="h-full ${winner === 'A' ? 'bg-emerald-500' : 'bg-slate-400'}"></div>
                    </div>
                  </div>
                  <div class="flex items-center justify-start space-x-2">
                    <div class="w-20 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div style="width: ${pctB}%" class="h-full ${winner === 'B' ? 'bg-indigo-500' : 'bg-slate-400'}"></div>
                    </div>
                    ${winner === 'B' ? '<span class="text-xs" title="勝出">🏆</span>' : ''}
                    <span class="text-xs sm:text-sm font-bold ${winner === 'B' ? 'text-indigo-700' : 'text-slate-600'}">
                      ${valB} ${m.unit}
                    </span>
                  </div>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function attachComparisonEvents() {}

// ==========================================
// 5. 水果詳細資訊 Modal
// ==========================================
function renderModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  if (state.recipesModalOpen) {
    const allRecipes = state.savedRecipes || [];
    const countAll = allRecipes.length;
    const countXgd = allRecipes.filter(r => r.zone === '鮮果多區').length;
    const countCs = allRecipes.filter(r => r.zone === '超商區').length;
    const countRd = allRecipes.filter(r => r.zone === 'R&D研發中').length;
    const countCustom = allRecipes.filter(r => !r.zone || (r.zone !== '鮮果多區' && r.zone !== '超商區' && r.zone !== 'R&D研發中')).length;

    const currentZone = state.recipeFilterZone || 'all';
    let filteredRecipes = allRecipes;
    if (currentZone && currentZone !== 'all') {
      if (currentZone === 'custom') {
        filteredRecipes = filteredRecipes.filter(r => !r.zone || (r.zone !== '鮮果多區' && r.zone !== '超商區' && r.zone !== 'R&D研發中'));
      } else {
        filteredRecipes = filteredRecipes.filter(r => r.zone === currentZone);
      }
    }

    if (state.recipeSearchQuery && state.recipeSearchQuery.trim()) {
      const q = state.recipeSearchQuery.trim().toLowerCase();
      filteredRecipes = filteredRecipes.filter(r => {
        const matchName = (r.name || '').toLowerCase().includes(q);
        const matchSpec = (r.spec || '').toLowerCase().includes(q);
        const matchFruits = (r.plateItems || []).some(it => {
          const f = getFruit(it.fruitId);
          return f && (f.name.toLowerCase().includes(q) || (f.english_name || '').toLowerCase().includes(q));
        });
        return matchName || matchSpec || matchFruits;
      });
    }

    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" onclick="closeRecipesModal()">
        <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[88vh]" onclick="event.stopPropagation()">
          
          <!-- Modal Header -->
          <div class="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center space-x-2">
              <span class="text-xl">📂</span>
              <h3 class="font-bold text-slate-800 text-base">已儲存配方庫與商業分區</h3>
              <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                共 ${countAll} 款配方
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <button
                onclick="restoreCommercialRecipes()"
                class="px-2.5 py-1 text-3xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-2xs flex items-center space-x-1"
                title="重新同步/匯入官方 37 款鮮果多、超商與 R&D 配方"
              >
                <span>🔄 重新匯入37款商業配方</span>
              </button>
              <button onclick="closeRecipesModal()" class="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition">
                ✕
              </button>
            </div>
          </div>

          <!-- Zone Tabs & Search Bar -->
          <div class="p-4 bg-white border-b border-slate-100 space-y-3">
            <!-- Zone Filter Tabs -->
            <div class="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
              <button
                onclick="setRecipeFilterZone('all')"
                class="px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${currentZone === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
              >
                全部 (${countAll})
              </button>
              <button
                onclick="setRecipeFilterZone('鮮果多區')"
                class="px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center space-x-1.5 ${currentZone === '鮮果多區' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'}"
              >
                <span>🏪 鮮果多區</span>
                <span class="text-3xs font-mono px-1.5 py-0.2 rounded ${currentZone === '鮮果多區' ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-900'}">${countXgd}</span>
              </button>
              <button
                onclick="setRecipeFilterZone('超商區')"
                class="px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center space-x-1.5 ${currentZone === '超商區' ? 'bg-sky-600 text-white shadow-xs' : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'}"
              >
                <span>🏬 超商區</span>
                <span class="text-3xs font-mono px-1.5 py-0.2 rounded ${currentZone === '超商區' ? 'bg-sky-700 text-white' : 'bg-sky-200 text-sky-900'}">${countCs}</span>
              </button>
              <button
                onclick="setRecipeFilterZone('R&D研發中')"
                class="px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center space-x-1.5 ${currentZone === 'R&D研發中' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'}"
              >
                <span>🔬 R&D研發中</span>
                <span class="text-3xs font-mono px-1.5 py-0.2 rounded ${currentZone === 'R&D研發中' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'}">${countRd}</span>
              </button>
              ${countCustom > 0 ? `
                <button
                  onclick="setRecipeFilterZone('custom')"
                  class="px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center space-x-1.5 ${currentZone === 'custom' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'}"
                >
                  <span>📝 自訂搭配</span>
                  <span class="text-3xs font-mono px-1.5 py-0.2 rounded ${currentZone === 'custom' ? 'bg-purple-700 text-white' : 'bg-purple-200 text-purple-900'}">${countCustom}</span>
                </button>
              ` : ''}
            </div>

            <!-- Search Input -->
            <div class="relative">
              <input
                type="text"
                value="${state.recipeSearchQuery || ''}"
                oninput="setRecipeSearchQuery(this.value)"
                placeholder="🔍 快速搜尋配方名稱、規格或原料（如：酪梨、鳳梨、超草莓、R&D）..."
                class="w-full pl-3.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <!-- Recipe Cards List -->
          <div class="p-6 overflow-y-auto space-y-3 flex-1 bg-slate-50/40">
            ${
              filteredRecipes.length === 0
                ? `
              <div class="text-center py-12 text-slate-400 space-y-2 bg-white rounded-2xl border border-dashed border-slate-200">
                <div class="text-3xl">📭</div>
                <p class="text-sm font-medium">查無符合條件的配方紀錄</p>
                <p class="text-xs text-slate-400">您可以切換上方分區標籤、清空搜尋關鍵字，或點選右上角「重新匯入37款商業配方」！</p>
              </div>
            `
                : filteredRecipes
                    .map((r) => {
                      const isEditing = state.editingRecipeId === r.id;
                      const zoneBadge = r.zone === '鮮果多區' ? '<span class="text-3xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">🏪 鮮果多區</span>'
                                      : r.zone === '超商區' ? '<span class="text-3xs px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800 border border-sky-200">🏬 超商區</span>'
                                      : r.zone === 'R&D研發中' ? '<span class="text-3xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">🔬 R&D研發中</span>'
                                      : '<span class="text-3xs px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-200">📝 自訂配方</span>';
                      
                      const calories = r.totalCalories || calcRecipeTotalCalories(r.plateItems);

                      if (isEditing) {
                        return `
                          <div class="p-4 rounded-2xl border-2 border-emerald-400 bg-white shadow-md space-y-2" onclick="event.stopPropagation()">
                            <div class="flex items-center space-x-2 flex-wrap">
                              <input
                                type="text"
                                id="edit-recipe-name-${r.id}"
                                value="${r.name}"
                                class="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-emerald-400 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs w-full sm:max-w-xs"
                                onkeydown="if(event.key==='Enter') saveRecipeName('${r.id}', this.value, event); if(event.key==='Escape') cancelEditRecipeName(event);"
                                placeholder="請輸入配方名稱"
                              />
                              <div class="flex items-center space-x-1 mt-1 sm:mt-0">
                                <button
                                  type="button"
                                  onclick="saveRecipeName('${r.id}', document.getElementById('edit-recipe-name-${r.id}').value, event)"
                                  class="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
                                >
                                  儲存
                                </button>
                                <button
                                  type="button"
                                  onclick="cancelEditRecipeName(event)"
                                  class="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
                                >
                                  取消
                                </button>
                              </div>
                            </div>
                          </div>
                        `;
                      }

                      return `
                        <div class="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-400 hover:shadow-card transition flex flex-col space-y-2.5 group">
                          <!-- Top Row: Name, Zone, Spec, Actions -->
                          <div class="flex items-start justify-between gap-2">
                            <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span class="font-extrabold text-sm text-slate-800 group-hover:text-emerald-700">${r.name}</span>
                              ${zoneBadge}
                              ${r.spec ? `<span class="text-3xs font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">${r.spec}</span>` : ''}
                              <span class="text-3xs text-slate-400 font-normal">(${r.createdAt})</span>
                            </div>
                            <div class="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onclick="startEditRecipe('${r.id}', event)"
                                class="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                title="修改搭配名稱"
                              >
                                ✏️ 改名
                              </button>
                              <button
                                type="button"
                                onclick="deleteRecipe('${r.id}', event)"
                                class="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="刪除此紀錄"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <!-- Ingredients Pills -->
                          <div class="flex flex-wrap gap-1.5">
                            ${(r.plateItems || []).map(item => {
                              const f = getFruit(item.fruitId);
                              return `
                                <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/70 text-3xs text-slate-700">
                                  <span>${f.emoji} ${f.name}</span>
                                  <strong class="font-mono text-emerald-700">${item.grams}g</strong>
                                </span>
                              `;
                            }).join('')}
                          </div>

                          <!-- Bottom Row: Nutrients & Load Buttons -->
                          <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                            <div class="text-slate-500 text-3xs flex items-center space-x-2">
                              <span>總重：<strong class="text-slate-700 font-mono">${r.totalWeight}g</strong></span>
                              <span>·</span>
                              <span>熱量：<strong class="text-amber-700 font-mono">${calories} kcal</strong></span>
                            </div>
                            <div class="flex items-center space-x-2">
                              <button
                                type="button"
                                onclick="loadRecipeToLabel('${r.id}')"
                                class="px-2.5 py-1 text-3xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200 flex items-center space-x-1"
                                title="直接載入並製作法規營養標籤"
                              >
                                <span>🏷️ 製作標籤</span>
                              </button>
                              <button
                                type="button"
                                onclick="loadRecipe('${r.id}')"
                                class="px-2.5 py-1 text-3xs font-bold text-white bg-slate-800 hover:bg-emerald-600 rounded-xl transition flex items-center space-x-1"
                                title="載入至工作台"
                              >
                                <span>🥗 載入工作台 ➔</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      `;
                    })
                    .join('')
            }
          </div>

          <!-- Modal Footer -->
          <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button onclick="saveCurrentRecipePrompt()" class="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center space-x-1.5">
              <span>+ 儲存當前搭配</span>
            </button>
            <button onclick="closeRecipesModal()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition">
              關閉
            </button>
          </div>
        </div>
      </div>
    `;
    return;
  }


  if (!state.modalFruit) {
    modalContainer.innerHTML = '';
    return;
  }

  const fruit = state.modalFruit;
  const grams = state.modalGrams;
  const nut100 = fruit.nutrition_per_100g;
  const nutServing = calcItemNut(fruit, grams);
  const tfdaLink = fruit.tfda_url || (fruit.tfda_id ? `https://consumer.fda.gov.tw/Food/tfndDetail.aspx?nodeID=178&f=${fruit.tfda_f || 0}&id=${fruit.tfda_id}` : `https://consumer.fda.gov.tw/Food/TFND.aspx?nodeID=178&k=${encodeURIComponent(fruit.name)}`);
  const isFav = (state.favorites || []).includes(fruit.id);

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" onclick="closeModal()">
      <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]" onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 p-6 border-b border-slate-100 flex items-start justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-4xl border border-slate-100">
              ${fruit.emoji}
            </div>
            <div>
              <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 class="text-2xl font-bold text-slate-800">${fruit.name}</h3>
                <span class="text-xs px-2.5 py-0.5 font-medium rounded-full bg-slate-200/80 text-slate-700">
                  ${fruit.category}
                </span>
                <button
                  onclick="toggleFavorite('${fruit.id}')"
                  class="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-xl shadow-2xs transition hover:scale-102 active:scale-98 ${
                    isFav
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300'
                  }"
                  title="${isFav ? '點擊取消常用收藏' : '點擊加入常用收藏並置頂'}"
                >
                  <span class="text-amber-500 font-bold">${isFav ? '★' : '☆'}</span>
                  <span>${isFav ? '已收藏置頂' : '收藏置頂'}</span>
                </button>
                <a
                  href="${tfdaLink}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-xl shadow-2xs transition hover:scale-102 active:scale-98 group"
                  title="前往衛生福利部食品藥物管理署 (TFDA) 官方「${fruit.name}」檢驗報告詳細頁面"
                >
                  <span>🏛️ 衛福部檢驗報告</span>
                  <span class="text-3xs text-emerald-600 group-hover:translate-x-0.5 transition-transform font-bold">↗</span>
                </a>
              </div>
              <p class="text-sm text-slate-500 font-medium">${fruit.english_name}</p>
              <div class="mt-2 flex items-center space-x-2">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${
                  fruit.gi_level === 'low'
                    ? 'bg-emerald-100 text-emerald-800'
                    : fruit.gi_level === 'medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }">
                  升糖指數 GI: ${fruit.gi_value} (${fruit.gi_level === 'low' ? '低升糖' : fruit.gi_level === 'medium' ? '中升糖' : '高升糖'})
                </span>
              </div>
            </div>
          </div>
          <button onclick="closeModal()" class="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors text-lg">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-6">
          <div>
            <p class="text-slate-600 text-sm leading-relaxed mb-3">${fruit.description}</p>
            <div class="flex flex-wrap gap-1.5">
              ${fruit.tags
                .map((t) => `<span class="px-2.5 py-0.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">#${t}</span>`)
                .join('')}
            </div>
          </div>

          <!-- Portion selector -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">快速份量換算</label>
                <div class="flex items-center space-x-2 mt-1">
                  <button onclick="setModalGrams(100)" class="px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    grams === 100 ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }">
                    100g (基準)
                  </button>
                  ${
                    fruit.serving_unit
                      ? `
                    <button onclick="setModalGrams(${fruit.serving_unit.grams})" class="px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                          grams === fruit.serving_unit.grams ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                        }">
                      1 ${fruit.serving_unit.name} (${fruit.serving_unit.grams}g)
                    </button>
                    <button onclick="setModalGrams(${Math.round(fruit.serving_unit.grams / 2)})" class="px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                          grams === Math.round(fruit.serving_unit.grams / 2) ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                        }">
                      半${fruit.serving_unit.name.charAt(0)} (${Math.round(fruit.serving_unit.grams / 2)}g)
                    </button>
                  `
                      : ''
                  }
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <input type="number" min="10" max="1000" step="5" value="${grams}" onchange="setModalGrams(Math.max(1, Number(this.value) || 0))" class="w-24 px-3 py-1.5 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-center" />
                <span class="text-sm font-medium text-slate-600">公克 (g)</span>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div>
            <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h4 class="text-sm font-bold text-slate-700 flex items-center space-x-2">
                <span>完整營養成分表</span>
                <span class="text-xs font-normal text-slate-500">
                  (換算數值為：<strong class="text-emerald-700">${grams}g</strong>)
                </span>
              </h4>
              <a
                href="${tfdaLink}"
                target="_blank"
                rel="noopener noreferrer"
                class="text-2xs text-emerald-700 hover:text-emerald-900 hover:underline flex items-center space-x-1 font-medium bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-200/60 transition"
                title="衛生福利部食品藥物管理署 (TFDA) 官方「${fruit.name}」檢驗報告詳細頁面"
              >
                <span>🔍 衛福部 TFDA 官方檢驗報告對照 ↗</span>
              </a>
            </div>
            <div class="overflow-hidden border border-slate-200 rounded-2xl">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead class="bg-slate-100 text-slate-600 font-semibold uppercase text-2xs border-b border-slate-200">
                  <tr>
                    <th class="py-2.5 px-4">營養項目</th>
                    <th class="py-2.5 px-3 text-right">每 100g 基準</th>
                    <th class="py-2.5 px-4 text-right bg-emerald-50 text-emerald-900 font-bold">換算份量 (${grams}g)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800">熱量 (Calories)</td>
                    <td class="py-2.5 px-3 text-right text-slate-600">${nut100.calories} kcal</td>
                    <td class="py-2.5 px-4 text-right font-bold text-emerald-700 bg-emerald-50/40">${nutServing.calories} kcal</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800">總碳水化合物</td>
                    <td class="py-2.5 px-3 text-right text-slate-600">${nut100.carbohydrates} g</td>
                    <td class="py-2.5 px-4 text-right font-semibold text-slate-900 bg-emerald-50/40">${nutServing.carbohydrates} g</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800 pl-8">↳ 總糖量 (Sugar)</td>
                    <td class="py-2.5 px-3 text-right text-amber-600 font-medium">${nut100.sugar} g</td>
                    <td class="py-2.5 px-4 text-right font-semibold text-amber-700 bg-emerald-50/40">${nutServing.sugar} g</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800 pl-8">↳ 膳食纖維 (Fiber)</td>
                    <td class="py-2.5 px-3 text-right text-emerald-600 font-medium">${nut100.dietary_fiber} g</td>
                    <td class="py-2.5 px-4 text-right font-semibold text-emerald-700 bg-emerald-50/40">${nutServing.dietary_fiber} g</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800">蛋白質 (Protein)</td>
                    <td class="py-2.5 px-3 text-right text-slate-600">${nut100.protein} g</td>
                    <td class="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">${nutServing.protein} g</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800">脂肪 (Fat)</td>
                    <td class="py-2.5 px-3 text-right text-slate-600">${nut100.fat} g</td>
                    <td class="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">${nutServing.fat} g</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800 pl-8">↳ 飽和脂肪</td>
                    <td class="py-2.5 px-3 text-right text-slate-600">${nut100.saturated_fat || 0} g</td>
                    <td class="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">${nutServing.saturated_fat || 0} g</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800 pl-8">↳ 反式脂肪</td>
                    <td class="py-2.5 px-3 text-right text-slate-600">0 g</td>
                    <td class="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">0 g</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800">鈉 (Sodium)</td>
                    <td class="py-2.5 px-3 text-right text-slate-600">${nut100.sodium} mg</td>
                    <td class="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">${nutServing.sodium} mg</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800">維生素 C</td>
                    <td class="py-2.5 px-3 text-right text-orange-600 font-semibold">${nut100.vitamin_c} mg</td>
                    <td class="py-2.5 px-4 text-right font-bold text-orange-600 bg-emerald-50/40">${nutServing.vitamin_c} mg</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800">鉀 (Potassium)</td>
                    <td class="py-2.5 px-3 text-right text-slate-600">${nut100.potassium} mg</td>
                    <td class="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">${nutServing.potassium} mg</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-medium text-slate-800">水分 (Water)</td>
                    <td class="py-2.5 px-3 text-right text-slate-600">${nut100.water} g</td>
                    <td class="py-2.5 px-4 text-right text-slate-800 bg-emerald-50/40">${nutServing.water} g</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition">
            關閉
          </button>
          <button onclick="addToPlate('${fruit.id}', ${grams}); closeModal();" class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition flex items-center space-x-2">
            <span>+ 加入水果搭配 (${grams}g)</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 全域控制函式 (掛載到 window 供 HTML 呼叫)
// ==========================================

window.toggleCostFruitPin = function (fruitId) {
  toggleFavorite(fruitId);
  const tableContainer = document.getElementById('cost-database-table-container');
  if (tableContainer) tableContainer.innerHTML = renderCostDatabaseRowsHtml();
  const catBar = document.getElementById('cost-category-bar');
  if (catBar) catBar.innerHTML = renderCostCategoryButtonsHtml();
  const btn = document.getElementById('cost-pin-toggle-btn');
  if (btn) {
    btn.innerHTML = `<span>${state.costPinTop !== false ? '📌 釘選置頂中' : '📍 預設排序'}</span><span class="text-3xs bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">${(state.favorites || []).length}</span>`;
  }
};

window.toggleCostPinTop = function () {
  state.costPinTop = !(state.costPinTop !== false);
  autoSaveCurrentState();
  const tableContainer = document.getElementById('cost-database-table-container');
  if (tableContainer) tableContainer.innerHTML = renderCostDatabaseRowsHtml();
  const btn = document.getElementById('cost-pin-toggle-btn');
  if (btn) {
    btn.className = `px-2.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center space-x-1 shadow-2xs ${
      state.costPinTop !== false
        ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
    }`;
    btn.innerHTML = `<span>${state.costPinTop !== false ? '📌 釘選置頂中' : '📍 預設排序'}</span><span class="text-3xs bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">${(state.favorites || []).length}</span>`;
  }
};

window.handleCostStorageFilter = function (filter) {
  state.costStorageFilter = filter;
  const tableContainer = document.getElementById('cost-database-table-container');
  if (tableContainer) tableContainer.innerHTML = renderCostDatabaseRowsHtml();
  renderTabContent();
};

window.togglePlateItemStorageType = function (index) {
  if (state.plateItems[index]) {
    const current = state.plateItems[index].storageType || 'fresh';
    state.plateItems[index].storageType = current === 'fresh' ? 'frozen' : 'fresh';
    autoSaveCurrentState();
    render();
  }
};

window.updateFruitCost = function (fruitId, storageType, field, val) {
  // 相容先前三參數呼叫 (fruitId, field, val)
  if (val === undefined) {
    val = field;
    field = storageType;
    storageType = 'fresh';
  }

  if (!state.fruitCosts) state.fruitCosts = {};
  if (!state.fruitCosts[fruitId]) {
    state.fruitCosts[fruitId] = {};
  }
  if (!state.fruitCosts[fruitId][storageType]) {
    state.fruitCosts[fruitId][storageType] = { ...getFruitCostConfig(fruitId, storageType) };
  }

  const num = Math.max(0, Number(val) || 0);
  state.fruitCosts[fruitId][storageType][field] = num;
  autoSaveCurrentState();

  if (state.activeTab === 'cost') {
    const tableContainer = document.getElementById('cost-database-table-container');
    if (tableContainer) tableContainer.innerHTML = renderCostDatabaseRowsHtml();
    const liveCalc = document.getElementById('cost-live-calculator-container');
    if (liveCalc) liveCalc.innerHTML = renderCostLiveCalculatorHtml();
    const kpiContainer = document.getElementById('cost-kpi-container');
    if (kpiContainer) kpiContainer.innerHTML = renderCostKPIsHtml();
  } else {
    render();
  }
};

window.quickAddToPlate = function (fruitId, grams = 100, storageType = 'fresh') {
  const existing = state.plateItems.find((item) => item.fruitId === fruitId && (item.storageType || 'fresh') === storageType);
  if (existing) {
    existing.grams = Math.min(1000, existing.grams + grams);
  } else {
    state.plateItems.push({ fruitId, grams, storageType });
  }
  syncLabelWeightWithPlate();
  autoSaveCurrentState();

  const f = getFruit(fruitId);
  const typeName = storageType === 'frozen' ? '❄️ 冷凍' : '🌱 常溫';
  if (state.activeTab === 'cost') {
    const kpiContainer = document.getElementById('cost-kpi-container');
    if (kpiContainer) kpiContainer.innerHTML = renderCostKPIsHtml();
    const liveCalc = document.getElementById('cost-live-calculator-container');
    if (liveCalc) liveCalc.innerHTML = renderCostLiveCalculatorHtml();
  } else {
    render();
  }
  alert(`✅ 已將「${typeName}${f.name}」${grams}g 投入目前拼盤！\n下方拼盤成本已即時更新。`);
};

window.handleCostSearch = function (val) {
  state.costSearchTerm = val;
  const tableContainer = document.getElementById('cost-database-table-container');
  if (tableContainer) tableContainer.innerHTML = renderCostDatabaseRowsHtml();
};

window.handleCostCategory = function (cat) {
  state.costCategory = cat;
  const tableContainer = document.getElementById('cost-database-table-container');
  if (tableContainer) tableContainer.innerHTML = renderCostDatabaseRowsHtml();
  const catBar = document.getElementById('cost-category-bar');
  if (catBar) catBar.innerHTML = renderCostCategoryButtonsHtml();
};

window.handleCostSort = function (val) {
  if (val.includes('_')) {
    const [field, order] = val.split('_');
    state.costSortBy = field;
    state.costSortOrder = order;
  } else {
    state.costSortBy = val;
    state.costSortOrder = 'asc';
  }
  const tableContainer = document.getElementById('cost-database-table-container');
  if (tableContainer) tableContainer.innerHTML = renderCostDatabaseRowsHtml();
};



window.scrollToCostCalculator = function () {
  const el = document.getElementById('cost-live-calculator-section');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

window.exportCostDatabaseToCSV = function () {
  const dateStr = new Date().toISOString().split('T')[0];
  const rows = [
    ['【Cfruit 水果原料成本與加工取果率資料庫總表（常溫鮮果 vs 冷凍水果雙軌對比）】'],
    ['製表日期', new Date().toLocaleDateString('zh-TW')],
    ['標準規範', '台灣衛生福利部食品藥物管理署 (TFDA) 台灣食品成分資料庫'],
    ['* 核心公式：實質果肉單價 (元/kg) = 進貨單價 ÷ (取果率% / 100)；每公克果肉單價 (元/g) = 實質單價 ÷ 1000；加工損耗率 (%) = 100% - 取果率%'],
    [],
    [
      '水果品名',
      '英文名稱',
      '商品分類',
      '常溫進貨價 (元/kg)',
      '常溫取果率 (%)',
      '常溫損耗率 (%)',
      '常溫實質單價 (元/kg)',
      '常溫前處理說明',
      '冷凍進貨價 (元/kg)',
      '冷凍出成率 (%)',
      '冷凍滴水損耗 (%)',
      '冷凍實質單價 (元/kg)',
      '冷凍加工規格',
      '鮮凍效益分析 (何者更省)',
      '每公斤差額 (元/kg)',
      '每100g熱量 (kcal)',
      '每100g糖分 (g)',
      'TFDA官方檢驗網址'
    ],
    ...state.fruits.map((f) => {
      const freshCfg = getFruitCostConfig(f.id, 'fresh');
      const frozenCfg = getFruitCostConfig(f.id, 'frozen');

      const freshEff = freshCfg.purchasePrice / (freshCfg.yieldRate / 100);
      const frozenEff = frozenCfg.purchasePrice / (frozenCfg.yieldRate / 100);
      const diff = freshEff - frozenEff;

      const betterText = Math.abs(diff) < 2
        ? '兩者成本相當'
        : diff > 0
        ? `冷凍水果較省 ($${diff.toFixed(1)}/kg)`
        : `常溫鮮果較省 ($${(-diff).toFixed(1)}/kg)`;

      return [
        f.name,
        f.english_name || '',
        f.category || '',
        freshCfg.purchasePrice,
        `${freshCfg.yieldRate}%`,
        `${100 - freshCfg.yieldRate}%`,
        freshEff.toFixed(1),
        freshCfg.note || '去皮去籽加工',
        frozenCfg.purchasePrice,
        `${frozenCfg.yieldRate}%`,
        `${100 - frozenCfg.yieldRate}%`,
        frozenEff.toFixed(1),
        frozenCfg.note || 'IQF鮮凍果丁',
        betterText,
        Math.abs(diff).toFixed(1),
        f.nutrition_per_100g.calories,
        f.nutrition_per_100g.sugar,
        f.tfda_url || ''
      ];
    })
  ];

  const csvContent = rows
    .map((row) =>
      row
        .map((field) => {
          const str = String(field !== undefined && field !== null ? field : '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Cfruit_水果原料成本資料庫_常溫與冷凍雙軌_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};



window.updateCostConfig = function (field, val) {
  if (!state.costConfig) {
    state.costConfig = {
      packagingCost: 5,
      laborCost: 0,
      sellingPrice: 80,
      targetMargin: 50,
    };
  }
  state.costConfig[field] = Math.max(0, Number(val) || 0);
  autoSaveCurrentState();

  if (state.activeTab === 'cost') {
    const liveCalc = document.getElementById('cost-live-calculator-container');
    if (liveCalc) liveCalc.innerHTML = renderCostLiveCalculatorHtml();
  } else {
    render();
  }
};

window.resetFruitCosts = function () {
  if (!confirm('確定要將所有水果的進貨單價與取果率重設為系統預設值嗎？')) return;
  state.fruitCosts = {};
  autoSaveCurrentState();
  render();
};

window.copyCostSummaryText = function () {
  const costs = calcPlateCosts();
  if (costs.itemCosts.length === 0) return;

  const lines = [
    `【Cfruit 水果拼盤原料成本與定價試算】`,
    `搭配品名：${state.labelConfig.productName || '未命名商品'}`,
    `總果肉重量：${costs.totalPlateWeight} g | 需採購毛重約：${Math.round(costs.totalPurchasedWeight)} g`,
    `----------------------------------------`,
    `各品項原料明細：`,
    ...costs.itemCosts.map(
      (ic) =>
        `• ${ic.fruitName} ${ic.grams}g (進貨 $${ic.purchasePrice}/kg，取果率 ${ic.yieldRate}%) ➔ 需採購 ${Math.round(ic.rawWeightNeeded)}g，成本 $${ic.itemCost.toFixed(1)}元 (${ic.costPercentage.toFixed(1)}%)`
    ),
    `----------------------------------------`,
    `總原料成本：NT$ ${costs.totalRawCost.toFixed(1)} 元`,
    `每 100g 原料成本：NT$ ${costs.costPer100g.toFixed(1)} 元`,
    `包材耗材成本：NT$ ${costs.packagingCost} 元 | 人工成本：NT$ ${costs.laborCost} 元`,
    `總生產成本：NT$ ${costs.totalCost.toFixed(1)} 元/盒`,
    `預計售價：NT$ ${costs.sellingPrice} 元/盒 ➔ 毛利 NT$ ${costs.grossProfit.toFixed(1)} 元 (${costs.grossMarginPct.toFixed(1)}%)`,
    `目標 ${costs.targetMargin}% 毛利建議售價：NT$ ${Math.ceil(costs.suggestedPrice)} 元`,
    `產出時間：${new Date().toLocaleString('zh-TW')}`,
  ];

  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    const btn = document.getElementById('copy-cost-btn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '<span>✅ 已複製！</span>';
      setTimeout(() => {
        btn.innerHTML = orig;
      }, 2000);
    }
  });
};

window.switchPlateRightTab = function (tab) {
  state.plateRightTab = tab;
  renderTabContent();
};

window.switchTab = function (tab) {
  state.activeTab = tab;
  render();
};

window.addToPlate = function (fruitId, grams) {
  const existing = state.plateItems.find((item) => item.fruitId === fruitId);
  if (existing) {
    existing.grams = Math.min(1000, existing.grams + grams);
  } else {
    state.plateItems.push({ fruitId, grams });
  }  syncLabelWeightWithPlate();
  render();
};

window.updateGrams = function (index, grams) {
  if (state.plateItems[index]) {
    state.plateItems[index].grams = grams;
    syncLabelWeightWithPlate();
    render();
  }
};
window.adjustGrams = function (index, delta) {
  if (state.plateItems[index]) {
    const current = Number(state.plateItems[index].grams) || 0;
    const newGrams = Math.max(1, Math.min(1000, current + delta));
    updateGrams(index, newGrams);
  }
};


window.removePlateItem = function (index) {
  state.plateItems.splice(index, 1);
  syncLabelWeightWithPlate();
  render();
};

window.clearPlate = function () {
  state.plateItems = [];
  syncLabelWeightWithPlate();
  render();
};

window.applyPreset = function (presetKey) {
  switch (presetKey) {
    case 'weight_loss':
      state.plateItems = [
        { fruitId: 'guava_pearl', grams: 150 },
        { fruitId: 'kiwi_green', grams: 85 },
        { fruitId: 'blueberry', grams: 50 },
      ];
      break;
    case 'vitamin_c':
      state.plateItems = [
        { fruitId: 'kiwi_gold', grams: 90 },
        { fruitId: 'strawberry', grams: 100 },
        { fruitId: 'guava_red', grams: 100 },
      ];
      break;
    case 'workout':
      state.plateItems = [
        { fruitId: 'banana', grams: 120 },
        { fruitId: 'apple_fuji', grams: 100 },
      ];
      break;
    case 'hydration':
      state.plateItems = [
        { fruitId: 'wax_apple', grams: 110 },
        { fruitId: 'watermelon_red', grams: 150 },
      ];
      break;
  }
  syncLabelWeightWithPlate();
  render();
};


window.toggleAutoSyncWeight = function () {
  state.labelConfig.autoSyncWeight = !state.labelConfig.autoSyncWeight;
  if (state.labelConfig.autoSyncWeight) {
    syncLabelWeightWithPlate();
  }
  renderTabContent();
};

window.setManualServingSize = function (val) {
  state.labelConfig.servingSize = Math.max(1, Number(val) || 100);
  state.labelConfig.autoSyncWeight = false;
  renderTabContent();
};

window.handleProductNameInput = function (val) {
  state.labelConfig.productName = val;
  autoSaveCurrentState();
  const displays = document.querySelectorAll('.label-product-name-display');
  displays.forEach((el) => {
    el.textContent = val || '未命名商品';
  });
  const inputs = document.querySelectorAll('.product-name-input-class');
  inputs.forEach((inp) => {
    if (inp !== document.activeElement && inp.value !== val) {
      inp.value = val;
    }
  });
};

window.updateLabelConfig = function (key, val) {
  state.labelConfig[key] = val;
  renderTabContent();
};

window.applyProductPreset = function (key) {
  switch (key) {
    case 'salad_box':
      state.labelConfig.productName = '綜合鮮切水果盒';
      state.labelConfig.servingSize = 200;
      state.labelConfig.servingsPerPkg = 1;
      state.labelConfig.sourceType = 'plate';
      break;
    case 'guava_cup':
      state.labelConfig.productName = '鮮切珍珠芭樂隨手杯';
      state.labelConfig.servingSize = 150;
      state.labelConfig.servingsPerPkg = 1;
      state.labelConfig.sourceType = 'single';
      state.labelConfig.singleFruitId = 'guava_pearl';
      break;
    case 'family_pack':
      state.labelConfig.productName = '家庭號生鮮綜合果盒';
      state.labelConfig.servingSize = 200;
      state.labelConfig.servingsPerPkg = 2;
      state.labelConfig.sourceType = 'plate';
      break;
    case 'dried_fruit':
      state.labelConfig.productName = '愛文芒果鮮切盒';
      state.labelConfig.servingSize = 180;
      state.labelConfig.servingsPerPkg = 1;
      state.labelConfig.sourceType = 'single';
      state.labelConfig.singleFruitId = 'mango_irwin';
      break;
  }
  renderTabContent();
};

window.copyLabelPlainText = function () {
  const cfg = state.labelConfig;
  const { base100g, perServing } = getLabelNutrients();
  const isDual = cfg.labelFormat === 'dual';

  const lines = [
    `【營養標示】`,
    `品名：${cfg.productName}`,
    `每一份量：${cfg.servingSize} 公克`,
    `本包裝含：${cfg.servingsPerPkg} 份`,
    `----------------------------------------`,
    isDual
      ? `項目           每份          每100公克`
      : `項目           每份          每日參考值百分比`,
    `----------------------------------------`,
    `熱量           ${fmtTFDANut(perServing.calories, 'calories')} 大卡       ${isDual ? fmtTFDANut(base100g.calories, 'calories') + ' 大卡' : calcDailyPct(perServing.calories, 'calories')}`,
    `蛋白質         ${fmtTFDANut(perServing.protein, 'protein')} 公克       ${isDual ? fmtTFDANut(base100g.protein, 'protein') + ' 公克' : calcDailyPct(perServing.protein, 'protein')}`,
    `脂肪           ${fmtTFDANut(perServing.fat, 'fat')} 公克       ${isDual ? fmtTFDANut(base100g.fat, 'fat') + ' 公克' : calcDailyPct(perServing.fat, 'fat')}`,
    `  飽和脂肪     ${fmtTFDANut(perServing.saturated_fat, 'saturated_fat')} 公克       ${isDual ? fmtTFDANut(base100g.saturated_fat, 'saturated_fat') + ' 公克' : calcDailyPct(perServing.saturated_fat, 'saturated_fat')}`,
    `  反式脂肪     ${fmtTFDANut(perServing.trans_fat, 'trans_fat')} 公克       ${isDual ? fmtTFDANut(base100g.trans_fat, 'trans_fat') + ' 公克' : '*'}`,
    `碳水化合物     ${fmtTFDANut(perServing.carbohydrates, 'carbohydrates')} 公克       ${isDual ? fmtTFDANut(base100g.carbohydrates, 'carbohydrates') + ' 公克' : calcDailyPct(perServing.carbohydrates, 'carbohydrates')}`,
    `  糖           ${fmtTFDANut(perServing.sugar, 'sugar')} 公克       ${isDual ? fmtTFDANut(base100g.sugar, 'sugar') + ' 公克' : '*'}`,
    `鈉             ${fmtTFDANut(perServing.sodium, 'sodium')} 毫克       ${isDual ? fmtTFDANut(base100g.sodium, 'sodium') + ' 毫克' : calcDailyPct(perServing.sodium, 'sodium')}`,
  ];

  if (cfg.includeFiber) {
    lines.push(`膳食纖維       ${fmtTFDANut(perServing.dietary_fiber, 'dietary_fiber')} 公克       ${isDual ? fmtTFDANut(base100g.dietary_fiber, 'dietary_fiber') + ' 公克' : calcDailyPct(perServing.dietary_fiber, 'dietary_fiber')}`);
  }
  if (cfg.includeVitaminC) {
    lines.push(`維生素 C       ${fmtTFDANut(perServing.vitamin_c, 'vitamin_c')} 毫克       ${isDual ? fmtTFDANut(base100g.vitamin_c, 'vitamin_c') + ' 毫克' : calcDailyPct(perServing.vitamin_c, 'vitamin_c')}`);
  }
  if (cfg.includePotassium) {
    lines.push(`鉀             ${fmtTFDANut(perServing.potassium, 'potassium')} 毫克       ${isDual ? fmtTFDANut(base100g.potassium, 'potassium') + ' 毫克' : calcDailyPct(perServing.potassium, 'potassium')}`);
  }

  lines.push(`----------------------------------------`);
  if (!isDual) {
    lines.push(`* 參考值未訂定`);
    lines.push(`每日參考值：熱量 2000 大卡、蛋白質 60 公克、脂肪 60 公克、飽和脂肪 18 公克、碳水化合物 300 公克、鈉 2000 毫克。`);
  }

  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    const btn = document.getElementById('copy-label-btn');
    if (btn) {
      btn.innerHTML = '✅ 已複製文字！';
      setTimeout(() => {
        btn.innerHTML = '📋 複製純文字';
      }, 2000);
    }
  });
};

window.handleSearch = function (val) {
  state.searchTerm = val;
  const container = document.getElementById('catalog-cards-container');
  if (container) {
    container.innerHTML = renderCatalogCardsHtml();
  } else {
    renderTabContent();
  }
};

window.handleSelectCategory = function (cat) {
  state.selectedCategory = cat;
  const container = document.getElementById('catalog-cards-container');
  if (container) container.innerHTML = renderCatalogCardsHtml();
  const catBar = document.getElementById('catalog-category-bar');
  if (catBar) catBar.innerHTML = renderCatalogCategoriesHtml();
};

window.handleSelectTag = function (tag) {
  state.selectedTag = tag;
  const container = document.getElementById('catalog-cards-container');
  if (container) container.innerHTML = renderCatalogCardsHtml();
  const tagBar = document.getElementById('catalog-tag-bar');
  if (tagBar) tagBar.innerHTML = renderCatalogTagsHtml();
};

window.resetFilters = function () {
  state.searchTerm = '';
  state.selectedCategory = '全部';
  state.selectedTag = '全部';
  const inp = document.getElementById('catalog-search-input');
  if (inp) inp.value = '';
  const container = document.getElementById('catalog-cards-container');
  if (container) container.innerHTML = renderCatalogCardsHtml();
  const catBar = document.getElementById('catalog-category-bar');
  if (catBar) catBar.innerHTML = renderCatalogCategoriesHtml();
  const tagBar = document.getElementById('catalog-tag-bar');
  if (tagBar) tagBar.innerHTML = renderCatalogTagsHtml();
};

window.toggleFavorite = function (fruitId) {
  if (!state.favorites) state.favorites = [];
  const idx = state.favorites.indexOf(fruitId);
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
  } else {
    state.favorites.push(fruitId);
  }
  autoSaveCurrentState();

  if (state.modalFruit) {
    renderModal();
  }

  const container = document.getElementById('catalog-cards-container');
  if (container) {
    container.innerHTML = renderCatalogCardsHtml();
    const tagBar = document.getElementById('catalog-tag-bar');
    if (tagBar) tagBar.innerHTML = renderCatalogTagsHtml();
    const favBadge = document.getElementById('catalog-fav-badge');
    if (favBadge) {
      if (state.favorites.length > 0) {
        favBadge.classList.remove('hidden');
        favBadge.classList.add('inline-flex');
        favBadge.innerHTML = `<span>⭐ 已收藏置頂 ${state.favorites.length} 款</span>`;
      } else {
        favBadge.classList.add('hidden');
        favBadge.classList.remove('inline-flex');
      }
    }
  } else {
    renderTabContent();
  }
};

window.toggleFavoritePinTop = function () {
  state.favoritePinTop = !state.favoritePinTop;
  autoSaveCurrentState();
  const container = document.getElementById('catalog-cards-container');
  if (container) {
    container.innerHTML = renderCatalogCardsHtml();
    const btn = document.getElementById('catalog-pin-toggle-btn');
    if (btn) {
      btn.className = `px-3 py-2.5 rounded-2xl text-xs font-semibold transition shrink-0 flex items-center space-x-1.5 shadow-2xs ${
        state.favoritePinTop
          ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
      }`;
      btn.innerHTML = `<span>${state.favoritePinTop ? '📌 收藏置頂中' : '📍 預設排序'}</span>`;
    }
  } else {
    renderTabContent();
  }
};

window.openDetailModal = function (fruitId) {
  const fruit = getFruit(fruitId);
  state.modalFruit = fruit;
  state.modalGrams = fruit.serving_unit?.grams || 100;
  renderModal();
};

window.closeModal = function () {
  state.modalFruit = null;
  renderModal();
};

window.setModalGrams = function (grams) {
  state.modalGrams = grams;
  renderModal();
};

window.setComparisonFruit = function (slot, id) {
  if (slot === 'A') state.comparison.fruitAId = id;
  if (slot === 'B') state.comparison.fruitBId = id;
  renderTabContent();
};

window.setComparisonWeight = function (weight) {
  state.comparison.weight = weight;
  renderTabContent();
};

window.copySummaryText = function () {
  const totals = calcTotals();
  const lines = [
    `🥗 我的今日水果搭配營養報告`,
    `----------------------------`,
    ...state.plateItems.map((item) => {
      const f = getFruit(item.fruitId);
      const nut = calcItemNut(f, item.grams);
      return `• ${f.name} ${item.grams}g (約 ${nut.calories} kcal, 糖 ${nut.sugar}g)`;
    }),
    `----------------------------`,
    `總重量: ${totals.weight} g`,
    `總熱量: ${totals.calories} kcal (約 ${totals.servings} 份水果)`,
    `總碳水: ${totals.carbohydrates} g (總糖量: ${totals.sugar} g)`,
    `膳食纖維: ${totals.dietary_fiber} g`,
    `蛋白質: ${totals.protein} g | 脂肪: ${totals.fat} g`,
    `維生素 C: ${totals.vitamin_c} mg (達成人每日目標 ${Math.round((totals.vitamin_c / 100) * 100)}%)`,
    `鉀離子: ${totals.potassium} mg`,
  ];
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    const btn = document.getElementById('copy-btn');
    if (btn) {
      btn.innerHTML = '✅ 已複製！';
      setTimeout(() => {
        btn.innerHTML = '📋 複製摘要';
      }, 2000);
    }
  });
};

// 頁面初次載入
document.addEventListener('DOMContentLoaded', () => {
  render();
});


// ==========================================
// 匯出 CSV 報表功能 (UTF-8 with BOM 支援 Excel)
// ==========================================
window.exportPlateToCSV = function () {
  if (state.plateItems.length === 0) {
    alert('目前水果搭配清單為空，請先加入水果後再匯出！');
    return;
  }

  const totals = calcTotals();
  const cfg = state.labelConfig;
  const { base100g, perServing } = getLabelNutrients();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false });

  const rows = [
    ['【Cfruit 水果搭配與商品法規營養標示報表】'],
    ['商品品名', cfg.productName],
    ['產出時間', `${dateStr} ${timeStr}`],
    ['搭配總重量', `${totals.weight} 公克 (g)`],
    ['每一份量', `${cfg.servingSize} 公克 (g)`],
    ['本包裝含', `${cfg.servingsPerPkg} 份`],
    ['包裝總淨重', `${Math.round(cfg.servingSize * cfg.servingsPerPkg)} 公克 (g)`],
    [],
    ['【第一部分：搭配水果內容物明細清單】'],
    [
      '水果名稱',
      '英文名稱',
      '分類',
      '投入公克數 (g)',
      '熱量 (kcal)',
      '總碳水 (g)',
      '糖分 (g)',
      '膳食纖維 (g)',
      '蛋白質 (g)',
      '脂肪 (g)',
      '飽和脂肪 (g)',
      '反式脂肪 (g)',
      '鈉 (mg)',
      '維生素 C (mg)',
      '鉀 (mg)',
      '升糖指數 (GI)',
      'GI 等級'
    ],
    ...state.plateItems.map((item) => {
      const f = getFruit(item.fruitId);
      const nut = calcItemNut(f, item.grams);
      return [
        f.name,
        f.english_name,
        f.category,
        item.grams,
        nut.calories,
        nut.carbohydrates,
        nut.sugar,
        nut.dietary_fiber,
        nut.protein,
        nut.fat,
        nut.saturated_fat,
        nut.trans_fat,
        nut.sodium,
        nut.vitamin_c,
        nut.potassium,
        f.gi_value,
        f.gi_level === 'low' ? '低 GI' : f.gi_level === 'medium' ? '中 GI' : '高 GI'
      ];
    }),
    [
      '搭配合計總值',
      '',
      '',
      totals.weight,
      totals.calories,
      totals.carbohydrates,
      totals.sugar,
      totals.dietary_fiber,
      totals.protein,
      totals.fat,
      totals.saturated_fat,
      totals.trans_fat,
      totals.sodium,
      totals.vitamin_c,
      totals.potassium,
      '',
      ''
    ],
    [],
    ['【第二部分：衛福部食品藥物管理署 (TFDA) 商品法規營養標示】'],
    ['項目', `每份 (${cfg.servingSize}g)`, '每 100 公克', '每日參考值百分比 (%)'],
    ['熱量 (大卡)', fmtTFDANut(perServing.calories, 'calories'), fmtTFDANut(base100g.calories, 'calories'), calcDailyPct(perServing.calories, 'calories')],
    ['蛋白質 (公克)', fmtTFDANut(perServing.protein, 'protein'), fmtTFDANut(base100g.protein, 'protein'), calcDailyPct(perServing.protein, 'protein')],
    ['脂肪 (公克)', fmtTFDANut(perServing.fat, 'fat'), fmtTFDANut(base100g.fat, 'fat'), calcDailyPct(perServing.fat, 'fat')],
    ['  飽和脂肪 (公克)', fmtTFDANut(perServing.saturated_fat, 'saturated_fat'), fmtTFDANut(base100g.saturated_fat, 'saturated_fat'), calcDailyPct(perServing.saturated_fat, 'saturated_fat')],
    ['  反式脂肪 (公克)', fmtTFDANut(perServing.trans_fat, 'trans_fat'), fmtTFDANut(base100g.trans_fat, 'trans_fat'), '*'],
    ['碳水化合物 (公克)', fmtTFDANut(perServing.carbohydrates, 'carbohydrates'), fmtTFDANut(base100g.carbohydrates, 'carbohydrates'), calcDailyPct(perServing.carbohydrates, 'carbohydrates')],
    ['  糖 (公克)', fmtTFDANut(perServing.sugar, 'sugar'), fmtTFDANut(base100g.sugar, 'sugar'), '*'],
    ['鈉 (毫克)', fmtTFDANut(perServing.sodium, 'sodium'), fmtTFDANut(base100g.sodium, 'sodium'), calcDailyPct(perServing.sodium, 'sodium')],
    ['膳食纖維 (公克)', fmtTFDANut(perServing.dietary_fiber, 'dietary_fiber'), fmtTFDANut(base100g.dietary_fiber, 'dietary_fiber'), calcDailyPct(perServing.dietary_fiber, 'dietary_fiber')],
    ['維生素 C (毫克)', fmtTFDANut(perServing.vitamin_c, 'vitamin_c'), fmtTFDANut(base100g.vitamin_c, 'vitamin_c'), calcDailyPct(perServing.vitamin_c, 'vitamin_c')],
    ['鉀 (毫克)', fmtTFDANut(perServing.potassium, 'potassium'), fmtTFDANut(base100g.potassium, 'potassium'), calcDailyPct(perServing.potassium, 'potassium')],
    [],
    ['* 參考值未訂定'],
    ['每日參考值：熱量 2000 大卡、蛋白質 60 公克、脂肪 60 公克、飽和脂肪 18 公克、碳水化合物 300 公克、鈉 2000 毫克、膳食纖維 25 公克。'],
    [],
    ['【第三部分：水果原料採購成本與毛利試算分析】'],
    ['水果品項', '原料來源型態', '英文名', '搭配果肉量 (g)', '進貨單價 (元/kg)', '加工取果率/出成率 (%)', '實質果肉單價 (元/kg)', '需採購毛重 (g)', '原料成本小計 (元)', '成本佔比 (%)'],
    ...(() => {
      const costs = calcPlateCosts();
      return [
        ...costs.itemCosts.map((ic) => [
          ic.fruitName,
          ic.storageType === 'frozen' ? '❄️ 冷凍水果' : '🌱 常溫鮮果',
          getFruit(ic.fruitId).english_name || '',
          ic.grams,
          ic.purchasePrice,
          `${ic.yieldRate}%`,
          Math.round(ic.effectivePricePerKg),
          Math.round(ic.rawWeightNeeded),
          ic.itemCost.toFixed(1),
          `${ic.costPercentage.toFixed(1)}%`
        ]),
        ['合計/綜合指標', '-', '', costs.totalPlateWeight, '-', '-', '-', Math.round(costs.totalPurchasedWeight), costs.totalRawCost.toFixed(1), '100%'],
        [],
        ['【商業成本分析與定價指標】', '數值', '單位/說明'],
        ['搭配總果肉重', costs.totalPlateWeight, '公克 (g)'],
        ['需採購原料毛重', Math.round(costs.totalPurchasedWeight), '公克 (g) - 依取果率加權損耗計算'],
        ['總原料成本', costs.totalRawCost.toFixed(1), '元 (NTD)'],
        ['每 100g 綜合原料成本', costs.costPer100g.toFixed(1), '元 / 100g'],
        ['包材耗材成本', costs.packagingCost, '元 / 盒 (果盒、叉子、貼紙等)'],
        ['人工處理加工成本', costs.laborCost, '元 / 盒'],
        ['總生產成本', costs.totalCost.toFixed(1), '元 / 盒 (原料 + 包材 + 人工)'],
        ['預計販售價格', costs.sellingPrice, '元 / 盒'],
        ['預估毛利額', costs.grossProfit.toFixed(1), '元 / 盒 (售價 - 總成本)'],
        ['預估毛利率', `${costs.grossMarginPct.toFixed(1)} %`, '毛利額 ÷ 售價'],
        ['目標毛利率', `${costs.targetMargin} %`, '自訂經營利潤目標'],
        ['達目標毛利之建議售價', Math.ceil(costs.suggestedPrice), '元 / 盒 (總成本 ÷ (1 - 目標毛利率))'],
        [],
        ['* 備註說明：實質果肉單價 = 進貨單價 ÷ (取果率% / 100)；需採購毛重 = 搭配投入量 ÷ (取果率% / 100)；原料成本 = 投入量 × (實質果肉單價 / 1000)。']
      ];
    })()
  ];

  // 轉換成 CSV 格式字串
  const csvContent = rows
    .map((row) =>
      row
        .map((field) => {
          const str = String(field !== undefined && field !== null ? field : '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\r\n');

  // 加入 \uFEFF (UTF-8 BOM) 避免 Excel 開啟中文亂碼
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeTitle = (cfg.productName || '水果搭配').replace(/[\\/:*?"<>|]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `水果搭配營養標示_${safeTitle}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ==========================================
// 搭配記憶與管理功能 (Saved Recipes)
// ==========================================
window.saveCurrentRecipePrompt = function () {
  if (state.plateItems.length === 0) {
    alert('目前水果搭配清單為空，無法儲存！');
    return;
  }
  const defaultName = `${state.labelConfig.productName} (${calcTotals().weight}g)`;
  const name = prompt('請輸入此搭配的儲存名稱：', defaultName);
  if (!name || !name.trim()) return;

  const newRecipe = {
    id: 'recipe_' + Date.now(),
    name: name.trim(),
    createdAt: new Date().toLocaleDateString('zh-TW'),
    plateItems: JSON.parse(JSON.stringify(state.plateItems)),
    labelConfig: JSON.parse(JSON.stringify(state.labelConfig)),
    fruitCosts: JSON.parse(JSON.stringify(state.fruitCosts)),
    costConfig: JSON.parse(JSON.stringify(state.costConfig)),
    totalWeight: calcTotals().weight,
    totalCalories: calcTotals().calories,
  };

  state.savedRecipes.unshift(newRecipe);
  setStoredJSON(RECIPES_KEY, state.savedRecipes);
  alert(`✅ 已成功儲存搭配「${newRecipe.name}」！您可隨時從「我的搭配」載入。`);
  render();
};

window.openRecipesModal = function () {
  state.recipesModalOpen = true;
  renderModal();
};

window.closeRecipesModal = function () {
  state.recipesModalOpen = false;
  renderModal();
};
window.startEditRecipe = function (recipeId, e) {
  if (e) e.stopPropagation();
  state.editingRecipeId = recipeId;
  renderModal();
  setTimeout(() => {
    const inputEl = document.getElementById(`edit-recipe-name-${recipeId}`);
    if (inputEl) {
      inputEl.focus();
      inputEl.select();
    }
  }, 50);
};

window.saveRecipeName = function (recipeId, newName, e) {
  if (e) e.stopPropagation();
  const r = state.savedRecipes.find((item) => item.id === recipeId);
  if (!r) return;
  const trimmed = (newName || '').trim();
  if (!trimmed) {
    alert('搭配名稱不能為空！');
    return;
  }
  const oldName = r.name;
  r.name = trimmed;
  if (r.labelConfig) {
    r.labelConfig.productName = trimmed;
  }
  setStoredJSON(RECIPES_KEY, state.savedRecipes);

  if (state.labelConfig && state.labelConfig.productName === oldName) {
    state.labelConfig.productName = trimmed;
    autoSaveCurrentState();
    const displays = document.querySelectorAll('.label-product-name-display');
    displays.forEach((el) => {
      el.textContent = trimmed;
    });
    const inputs = document.querySelectorAll('.product-name-input-class');
    inputs.forEach((inp) => {
      if (inp.value === oldName) inp.value = trimmed;
    });
  }

  state.editingRecipeId = null;
  renderModal();
};

window.cancelEditRecipeName = function (e) {
  if (e) e.stopPropagation();
  state.editingRecipeId = null;
  renderModal();
};


window.loadRecipe = function (recipeId) {
  const r = state.savedRecipes.find((item) => item.id === recipeId);
  if (!r) return;
  state.plateItems = JSON.parse(JSON.stringify(r.plateItems));
  if (r.labelConfig) {
    state.labelConfig = JSON.parse(JSON.stringify(r.labelConfig));
  }
  if (r.fruitCosts) {
    state.fruitCosts = JSON.parse(JSON.stringify(r.fruitCosts));
  }
  if (r.costConfig) {
    state.costConfig = JSON.parse(JSON.stringify(r.costConfig));
  }
  syncLabelWeightWithPlate();
  state.recipesModalOpen = false;
  render();
};


// ==========================================
// 配方分區與搜尋切換函式
// ==========================================
window.setRecipeFilterZone = function (zone) {
  state.recipeFilterZone = zone;
  renderModal();
};

window.setRecipeSearchQuery = function (q) {
  state.recipeSearchQuery = q;
  renderModal();
};

window.setLabelRecipeZone = function (zone) {
  state.labelRecipeZone = zone;
  renderTabContent();
};

window.loadRecipeToLabel = function (recipeId) {
  applySavedRecipeToLabel(recipeId);
  state.recipesModalOpen = false;
  switchTab('label');
};

window.restoreCommercialRecipes = function () {
  if (typeof confirm === 'function') {
    if (!confirm('確定要同步/重新匯入 37 款官方商業配方（鮮果多區、超商區、R&D研發中）嗎？現有自訂配方將會完整保留。')) return;
  }
  const existingIds = new Set(state.savedRecipes.map(r => r.id));
  const missing = DEFAULT_COMMERCIAL_RECIPES.filter(r => !existingIds.has(r.id));
  if (missing.length === 0) {
    const customOnly = state.savedRecipes.filter(r => !DEFAULT_COMMERCIAL_RECIPES.some(d => d.id === r.id));
    state.savedRecipes = [...DEFAULT_COMMERCIAL_RECIPES, ...customOnly];
  } else {
    state.savedRecipes = [...state.savedRecipes, ...missing];
  }
  setStoredJSON(RECIPES_KEY, state.savedRecipes);
  renderModal();
  render();
  if (typeof alert === 'function') {
    alert('已成功同步 37 款官方商業配方！');
  }
};

window.deleteRecipe = function (recipeId, e) {
  if (e) e.stopPropagation();
  if (!confirm('確定要刪除這筆已存搭配嗎？')) return;
  state.savedRecipes = state.savedRecipes.filter((r) => r.id !== recipeId);
  setStoredJSON(RECIPES_KEY, state.savedRecipes);
  renderModal();
  renderNavbar();
};

if (typeof window !== 'undefined') {
  window.getFruit = getFruit;
  window.fmtTFDANut = fmtTFDANut;
  window.calcDailyPct = calcDailyPct;
  window.calcRecipeTotalCalories = calcRecipeTotalCalories;
  window.DEFAULT_COMMERCIAL_RECIPES = DEFAULT_COMMERCIAL_RECIPES;
  window.renderCatalogCardsHtml = renderCatalogCardsHtml;
  window.getPlateHtml = getPlateHtml;
  window.getCatalogHtml = getCatalogHtml;
  window.renderModal = renderModal;
}



// ==========================================
// 價格波動庫互動事件與彈窗邏輯 (Inventory Actions & Modals)
// ==========================================

function attachInventoryEvents() {
  // 附加頁面事件
}

window.switchInventoryFruit = function(fruitId) {
  state.inventorySelectedFruit = fruitId;
  state.selectedChartPointId = null;
  render();
};

window.setInventoryTimeRange = function(range) {
  state.inventoryTimeRange = range;
  render();
};

window.setInventoryStorageFilter = function(filter) {
  state.inventoryStorageFilter = filter;
  render();
};

window.setInventoryViewTab = function(tab) {
  state.inventoryViewTab = tab;
  render();
};

window.selectChartDataPoint = function(batchId) {
  state.selectedChartPointId = batchId;
  render();
};

// ==========================================
// 價格走勢圖即時 HUD 懸浮註解提示系統 (0 毫秒極速響應、零位移)
// ==========================================

window.showChartBatchTooltip = function(event, batchId, fruitId, svgX, svgY) {
  const tooltip = document.getElementById('price-chart-floating-tooltip');
  const wrapper = document.getElementById('price-chart-wrapper');
  if (!tooltip || !wrapper) return;

  const batch = (state.inventoryBatches || []).find((b) => b.id === batchId);
  const fruit = getFruit(fruitId) || {};
  if (!batch) return;

  const isFrozen = batch.storageType === 'frozen';
  const effPrice = Number(batch.effectivePrice || (batch.purchasePrice / ((Number(batch.yieldRate) || 100) / 100))).toFixed(1);
  const totalSpend = Number(batch.totalAmount || (batch.purchasePrice * batch.quantityKg)).toLocaleString();

  tooltip.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2 gap-2">
      <div class="flex items-center space-x-1.5 font-bold text-white">
        <span>${isFrozen ? '❄️' : '🌱'}</span>
        <span>${fruit.name || '水果'} · ${batch.date}</span>
      </div>
      <span class="text-3xs font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">${batch.batchNo || '無批號'}</span>
    </div>
    <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-2xs mb-2">
      <div><span class="text-slate-400">進貨單價:</span> <strong class="${isFrozen ? 'text-sky-300' : 'text-emerald-400'} text-xs font-mono">$${batch.purchasePrice}</strong> <span class="text-3xs text-slate-400">/kg</span></div>
      <div><span class="text-purple-300">實質淨肉:</span> <strong class="text-purple-300 text-xs font-mono">$${effPrice}</strong> <span class="text-3xs text-slate-400">/kg</span></div>
      <div><span class="text-slate-400">${isFrozen ? '解凍出成' : '取果出成'}:</span> <strong class="text-slate-200 font-mono">${batch.yieldRate}%</strong></div>
      <div><span class="text-slate-400">進貨批額:</span> <strong class="text-slate-200 font-mono">${batch.quantityKg} kg</strong> <span class="text-3xs text-slate-400">($${totalSpend})</span></div>
    </div>
    <div class="text-3xs text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
      <span class="truncate max-w-[140px]">🏢 ${batch.supplier || '未註明廠商'}</span>
      <span class="text-sky-300 font-semibold">👉 點選鎖定明細</span>
    </div>
  `;

  tooltip.classList.remove('hidden');
  window.moveChartTooltip(event);

  // 點亮十字對齊參考線
  const crossX = document.getElementById('chart-hover-crosshair-x');
  const crossY = document.getElementById('chart-hover-crosshair-y');
  if (crossX && typeof svgX === 'number') {
    crossX.setAttribute('x1', svgX);
    crossX.setAttribute('x2', svgX);
    crossX.setAttribute('opacity', '0.6');
  }
  if (crossY && typeof svgY === 'number') {
    crossY.setAttribute('y1', svgY);
    crossY.setAttribute('y2', svgY);
    crossY.setAttribute('opacity', '0.6');
  }
};

window.showChartVendorTooltip = function(event, fruitId, vendorIdx, svgX, svgY) {
  const tooltip = document.getElementById('price-chart-floating-tooltip');
  const wrapper = document.getElementById('price-chart-wrapper');
  if (!tooltip || !wrapper) return;

  const comparison = calcVendorQuotesComparison(fruitId);
  const quotes = (comparison && comparison.quotes) || [];
  const vq = quotes[vendorIdx];
  if (!vq) return;

  const isWinner = vq.isWinner;
  const isTrap = vq.isTrap;
  const badgeTitle = isWinner ? '🏆 性價比冠軍' : isTrap ? '⚠️ 表面便宜陷阱' : '🏢 標準供應';
  const badgeClass = isWinner ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : isTrap ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-blue-500/20 text-sky-300 border-blue-500/40';

  tooltip.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2 gap-2">
      <div class="flex items-center space-x-1.5 font-bold text-white">
        <span>${isWinner ? '👑' : isTrap ? '⚠️' : '🏢'}</span>
        <span>${vq.vendorName}</span>
      </div>
      <span class="text-3xs font-semibold px-2 py-0.5 rounded-full border ${badgeClass}">${badgeTitle}</span>
    </div>
    <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-2xs mb-2">
      <div><span class="text-slate-400">今日報價:</span> <strong class="text-amber-300 text-xs font-mono">$${vq.quotePrice}</strong> <span class="text-3xs text-slate-400">/kg</span></div>
      <div><span class="text-purple-300">實質肉價:</span> <strong class="text-purple-300 text-xs font-mono">$${vq.effectivePrice.toFixed(1)}</strong> <span class="text-3xs text-slate-400">/kg</span></div>
      <div><span class="text-slate-400">預估出成:</span> <strong class="text-slate-200 font-mono">${vq.yieldRate}%</strong></div>
      <div><span class="text-slate-400">溫層規格:</span> <strong class="text-slate-200">${vq.storageType === 'frozen' ? '❄️ 冷凍' : '🌱 常溫'}</strong></div>
    </div>
    <div class="text-3xs text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
      <span class="truncate max-w-[140px]">${vq.notes || '即時詢價紀錄'}</span>
      <span class="text-amber-300 font-semibold">👉 點選跳轉比價矩陣</span>
    </div>
  `;

  tooltip.classList.remove('hidden');
  window.moveChartTooltip(event);

  const crossY = document.getElementById('chart-hover-crosshair-y');
  if (crossY && typeof svgY === 'number') {
    crossY.setAttribute('y1', svgY);
    crossY.setAttribute('y2', svgY);
    crossY.setAttribute('opacity', '0.6');
  }
};

window.showChartStaticTooltip = function(event, title, desc, tag, svgY) {
  const tooltip = document.getElementById('price-chart-floating-tooltip');
  if (!tooltip) return;

  tooltip.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5 gap-2">
      <span class="font-bold text-white text-xs">${title}</span>
      ${tag ? `<span class="text-3xs px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">${tag}</span>` : ''}
    </div>
    <div class="text-2xs text-slate-300 leading-relaxed">
      ${desc}
    </div>
  `;
  tooltip.classList.remove('hidden');
  window.moveChartTooltip(event);

  if (typeof svgY === 'number') {
    const crossY = document.getElementById('chart-hover-crosshair-y');
    if (crossY) {
      crossY.setAttribute('y1', svgY);
      crossY.setAttribute('y2', svgY);
      crossY.setAttribute('opacity', '0.6');
    }
  }
};

window.moveChartTooltip = function(event) {
  const tooltip = document.getElementById('price-chart-floating-tooltip');
  const wrapper = document.getElementById('price-chart-wrapper');
  if (!tooltip || !wrapper || !event) return;

  const rect = wrapper.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const tooltipW = tooltip.offsetWidth || 230;
  const tooltipH = tooltip.offsetHeight || 135;

  let posX = 0;
  let posY = 0;

  // 智慧側邊避讓演算 (Smart Side Offset)：
  // 提示卡片預設靠游標側邊浮動，徹底釋放被檢視的單點節點、折線與價格數值，確保 100% 不遮擋視覺焦點
  if (rect.width >= 500) {
    // 桌面與平板佈局：優先靠右側，若右側不足則鏡像靠左側
    if (mouseX + tooltipW + 24 <= rect.width) {
      posX = mouseX + 18;
    } else {
      posX = Math.max(12, mouseX - tooltipW - 18);
    }
    // 垂直方向：使卡片中心對齊游標高度，並做上下安全邊界限制 (防止頂部標題或底部截斷)
    const targetY = mouseY - tooltipH / 2;
    posY = Math.max(10, Math.min(rect.height - tooltipH - 10, targetY));
  } else {
    // 窄螢幕手機佈局：自動置於游標下方或上方，並做水平防溢出
    posX = Math.max(10, Math.min(rect.width - tooltipW - 10, mouseX - tooltipW / 2));
    if (mouseY + tooltipH + 24 <= rect.height) {
      posY = mouseY + 20;
    } else {
      posY = Math.max(10, mouseY - tooltipH - 20);
    }
  }

  tooltip.style.left = `${posX}px`;
  tooltip.style.top = `${posY}px`;
};

window.hideChartTooltip = function() {
  const tooltip = document.getElementById('price-chart-floating-tooltip');
  if (tooltip) {
    tooltip.classList.add('hidden');
  }
  const crossX = document.getElementById('chart-hover-crosshair-x');
  const crossY = document.getElementById('chart-hover-crosshair-y');
  if (crossX) crossX.setAttribute('opacity', '0');
  if (crossY) crossY.setAttribute('opacity', '0');
};

// 一鍵由原料成本庫跳轉至該水果歷史波動走勢
window.jumpToFruitFluctuation = function(fruitId) {
  state.activeTab = 'inventory';
  state.inventorySelectedFruit = fruitId;
  state.inventoryViewTab = 'chart';
  state.selectedChartPointId = null;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 新增進貨批次彈窗
window.openAddBatchModal = function(defaultFruitId) {
  const modalContainer = document.getElementById('add-batch-modal-container');
  if (!modalContainer) return;

  const targetFruitId = defaultFruitId || state.inventorySelectedFruit || 'mango_irwin';
  const fruit = getFruit(targetFruitId);
  const cfgFresh = getFruitCostConfig(targetFruitId, 'fresh');
  const todayStr = '2026-09-18'; // 預設進貨日

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-4 border border-slate-100 transform transition-all">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">📦</span>
            <h3 class="text-base font-extrabold text-slate-800">新增水果進貨入庫批次</h3>
          </div>
          <button onclick="closeAddBatchModal()" class="text-slate-400 hover:text-slate-600 p-1 text-lg">✕</button>
        </div>

        <form id="add-batch-form" onsubmit="submitAddBatch(event)" class="space-y-3.5 text-xs">
          <!-- 品項選擇 -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">水果品項：</label>
            <select
              id="batch-fruit-id"
              onchange="onBatchFruitChange(this.value)"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white"
            >
              ${state.fruits
                .map((f) => `<option value="${f.id}" ${f.id === targetFruitId ? 'selected' : ''}>${f.emoji} ${f.name} (${f.category})</option>`)
                .join('')}
            </select>
          </div>

          <!-- 日期與保存型態 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">進貨日期：</label>
              <input
                type="date"
                id="batch-date"
                required
                value="${todayStr}"
                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">保存型態：</label>
              <select
                id="batch-storage-type"
                onchange="onBatchStorageChange()"
                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="fresh">🌱 常溫鮮果 (需去皮切塊)</option>
                <option value="frozen">❄️ 冷凍水果 (IQF/純原汁)</option>
              </select>
            </div>
          </div>

          <!-- 進貨單價與取果率 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">進貨單價 (元/kg)：</label>
              <input
                type="number"
                id="batch-purchase-price"
                min="1"
                step="1"
                required
                value="${cfgFresh.purchasePrice}"
                oninput="updateBatchPreview()"
                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">取果/出成率 (%)：</label>
              <input
                type="number"
                id="batch-yield-rate"
                min="1"
                max="100"
                step="1"
                required
                value="${cfgFresh.yieldRate}"
                oninput="updateBatchPreview()"
                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
          </div>

          <!-- 進貨重量與批號 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">進貨總量 (kg)：</label>
              <input
                type="number"
                id="batch-quantity-kg"
                min="1"
                step="1"
                required
                value="100"
                oninput="updateBatchPreview()"
                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">進貨批號 (選填)：</label>
              <input
                type="text"
                id="batch-no"
                placeholder="例: MG-202609-01"
                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
          </div>

          <!-- 供應商與備註 -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">供應商 / 產地備註：</label>
            <input
              type="text"
              id="batch-supplier"
              placeholder="例: 高雄燕巢農會產銷第一班"
              class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          <!-- 即時核算預覽卡片 -->
          <div id="batch-preview-card" class="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80 text-amber-950 flex items-center justify-between">
            <div>
              <div class="text-3xs text-amber-800">換算實質果肉單價</div>
              <div id="preview-effective-price" class="text-base font-black">$ ${(cfgFresh.purchasePrice / (cfgFresh.yieldRate / 100)).toFixed(1)} / kg</div>
            </div>
            <div class="text-right">
              <div class="text-3xs text-amber-800">採購總支出</div>
              <div id="preview-total-amount" class="text-base font-black">$ ${(cfgFresh.purchasePrice * 100).toLocaleString()} 元</div>
            </div>
          </div>

          <!-- 按鈕列 -->
          <div class="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onclick="closeAddBatchModal()"
              class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition active:scale-95"
            >
              確認入庫並繪入走勢圖
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
};

window.closeAddBatchModal = function() {
  const modalContainer = document.getElementById('add-batch-modal-container');
  if (modalContainer) modalContainer.innerHTML = '';
};

window.onBatchFruitChange = function(fruitId) {
  const storageType = document.getElementById('batch-storage-type')?.value || 'fresh';
  const cfg = getFruitCostConfig(fruitId, storageType);
  const priceInput = document.getElementById('batch-purchase-price');
  const yieldInput = document.getElementById('batch-yield-rate');
  if (priceInput) priceInput.value = cfg.purchasePrice;
  if (yieldInput) yieldInput.value = cfg.yieldRate;
  updateBatchPreview();
};

window.onBatchStorageChange = function() {
  const fruitId = document.getElementById('batch-fruit-id')?.value || 'mango_irwin';
  const storageType = document.getElementById('batch-storage-type')?.value || 'fresh';
  const cfg = getFruitCostConfig(fruitId, storageType);
  const priceInput = document.getElementById('batch-purchase-price');
  const yieldInput = document.getElementById('batch-yield-rate');
  if (priceInput) priceInput.value = cfg.purchasePrice;
  if (yieldInput) yieldInput.value = cfg.yieldRate;
  updateBatchPreview();
};

window.updateBatchPreview = function() {
  const price = Number(document.getElementById('batch-purchase-price')?.value) || 0;
  const yieldR = Number(document.getElementById('batch-yield-rate')?.value) || 100;
  const qty = Number(document.getElementById('batch-quantity-kg')?.value) || 0;

  const eff = yieldR > 0 ? price / (yieldR / 100) : price;
  const total = price * qty;

  const pEff = document.getElementById('preview-effective-price');
  const pTotal = document.getElementById('preview-total-amount');
  if (pEff) pEff.textContent = `$ ${eff.toFixed(1)} / kg`;
  if (pTotal) pTotal.textContent = `$ ${total.toLocaleString()} 元`;
};

window.submitAddBatch = function(e) {
  e.preventDefault();
  const fruitId = document.getElementById('batch-fruit-id')?.value;
  const date = document.getElementById('batch-date')?.value || new Date().toISOString().split('T')[0];
  const storageType = document.getElementById('batch-storage-type')?.value || 'fresh';
  const purchasePrice = Number(document.getElementById('batch-purchase-price')?.value) || 100;
  const yieldRate = Number(document.getElementById('batch-yield-rate')?.value) || 75;
  const quantityKg = Number(document.getElementById('batch-quantity-kg')?.value) || 50;
  const batchNo = (document.getElementById('batch-no')?.value || '').trim() || `B-${Date.now().toString().slice(-6)}`;
  const supplier = (document.getElementById('batch-supplier')?.value || '').trim();

  const effectivePrice = yieldRate > 0 ? purchasePrice / (yieldRate / 100) : purchasePrice;
  const totalAmount = purchasePrice * quantityKg;

  const newBatch = {
    id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    fruitId,
    date,
    storageType,
    batchNo,
    supplier,
    purchasePrice,
    yieldRate,
    effectivePrice,
    quantityKg,
    totalAmount,
    notes: '使用者自訂入庫批次'
  };

  state.inventoryBatches.push(newBatch);
  state.inventorySelectedFruit = fruitId;
  state.selectedChartPointId = newBatch.id;
  autoSaveCurrentState();
  closeAddBatchModal();
  render();
};

window.deleteInventoryBatch = function(batchId) {
  if (!confirm('確定要刪除此筆批次進貨紀錄嗎？刪除後將重新計算加權平均成本與走勢圖。')) return;
  state.inventoryBatches = state.inventoryBatches.filter((b) => b.id !== batchId);
  if (state.selectedChartPointId === batchId) {
    state.selectedChartPointId = null;
  }
  autoSaveCurrentState();
  render();
};

window.resetInventoryBatchesToDefault = function() {
  if (!confirm('確定要將所有歷史批次紀錄還原為系統內建的 12 個月示範行情數據嗎？自訂批次將被清除。')) return;
  state.inventoryBatches = JSON.parse(JSON.stringify(DEFAULT_INVENTORY_BATCHES));
  state.selectedChartPointId = null;
  autoSaveCurrentState();
  render();
};

// 匯出庫存歷史批次為標準 CSV 格式
window.exportInventoryBatchesToCSV = function() {
  const batches = [...(state.inventoryBatches || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const headers = [
    '進貨日期',
    '水果品項ID',
    '水果中文名',
    '保存型態',
    '批次編號',
    '進貨單價(元/kg)',
    '取果率出成率(%)',
    '實質果肉單價(元/kg)',
    '進貨數量(kg)',
    '採購總支出(元)',
    '供應商來源',
    '備註'
  ];

  const rows = batches.map((b) => {
    const fruit = getFruit(b.fruitId);
    const fruitName = fruit ? fruit.name : b.fruitId;
    const storageText = b.storageType === 'frozen' ? '冷凍水果' : '常溫鮮果';
    const eff = b.effectivePrice || (b.purchasePrice / (b.yieldRate / 100));
    const total = b.totalAmount || (b.purchasePrice * b.quantityKg);

    return [
      `"${b.date}"`,
      `"${b.fruitId}"`,
      `"${fruitName}"`,
      `"${storageText}"`,
      `"${b.batchNo || ''}"`,
      b.purchasePrice,
      b.yieldRate,
      eff.toFixed(2),
      b.quantityKg,
      total,
      `"${(b.supplier || '').replace(/"/g, '""')}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Cfruit_水果歷史進貨與庫存成本庫_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



// 自購詢價即時比對事件處理
window.handleCustomQuoteChange = function(field, value) {
  if (!state.inventoryCustomQuote) {
    state.inventoryCustomQuote = {};
  }
  const fruitId = state.inventorySelectedFruit || 'mango_irwin';
  state.inventoryCustomQuote.fruitId = fruitId;
  state.inventoryCustomQuote[field] = field === 'storageType' ? value : Number(value);
  autoSaveCurrentState();

  const container = document.getElementById('custom-quote-diagnosis-cards');
  if (container) {
    const fruit = getFruit(fruitId);
    const timeRange = state.inventoryTimeRange || 'all';
    const storageFilter = state.inventoryStorageFilter || 'all';
    const stats = calcFruitPriceStats(fruitId, timeRange, storageFilter);
    container.innerHTML = renderCustomQuoteDiagnosisHtml(fruit, stats, state.inventoryCustomQuote);
  }
  const stressContainer = document.getElementById('margin-stress-test-cards');
  if (stressContainer) {
    stressContainer.innerHTML = renderMarginStressTestCardsHtml(fruitId, state.inventoryCustomQuote.purchasePrice, state.inventoryCustomQuote.yieldRate);
  }
  const slider = document.getElementById('stress-test-slider');
  if (slider && field === 'purchasePrice') slider.value = value;
  const valDisplay = document.getElementById('stress-test-price-display');
  if (valDisplay && field === 'purchasePrice') valDisplay.innerText = `$${value} /kg`;
  if (!container && !stressContainer) {
    render();
  }
};

window.fillCustomQuotePrice = function(price, yieldR) {
  if (!state.inventoryCustomQuote) {
    state.inventoryCustomQuote = {};
  }
  const fruitId = state.inventorySelectedFruit || 'mango_irwin';
  state.inventoryCustomQuote.fruitId = fruitId;
  state.inventoryCustomQuote.purchasePrice = Number(price);
  if (yieldR) {
    state.inventoryCustomQuote.yieldRate = Number(yieldR);
  }
  autoSaveCurrentState();

  const pInp = document.getElementById('cq-purchase-price');
  if (pInp) pInp.value = price;
  const yInp = document.getElementById('cq-yield-rate');
  if (yInp && yieldR) yInp.value = yieldR;

  const container = document.getElementById('custom-quote-diagnosis-cards');
  if (container) {
    const fruit = getFruit(fruitId);
    const timeRange = state.inventoryTimeRange || 'all';
    const storageFilter = state.inventoryStorageFilter || 'all';
    const stats = calcFruitPriceStats(fruitId, timeRange, storageFilter);
    container.innerHTML = renderCustomQuoteDiagnosisHtml(fruit, stats, state.inventoryCustomQuote);
  } else {
    render();
  }
};

window.saveCustomQuoteAsBatch = function() {
  const quote = state.inventoryCustomQuote || {};
  const fruitId = state.inventorySelectedFruit || 'mango_irwin';
  const fruit = getFruit(fruitId);
  const cfg = getFruitCostConfig(fruitId, quote.storageType || 'fresh');

  const purchasePrice = Number(quote.purchasePrice || cfg.purchasePrice);
  const yieldRate = Number(quote.yieldRate || cfg.yieldRate);
  const quantityKg = Number(quote.quantityKg || 100);
  const storageType = quote.storageType || 'fresh';
  const effectivePrice = yieldRate > 0 ? purchasePrice / (yieldRate / 100) : purchasePrice;
  const totalAmount = purchasePrice * quantityKg;
  const todayStr = '2026-09-18';

  const newBatch = {
    id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    fruitId,
    date: todayStr,
    storageType,
    batchNo: `CQ-${todayStr.replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`,
    supplier: '自購詢價登錄批次',
    purchasePrice,
    yieldRate,
    effectivePrice,
    quantityKg,
    totalAmount,
    notes: `自購比對入庫 (每公斤 $${purchasePrice} 元)`
  };

  state.inventoryBatches.push(newBatch);
  state.selectedChartPointId = newBatch.id;
  autoSaveCurrentState();
  render();
  alert(`已成功將「${fruit.name}」自購價 $${purchasePrice}/kg (共 ${quantityKg} kg) 登錄至歷史進貨批次庫！折線圖與加權平均成本已即時更新。`);
};



// ==========================================
// 查找與登錄目前百科釘選水果之最新新鮮與 IQF 冷凍市價
// ==========================================

window.syncPinnedFruitsPricesToInventory = function(silent = false) {
  const favList = state.favorites && state.favorites.length > 0
    ? state.favorites
    : ['guava_pearl', 'guava_red', 'apple_fuji'];

  const todayStr = '2026-09-18';
  let addedCount = 0;
  const recordedFruits = [];

  favList.forEach((fruitId) => {
    const fruit = getFruit(fruitId);
    if (!fruit) return;

    // 取得該品項常溫與冷凍之官方/批發參考定價與取果率
    const freshCfg = getFruitCostConfig(fruitId, 'fresh');
    const frozenCfg = getFruitCostConfig(fruitId, 'frozen');

    // 1. 檢查今日常溫鮮果紀錄是否存在
    const hasFreshToday = (state.inventoryBatches || []).some(
      (b) => b.fruitId === fruitId && b.date === todayStr && b.storageType === 'fresh'
    );
    if (!hasFreshToday) {
      const freshPrice = freshCfg.purchasePrice || 80;
      const freshYield = freshCfg.yieldRate || 75;
      const freshBatch = {
        id: `batch_${fruitId}_today_fresh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        fruitId: fruitId,
        date: todayStr,
        storageType: 'fresh',
        batchNo: `${fruitId.toUpperCase().slice(0, 4)}-${todayStr.replace(/-/g, '')}-F`,
        supplier: `${fruit.name}產銷產地直送`,
        purchasePrice: freshPrice,
        yieldRate: freshYield,
        effectivePrice: Number((freshPrice / (freshYield / 100)).toFixed(2)),
        quantityKg: 150,
        totalAmount: freshPrice * 150,
        notes: `今日最新入庫 ${fruit.name} 新鮮鮮果 (取果率 ${freshYield}%)`
      };
      state.inventoryBatches.push(freshBatch);
      addedCount++;
    }

    // 2. 檢查今日 IQF 急速冷凍規格是否存在
    const hasFrozenToday = (state.inventoryBatches || []).some(
      (b) => b.fruitId === fruitId && b.date === todayStr && b.storageType === 'frozen'
    );
    if (!hasFrozenToday) {
      const frozenPrice = frozenCfg.purchasePrice || 120;
      const frozenYield = frozenCfg.yieldRate || 95;
      const frozenBatch = {
        id: `batch_${fruitId}_today_frozen_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        fruitId: fruitId,
        date: todayStr,
        storageType: 'frozen',
        batchNo: `IQF-${fruitId.toUpperCase().slice(0, 4)}-${todayStr.replace(/-/g, '')}`,
        supplier: '業務級冷鏈加工部 (IQF果丁/純原汁)',
        purchasePrice: frozenPrice,
        yieldRate: frozenYield,
        effectivePrice: Number((frozenPrice / (frozenYield / 100)).toFixed(2)),
        quantityKg: 100,
        totalAmount: frozenPrice * 100,
        notes: `今日最新入庫 IQF 冷凍${fruit.name}規格 (出成率 ${frozenYield}%)`
      };
      state.inventoryBatches.push(frozenBatch);
      addedCount++;
    }

    recordedFruits.push(fruit.name);
  });

  autoSaveCurrentState();
  render();

  if (!silent) {
    const fruitNames = [...new Set(recordedFruits)].join('、');
    alert(`⭐ 已成功查找並更新目前百科釘選水果【${fruitNames}】！\n\n已登錄各品項今日（${todayStr}）之「🌱 新鮮鮮果」與「❄️ IQF 急速冷凍」採購價格至價格波動庫，加權平均成本與圖表已即時更新。`);
  }
};


// 自動同步百科釘選水果最新新鮮與 IQF 冷凍市價至價格庫
if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (typeof window.syncPinnedFruitsPricesToInventory === 'function') {
      window.syncPinnedFruitsPricesToInventory(true);
    }
  }, 100);
}


// ==========================================
// 產季指南與資料備份還原互動邏輯 (Seasonality & Backup Handlers)
// ==========================================

function attachSeasonalityEvents() {
  // 附加產季月曆事件
}

window.selectSeasonMonth = function(month) {
  state.seasonSelectedMonth = Number(month);
  autoSaveCurrentState();
  render();
};

window.setSeasonCategoryFilter = function(cat) {
  state.seasonCategoryFilter = cat;
  const tbody = document.getElementById('seasonality-table-body');
  const catBar = document.getElementById('season-category-bar');
  if (tbody) tbody.innerHTML = renderSeasonalityTableRowsHtml();
  if (catBar) catBar.innerHTML = renderSeasonCategoryButtonsHtml();
  if (!tbody) render();
};

window.handleSeasonSearch = function(term) {
  state.seasonSearchTerm = term;
  const tbody = document.getElementById('seasonality-table-body');
  if (tbody) {
    tbody.innerHTML = renderSeasonalityTableRowsHtml();
  } else {
    render();
  }
};

// ==========================================
// 全站資料一鍵打包備份與匯入還原 (JSON Backup & Restore Engine)
// ==========================================

window.openBackupModal = function() {
  const container = document.getElementById('backup-modal-container');
  if (!container) return;

  const recipesCount = (state.savedRecipes || []).length;
  const batchesCount = (state.inventoryBatches || []).length;
  const favCount = (state.favorites || []).length;
  const costCount = Object.keys(state.fruitCosts || {}).length;

  container.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div class="bg-white rounded-3xl p-6 shadow-2xl max-w-xl w-full space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto">
        <!-- 頂部標題 -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center space-x-2.5">
            <span class="text-2xl">💾</span>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Cfruit 全站資料備份與匯入還原</h3>
              <p class="text-2xs text-slate-400">完整打包所有配方、採購進貨批次、釘選與自訂成本設定</p>
            </div>
          </div>
          <button onclick="closeBackupModal()" class="text-slate-400 hover:text-slate-600 p-1 text-lg">✕</button>
        </div>

        <!-- 目前資料概要統計 -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div class="text-slate-400 text-3xs">儲存配方</div>
            <div class="text-lg font-black text-slate-800">${recipesCount} 筆</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div class="text-slate-400 text-3xs">入庫批次</div>
            <div class="text-lg font-black text-slate-800">${batchesCount} 筆</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div class="text-slate-400 text-3xs">自訂成本</div>
            <div class="text-lg font-black text-slate-800">${costCount} 項</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div class="text-slate-400 text-3xs">釘選水果</div>
            <div class="text-lg font-black text-slate-800">${favCount} 款</div>
          </div>
        </div>

        <!-- 區塊 1: 一鍵打包匯出 (Export) -->
        <div class="bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/30 p-4 rounded-2xl border border-indigo-200/80 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-lg">📦</span>
              <div class="font-extrabold text-xs text-indigo-950">一鍵下載完整全站備份檔 (.json)</div>
            </div>
            <span class="text-3xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">離線儲存</span>
          </div>
          <p class="text-3xs text-slate-500 leading-relaxed">
            將您在此裝置的所有業務數據完整打包為單一 JSON 檔案。可發送至其他電腦、平板或手機門市設備，無痛還原同步！
          </p>
          <button
            onclick="exportFullBackupJSON()"
            class="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <span>📥 下載完整全站備份檔 (.json)</span>
          </button>
        </div>

        <!-- 區塊 2: 匯入備份還原 (Import) -->
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-lg">📤</span>
              <div class="font-extrabold text-xs text-slate-800">匯入備份檔還原資料</div>
            </div>
            <span class="text-3xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">覆蓋還原</span>
          </div>
          <p class="text-3xs text-slate-500 leading-relaxed">
            選擇先前下載的 Cfruit 備份檔進行覆蓋還原。系統將自動校驗資料結構完整性。
          </p>
          <div class="relative">
            <input
              type="file"
              id="backup-file-input"
              accept=".json"
              onchange="handleBackupFileSelect(event)"
              class="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
            />
          </div>
          <div id="import-preview-box" class="hidden text-3xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
          </div>
        </div>

        <!-- 區塊 3: 還原原廠設定 (Factory Reset) -->
        <div class="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
          <button
            type="button"
            onclick="resetAllToFactoryDefaults()"
            class="text-3xs text-rose-500 hover:text-rose-700 hover:underline font-semibold"
          >
            ⚠️ 清除所有自訂資料還原原廠預設
          </button>
          <button
            type="button"
            onclick="closeBackupModal()"
            class="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  `;
};

window.closeBackupModal = function() {
  const container = document.getElementById('backup-modal-container');
  if (container) container.innerHTML = '';
};

// 匯出完整 JSON 備份檔
window.exportFullBackupJSON = function() {
  const dateStr = new Date().toISOString().split('T')[0];
  const backupObject = {
    system: 'Cfruit Fruit Nutrition & Cost Manager',
    version: '2.2',
    exportedAt: new Date().toISOString(),
    timestamp: Date.now(),
    stats: {
      recipesCount: (state.savedRecipes || []).length,
      batchesCount: (state.inventoryBatches || []).length,
      favoritesCount: (state.favorites || []).length,
      customCostsCount: Object.keys(state.fruitCosts || {}).length,
    },
    data: {
      recipes: state.savedRecipes || [],
      inventoryBatches: state.inventoryBatches || [],
      fruitCosts: state.fruitCosts || {},
      costConfig: state.costConfig || {},
      labelConfig: state.labelConfig || {},
      favorites: state.favorites || [],
      favoritePinTop: state.favoritePinTop !== false,
      costPinTop: state.costPinTop !== false,
      plateItems: state.plateItems || [],
      inventoryCustomQuote: state.inventoryCustomQuote || null,
      inventoryComparatorMode: state.inventoryComparatorMode || 'vendor_matrix',
      vendorQuotes: state.vendorQuotes || {},
      seasonSelectedMonth: state.seasonSelectedMonth || 9,
    }
  };

  const jsonStr = JSON.stringify(backupObject, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Cfruit_全站完整備份_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 處理備份檔案選擇與校驗
window.handleBackupFileSelect = function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const parsed = JSON.parse(event.target.result);
      if (!parsed.data || typeof parsed.data !== 'object') {
        throw new Error('檔案格式不符合 Cfruit 備份規格（缺少 data 區塊）');
      }

      const d = parsed.data;
      const previewBox = document.getElementById('import-preview-box');
      if (previewBox) {
        previewBox.classList.remove('hidden');
        previewBox.innerHTML = `
          <strong>✅ 檔案校驗成功！</strong> (備份時間: ${parsed.exportedAt || '未知'})<br/>
          • 拼盤配方: <strong>${(d.recipes || []).length}</strong> 筆<br/>
          • 入庫採購批次: <strong>${(d.inventoryBatches || []).length}</strong> 筆<br/>
          • 自訂水果成本: <strong>${Object.keys(d.fruitCosts || {}).length}</strong> 項<br/>
          • 釘選水果名單: <strong>${(d.favorites || []).length}</strong> 款<br/>
          <button onclick="confirmExecuteImport()" class="mt-2 w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition active:scale-95">
            ⚠️ 確認以此備份覆蓋還原全站資料
          </button>
        `;
        window._pendingBackupData = d;
      }
    } catch (err) {
      alert('❌ 備份檔解析失敗：' + err.message);
    }
  };
  reader.readAsText(file);
};

// 確認執行覆蓋匯入
window.confirmExecuteImport = function() {
  const d = window._pendingBackupData;
  if (!d) return;

  if (!confirm('確定要執行全站覆蓋還原嗎？您當前未備份的本機修改將被取代。')) return;

  if (Array.isArray(d.recipes)) state.savedRecipes = d.recipes;
  if (Array.isArray(d.inventoryBatches)) state.inventoryBatches = d.inventoryBatches;
  if (d.fruitCosts && typeof d.fruitCosts === 'object') state.fruitCosts = d.fruitCosts;
  if (Array.isArray(d.favorites)) state.favorites = d.favorites;
  if (d.favoritePinTop !== undefined) state.favoritePinTop = d.favoritePinTop;
  if (d.costPinTop !== undefined) state.costPinTop = d.costPinTop;
  if (d.labelConfig && typeof d.labelConfig === 'object') state.labelConfig = d.labelConfig;
  if (d.costConfig && typeof d.costConfig === 'object') state.costConfig = d.costConfig;
  if (Array.isArray(d.plateItems)) state.plateItems = d.plateItems;
  if (d.inventoryCustomQuote) state.inventoryCustomQuote = d.inventoryCustomQuote;
  if (d.inventoryComparatorMode) state.inventoryComparatorMode = d.inventoryComparatorMode;
  if (d.vendorQuotes && typeof d.vendorQuotes === 'object') state.vendorQuotes = d.vendorQuotes;
  if (d.seasonSelectedMonth) state.seasonSelectedMonth = d.seasonSelectedMonth;

  // 儲存至各個 LocalStorage 鍵
  autoSaveCurrentState();
  setStoredJSON(RECIPES_KEY, state.savedRecipes);
  setStoredJSON(INVENTORY_BATCHES_KEY, state.inventoryBatches);
  setStoredJSON(FAVORITES_KEY, state.favorites);

  closeBackupModal();
  render();
  alert('🎉 全站資料已成功還原！所有配方、進貨歷程與成本設定已即時更新生效。');
};

// 一鍵清除還原原廠預設
window.resetAllToFactoryDefaults = function() {
  if (!confirm('⚠️ 高度危險操作：確定要清除所有本機儲存資料並還原為原廠出廠設定嗎？')) return;
  if (!confirm('再次確認：所有自訂配方、採購批次與修改單價將永久移除！確定？')) return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(RECIPES_KEY);
  localStorage.removeItem(FAVORITES_KEY);
  localStorage.removeItem(PIN_TOP_KEY);
  localStorage.removeItem(INVENTORY_BATCHES_KEY);

  alert('已重設為原廠預設值，畫面即將重新整理。');
  if (typeof window.location !== 'undefined' && window.location.reload) {
    window.location.reload();
  }
};


// ==========================================
// 供應商多方比價與圖表互動事件處理 (Vendor Matrix Handlers)
// ==========================================

window.setInventoryComparatorMode = function(mode) {
  state.inventoryComparatorMode = mode;
  if (mode === 'vendor_matrix') {
    state.inventoryWorkbenchTab = 'vendor_pk';
  } else if (mode === 'custom_quote') {
    state.inventoryWorkbenchTab = 'stress_test';
  }
  autoSaveCurrentState();
  render();
};

window.updateVendorQuoteField = function(fruitId, quoteId, field, value) {
  const quotes = getFruitVendorQuotes(fruitId);
  const target = quotes.find(q => q.id === quoteId);
  if (!target) return;

  if (field === 'quotePrice' || field === 'yieldRate' || field === 'quantityKg') {
    target[field] = Number(value);
  } else {
    target[field] = value;
  }

  autoSaveCurrentState();

  const effEl = document.getElementById(`vq-effective-${quoteId}`);
  if (effEl) {
    updateVendorQuotesLiveCalculations(fruitId);
  } else {
    render();
  }
};

window.addVendorQuoteSlot = function(fruitId) {
  const quotes = getFruitVendorQuotes(fruitId);
  const newId = 'vq_' + Date.now();
  const freshCfg = getFruitCostConfig(fruitId, 'fresh');
  quotes.push({
    id: newId,
    vendorName: `新廠商報價 ${quotes.length + 1}`,
    storageType: 'fresh',
    quotePrice: freshCfg.purchasePrice,
    yieldRate: freshCfg.yieldRate,
    quantityKg: 100,
    specNotes: '新增詢價廠商'
  });
  autoSaveCurrentState();
  render();
};

window.removeVendorQuoteSlot = function(fruitId, quoteId) {
  const quotes = getFruitVendorQuotes(fruitId);
  if (quotes.length <= 1) {
    alert('⚠️ 至少需保留一家供應商報價以供比對！');
    return;
  }
  state.vendorQuotes[fruitId] = quotes.filter(q => q.id !== quoteId);
  autoSaveCurrentState();
  render();
};

window.resetFruitVendorQuotes = function(fruitId) {
  if (!confirm('確定要還原此品項之示範供應商報價設定嗎？')) return;
  state.vendorQuotes[fruitId] = getDefaultVendorQuotes(fruitId);
  autoSaveCurrentState();
  render();
};

window.adoptVendorQuoteAsBatch = function(fruitId, quoteId) {
  const comp = calcVendorQuotesComparison(fruitId);
  const q = comp.quotes.find(x => x.id === quoteId);
  if (!q) return;

  const dateStr = new Date().toISOString().split('T')[0];
  const newBatch = {
    id: 'batch_vq_' + Date.now(),
    batchNo: `VQ-${dateStr.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
    fruitId: fruitId,
    date: dateStr,
    supplier: q.vendorName || '供應商比價採納',
    purchasePrice: Number(q.quotePrice) || 0,
    yieldRate: Number(q.yieldRate) || 100,
    storageType: q.storageType || 'fresh',
    quantityKg: Number(q.quantityKg) || 100,
    effectivePrice: Number(q.effectivePrice) || 0,
    totalAmount: (Number(q.quotePrice) || 0) * (Number(q.quantityKg) || 100),
    notes: `由供應商比價矩陣採納入庫。${q.isWinner ? '【性價比冠軍】' : ''} ${q.specNotes || ''}`
  };

  state.inventoryBatches.push(newBatch);
  autoSaveCurrentState();
  render();
  alert(`🎉 已成功採納【${q.vendorName}】報價 $${q.quotePrice}/kg (共 ${q.quantityKg} kg) 並正式登錄至歷史庫存批次庫！折線圖與加權平均成本已即時更新。`);
};

window.copyVendorNegotiationMemo = function(fruitId, quoteId) {
  const comp = calcVendorQuotesComparison(fruitId);
  const q = comp.quotes.find(x => x.id === quoteId);
  const best = comp.bestQuote;
  const fruit = getFruit(fruitId);
  if (!q || !best) return;

  let memo = `【${fruit.name} 採購比價與議價備忘錄】\n`;
  memo += `📅 評估日期: ${new Date().toISOString().split('T')[0]}\n`;
  memo += `🏢 洽詢廠商: ${q.vendorName}\n`;
  memo += `💰 當前進貨報價: NT$ ${q.quotePrice} / kg (${q.storageType === 'frozen' ? 'IQF冷凍果丁' : '常溫鮮果原果'})\n`;
  memo += `🎯 約定加工取果率: ${q.yieldRate}%\n`;
  memo += `🥩 實質淨肉成本: NT$ ${q.effectivePrice.toFixed(1)} / kg (每100g NT$ ${(q.effectivePrice/10).toFixed(2)})\n`;
  memo += `⚖️ 在庫加權平均均價 (WAC): NT$ ${comp.wac.toFixed(1)} / kg\n`;

  if (q.isWinner) {
    memo += `🏆 評估結論: 實質果肉性價比最優！建議依此規格下單採購 ${q.quantityKg} kg (總預算 NT$ ${Math.round(q.totalCost).toLocaleString()})。\n`;
  } else if (q.isTrap) {
    memo += `⚠️ 議價分析: 此報價表面單價雖然便宜，但因果損率高達 ${100 - q.yieldRate}%，削皮後實質淨果肉每公斤高達 NT$ ${q.effectivePrice.toFixed(1)}，反而比競品多花 NT$ ${q.wasteExtraPerKg.toFixed(1)}/kg (+${q.wasteExtraPct.toFixed(1)}%)！\n`;
    memo += `💡 談判建議: 請廠商將進貨價讓利調降至 NT$ ${Math.round(best.effectivePrice * (q.yieldRate / 100))} 以下，或提升出成率至 ${Math.round((q.quotePrice / best.effectivePrice) * 100)}% 方具採購效益。\n`;
  } else {
    memo += `💡 議價空間: 實質淨肉單價高於目前最優方案 NT$ ${(q.effectivePrice - best.effectivePrice).toFixed(1)}/kg，建議作為第二備用供應源。\n`;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(memo).then(() => {
      alert('📋 已成功複製供應商議價備忘錄至剪貼簿！可直接傳送給主管批示或發送廠商談判。');
    });
  } else {
    alert(memo);
  }
};

window.scrollToVendorMatrix = function(fruitId) {
  const el = document.getElementById('vendor-quotes-matrix-section');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};



// ==========================================
// 採購決策指揮艙頁籤切換與壓力測試互動事件
// ==========================================

window.setInventoryWorkbenchTab = function(tab) {
  state.inventoryWorkbenchTab = tab;
  if (tab === 'vendor_pk') {
    state.inventoryComparatorMode = 'vendor_matrix';
  } else if (tab === 'stress_test') {
    state.inventoryComparatorMode = 'custom_quote';
  } else if (tab === 'batches') {
    state.inventoryViewTab = 'chart';
  } else if (tab === 'volatility') {
    state.inventoryViewTab = 'overview';
  }
  autoSaveCurrentState();
  if (typeof preserveScrollAndFocus === 'function') {
    preserveScrollAndFocus(() => {
      const container = document.getElementById('tab-content');
      if (container && state.activeTab === 'inventory') {
        container.innerHTML = getInventoryPageHtml();
      } else {
        render();
      }
    });
  } else {
    render();
  }
};

window.handleMarginStressSimPriceChange = function(simPrice) {
  if (!state.inventoryCustomQuote) {
    state.inventoryCustomQuote = {};
  }
  const fruitId = state.inventorySelectedFruit || 'mango_irwin';
  state.inventoryCustomQuote.fruitId = fruitId;
  state.inventoryCustomQuote.purchasePrice = Number(simPrice);
  autoSaveCurrentState();

  // 原地更新輸入框與滑桿數值，防跳動
  const pInp = document.getElementById('cq-purchase-price');
  if (pInp) pInp.value = simPrice;
  const slider = document.getElementById('stress-test-slider');
  if (slider) slider.value = simPrice;
  const valDisplay = document.getElementById('stress-test-price-display');
  if (valDisplay) valDisplay.innerText = `$${simPrice} /kg`;

  // 原地更新自購診斷卡片
  const diagContainer = document.getElementById('custom-quote-diagnosis-cards');
  if (diagContainer) {
    const fruit = getFruit(fruitId);
    const timeRange = state.inventoryTimeRange || 'all';
    const storageFilter = state.inventoryStorageFilter || 'all';
    const stats = calcFruitPriceStats(fruitId, timeRange, storageFilter);
    diagContainer.innerHTML = renderCustomQuoteDiagnosisHtml(fruit, stats, state.inventoryCustomQuote);
  }

  // 原地更新拼盤毛利壓力測試卡片
  const stressContainer = document.getElementById('margin-stress-test-cards');
  if (stressContainer) {
    stressContainer.innerHTML = renderMarginStressTestCardsHtml(fruitId, simPrice, state.inventoryCustomQuote.yieldRate);
  }
};

window.applyMarginStressDelta = function(deltaPercent) {
  const fruitId = state.inventorySelectedFruit || 'mango_irwin';
  const stats = calcFruitPriceStats(fruitId, 'all', 'all');
  const baseP = Number(stats.latestPrice) || 100;
  const newPrice = Math.max(1, Math.round(baseP * (1 + deltaPercent / 100)));
  window.handleMarginStressSimPriceChange(newPrice);
};
