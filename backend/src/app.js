const express = require('express')
const cors = require('cors')
const connectDB = require('./dbConfig')
const forgeRoutes = require('./routes/forgeRoutes')
require('dotenv').config()

const app = express()
const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, 'upload')))

app.use(cors())
app.use(express.json())

connectDB()

app.use('/api/forge', forgeRoutes)

app.listen(3001, () => {
  console.log('Backend server running on port 3001')
})
