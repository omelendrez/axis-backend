const sql = require('./db')
const { toWeb, getPaginationFilters, loadModel } = require('../helpers/utils')
const { sendError } = require('../errors/error-monitoring')
// constructor
const Nationality = function (payload) {
  loadModel(payload, this)
}

Nationality.create = (nationality, result) => {
  const newNationality = { ...nationality }
  sql.query('INSERT INTO nationality SET ?', newNationality, (err, res) => {
    if (err) {
      sendError('Nationality.create', err)
      result(err, null)
      return
    }

    result(null, { id: res.insertId, ...newNationality })
  })
}

Nationality.findById = (id, result) => {
  sql.query('SELECT * FROM nationality WHERE id = ?', id, (err, res) => {
    if (err) {
      sendError('Nationality.findById', err)
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

Nationality.getAll = (pagination, result) => {
  const fields = ['code', 'country', 'nationality']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT id, code, country, nationality FROM nationality ${filter} ORDER BY country ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM nationality ${filter};`

  const query = `${queryData}${queryCount}`

  sql.query(query, (err, res) => {
    if (err) {
      sendError('Nationality.getAll', err)
      result(err, null)
      return
    }

    const records = res[0]
    const count = res[1][0].records

    const rows = records.map((data) => toWeb(data))

    result(null, { rows, count })
  })
}

Nationality.updateById = (id, nationality, result) => {
  sql.query(
    'UPDATE nationality SET code = ?, country = ?, nationality = ? WHERE id = ?',
    [nationality.code, nationality.country, nationality.nationality, id],
    (err, res) => {
      if (err) {
        sendError('Nationality.getAll', err)
        result(err, null)
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
    'SELECT COUNT(1) records FROM learner WHERE nationality = ?',
    id,
    (err, res) => {
      if (err) {
        sendError('Nationality.remove', err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'cannot_delete' }, null)
        return
      }

      sql.query('DELETE FROM nationality WHERE id = ?', id, (err, res) => {
        if (err) {
          sendError('Nationality.remove', err)
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

// Nationality.removeAll = (result) => {
//   sql.query('DELETE FROM nationality', (err, res) => {
//     if (err) {
//       sendError('Nationality.removeAll', err)
//       result(err, null)
//       return
//     }

//     result(null, res.affectedRows)
//   })
// }

module.exports = Nationality
