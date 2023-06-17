const sql = require('./db.js')
const { loadModel } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')

const Approval = function (payload) {
  loadModel(payload, this)
}

Approval.approve = (id, status, payload, user, result) => {
  let query = 'INSERT INTO tracking (training, status, user) VALUES (?,?,?);'
  const params = [id, status, user.data.id]

  switch (status) {
    case 3: // Medical
      query +=
        'INSERT INTO training_medical (training, systolic, diastolic) VALUES (?,?,?);'
      params.push(
        id,
        parseInt(payload.systolic, 10),
        parseInt(payload.diastolic, 10)
      )
      break

    case 5: // Assesment
      query +=
        'INSERT INTO training_assesment (training, assesment, status) VALUES (?,?,?);'
      payload.assesments.forEach((a) => {
        params.push([id, parseInt(a.assesment, 10), parseInt(a.status, 10)])
      })

      break

    case 7: // Finance
      query += 'UPDATE training SET finance_status = ? WHERE id = ?;'
      params.push(payload.approved, id)

      break
    default:
  }

  if (payload?.approved === 0) {
    query += 'INSERT INTO tracking (training, status, user) VALUES (?,?,?);'
    params.push(id, 12, user.data.id)
  }

  sql.query(query, params, (err, res) => {
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
  })
}

Approval.undo = (id, result) => {
  sql.query(
    'SELECT status FROM tracking WHERE training = ? ORDER BY id DESC LIMIT 1;',
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

      if (status > 1) {
        const params = [id, status]

        const query = 'DELETE FROM tracking WHERE training = ? AND status = ?;'

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
      } else {
        result({ kind: 'cannot_delete' }, null)
      }
    }
  )
}

module.exports = Approval
