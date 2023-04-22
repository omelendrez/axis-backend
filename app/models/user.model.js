const sql = require('./db.js')
const { toWeb } = require('../helpers/utils')
const { log } = require('../helpers/log.js')
const { createToken, comparePassword, passwordHash } = require('../secure')
// constructor
const User = function (user) {
  this.email = user.email
  this.password = user.password
  this.name = user.name
  this.full_name = user.full_name
  this.role = user.role
  this.status = user.status
}

User.create = (user, result) => {
  const newUser = { ...user, status: 1 }
  sql.query('INSERT INTO user SET ?', newUser, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(err, null)
      return
    }

    result(null, { id: res.insertId, ...newUser })
  })
}

User.findById = (id, result) => {
  sql.query(`SELECT * FROM user WHERE id = ${id}`, (err, res) => {
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

User.login = (params, result) => {
  const query = `SELECT * FROM user WHERE name = '${params.name}'`
  sql.query(query, async (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(err, null)
      return
    }

    if (res.length) {
      const ok = await comparePassword(params.password, res[0].password)

      if (!ok) {
        log.error('error: user or password incorrect' + err)
        result({ kind: 'wrong_password' }, null)
        return
      }

      const user = toWeb(res[0])
      const token = await createToken(user)

      result(null, { ...user, token })
      return
    }

    result({ kind: 'not_found' }, null)
  })
}

User.getAll = (search, result) => {
  let filter = ''
  const fields = ['u.name', 'u.full_name', 'u.email']
  if (search) {
    filter = ` WHERE u.status=1 AND CONCAT(${fields.join(
      ' , '
    )}) LIKE '%${search}%' AND u.status=1`
  }

  const query = `SELECT u.id, u.name, u.email, full_name, email, r.name role_name, CASE WHEN status=1 THEN 'Active' WHEN u.status=0 THEN 'Inactive' END status_name  FROM user u INNER JOIN role r ON u.role = r.id ${filter} ORDER BY id LIMIT 50;`

  sql.query(query, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }
    const results = res.map((user) => toWeb(user))
    result(null, results)
  })
}

User.updateById = (id, user, result) => {
  sql.query(
    'UPDATE user SET name = ?, full_name = ?, email = ?, role = ?, status = ? WHERE id = ?',
    [user.name, user.full_name, user.email, user.role, user.status, id],
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

      result(null, { id, ...toWeb(user) })
    }
  )
}

User.chgPwd = async (id, user, result) => {
  if (user.prevPass === user.password) {
    result({ kind: 'same_password' }, null)
    return
  }

  sql.query(`SELECT * FROM user WHERE id = '${id}'`, async (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(err, null)
      return
    }

    if (res.length === 0) {
      result({ kind: 'not_found' }, null)
      return
    }

    const ok = await comparePassword(user.prevPass, res[0].password)

    if (!ok) {
      result({ kind: 'wrong_curr_password' }, null)
      return
    }

    const password = await passwordHash(user.password)

    sql.query(
      'UPDATE user SET password = ? WHERE id = ?',
      [password, id],
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

        result(null, { id })
      }
    )
  })
}

User.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM tracking WHERE user = ?',
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

      sql.query('DELETE FROM user WHERE id = ?', id, (err, res) => {
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

User.removeAll = (result) => {
  sql.query('DELETE FROM user', (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = User
