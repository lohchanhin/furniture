// dbConfig.js
const mongoose = require('mongoose')
require('dotenv').config()

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auto_desk'
  await mongoose.connect(uri)
  console.log('MongoDB connected to', uri)
}

module.exports = connectDB
