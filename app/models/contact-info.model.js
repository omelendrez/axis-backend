const sql = require('./db.js')
const { toWeb } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const ContactInfo = function (info) {
  this.trainee = info.trainee
  this.type = info.type
  this.value = info.value
}

ContactInfo.create = (info, result) => {
  const newContactInfo = { ...info }

  sql.query(
    'SELECT COUNT(1) records FROM contact_info WHERE trainee = ? AND type = ?',
    [newContactInfo.trainee, newContactInfo.type],
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'already_exists' }, null)
        return
      }

      sql.query(
        'INSERT INTO contact_info SET ?',
        newContactInfo,
        (err, res) => {
          if (err) {
            log.error(err)
            result(err, null)
            return
          }

          result(null, { id: res.insertId, ...newContactInfo })
        }
      )
    }
  )
}

ContactInfo.findById = (id, result) => {
  sql.query(
    `SELECT id, trainee, type, value FROM contact_info WHERE id = ${id}`,
    (err, res) => {
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
    }
  )
}

ContactInfo.getAll = (id, result) => {
  const query = `SELECT i.id, t.name type, i.value FROM contact_info i INNER JOIN contact_type t ON i.type = t.id WHERE i.trainee = ${id}`
  log.warning(query, true)
  sql.query(query, (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    const data = res.map((data) => toWeb(data))

    result(null, data)
  })
}

ContactInfo.updateById = (id, info, result) => {
  sql.query(
    'UPDATE contact_info SET type = ?, value = ? WHERE id = ?',
    [info.type, info.value, id],
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

      result(null, { id, ...toWeb(info) })
    }
  )
}

ContactInfo.remove = (id, result) => {
  sql.query('DELETE FROM contact_info WHERE id = ?', id, (err, res) => {
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

ContactInfo.removeAll = (result) => {
  sql.query('DELETE FROM contact_info', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = ContactInfo
