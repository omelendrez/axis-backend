const sql = require('./db')
const { toWeb, loadModel } = require('../helpers/utils')
const { log } = require('../helpers/log')
// constructor
const UserRole = function (payload) {
  loadModel(payload, this)
}

UserRole.create = (payload, result) => {
  sql.query(
    'INSERT INTO user_role (user,role) VALUES ?',
    payload,
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      result(null, { id: res.insertId, ...payload })
    }
  )
}

UserRole.getAll = (id, result) => {
  const query = `SELECT ur.id, r.name FROM role r INNER JOIN user_role ur ON ur.role = r.id WHERE ur.user = ${id} ORDER BY r.name;`

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

UserRole.getAllAvailable = (id, result) => {
  const query = `SELECT r.id, r.name FROM role r WHERE r.id NOT IN (SELECT role FROM user_role WHERE user = ${id}) ORDER BY r.name;`

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

UserRole.remove = (id, result) => {
  sql.query('DELETE FROM user_role WHERE id = ?', id, (err, res) => {
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

UserRole.removeAll = (result) => {
  sql.query('DELETE FROM user_role', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = UserRole
