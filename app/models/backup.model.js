const exec = require('child_process').exec
const fs = require('fs')
const { escape } = require('mysql2')
const pool = require('../models/db-promise')
const {
  FILE_NAME,
  TABLE_LIST_FILE,
  HEADER,
  FOOTER,
  LIMIT,
  uploadSqlFile
} = require('../helpers/backup')

const path = require('path')

const backupFolderDirPath = path.join(
  __dirname,
  '..',
  '..',
  'backup',
  'sql-files'
)

const backupFileName = path.join(backupFolderDirPath, FILE_NAME)

const Backup = {}
let primary = []
let indexes = []
let foreignKeys = []
let triggers = []
let processed = 0

Backup.backup = () =>
  new Promise((resolve) =>
    (async () => {
      if (await !fs.existsSync(backupFolderDirPath)) {
        await fs.mkdirSync(backupFolderDirPath)
      }

      const files = await fs.readdirSync(backupFolderDirPath)

      for (const file of files) {
        if (file.includes('.sql')) {
          await fs.unlinkSync(`${backupFolderDirPath}/${file}`)
        }
      }

      const tables = await fs
        .readFileSync(TABLE_LIST_FILE)
        .toString()
        .split('\n')
        .filter((f) => !f.includes('-') && f.length > 0)

      for (const table of tables) {
        await processTable(table)
        processed++
      }

      await uploadSqlFile(backupFileName, 'database')

      resolve({
        message: tables.length
          ? `Backup completed. (${processed}) tables generated successfully ${new Date()}`
          : 'No files to process'
      })
    })()
  )

const getValues = (row) =>
  new Promise((resolve) => {
    const fields = []
    Object.values(row).forEach((value) => fields.push(escape(value)))
    const result = `(${fields.join(',')})`
    resolve(result)
  })

// const getPrimary = (table, backupFileName) =>
//   new Promise((resolve) =>
//     (async () => {
//       const [primaryIndexes] = await pool.query(
//         'SELECT COLUMN_NAME, COLLATION FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND INDEX_NAME="PRIMARY" AND TABLE_NAME=? ORDER BY COLUMN_NAME',
//         table
//       )

//       const fields = []
//       for (const primary of primaryIndexes) {
//         const { COLUMN_NAME } = primary
//         fields.push(COLUMN_NAME)
//       }

//       const primaryIndex = fields.length
//         ? `ALTER TABLE \`${table}\` ADD PRIMARY KEY(${fields.join(',')});\n`
//         : null

//       if (primaryIndex) {
//         primary.push(primaryIndex)

//         await fs.writeFileSync(
//           backupFileName,
//           `ALTER TABLE \`${table}\` DROP PRIMARY KEY;\n`,
//           {
//             flag: 'a'
//           }
//         )
//       }

//       resolve(primary)
//     })()
//   )

// const getIndexes = (table, backupFileName) =>
//   new Promise((resolve) =>
//     (async () => {
//       const [otherIndexes] = await pool.query(
//         'SELECT INDEX_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND INDEX_NAME<>"PRIMARY" AND TABLE_NAME=? ORDER BY INDEX_NAME, SEQ_IN_INDEX;',
//         table
//       )

//       const indexes = []
//       const fields = []
//       let indexName = ''

//       for (const index of otherIndexes) {
//         const { INDEX_NAME, COLUMN_NAME } = index
//         if (indexName && indexName !== INDEX_NAME) {
//           const otherIndex = `CREATE INDEX \`${indexName}\` ON ${table}(${fields.join(
//             ','
//           )});\n`
//           indexes.push(otherIndex)

//           await fs.writeFileSync(
//             backupFileName,
//             `DROP INDEX \`${indexName}\` ON \`${table}\`;\n`,
//             {
//               flag: 'a'
//             }
//           )

//           fields.length = 0
//         }
//         fields.push(COLUMN_NAME)
//         indexName = INDEX_NAME
//       }

//       resolve(indexes)
//     })()
//   )

