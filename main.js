const MongoClient = require('mongodb').MongoClient
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const haversine = require('haversine')
const uri = "mongo_url_here"



MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('hospital-db')
    const hospitalCollection = db.collection('hospital')

    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(express.static('public'))




    app.get('/', (req, res) => {
      db.collection('hospital').find().toArray()
        .then(async (hospital) => {
          var tempArray = []

          const toRadian = angle => (Math.PI / 180) * angle
          const distance = (a, b) => (Math.PI / 180) * (a - b)
          const RADIUS_OF_EARTH_IN_KM = 6371


          for (var key in hospital) {
            if (hospital.hasOwnProperty(key)) {

              var myLat = 20.22
              var myLongi = 72.11
              var arrayLat = hospital[key]['lat']
              var arrayLongi = hospital[key]['long']

              // Via Library
              // const start = {
              //   latitude: myLat,
              //   longitude: myLongi
              // }
              // var end = {  
              //   latitude: arrayLat,
              //   longitude: arrayLongi
              // }
              // Via Library

              var dLat = await distance(arrayLat, myLat)
              var dLon = await distance(arrayLongi, myLongi)

              var latRad = await toRadian(myLat)
              var arrayLatRad = await toRadian(arrayLat)


              // Haversine Formula
              var a = Math.pow(Math.sin(dLat / 2), 2) + Math.pow(Math.sin(dLon / 2), 2) * Math.cos(latRad) * Math.cos(arrayLatRad)
              var c = 2 * Math.asin(Math.sqrt(a))
              let finalDistance = RADIUS_OF_EARTH_IN_KM * c
              // Haversine Formula

              hospital[key]['distance'] = finalDistance
              tempArray.push(finalDistance)
              console.log("Distance : ", finalDistance)
              // console.log("Distance Lib : ", haversine(start, end)) // Via Library

            }
          }

          let minVal = Math.min.apply(Math, tempArray)

          for (var key in hospital) {
            if (hospital[key]['distance'] == minVal) {
              console.log("Hospitals : ", hospital[key])
              console.log("Nearest Hospital To Your Location : ", hospital[key]['name'])
              var stringToRender = "Nearest Hospital To Your Location : " + hospital[key]['name']
              res.render('index.ejs', { hospitalList: hospital, nearest: stringToRender })
            }
          }
        })
        .catch(error => console.error("GET Error : ", error))
    })

    app.listen(3000, function () {
      console.log('Listening on 3000')
    })
    
  })
  .catch(error => console.error("Mongo Error : ", error))












