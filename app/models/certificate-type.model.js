const sql = require('./db.js')
const { toWeb } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const CertificateType = function (certificatetype) {
  this.name = certificatetype.name
}

CertificateType.create = (certificatetype, result) => {
  const newCertificateType = { ...certificatetype }
  sql.query(
    'INSERT INTO certificate_type SET ?',
    newCertificateType,
    (err, res) => {
      if (err) {
        log.error('error: ', err)
        result(err, null)
        return
      }

      result(null, { id: res.insertId, ...newCertificateType })
    }
  )
}

CertificateType.findById = (id, result) => {
  sql.query(`SELECT * FROM certificate_type WHERE id = ${id}`, (err, res) => {
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

CertificateType.getAll = (search, result) => {
  let filter = ''
  const fields = ['name']
  if (search) {
    filter = ` WHERE CONCAT(${fields.join(' , ')}) LIKE '%${search}%'`
  }

  const query = `SELECT id, name FROM certificate_type ${filter} ORDER BY id LIMIT 25;`

  sql.query(query, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }
    const results = res.map((certificatetype) => toWeb(certificatetype))
    result(null, results)
  })
}

CertificateType.updateById = (id, certificatetype, result) => {
  sql.query(
    'UPDATE certificate_type SET name = ? WHERE id = ?',
    [certificatetype.name, id],
    (err, res) => {
      if (err) {
        log.error('error: ', err)
        result(null, err)
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
        log.error('error: ', err)
        result(null, err)
        return
      }

      if (res[0].records) {
        result({ kind: 'cannot_delete' }, null)
        return
      }

      sql.query('DELETE FROM certificate_type WHERE id = ?', id, (err, res) => {
        if (err) {
          log.error('error: ', err)
          result(null, err)
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

CertificateType.removeAll = (result) => {
  sql.query('DELETE FROM certificate_type', (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = CertificateType