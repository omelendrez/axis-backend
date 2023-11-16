const fs = require('fs')

const Backup = require('../models/backup.model')

const createBackup = async (req, res) => {
  Backup.backup((err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || 'Some error occurred when backing up data.'
      })
    }
    res.status(200).send({ data })
  })
}

const unzipBackup = async (req, res) => {
  Backup.unzipFiles((err) => {
    if (err) {
      return res.status(500).send({
        message: err.message || 'Some error occurred when unziping files.'
      })
    }
    res.status(200).send({ message: 'Unzip files  successfuly!' })
  })
}

const restoreBackup = async (req, res) => {
  const tables = fs
    .readFileSync('./backup/tables-list.txt', 'ascii')
    .toString()
    .split('\n')
    .filter((n) => n.length)
    .filter((n) => !n.includes('-'))

  let counter = 0
  let errors = 0

  await tables.forEach(async (tableName) => {
    const sqlFile = `./backup/${tableName}.sql`

    if (fs.existsSync(sqlFile)) {
      const [err, data] = await Backup.processFile(sqlFile, tableName)

      if (err) {
        errors++
      } else {
        counter++
        console.log(data)
      }
    } else {
      console.log(`File: ${sqlFile} does not exist`)
    }
  })

  res.status(200).send({
    message: `${counter} tables restored successfuly!\n${errors} table errors found`
  })
}

module.exports = { createBackup, unzipBackup, restoreBackup }
