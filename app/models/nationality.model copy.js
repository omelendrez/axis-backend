const sql = require('./db.js')
const { toWeb } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const Nationality = function (nationality) {
  this.code = nationality.code
  this.country = nationality.country
  this.nationality = nationality.nationality
}

Nationality.create = (nationality, result) => {
  const newNationality = { ...nationality }
  sql.query('INSERT INTO nationality SET ?', newNationality, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(err, null)
      return
    }

    result(null, { id: res.insertId, ...newNationality })
  })
}

Nationality.findById = (id, result) => {
  sql.query(`SELECT * FROM nationality WHERE id = ${id}`, (err, res) => {
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

Nationality.getAll = (search, result) => {
  let filter = ''
  const fields = ['code', 'country', 'nationality']
  if (search) {
    filter = ` WHERE CONCAT(${fields.join(' , ')}) LIKE '%${search}%'`
  }

  const query = `SELECT id, code, country, nationality FROM nationality ${filter} ORDER BY code LIMIT 25;`

  sql.query(query, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }
    const results = res.map((nationality) => toWeb(nationality))
    result(null, results)
  })
}

Nationality.updateById = (id, nationality, result) => {
  sql.query(
    'UPDATE nationality SET code = ?, country = ?, nationality = ? WHERE id = ?',
    [nationality.code, nationality.country, nationality.nationality, id],
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

      result(null, { id, ...toWeb(nationality) })
    }
  )
}

Nationality.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM trainee WHERE nationality = ?',
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

      sql.query('DELETE FROM nationality WHERE id = ?', id, (err, res) => {
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

Nationality.removeAll = (result) => {
  sql.query('DELETE FROM nationality', (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Nationality