const sql = require('./db')
const { toWeb, getPaginationFilters, loadModel } = require('../helpers/utils')
const { sendError } = require('../errors/error-monitoring')
// constructor
const CertificateType = function (payload) {
  loadModel(payload, this)
}

CertificateType.create = (certificatetype, result) => {
  const newCertificateType = { ...certificatetype }
  sql.query(
    'INSERT INTO certificate_type SET ?',
    newCertificateType,
    (err, res) => {
      if (err) {
        sendError('CertificateType.create', err)
        result(err, null)
        return
      }

      result(null, { id: res.insertId, ...newCertificateType })
    }
  )
}

CertificateType.findById = (id, result) => {
  sql.query('SELECT * FROM certificate_type WHERE id = ?', id, (err, res) => {
    if (err) {
      sendError('CertificateType.findById', err)
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

CertificateType.getAll = (pagination, result) => {
  const fields = ['name']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT id, name FROM certificate_type ${filter} ORDER BY id ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM certificate_type ${filter};`

  const query = `${queryData}${queryCount}`

  sql.query(query, (err, res) => {
    if (err) {
      sendError('CertificateType.getAll', err)
      result(err, null)
      return
    }

    const records = res[0]
    const count = res[1][0].records

    const rows = records.map((data) => toWeb(data))

    result(null, { rows, count })
  })
}

CertificateType.updateById = (id, certificatetype, result) => {
  sql.query(
    'UPDATE certificate_type SET name = ? WHERE id = ?',
    [certificatetype.name, id],
    (err, res) => {
      if (err) {
        sendError('CertificateType.updateById', err)
        result(err, null)
        return
      }

      if (res.affectedRows === 0) {
        result({ kind: 'not_found' }, null)
        return
      }

      result(null, { id, ...toWeb(certificatetype) })
    }
  )
}

CertificateType.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM course WHERE type = ?',
    id,
    (err, res) => {
      if (err) {
        sendError('CertificateType.remove', err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'cannot_delete' }, null)
        return
      }

      sql.query('DELETE FROM certificate_type WHERE id = ?', id, (err, res) => {
        if (err) {
          sendError('CertificateType.remove', err)
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

// CertificateType.removeAll = (result) => {
//   sql.query('DELETE FROM certificate_type', (err, res) => {
//     if (err) {
//       sendError('CertificateType.removeAll', err)
//       result(err, null)
//       return
//     }

//     result(null, res.affectedRows)
//   })
// }

module.exports = CertificateType
