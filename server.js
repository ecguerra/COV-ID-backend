const express = require('express') 
const bodyParser = require('body-parser') 
const cors = require('cors')
const dbConfig = require('./config/db.config')

const app = express()
require('dotenv').config()

app.use(cors())
// parse requests of content-type - application/json
app.use(bodyParser.json())

// parse request of content type = application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

// SETUP MONGOOSE
const db = require('./models/index')
const Role = db.role
// const dbURI = process.env.MONDOGUIR || `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`
const dbURI = 'mongodb://admin:GAProject4@cluster0-shard-00-00.rh7cy.mongodb.net:27017,cluster0-shard-00-01.rh7cy.mongodb.net:27017,cluster0-shard-00-02.rh7cy.mongodb.net:27017/covidDB?ssl=true&replicaSet=atlas-nvvg2y-shard-0&authSource=admin&retryWrites=true&w=majority'

db.mongoose
    .connect(dbURI,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=> {
        console.log('Successfully connected to MongoDB')
        initial()
    })
    .catch(err => {
        console.error('Connection error', err)
        process.exit
    })

app.get('/',(req,res)=>{
    res.json({message: 'Welcome to the jungle. We\'ve got fun and games'})
})

require('./routes/auth.routes')(app)
require('./routes/user.routes')(app)
require('./routes/search.routes')(app);

const PORT = process.env.PORT || 8080
app.listen(PORT, ()=> {
    console.log(`Server running on ${PORT}`)
})

function initial(){
    Role.estimatedDocumentCount((err, count)=>{
        // if no roles are present, create new roles (admin and user)
        if(!err && count === 0){
            new Role({
                name: 'user'
            }).save(err => {
                if(err) {
                    console.log('error',err)
                }
                console.log('added users to roles collection')
            })

            new Role({
                name: 'admin'
            }).save(err => {
                if(err) {
                    console.log('error',err)
                }
                console.log('added admin to roles collection')
            })
        }
    })
}