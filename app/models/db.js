require('dotenv').config()
const { log } = require('./../helpers/log')
const mysql = require('mysql2')
// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0
})

// open the MySQL connection
connection.connect((error) => {
  if (error) throw error
  log.info('Successfully connected to the database.')
})

module.exports = connection
