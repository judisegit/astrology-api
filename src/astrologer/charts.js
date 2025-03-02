const { houses } = require('./houses')
const { aspects } = require('./aspects')
const { planets } = require('./astros')
const { addHouseInfoToPlanets } = require('./planetHouse')

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
  
  const aspectsList = aspects(astrosWithHouses, housesList.axes)

  return {
    astros: {
      ...astrosWithHouses
    },
    ...housesList,
    aspects: aspectsList
  }
}

module.exports = {
  natalChart
}
