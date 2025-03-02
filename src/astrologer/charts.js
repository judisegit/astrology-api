const { houses } = require('./houses')
const { aspects } = require('./aspects')
const { planets } = require('./astros')
const { 
  addHouseInfoToPlanets, 
  addRulerInfoToHouses, 
  calculateSignDistribution 
} = require('./planetHouse')

const natalChart = (date, latitude, longitude, houseSystem = 'P') => {
  const astrosList = planets(date)
  const housesList = houses(
    date,
    {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    },
    houseSystem
  )
  
  const astrosWithHouses = addHouseInfoToPlanets(astrosList, housesList.houses)
  
  const housesWithRulers = addRulerInfoToHouses(housesList.houses, astrosWithHouses)
  
  const distribution = calculateSignDistribution(astrosWithHouses)
  
  const aspectsList = aspects(astrosWithHouses, housesList.axes)

  return {
    astros: {
      ...astrosWithHouses
    },
    houses: housesWithRulers,
    axes: housesList.axes,
    aspects: aspectsList,
    distribution: distribution
  }
}

module.exports = {
  natalChart
}
