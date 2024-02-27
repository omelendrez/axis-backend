const sql = require('./db')
const { loadModel, TRAINING_STATUS } = require('../helpers/utils')
// const socketIO = require('../socket.io')
const { sendError } = require('../errors/error-monitoring')

const Approval = function (payload) {
  loadModel(payload, this)
}

Approval.approve = (id, status, payload, user, result) => {
  // It also does rejections

  if (!status) {
    result({ kind: 'missing_status' }, null)
    return
  }

  let query = ''
  const params = []

  if (payload?.status === status) {
    query +=
      'UPDATE training_tracking SET user=?, updated=NOW() WHERE training=? AND status=?;'
    params.push(user.data.id, id, status)
  } else {
    query +=
      'INSERT INTO training_tracking (training, status, user) VALUES (?,?,?);'
    params.push(id, status, user.data.id)
  }

  query += 'UPDATE training SET reject_reason = "" WHERE id = ?;'
  params.push(id)

  switch (status) {
    case TRAINING_STATUS.MEDIC_DONE:
      payload.updates
        .filter((e) => !e.existing)
        .map((d) => {
          query +=
            'INSERT INTO training_medical (training, date, systolic, diastolic) VALUES (?,?,?,?);'
          params.push(
            id,
            d.date,
            parseInt(d.systolic, 10),
            parseInt(d.diastolic, 10)
          )
        })
      break

    case TRAINING_STATUS.CERT_PRINT_DONE:
      if (parseInt(payload.hasId, 10) === 0) {
        query +=
          'INSERT INTO training_tracking (training, status, user) VALUES (?,?,?);'
        params.push(id, TRAINING_STATUS.COMPLETED, user.data.id)
      }

      break

    case TRAINING_STATUS.ID_CARD_PRINT_DONE:
      query +=
        'INSERT INTO training_tracking (training, status, user) VALUES (?,?,?);'
      params.push(id, TRAINING_STATUS.COMPLETED, user.data.id)

      break
    default:
  }

  sql.query(query, params, (err, res) => {
    if (err) {
      sendError('Approval.approve', err)
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

    // socketIO.notify('training-status-changed', { id, status })
  })
}

Approval.undo = (id, result) => {
  // socketIO.notify('data', id)

  let query =
    'SELECT status FROM training_tracking WHERE training = ? ORDER BY id DESC LIMIT 2;'

  sql.query(query, id, (err, res) => {
    if (err) {
      sendError('Approval.undo', err)
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

    // eslint-disable-next-line quotes
    query += "UPDATE training SET reject_reason = '' WHERE id = ?;"
    params.push(id)

    sql.query(query, params, (err) => {
      if (err) {
        sendError('Approval.undo', err)
        result(err, null)
        return
      }

      result(null, {
        id,
        message: 'Status undone successfully!'
      })

      // socketIO.notify('training-status-changed', { id, status })
    })
  })
}

Approval.saveReason = (id, payload, result) => {
  const { reason } = payload

  let query = 'UPDATE training SET reject_reason = ? WHERE id = ?;'
  const params = [reason, id]

  sql.query(query, params, (err) => {
    if (err) {
      sendError('Approval.saveReason', err)
      result(err, null)
      return
    }

    result(null, {
      id,
      message: 'Reason saved  successfully!'
    })
  })
}

Approval.approveMultiple = (payload, result) => {
  // It also does rejections
  const { records } = payload

  let ids = records.map((l) => `(${l.join(',')})`).join(',')

  const query = `INSERT INTO training_tracking (training, status, user) VALUES ${ids};`

  sql.query(query, (err) => {
    if (err) {
      sendError('Approval.approveMultiple', err)
      result(err, null)
      return
    }

    result(null, {
      message: 'Approvals processed  successfully!'
    })
  })
}

module.exports = Approval
