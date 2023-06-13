const sql = require('./db.js')
const { loadModel, toWeb } = require('../helpers/utils')
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
        ...toWeb(payload),
        message: 'Status updated successfully!'
      })
    }
  )
}

module.exports = Approvals
