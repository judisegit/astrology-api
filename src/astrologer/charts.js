const { houses } = require('./houses')
const { aspects } = require('./aspects')
const { planets } = require('./astros')

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
  
  const aspectsList = aspects(astrosList, housesList.axes)

  return {
    astros: {
      ...astrosList
    },
    ...housesList,
    aspects: aspectsList
  }
}

module.exports = {
  natalChart
}
