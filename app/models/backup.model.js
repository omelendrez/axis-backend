const exec = require('child_process').exec
const fs = require('fs')
const { escape } = require('mysql2')
const sql = require('./db')
const { log } = require('../helpers/log')

const limit = 10000

const Backup = {}

Backup.backup = async (result) => {
  sql.query(
    'SELECT TABLE_NAME as `table` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_ROWS;',
    async (err, data) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      const tables = data.map((t) => t.table) //.filter((t) => t === 'user')
      for (const table of tables) {
        const data = await processTable(table, result)
        console.log(data)
      }

      result(null, `Backup files generated successfully ${new Date()}`)
    }
  )
}

const getValues = (row) =>
  new Promise((resolve) => {
    const fields = []
    Object.values(row).forEach((value) => fields.push(escape(value)))
    const result = `(${fields.join(',')})`
    resolve(result)
  })

const processTable = (table, result) =>
  new Promise((resolve) => {
    const fileName = `./backup/${table}.sql`

    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName)
    }
    sql.query(`SELECT COUNT(1) records FROM ${table};`, async (err, data) => {
      if (err) {
        log.error(err)
        result(err, null)
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

        fs.writeFileSync(fileName, 'SET FOREIGN_KEY_CHECKS = 1;\n\n', {
          flag: 'a'
        })

        await fs.writeFileSync(fileName, 'UNLOCK TABLES;\n\n', {
          flag: 'a'
        })

        for (let records = 0; records < totalRecords; records += limit) {
          const sqlQuery = `SELECT * FROM ${table} LIMIT ${limit} OFFSET ${records};`

          sql.query(sqlQuery, async (err, data) => {
            if (err) {
              log.error(err)
              result(err, null)
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

            await fs.writeFileSync(fileName, `INSERT INTO ${table} VALUES`, {
              flag: 'a'
            })

            await fs.writeFileSync(fileName, records.join(','), { flag: 'a' })

            await fs.writeFileSync(fileName, ';\n', { flag: 'a' })

            // fs.writeFileSync(
            //   fileName,
            //   `/*!40000 ALTER TABLE ${table} ENABLE KEYS */;\n`,
            //   { flag: 'a' }
            // )

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

Backup.unzipFiles = async (result) => {
  const backup = exec(
    'cd backup && bash database-unzip.sh ',
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
      }
      console.log(`stdout: ${stdout}`)
      console.error(`stderr: ${stderr}`)
    }
  )

  backup.on('exit', function (code) {
    console.log(`Exit with code ${code}`)
    result(null, code)
  })
}

Backup.processFile = async (sqlFile, tableName) =>
  new Promise((resolve) => {
    const sqlQuery = fs.readFileSync(sqlFile).toString()

    const dataArr = sqlQuery.toString().split('\n').join('')

    try {
      // dataArr.forEach((sqlQuery) => {
      console.log(dataArr)
      if (dataArr.length) {
        sql.query(dataArr)
      }
      // })

      // fs.promises.unlink(sqlFile)

      resolve([null, { message: `Table ${tableName} updated` }])
    } catch (error) {
      console.log(error)
    }
  })

module.exports = Backup
