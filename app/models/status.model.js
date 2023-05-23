const sql = require('./db.js')
const {
  toWeb,
  getPaginationFilters,
  loadModel
} = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const Status = function (payload) {
  loadModel(payload, this)
}

Status.create = (status, result) => {
  sql.query('INSERT INTO status SET ?', status, (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, { id: res.insertId, ...status })
  })
}

Status.findById = (id, result) => {
  sql.query(`SELECT * FROM status WHERE id = ${id}`, (err, res) => {
    if (err) {
      log.error(err)
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

Status.getAll = (pagination, result) => {
  const fields = ['status', 'state']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT id, status, state, continue_flow FROM status ${filter} ORDER BY id ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM status ${filter};`

  const query = `${queryData}${queryCount}`

  sql.query(query, (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    const records = res[0]
    const count = res[1][0].records

    const rows = records.map((data) => toWeb(data))

    result(null, { rows, count })
  })
}

Status.updateById = (id, status, result) => {
  sql.query(
    'UPDATE status SET status = ?, state = ?, continue_flow = ? WHERE id = ?',
    [status.status, status.state, status.continue_flow, id],
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      if (res.affectedRows === 0) {
        result({ kind: 'not_found' }, null)
        return
      }

      result(null, { id, ...toWeb(status) })
    }
  )
}

Status.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM tracking WHERE status = ?',
    id,
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'cannot_delete' }, null)
        return
      }

      sql.query('DELETE FROM status WHERE id = ?', id, (err, res) => {
        if (err) {
          log.error(err)
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

Status.removeAll = (result) => {
  sql.query('DELETE FROM status', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Status