const getForeignKeys = (table) =>
  new Promise((resolve) =>
    (async () => {
      const [foreignKeys] = await pool.query(
        'SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND CONSTRAINT_NAME<>"PRIMARY" AND TABLE_NAME=? ORDER BY CONSTRAINT_NAME;',
        table
      )

      const keys = []

      for (const foreignKey of foreignKeys) {
        const {
          CONSTRAINT_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        } = foreignKey

        keys.push(
          `ALTER TABLE \`${table}\` ADD CONSTRAINT \`${CONSTRAINT_NAME}\` FOREIGN KEY(${COLUMN_NAME}) REFERENCES ${REFERENCED_TABLE_NAME}(${REFERENCED_COLUMN_NAME});\n`
        )

        await fs.writeFileSync(
          backupFileName,
          `ALTER TABLE \`${table}\` DROP CONSTRAINT \`${CONSTRAINT_NAME}\` ;\n`,
          {
            flag: 'a'
          }
        )
      }

      resolve(keys)
    })()
  )

const getTriggers = (table) =>
  new Promise((resolve) =>
    (async () => {
      const [tableTriggers] = await pool.query(
        'SELECT TRIGGER_NAME, ACTION_TIMING, EVENT_MANIPULATION, ACTION_STATEMENT FROM INFORMATION_SCHEMA.TRIGGERS WHERE EVENT_OBJECT_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE=? ORDER BY TRIGGER_NAME;',
        table
      )

      const triggers = []

      for (const trigger of tableTriggers) {
        const {
          TRIGGER_NAME,
          ACTION_TIMING,
          EVENT_MANIPULATION,
          ACTION_STATEMENT
        } = trigger

        triggers.push(
          `DELIMITER ;;\nCREATE TRIGGER \`${TRIGGER_NAME}\` ${ACTION_TIMING} ${EVENT_MANIPULATION} ON \`${table}\` FOR EACH ROW ${ACTION_STATEMENT};;\nDELIMITER ;\n`
        )
        await fs.writeFileSync(
          backupFileName,
          `DROP TRIGGER IF EXISTS \`${TRIGGER_NAME}\` ;\n`,
          {
            flag: 'a'
          }
        )
      }

      resolve(triggers)
    })()
  )

const setHeaders = (table) =>
  new Promise((resolve) =>
    (async () => {
      await fs.writeFileSync(
        backupFileName,
        HEADER.replace(/{table}/g, table),
        {
          flag: 'a'
        }
      )

      primary.length = 0
      indexes.length = 0
      foreignKeys.length = 0
      triggers.length = 0

      // primary = await getPrimary(table, backupFileName)
      // indexes = await getIndexes(table, backupFileName)
      foreignKeys = await getForeignKeys(table, backupFileName)
      triggers = await getTriggers(table, backupFileName)

      resolve()
    })()
  )

const setFooters = () =>
  new Promise((resolve) =>
    (async () => {
      for (const p of primary) {
        await fs.writeFileSync(backupFileName, p, {
          flag: 'a'
        })
      }

      for (const f of foreignKeys) {
        await fs.writeFileSync(backupFileName, f, {
          flag: 'a'
        })
      }

      for (const i of indexes) {
        await fs.writeFileSync(backupFileName, i, {
          flag: 'a'
        })
      }

      for (const t of triggers) {
        await fs.writeFileSync(backupFileName, t, {
          flag: 'a'
        })
      }

      await fs.writeFileSync(backupFileName, FOOTER, {
        flag: 'a'
      })
      resolve()
    })()
  )

const processTable = (table) =>
  new Promise((resolve) =>
    (async () => {
      try {
        const resp = await pool.query(`SELECT COUNT(1) records FROM ${table};`)

        const totalRecords = resp[0][0].records

        if (totalRecords) {
          await setHeaders(table, backupFileName)

          const limits = []

          for (let records = 0; records < totalRecords; records += LIMIT) {
            limits.push({ limit: LIMIT, records })
          }

          await fs.writeFileSync(backupFileName, '\n', {
            flag: 'a'
          })

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

              await fs.writeFileSync(backupFileName, insert, {
                flag: 'a'
              })
            } catch (error) {
              console.log(error)
            }
          }

          await fs.writeFileSync(backupFileName, '\n', {
            flag: 'a'
          })

          await setFooters(backupFileName)

          resolve()
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
      const query = await fs.readFileSync(sqlFile).toString()

      try {
        // const query = await sqlQuery.replace(/;;/g, '//')
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
    const test = exec('cd backup && bash test.sh ', (error, stdout, stderr) => {
      if (error) console.log(error)
      if (stdout) console.log(stdout)
      if (stderr) console.log(stderr)
    })

    test.on('exit', function (code) {
      if (code !== 0) {
        return reject({ message: `Test exit with code ${code}` })
      }

      resolve({ message: 'Test process successful' })
    })
  })

module.exports = Backup
