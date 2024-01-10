const assert = require('assert').strict
const fs = require('fs')

const Backup = require('../models/backup.model')

assert.ok(
  process.env.DOCUMENTS_URL,
  'The "DOCUMENTS_URL" environment variable is required'
)

const createBackup = async (req, res) => {
  try {
    const resp = await Backup.backup()
    res.status(200).send(resp)
  } catch (error) {
    return res.status(500).send({
      message: error.message || 'Some error occurred when backing up data.'
    })
  }
}

const zipBackup = async (req, res) => {
  try {
    const resp = await Backup.zipFiles()
    res.status(200).send(resp)
  } catch (error) {
    return res.status(500).send({
      message: error.message || 'Some error occurred when ziping files.'
    })
  }
}

const unzipBackup = async (req, res) => {
  try {
    const resp = await Backup.unzipFiles()
    res.status(200).send(resp)
  } catch (error) {
    return res.status(500).send({
      message: error.message || 'Some error occurred when unziping files.'
    })
  }
}

const pushBackup = async (req, res) => {
  try {
    const resp = await Backup.pushFiles()
    res.status(200).send(resp)
  } catch (error) {
    return res.status(500).send({
      message: error.message || 'Some error occurred when pushing files.'
    })
  }
}

const restoreBackup = async (req, res) => {
  const tables = fs
    .readFileSync('./backup/tables-list.txt', 'ascii')
    .toString()
    .split('\n')
    .filter((n) => n.length)
    .filter((n) => !n.includes('-'))

  let success = []
  let errors = []

  for (const tableName of tables) {
    const sqlFile = `./backup/sql-files/${tableName}.sql`

    if (await fs.existsSync(sqlFile)) {
      try {
        const resp = await Backup.processSQLFile(sqlFile, tableName)
        success.push(resp)
        console.log(resp)
        console.log()
      } catch (error) {
        const errMsg = `File: ${sqlFile} failed. ${error.sqlMessage}`
        console.log(errMsg)
        errors.push({ file: sqlFile, error: error.sqlMessage })
      }
    } else {
      console.log(`File: ${sqlFile} does not exist`)
    }
  }

  res.status(200).send({
    success,
    errors
  })

  await fs.writeFileSync('./backup/errors.json', JSON.stringify(errors))
}

const test = async (req, res) => {
  try {
    const resp = await Backup.test()
    res.status(200).send(resp)
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message:
        error.message || 'Some error occurred when executing test script.'
    })
  }
}

const generateForeingKeysDeleteFile = async (req, res) => {
  try {
    const resp = await Backup.generateForeingKeysDeleteFile()
    res.status(200).send(resp)
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message:
        error.message || 'Some error occurred when executing test script.'
    })
  }
}

const generateForeingKeysCreateFile = async (req, res) => {
  try {
    const resp = await Backup.generateForeingKeysCreateFile()
    res.status(200).send(resp)
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message:
        error.message || 'Some error occurred when executing test script.'
    })
  }
}

const generateIndexesCreateFile = async (req, res) => {
  try {
    const resp = await Backup.generateIndexesCreateFile()
    res.status(200).send(resp)
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message:
        error.message || 'Some error occurred when executing test script.'
    })
  }
}

const generateIndexesDeleteFile = async (req, res) => {
  try {
    const resp = await Backup.generateIndexesDeleteFile()
    res.status(200).send(resp)
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message:
        error.message || 'Some error occurred when executing test script.'
    })
  }
}
module.exports = {
  createBackup,
  zipBackup,
  pushBackup,
  unzipBackup,
  restoreBackup,
  test,
  generateForeingKeysDeleteFile,
  generateForeingKeysCreateFile,
  generateIndexesCreateFile,
  generateIndexesDeleteFile
}
