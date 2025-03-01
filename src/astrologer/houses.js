const sweph = require('sweph')
const path = require('path')

sweph.set_ephe_path(path.join(__dirname, '/../../eph'))

const { utcToJulianUt, degreesToDms, zodiacSign } = require('./utils')

const houses = (date, position, houseSystem = 'P') => {
  const julianDayUT = utcToJulianUt(date)

  const withoutGeoposition = !(position?.latitude && position?.longitude)

  if (withoutGeoposition) {
    return {
      axes: {
        asc: undefined,
        dc: undefined,
        mc: undefined,
        ic: undefined
      },
      houses: []
    }
  }

  const { houses: housesPositions } = sweph.houses(
    julianDayUT,
    position.latitude,
    position.longitude,
    houseSystem // placidus system...
  ).data

  // 修改這裡，加入宮位編號
  const houseCollection = housesPositions.map((cuspid, index) => ({
    houseNumber: index + 1, // 宮位編號從 1 開始
    position: degreesToDms(cuspid),
    sign: zodiacSign(cuspid)
  }))

  const axes = {
    asc: houseCollection[0],  // 第1宮 (上升點)
    dc: houseCollection[6],   // 第7宮 (下降點)
    mc: houseCollection[9],   // 第10宮 (中天)
    ic: houseCollection[3]    // 第4宮 (天底)
  }

  return {
    axes,
    houses: houseCollection
  }
}

module.exports = {
  houses
}
