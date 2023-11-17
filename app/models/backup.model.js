const exec = require('child_process').exec
const fs = require('fs')
const { escape } = require('mysql2')
const { log } = require('../helpers/log')

const limit = 2000

const Backup = {}

Backup.backup = async (result) =>
  new Promise((resolve, reject) => {
    const sql = require('./db')
    sql.query(
      'SELECT TABLE_NAME as `table` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_ROWS;',
      async (err, data) => {
        if (err) {
          log.error(err)

          return reject(err)
        }

        const tables = data.map((t) => t.table) //.filter((t) => t === 'user')

        for (const table of tables) {
          const data = await processTable(table, result)
          console.log(data)
        }

        resolve({
          message: `Backup files generated successfully ${new Date()}`
        })
      }
    )
  })

const getValues = (row) =>
  new Promise((resolve) => {
    const fields = []
    Object.values(row).forEach((value) => fields.push(escape(value)))
    const result = `(${fields.join(',')})`
    resolve(result)
  })

const processTable = (table) =>
  new Promise((resolve, reject) => {
    const fileName = `./backup/${table}.sql`

    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName)
    }

    const sql = require('./db')

    sql.query(`SELECT COUNT(1) records FROM ${table};`, async (err, data) => {
      if (err) {
        log.error(err)
        reject(err)
        return
      }

      const totalRecords = data[0].records

      if (totalRecords) {
        fs.writeFileSync(fileName, `LOCK TABLES ${table} WRITE;\n\n`, {
          flag: 'a'
        })

        fs.writeFileSync(fileName, 'SET FOREIGN_KEY_CHECKS = 0;\n\n', {
          flag: 'a'
        })

        fs.writeFileSync(fileName, `TRUNCATE TABLE ${table};\n\n`, {
          flag: 'a'
        })

        await fs.writeFileSync(fileName, 'UNLOCK TABLES;\n\n', {
          flag: 'a'
        })

        for (let records = 1; records < totalRecords; records += limit) {
          const sqlQuery = `SELECT * FROM ${table} LIMIT ${limit} OFFSET ${records};`
          const sql = require('./db')

          sql.query(sqlQuery, async (err, data) => {
            if (err) {
              log.error(err)
              reject(err)
              return
            }

            const records = []
            for (const row of data) {
              const values = await getValues(row)
              records.push(values)
            }

            fs.writeFileSync(fileName, `LOCK TABLES ${table} WRITE;\n`, {
              flag: 'a'
            })

            // fs.writeFileSync(
            //   fileName,
            //   `/*!40000 ALTER TABLE ${table} DISABLE KEYS */;\n`,
            //   { flag: 'a' }
            // )
            fs.writeFileSync(fileName, 'SET FOREIGN_KEY_CHECKS = 0;\n\n', {
              flag: 'a'
            })

            await fs.writeFileSync(fileName, `INSERT INTO ${table} VALUES `, {
              flag: 'a'
            })

            await fs.writeFileSync(fileName, records.join(','), {
              flag: 'a'
            })

            await fs.writeFileSync(fileName, ';\n', { flag: 'a' })

            // fs.writeFileSync(
            //   fileName,
            //   `/*!40000 ALTER TABLE ${table} ENABLE KEYS */;\n`,
            //   { flag: 'a' }
            // )
            fs.writeFileSync(fileName, 'SET FOREIGN_KEY_CHECKS = 1;\n\n', {
              flag: 'a'
            })

            await fs.writeFileSync(fileName, 'UNLOCK TABLES;\n\n', {
              flag: 'a'
            })
          })
        }
        resolve(`File ${fileName} has been created`)
      } else {
        resolve(`No records found for table ${table}`)
      }
    })
  })

Backup.zipFiles = () =>
  new Promise((resolve, reject) => {
    const backup = exec(
      'cd backup && bash database-zip.sh ',
      (error, stdout, stderr) => {
        if (error) {
          return reject({ error })
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

Backup.processSQLFile = async (sqlFile, tableName) => {
  const sqlQuery = await fs.readFileSync(sqlFile).toString()
  return new Promise((resolve, reject) => {
    // const dataArr = sqlQuery.split(';')

    // if (dataArr.length) {
    //   for (const r of dataArr) {
    const sql = require('./db')
    sql.query(sqlQuery, (err) => {
      if (err) {
        reject(err)
      }
      resolve(`Table [${tableName}] processed`)
      // if (fs.existsSync(sqlFile)) {
      //   fs.promises.unlink(sqlFile)
      // }
    })
    //   }
    // }
  })
}
module.exports = Backup
