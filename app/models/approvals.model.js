const sql = require('./db.js')
const { loadModel } = require('../helpers/utils')
const { log } = require('../helpers/log.js')

const Approvals = function (payload) {
  loadModel(payload, this)
}

Approvals.finance = (id, payload, user, result) => {
  const status = 7
  sql.query(
    'UPDATE training SET finance_status = ? WHERE id = ?;INSERT INTO tracking (training,status,user) VALUES (?,?,?);',
    [payload.finance_status, id, id, status, user.data.id],
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

      result(null, {
        id,
        message: 'Status updated successfully!'
      })
    }
  )
}

Approvals.undo = (id, result) => {
  sql.query(
    'SELECT status FROM tracking WHERE training=? ORDER BY id DESC LIMIT 1;',
    id,
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      if (res.length === 0) {
        result({ kind: 'not_found' }, null)
        return
      }

      const { status } = res[0]

      const params = [id, status]

      let query = 'DELETE FROM tracking WHERE training = ? AND status = ?;'

      switch (status) {
        case 3:
          query += 'DELETE FROM training_medical WHERE training = ?;'
          params.push(id)
          break
        case 5:
          query += 'DELETE FROM training_assesment WHERE training = ?;'
          params.push(id)
          break
        case 7:
          query += 'UPDATE training SET finance_status = null WHERE id = ?;'
          params.push(id)
          break
      }

      sql.query(query, params, (err) => {
        if (err) {
          log.error(err)
          result(err, null)
          return
        }
      })

      result(null, {
        id,
        message: 'Status undone successfully!'
      })
    }
  )
}

module.exports = Approvals
