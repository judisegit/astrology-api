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
      // 檢查宮位是否跨星座
      const houseStartSign = getZodiacSign(currentLongitude);
      const houseEndSign = getZodiacSign(nextLongitude % 360); // 確保在 0-359 範圍內
      
      const isInterceptedSign = houseStartSign !== houseEndSign;
      
      return {
        houseNumber: currentHouse.houseNumber,
        isInterceptedSign: isInterceptedSign,
        signs: isInterceptedSign ? [houseStartSign, houseEndSign] : [houseStartSign]
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
  
  return result;
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
          sign: rulerPlanet.sign
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
  getRuler
}; 
