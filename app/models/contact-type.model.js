const sql = require('./db')
const { toWeb, getPaginationFilters, loadModel } = require('../helpers/utils')
const { log } = require('../helpers/log')
// constructor
const ContactType = function (payload) {
  loadModel(payload, this)
}

ContactType.create = (contactType, result) => {
  const newContactType = { ...contactType }
  sql.query('INSERT INTO contact_type SET ?', newContactType, (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, { id: res.insertId, ...newContactType })
  })
}

ContactType.findById = (id, result) => {
  sql.query('SELECT * FROM contact_type WHERE id = ?', id, (err, res) => {
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

ContactType.getAll = (pagination, result) => {
  const fields = ['name']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT id, name FROM contact_type ${filter} ORDER BY id ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM contact_type ${filter};`

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

ContactType.updateById = (id, contactType, result) => {
  sql.query(
    'UPDATE contact_type SET name = ? WHERE id = ?',
    [contactType.name, id],
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

      result(null, { id, ...toWeb(contactType) })
    }
  )
}

ContactType.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM contact_info WHERE type = ?',
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

      sql.query('DELETE FROM contact_type WHERE id = ?', id, (err, res) => {
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

ContactType.removeAll = (result) => {
  sql.query('DELETE FROM contact_type', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = ContactType
