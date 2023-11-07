const { log } = require('../helpers/log')
const sql = require('../models/db')
const modifiers = require('./queries.json')

/* This code was created with the intention of
  allowing database models' creation and modification
  without the need to run data-converion anymore
*/

const Modifier = {}

Modifier.execute = () => {
  // modifiers.forEach((q) => {
  modifiers.forEach((q) => {
    sql.query(q.query, (err, res) => {
      if (err) {
        log.error(err)
        return
      }

      if (!res.length) {
        sql.query(q.modify, (err, res) => {
          if (err) {
            log.error(err)
            return
          }

          console.log(`${q.label} created/modified`, res.affectedRows || '')
        })
      }
    })
  })
}

Modifier.rollback = () => {
  modifiers.forEach((q) => {
    sql.query(q.query, (err, res) => {
      if (err) {
        log.error(err)
        return
      }

      if (res.length) {
        sql.query(q.rollback, (err) => {
          if (err) {
            log.error(err)
            return
          }
          console.log(`${q.label} rolled back`)
        })
      }
    })
  })
}

module.exports = Modifier
