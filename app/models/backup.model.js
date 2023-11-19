const exec = require('child_process').exec
const fs = require('fs')
const { escape } = require('mysql2')
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  port: process.env.MYSQL_PORT,
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

const limit = 500

const Backup = {}

Backup.backup = () =>
  new Promise((resolve) => {
    const files = fs.readdirSync('./backup')
    ;(async () => {
      for (const file of files) {
        if (file.includes('.sql')) {
          await fs.unlinkSync(`./backup/${file}`)
        }
      }
    })()

    let tables = ''
    ;(async () => {
      tables = await fs
        .readFileSync('./backup/tables-list.txt')
        .toString()
        .split('\n')
        .filter((f) => !f.includes('-') && f.length > 0)

      for (const table of tables) {
        const data = await processTable(table)
        console.log(data)
      }

      resolve({
        message: tables.length
          ? `Backup files generated successfully ${new Date()}`
          : 'No files to process'
      })
    })()
  })

const getValues = (row) =>
  new Promise((resolve) => {
    const fields = []
    Object.values(row).forEach((value) => fields.push(escape(value)))
    const result = `(${fields.join(',')})`
    resolve(result)
  })

const setHeaders = (table, fileName) =>
  new Promise((resolve) =>
    (async () => {
      await fs.writeFileSync(
        fileName,
        `/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;\n
LOCK TABLES \`${table}\` WRITE;
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
TRUNCATE TABLE \`${table}\`;
UNLOCK TABLES;
LOCK TABLES \`${table}\` WRITE;
SET FOREIGN_KEY_CHECKS = 0;\n`,
        {
          flag: 'a'
        }
      )
      resolve()
    })()
  )

const setFooters = (table, fileName) =>
  new Promise((resolve) =>
    (async () => {
      await fs.writeFileSync(
        fileName,
        `
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;
UNLOCK TABLES;\n
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;\n`,
        {
          flag: 'a'
        }
      )
      resolve()
    })()
  )

const processTable = (table) =>
  new Promise((resolve) =>
    (async () => {
      const fileName = `./backup/${table}.sql`

      try {
        const resp = await pool.query(`SELECT COUNT(1) records FROM ${table};`)

        const totalRecords = resp[0][0].records

        if (totalRecords) {
          await setHeaders(table, fileName)

          const limits = []

          for (let records = 0; records < totalRecords; records += limit) {
            limits.push({ limit, records })
          }
          for (const param of limits) {
            const sqlQuery = `SELECT * FROM ${table} LIMIT ${param.limit} OFFSET ${param.records};`

            try {
              const data = await pool.query(sqlQuery)

              const records = []
              for (const row of data[0]) {
                const values = await getValues(row)
                records.push(values)
              }

              const values = await records.join(',')

              const insert =
                await `INSERT INTO \`${table}\` VALUES ${values};\n`

              await fs.writeFileSync(fileName, insert, {
                flag: 'a'
              })
            } catch (error) {
              console.log(error)
            }
          }

          await setFooters(table, fileName)

          resolve(
            `File ${fileName} has been created with ${totalRecords} records`
          )
        } else {
          resolve(`No records found for table ${table}`)
        }
      } catch (error) {
        console.log(error)
      }
    })()
  )

Backup.zipFiles = () =>
  new Promise((resolve, reject) => {
    const backup = exec(
      'cd backup && bash database-zip.sh ',
      (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
        }
        if (stdout) console.log(stdout)
        if (stderr) console.error(stderr)
      }
    )

    backup.on('exit', function (code) {
      if (code !== 0) {
        return reject({ message: `Zip exit with code ${code}` })
      }

      resolve({ message: 'Zip process successful' })
    })
  })

Backup.unzipFiles = () =>
  new Promise((resolve, reject) => {
    const unzip = exec(
      'cd backup && bash database-unzip.sh ',
      (error, stdout, stderr) => {
        if (error) {
          return reject({ error })
        }
        if (stdout) console.log(stdout)
        if (stderr) console.error(stderr)
      }
    )

    unzip.on('exit', function (code) {
      if (code !== 0) {
        return reject({ message: `Unzip exit with code ${code}` })
      }

      resolve({ message: 'Unzip process successful' })
    })
  })

Backup.pushFiles = () =>
  new Promise((resolve, reject) => {
    const filesPush = exec(
      'cd backup && bash zip-push.sh ',
      (error, stdout, stderr) => {
        if (error) {
          return reject({ error })
        }
        if (stdout) console.log(stdout)
        if (stderr) console.error(stderr)
      }
    )

    filesPush.on('exit', function (code) {
      if (code !== 0) {
        return reject({ message: `Zip push exit with code ${code}` })
      }

      resolve({ message: 'Zip push process successful' })
    })
  })

Backup.processSQLFile = (sqlFile, tableName) =>
  new Promise((resolve, reject) =>
    (async () => {
      const sqlQuery = await fs.readFileSync(sqlFile).toString()

      try {
        const query = await sqlQuery.replace(/;;/g, '//')
        await pool.query(query)
        resolve(`Table [${tableName}] processed`)
      } catch (error) {
        await pool.query('UNLOCK TABLES;')
        reject(error)
      }
      // if (fs.existsSync(sqlFile)) {
      //   fs.promises.unlink(sqlFile)
      // }
    })()
  )

Backup.test = () =>
  new Promise((resolve, reject) => {
    let data = {
      stderr: '',
      stdout: '',
      error: ''
    }
    const test = exec('cd backup && bash test.sh ', (error, stdout, stderr) => {
      if (error) {
        data.error = error
        return reject({ error })
      }
      if (stdout) {
        data.stdout = stdout
        console.log(stdout)
      }
      if (stderr) {
        data.stderr = stderr
        console.error(stderr)
      }
    })

    test.on('exit', function (code) {
      if (code !== 0) {
        return reject({ message: `Test exit with code ${code}`, data })
      }

      resolve({ message: 'Test process successful', data })
    })
  })

module.exports = Backup
