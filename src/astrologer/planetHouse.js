/**
 * 根據星座編號獲取星座模式（開創、固定、變動）
 * @param {Number} sign - 星座編號 (1-12)
 * @returns {String} - 星座模式：'cardinal'（開創）, 'fixed'（固定）, 'mutable'（變動）
 */
const getSignModality = (sign) => {
  // 開創星座：白羊(1)、巨蟹(4)、天秤(7)、摩羯(10)
  if ([1, 4, 7, 10].includes(sign)) {
    return 'cardinal';
  }
  // 固定星座：金牛(2)、獅子(5)、天蠍(8)、水瓶(11)
  else if ([2, 5, 8, 11].includes(sign)) {
    return 'fixed';
  }
  // 變動星座：雙子(3)、處女(6)、射手(9)、雙魚(12)
  else {
    return 'mutable';
  }
};

/**
 * 根據星座編號獲取星座元素（火、土、風、水）
 * @param {Number} sign - 星座編號 (1-12)
 * @returns {String} - 星座元素：'fire'（火）, 'earth'（土）, 'air'（風）, 'water'（水）
 */
const getSignElement = (sign) => {
  // 火象星座：白羊(1)、獅子(5)、射手(9)
  if ([1, 5, 9].includes(sign)) {
    return 'fire';
  }
  // 土象星座：金牛(2)、處女(6)、摩羯(10)
  else if ([2, 6, 10].includes(sign)) {
    return 'earth';
  }
  // 風象星座：雙子(3)、天秤(7)、水瓶(11)
  else if ([3, 7, 11].includes(sign)) {
    return 'air';
  }
  // 水象星座：巨蟹(4)、天蠍(8)、雙魚(12)
  else {
    return 'water';
  }
};

/**
 * 為行星添加星座模式和元素資訊
 * @param {Object} planets - 行星資料對象
 * @returns {Object} - 添加了星座模式和元素資訊的行星資料
 */
const addSignPropertiesToPlanets = (planets) => {
  const result = { ...planets };
  
  Object.keys(result).forEach(planetKey => {
    const planet = result[planetKey];
    if (planet.sign) {
      result[planetKey] = {
        ...planet,
        signModality: getSignModality(planet.sign),
        signElement: getSignElement(planet.sign)
      };
    }
  });
  
  return result;
};

/**
 * 計算星盤中各種星座模式和元素的分佈
 * @param {Object} planets - 行星資料對象
 * @returns {Object} - 包含星座模式和元素分佈的統計資料
 */
const calculateSignDistribution = (planets) => {
  const distribution = {
    modality: {
      cardinal: 0,
      fixed: 0,
      mutable: 0
    },
    element: {
      fire: 0,
      earth: 0,
      air: 0,
      water: 0
    }
  };
  
  Object.values(planets).forEach(planet => {
    if (planet.sign) {
      const modality = getSignModality(planet.sign);
      const element = getSignElement(planet.sign);
      
      distribution.modality[modality]++;
      distribution.element[element]++;
    }
  });
  
  return distribution;
};

/**
 * 根據黃道經度獲取星座編號 (1-12)
 * @param {Number} longitude - 黃道經度
 * @returns {Number} - 星座編號 (1-12)
 */
const getZodiacSign = (longitude) => {
  return (Math.floor(longitude / 30) % 12) + 1;
};

/**
 * 計算行星落在哪個宮位
 * @param {Object} planet - 行星資料
 * @param {Array} houses - 宮位資料陣列
 * @returns {Object} - 包含宮位編號和跨星座信息
 */
