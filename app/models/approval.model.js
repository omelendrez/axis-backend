const sql = require('./db')
const { loadModel, TRAINING_STATUS } = require('../helpers/utils')
const socketIO = require('../socket.io')
const { log } = require('../helpers/log')

const Approval = function (payload) {
  loadModel(payload, this)
}

Approval.approve = (id, status, payload, user, result) => {
  let query =
    'INSERT INTO training_tracking (training, status, user) VALUES (?,?,?);'
  const params = [id, status, user.data.id]

  query += 'DELETE FROM reject_reason WHERE training=?;'
  params.push(id)

  switch (status) {
    case TRAINING_STATUS.MEDICAL_DONE:
      query +=
        'INSERT INTO training_medical (training, systolic, diastolic) VALUES (?,?,?);'
      params.push(
        id,
        parseInt(payload.systolic, 10),
        parseInt(payload.diastolic, 10)
      )
      break

    case TRAINING_STATUS.ACCOUNTS_DONE:
      query += 'UPDATE training SET finance_status = ? WHERE id = ?;'
      params.push(payload.approved, id)

      break

    case TRAINING_STATUS.CERT_PRINT_DONE:
      if (parseInt(payload.hasId, 10) === 0) {
        query +=
          'INSERT INTO training_tracking (training, status, user) VALUES (?,?,?);'
        params.push(id, TRAINING_STATUS.COMPLETED, user.data.id)
      }

      break
    default:
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

    socketIO.notify('training-status-changed', { id, status })
  })
}

Approval.undo = (id, result) => {
  socketIO.notify('data', id)

  let query =
    'SELECT status FROM training_tracking WHERE training = ? ORDER BY id DESC LIMIT 2;'
  const params = [id]

  sql.query(query, params, (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    if (res.length === 0) {
      result({ kind: 'cannot_undo' }, null)
      return
    }

    const { status } = res[0]

    const statuses = []

    let query =
      'DELETE FROM training_tracking WHERE training = ? AND status IN (?);'

    statuses.push(status)

    const params = [id, statuses]

    query += 'DELETE FROM reject_reason WHERE training=?;'
    params.push(id)

    sql.query(query, params, (err) => {
      if (err) {
        log.error(err)
      }

      result(null, {
        id,
        message: 'Status undone successfully!'
      })

      socketIO.notify('training-status-changed', { id, status })
    })
  })
}

Approval.saveReason = (id, payload, result) => {
  const { reason } = payload

  let query = 'DELETE FROM reject_reason WHERE training=?;'
  const params = [id]

  query += 'INSERT INTO reject_reason (training, reason) VALUES (?, ?);'

  params.pusn(id, reason)

  sql.query(query, params, (err) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, {
      id,
      message: 'Reason saved  successfully!'
    })
  })
}

module.exports = Approval
