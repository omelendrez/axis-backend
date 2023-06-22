const sql = require('./db.js')
const { loadModel, TRAINING_STATUS } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')

const Approval = function (payload) {
  loadModel(payload, this)
}

Approval.approve = (id, status, payload, user, result) => {
  let query = 'INSERT INTO tracking (training, status, user) VALUES (?,?,?);'
  const params = [id, status, user.data.id]

  switch (status) {
    case TRAINING_STATUS.MEDICAL:
      query +=
        'INSERT INTO training_medical (training, systolic, diastolic) VALUES (?,?,?);'
      params.push(
        id,
        parseInt(payload.systolic, 10),
        parseInt(payload.diastolic, 10)
      )
      break

    case TRAINING_STATUS.ASSESSMENT:
      query +=
        'INSERT INTO training_assesment (training, assesment, status) VALUES (?,?,?);'
      payload.assesments.forEach((a) => {
        params.push([id, parseInt(a.assesment, 10), parseInt(a.status, 10)])
      })

      break

    case TRAINING_STATUS.FINANCE:
      query += 'UPDATE training SET finance_status = ? WHERE id = ?;'
      params.push(payload.approved, id)

      break
    default:
  }

  if (payload?.approved === 0) {
    query += 'INSERT INTO tracking (training, status, user) VALUES (?,?,?);'
    params.push(id, TRAINING_STATUS.CANCELLED, user.data.id)
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
    'SELECT status FROM tracking WHERE training = ? ORDER BY id DESC LIMIT 2;',
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

      if (status > TRAINING_STATUS.ADMIN) {
        const statuses = []

        const query =
          'DELETE FROM tracking WHERE training = ? AND status IN (?);'

        statuses.push(status)

        if (status === TRAINING_STATUS.CANCELLED) {
          statuses.push(res[1].status)
        }

        const params = [id, statuses]

        sql.query(query, params, (err) => {
          if (err) {
            log.error(err)
            result(err, null)
            return
          }

          result(null, {
            id,
            message: 'Status undone successfully!'
          })
        })
      } else {
        result({ kind: 'cannot_delete' }, null)
      }
    }
  )
}

module.exports = Approval
