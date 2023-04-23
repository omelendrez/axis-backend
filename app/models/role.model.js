const sql = require('./db.js')
const { toWeb } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const Role = function (role) {
  this.name = role.name
}

Role.create = (role, result) => {
  const newRole = { ...role }
  sql.query('INSERT INTO role SET ?', newRole, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(err, null)
      return
    }

    result(null, { id: res.insertId, ...newRole })
  })
}

Role.findById = (id, result) => {
  sql.query(`SELECT * FROM role WHERE id = ${id}`, (err, res) => {
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

Role.getAll = (search, result) => {
  let filter = ''
  const fields = ['name']
  if (search) {
    filter = ` WHERE CONCAT(${fields.join(' , ')}) LIKE '%${search}%'`
  }

  const query = `SELECT id, name FROM role ${filter} ORDER BY id LIMIT 25;`

  sql.query(query, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }
    const results = res.map((role) => toWeb(role))
    result(null, results)
  })
}

Role.updateById = (id, role, result) => {
  sql.query(
    'UPDATE role SET name = ? WHERE id = ?',
    [role.name, id],
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

      result(null, { id, ...toWeb(role) })
    }
  )
}

Role.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM user WHERE role = ?',
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

      sql.query('DELETE FROM role WHERE id = ?', id, (err, res) => {
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

Role.removeAll = (result) => {
  sql.query('DELETE FROM role', (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Role
