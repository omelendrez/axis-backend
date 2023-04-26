const sql = require('./db.js')
const { toWeb, getPaginationFilters } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const State = function (state) {
  this.name = state.name
}

State.create = (state, result) => {
  sql.query('INSERT INTO state SET ?', state, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(err, null)
      return
    }

    result(null, { id: res.insertId, ...state })
  })
}

State.findById = (id, result) => {
  sql.query(`SELECT * FROM state WHERE id = ${id}`, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(err, null)
      return
    }

    if (res.length) {
      result(null, toWeb(res[0]))
      return
    }

    result({ kind: 'not_found' }, null)
  })
}

State.getAll = (pagination, result) => {
  const fields = ['name']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT id, name FROM state ${filter} ORDER BY name ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM state ${filter};`

  const query = `${queryData}${queryCount}`

  sql.query(query, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(err, null)
      return
    }

    const records = res[0]
    const count = res[1][0].records

    const rows = records.map((data) => toWeb(data))

    result(null, { rows, count })
  })
}

State.updateById = (id, state, result) => {
  sql.query(
    'UPDATE state SET name = ? WHERE id = ?',
    [state.name, id],
    (err, res) => {
      if (err) {
        log.error('error: ', err)
        result(err, null)
        return
      }

      if (res.affectedRows === 0) {
        result({ kind: 'not_found' }, null)
        return
      }

      result(null, { id, ...toWeb(state) })
    }
  )
}

State.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM trainee WHERE state = ?',
    id,
    (err, res) => {
      if (err) {
        log.error('error: ', err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'cannot_delete' }, null)
        return
      }

      sql.query('DELETE FROM state WHERE id = ?', id, (err, res) => {
        if (err) {
          log.error('error: ', err)
          result(err, null)
          return
        }

        if (res.affectedRows === 0) {
          result({ kind: 'not_found' }, null)
          return
        }

        result(null, id)
      })
    }
  )
}

State.removeAll = (result) => {
  sql.query('DELETE FROM state', (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = State
