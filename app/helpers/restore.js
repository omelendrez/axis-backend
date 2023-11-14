const exec = require('child_process').exec
const fs = require('fs')

const unzipBackup = () =>
  new Promise((resolve, reject) => {
    if (fs.readdirSync('./backup').filter((f) => f.includes('.gz')).length) {
      const restore = exec(
        'cd backup && bash database-restore.sh ',
        function (err, stdout, stderr) {
          if (err) {
            return console.log(err)
          }
          if (stderr) {
            console.log(stderr)
          }
          if (stdout) {
            console.log(stdout)
          }
        }
      )

      resolve('Done')

      restore.on('exit', function (code) {
        console.log(`Exit with code ${code}`)
      })
    } else {
      reject('No files to restore')
    }
  })

const restoreBackup = (sql) =>
  new Promise((resolve) => {
    fs.readdirSync('./backup')
      .filter((f) => f.includes('.sql'))
      .forEach((file) => {
        try {
          const query = fs.readFileSync(`./backup/${file}`).toString()

          const dataArr = query.toString().split(');')

          // sql.run runs your SQL query against the sql
          sql.query('PRAGMA foreign_keys=OFF;')
          sql.query('BEGIN TRANSACTION;')
          sql.query('LOCK TABLES;')

          // Loop through the `dataArr` and sql.run each query
          dataArr.forEach((query) => {
            if (query) {
              // Add the delimiter back to each query before you run them
              // In my case the it was `);`
              query += ');'
              sql.query(query)
              console.log(query)
              console.log('')
              console.log('')
              console.log('')
            }
          })
          sql.query('UNLOCK TABLES;')
          sql.query('COMMIT;')
        } catch (error) {
          console.log(error)
        }
      })
    resolve('Complete')
  })

const executeRestore = async (sql) => {
  unzipBackup()
    .then((res) => {
      console.log(res)
    })
    .catch((err) => console.log(err))

  restoreBackup(sql)
    .then((res) => {
      console.log(res)
    })
    .catch((err) => console.log(err))
}
module.exports = { executeRestore }
