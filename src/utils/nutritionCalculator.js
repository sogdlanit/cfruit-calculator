/**
 * 水果營養成分計算核心演算法與健康指標工具
 * 包含台灣衛福部食藥署 (TFDA)《包裝食品營養標示應遵行事項》法規運算規範
 */

// 衛生福利部每日營養素基準值 (TFDA 每日參考值)
export const TFDA_DAILY_VALUES = {
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
export const DRI_STANDARDS = {
  DAILY_FRUIT_SERVINGS: 2, // 每日建議 2 份水果 (1 份約 100g 或 60 kcal)
  VITAMIN_C_MG: 100,      // 維生素 C 建議每日 100 mg
  FIBER_DAILY_G: 25,      // 每日膳食纖維建議 25g (水果通常貢獻約 5~8g)
  FRUIT_FIBER_GOAL_G: 6,  // 水果類建議攝取纖維目標 6g
  SUGAR_MAX_RECOMMENDED_G: 30, // 每日水果游離/單次糖攝取建議安全上限 ~30g
  POTASSIUM_MG: 2500,     // 鉀每日建議約 2500mg
};

/**
 * 計算單一水果在特定公克數下的營養素
 * @param {Object} fruit - 水果物件
 * @param {number} grams - 公克數
 * @returns {Object} 換算後的營養數值
 */
export function calculateItemNutrition(fruit, grams) {
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

/**
 * 計算整個水果拼盤累計總營養
 * @param {Array} plateItems - 包含 { fruit, grams } 的陣列
 * @returns {Object} 匯總營養與三大營養素佔比
 */
export function calculatePlateTotals(plateItems) {
  const initial = {
    totalWeightGrams: 0,
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

  if (!plateItems || plateItems.length === 0) {
    return {
      ...initial,
      servings: 0,
      macroPercentages: { carb: 0, protein: 0, fat: 0 },
    };
  }

  const totals = plateItems.reduce((acc, item) => {
    const itemNut = calculateItemNutrition(item.fruit, item.grams);
    acc.totalWeightGrams += Number(item.grams) || 0;
    acc.calories += itemNut.calories;
    acc.water += itemNut.water;
    acc.protein += itemNut.protein;
    acc.fat += itemNut.fat;
    acc.saturated_fat += itemNut.saturated_fat;
    acc.trans_fat += itemNut.trans_fat;
    acc.carbohydrates += itemNut.carbohydrates;
    acc.sugar += itemNut.sugar;
    acc.dietary_fiber += itemNut.dietary_fiber;
    acc.vitamin_c += itemNut.vitamin_c;
    acc.potassium += itemNut.potassium;
    acc.magnesium += itemNut.magnesium;
    acc.calcium += itemNut.calcium;
    acc.sodium += itemNut.sodium;
    return acc;
  }, initial);

  // 四捨五入至小數點後 1 位
  Object.keys(totals).forEach((key) => {
    totals[key] = Math.round(totals[key] * 10) / 10;
  });

  // 衛福部 1 份水果基準約 60 kcal (或約 100g)
  totals.servings = Math.round((totals.calories / 60) * 10) / 10;

  // 計算三大營養素熱量佔比
  const carbCalories = totals.carbohydrates * 4;
  const proteinCalories = totals.protein * 4;
  const fatCalories = totals.fat * 9;
  const totalMacroCalories = carbCalories + proteinCalories + fatCalories;

  totals.macroPercentages = {
    carb: totalMacroCalories > 0 ? Math.round((carbCalories / totalMacroCalories) * 100) : 0,
    protein: totalMacroCalories > 0 ? Math.round((proteinCalories / totalMacroCalories) * 100) : 0,
    fat: totalMacroCalories > 0 ? Math.round((fatCalories / totalMacroCalories) * 100) : 0,
  };

  return totals;
}

/**
 * 依照食藥署修約規則格式化法規標籤數值
 * @param {number} val - 原始數值
 * @param {string} type - 欄位名稱
 * @returns {string} 格式化後的標示字串
 */
export function formatTFDANutrient(val, type) {
  const num = Number(val) || 0;
  if (type === 'trans_fat') {
    // 法規：每100g脂肪<=1g或反式脂肪<=0.3g可標示0
    return num <= 0.3 ? '0' : num.toFixed(1);
  }
  if (type === 'saturated_fat') {
    return num < 0.1 ? '0' : num.toFixed(1);
  }
  if (type === 'sodium') {
    return String(Math.round(num));
  }
  if (type === 'calories') {
    return Math.round(num * 10) % 10 === 0 ? String(Math.round(num)) : num.toFixed(1);
  }
  return Math.round(num * 10) % 10 === 0 ? String(Math.round(num)) : num.toFixed(1);
}

/**
 * 計算每日參考值百分比
 * @param {number} val - 營養素數值
 * @param {string} type - 欄位名稱
 * @returns {string} 百分比字串 (例如 "8%")，若無標準則回傳 "*"
 */
export function calcTFDADailyPercent(val, type) {
  const ref = TFDA_DAILY_VALUES[type];
  if (!ref) return '*';
  const num = Number(val) || 0;
  const pct = Math.round((num / ref) * 100);
  return `${pct}%`;
}

/**
 * 產生健康與營養評估洞察
 * @param {Array} plateItems - 水果列表
 * @param {Object} totals - 總營養數值
 * @returns {Array} 洞察訊息清單
 */
export function generateHealthInsights(plateItems, totals) {
  if (!plateItems || plateItems.length === 0) return [];

  const insights = [];

  // 1. 每日水果份量評估
  if (totals.servings > 3.5) {
    insights.push({
      type: 'warning',
      title: '水果份量超量提醒',
      message: `目前拼盤約 ${totals.servings} 份水果（國健署建議每日 2~3 份），糖分與總熱量累積較多，建議分次或與家人分享。`,
    });
  } else if (totals.servings >= 1.8 && totals.servings <= 3.2) {
    insights.push({
      type: 'success',
      title: '份量恰到好處',
      message: `目前份量約 ${totals.servings} 份水果，非常符合每日健康飲食指南建議！`,
    });
  }

  // 2. 維生素 C 達標狀況
  const vitCPercent = Math.round((totals.vitamin_c / DRI_STANDARDS.VITAMIN_C_MG) * 100);
  if (vitCPercent >= 100) {
    insights.push({
      type: 'success',
      title: `維生素 C 達標 (${vitCPercent}%)`,
      message: `總計攝取 ${totals.vitamin_c} mg 維生素 C，已超過成人每日所需 (100mg)，有助促進膠原蛋白合成與抗氧化！`,
    });
  }

  // 3. 膳食纖維表現
  if (totals.dietary_fiber >= DRI_STANDARDS.FRUIT_FIBER_GOAL_G) {
    insights.push({
      type: 'success',
      title: '高纖順暢好幫手',
      message: `膳食纖維高達 ${totals.dietary_fiber} g，能增加飽足感並幫助維持消化道機能健康。`,
    });
  } else if (totals.totalWeightGrams >= 200 && totals.dietary_fiber < 2.5) {
    insights.push({
      type: 'info',
      title: '纖維質偏低提示',
      message: '這份拼盤水份或糖分較多、纖維偏低，可適度加入芭樂、奇異果或百香果提升纖維量。',
    });
  }

  // 4. 糖分注意提示
  if (totals.sugar > DRI_STANDARDS.SUGAR_MAX_RECOMMENDED_G) {
    insights.push({
      type: 'warning',
      title: '糖分累積較高',
      message: `總含糖量達到 ${totals.sugar} g，血糖敏感族群或減重期建議搭配無糖優格或堅果，減緩血糖波動。`,
    });
  }

  // 5. 鉀含量提示
  if (totals.potassium >= 500) {
    insights.push({
      type: 'info',
      title: '高鉀利水消水腫',
      message: `鉀含量達 ${totals.potassium} mg，有助於體內多餘鈉離子代謝與血壓調節（慢性腎臟病限鉀者需注意份量）。`,
    });
  }

  // 6. 酪梨特點提示
  const hasAvocado = plateItems.some((item) => (item.fruit?.id || item.fruitId) === 'avocado');
  if (hasAvocado) {
    insights.push({
      type: 'info',
      title: '含優質單元不飽和脂肪酸',
      message: '拼盤中含有酪梨，脂肪與熱量佔比較高，但富含抗氧化與護心好油，飽足感持久。',
    });
  }

  return insights;
}
