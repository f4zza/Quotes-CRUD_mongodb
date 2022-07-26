const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient
const dotenv = require('dotenv').config({
  path: './not_public/key.env'
})



const connectionString = process.env.keyForMongo

MongoClient.connect(connectionString, {useUnifiedTopology: true})
        .then(client => {
            console.log(`connected to db`)
            const db = client.db('random-quotes')
            const quotesCollection = db.collection('quotes')

            //mid
            app.set('view engine', 'ejs')
            app.use(bodyParser.urlencoded({extended: true}))
            app.use(bodyParser.json())
            app.use(express.static('public'))            
            
            //routes
            
            app.get('/', (req, res) => {
                db.collection('quotes').find().toArray()
                  .then(quotes => {
                    res.render('index.ejs', { quotes: quotes })
                  })
                  .catch(error=>console.error(error))
              })
          
              app.post('/quotes', (req, res) => {
                quotesCollection.insertOne(req.body)
                  .then(result => {
                    res.redirect('/')   
                  })
                  .catch(error => console.error(error))
              })
          
              app.put('/quotes', (req, res) => {
                quotesCollection.findOneAndUpdate(
                  { name: 'Mark Twain' },
                  {
                    $set: {
                      name: req.body.name,
                      quote: req.body.quote
                    }
                  },
                  {
                    upsert: true
                  }
                )
                  .then(result => res.json('Success'))
                  .catch(error => console.error(error))
              })
          
              app.delete('/quotes', (req, res) => {
                quotesCollection.deleteOne(
                  { name: req.body.name }
                )
                  .then(result => {
                    if (result.deletedCount === 0) {
                      return res.json('No quote to delete')
                    }
                    res.json('Deleted Ernest Hemingway\'s quote')
                  })
                  .catch(error => console.error(error))
              })
        })  

const port = 8000

app.listen(port, function(){
    console.log(`listening on ${port}`)
})