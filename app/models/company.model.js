const sql = require('./db.js')
const { toWeb } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const Company = function (company) {
  this.code = company.code
  this.name = company.name
}

Company.create = (company, result) => {
  const newCompany = { ...company }
  sql.query('INSERT INTO company SET ?', newCompany, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(err, null)
      return
    }

    result(null, { id: res.insertId, ...newCompany })
  })
}

Company.findById = (id, result) => {
  sql.query(`SELECT * FROM company WHERE id = ${id}`, (err, res) => {
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

Company.getAll = ({ search, limit, offset }, result) => {
  let filter = ''
  const fields = ['name']

  if (search) {
    filter = `WHERE CONCAT(${fields.join(
      ', '
    )}) LIKE '%${search}%' AND status=1`
  } else {
    filter = 'WHERE status=1'
  }

  const queryData = `SELECT id, name FROM company ${filter} ORDER BY name LIMIT ${limit} OFFSET ${offset};`
  const queryCount = `SELECT COUNT(1) records FROM company ${filter};`

  const query = `${queryData}${queryCount}`

  sql.query(query, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }

    const records = res[0]
    const count = res[1][0].records

    const rows = records.map((data) => toWeb(data))

    result(null, { rows, count })
  })
}

Company.updateById = (id, company, result) => {
  sql.query(
    'UPDATE company SET code = ?, name = ? WHERE id = ?',
    [company.code, company.name, id],
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

      result(null, { id, ...toWeb(company) })
    }
  )
}

Company.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM trainee WHERE company IN (SELECT code FROM company WHERE id = ?)',
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

      sql.query('DELETE FROM company WHERE id = ?', id, (err, res) => {
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

Company.removeAll = (result) => {
  sql.query('DELETE FROM company', (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Company
