const sql = require('./db')
const { toWeb, getPaginationFilters, loadModel } = require('../helpers/utils')
const { sendError } = require('../errors/error-monitoring')
// constructor
const Role = function (payload) {
  loadModel(payload, this)
}

Role.create = (role, result) => {
  const newRole = { ...role }
  sql.query('INSERT INTO role SET ?', newRole, (err, res) => {
    if (err) {
      sendError('Role.create', err)
      result(err, null)
      return
    }

    result(null, { id: res.insertId, ...newRole })
  })
}

Role.findById = (id, result) => {
  sql.query('SELECT * FROM role WHERE id = ?', id, (err, res) => {
    if (err) {
      sendError('Role.findById', err)
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

Role.getAll = (pagination, result) => {
  const fields = ['name']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT id, name FROM role ${filter} ORDER BY id ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM role ${filter};`

  const query = `${queryData}${queryCount}`

  sql.query(query, (err, res) => {
    if (err) {
      sendError('Role.getAll', err)
      result(err, null)
      return
    }

    const records = res[0]
    const count = res[1][0].records

    const rows = records.map((data) => toWeb(data))

    result(null, { rows, count })
  })
}

Role.updateById = (id, role, result) => {
  sql.query(
    'UPDATE role SET name = ? WHERE id = ?',
    [role.name, id],
    (err, res) => {
      if (err) {
        sendError('Role.updateById', err)
        result(err, null)
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
  if (parseInt(id, 10) === 1) {
    result({ kind: 'cannot_delete_sys_admin' }, null)
    return
  }

  sql.query(
    'SELECT COUNT(1) records FROM user_role WHERE role = ?',
    id,
    (err, res) => {
      if (err) {
        sendError('Role.remove', err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'cannot_delete' }, null)
        return
      }

      sql.query('DELETE FROM role WHERE id = ?', id, (err, res) => {
        if (err) {
          sendError('Role.remove', err)
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

Role.removeAll = (result) => {
  sql.query('DELETE FROM role', (err, res) => {
    if (err) {
      sendError('Role.removeAll', err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Role