const getPlanetHouse = (planet, houses) => {
  const planetLongitude = planet.position.longitude;
  
  // 遍歷所有宮位，找出行星所在的宮位
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % houses.length];
    
    // 從 houses.js 中獲取的宮位經度
    let currentLongitude = currentHouse.position.longitude;
    let nextLongitude = nextHouse.position.longitude;
    
    // 處理跨越 0° 的情況
    if (nextLongitude < currentLongitude) {
      nextLongitude += 360;
    }
    
    // 處理行星經度跨越 0° 的情況
    let adjustedPlanetLongitude = planetLongitude;
    if (adjustedPlanetLongitude < currentLongitude && currentLongitude > 270) {
      adjustedPlanetLongitude += 360;
    }
    
    // 檢查行星是否在當前宮位範圍內
    if (adjustedPlanetLongitude >= currentLongitude && adjustedPlanetLongitude < nextLongitude) {
      // 計算宮位跨越的星座
      const currentHouseSign = getZodiacSign(currentLongitude);
      const nextHouseSign = getZodiacSign(nextLongitude);
      
      // 檢查宮位是否跨越多個星座
      let signs = [currentHouseSign];
      if (currentHouseSign !== nextHouseSign) {
        // 如果宮位跨越了 0°，需要特殊處理
        if (nextHouseSign < currentHouseSign && nextHouseSign !== 1) {
          for (let s = currentHouseSign + 1; s <= 12; s++) {
            signs.push(s);
          }
          for (let s = 1; s < nextHouseSign; s++) {
            signs.push(s);
          }
        } else {
          for (let s = currentHouseSign + 1; s < nextHouseSign; s++) {
            signs.push(s);
          }
        }
      }
      
      // 檢查行星是否在被截斷的星座中
      const planetSign = getZodiacSign(planetLongitude);
      const isInterceptedSign = signs.length > 1 && !signs.includes(planetSign);
      
      return {
        houseNumber: currentHouse.houseNumber,
        isInterceptedSign,
        signs
      };
    }
  }
  
  // 如果沒有找到匹配的宮位（理論上不應該發生）
  return null;
};

/**
 * 為所有行星添加宮位信息
 * @param {Object} planets - 行星資料對象
 * @param {Array} houses - 宮位資料陣列
 * @returns {Object} - 添加了宮位信息的行星資料
 */
const addHouseInfoToPlanets = (planets, houses) => {
  const result = { ...planets };
  
  Object.keys(result).forEach(planetKey => {
    const planet = result[planetKey];
    const houseInfo = getPlanetHouse(planet, houses);
    
    if (houseInfo) {
      // 添加宮位信息到行星資料
      result[planetKey] = {
        ...planet,
        house: houseInfo.houseNumber,
        isInterceptedSign: houseInfo.isInterceptedSign,
        houseSignSpan: houseInfo.signs
      };
    }
  });
  
  // 添加星座模式和元素資訊
  return addSignPropertiesToPlanets(result);
};

/**
 * 根據星座獲取宮主星
 * @param {Number} sign - 星座編號 (1-12)
 * @returns {String} - 宮主星名稱
 */
const getRuler = (sign) => {
  const rulers = {
    1: 'mars',        // 白羊座：火星
    2: 'venus',       // 金牛座：金星
    3: 'mercury',     // 雙子座：水星
    4: 'moon',        // 巨蟹座：月亮
    5: 'sun',         // 獅子座：太陽
    6: 'mercury',     // 處女座：水星
    7: 'venus',       // 天秤座：金星
    8: 'pluto',       // 天蠍座：冥王星（傳統：火星）
    9: 'jupiter',     // 射手座：木星
    10: 'saturn',     // 摩羯座：土星
    11: 'uranus',     // 水瓶座：天王星（傳統：土星）
    12: 'neptune'     // 雙魚座：海王星（傳統：木星）
  };
  
  return rulers[sign] || null;
};

/**
 * 為宮位添加宮主星資訊
 * @param {Array} houses - 宮位資料陣列
 * @param {Object} planets - 行星資料對象
 * @returns {Array} - 添加了宮主星資訊的宮位資料
 */
const addRulerInfoToHouses = (houses, planets) => {
  return houses.map(house => {
    const ruler = getRuler(house.sign);
    const rulerPlanet = planets[ruler];
    
    if (rulerPlanet) {
      return {
        ...house,
        ruler: {
          name: ruler,
          house: rulerPlanet.house,
          sign: rulerPlanet.sign,
          signModality: getSignModality(rulerPlanet.sign),
          signElement: getSignElement(rulerPlanet.sign)
        }
      };
    }
    
    return house;
  });
};

module.exports = {
  getZodiacSign,
  getPlanetHouse,
  addHouseInfoToPlanets,
  addRulerInfoToHouses,
  getRuler,
  getSignModality,
  getSignElement,
  calculateSignDistribution
}; 
