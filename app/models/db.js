require('dotenv').config()
const { log } = require('./../helpers/log')
const mysql = require('mysql2')
// const { executeRestore } = require('./../helpers/restore')

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  port: process.env.MYSQL_PORT,
  multipleStatements: true
})

pool.getConnection((err, connection) => {
  if (err) throw err
  log.info(`Successfully connected to ${process.env.MYSQL_DB} database.`)

  // executeRestore(pool)

  connection.release()
})

module.exports = pool
