/**
 * 根據黃道經度獲取星座編號 (0-11)
 * @param {Number} longitude - 黃道經度
 * @returns {Number} - 星座編號 (0-11)
 */
const getZodiacSign = (longitude) => {
  return Math.floor(longitude / 30) % 12;
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

module.exports = {
  getZodiacSign,
  getPlanetHouse,
  addHouseInfoToPlanets
}; 
