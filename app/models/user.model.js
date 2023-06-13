const sql = require('./db.js')
const { toWeb, getPaginationFilters, loadModel } = require('../helpers/utils')
const { log } = require('../helpers/log')
const { createToken, comparePassword, passwordHash } = require('../secure')
// constructor
const User = function (payload) {
  loadModel(payload, this)
}

User.create = async (user, result) => {
  const password = await passwordHash('axis')
  const newUser = { ...user, password, status: 1 }

  sql.query(
    `SELECT COUNT(1) records FROM user WHERE name='${user.name}'`,
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

      sql.query('INSERT INTO user SET ?', newUser, (err, res) => {
        if (err) {
          log.error(err)
          result(err, null)
          return
        }

        result(null, { id: res.insertId, ...newUser })
      })
    }
  )
}

User.findById = (id, result) => {
  sql.query(`SELECT * FROM user WHERE id = ${id}`, (err, res) => {
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

User.login = (params, result) => {
  const query =
    'SELECT u.id, u.name, u.full_name, u.password, case when ur.user is null then "[]" else json_arrayagg(json_object("id", r.id, "name", r.name)) end roles, u.status FROM user u left outer join user_role ur on ur.user = u.id left outer join role r on r.id = ur.role WHERE u.name = ? GROUP BY u.id, u.name, u.full_name, u.password, u.status'

  sql.query(query, params.name.trim(), async (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    if (res.length) {
      const ok = await comparePassword(params.password.trim(), res[0].password)

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

User.getAll = (pagination, result) => {
  const fields = ['u.name', 'u.full_name', 'u.email']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT u.id, u.name, u.full_name, u.email, case when ur.user is null then "[]" else json_arrayagg(json_object("id", r.id, "name", r.name)) end roles, CASE u.status WHEN 1 THEN "Active" ELSE "Inactive" END status FROM user u left outer join user_role ur on ur.user = u.id left outer join role r on r.id = ur.role ${filter} GROUP BY u.id, u.name, u.full_name, u.email, u.status ORDER BY u.id ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM user u left outer join user_role ur on ur.user = u.id left outer join role r on r.id = ur.role ${filter};`

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

User.findByIdView = (id, result) => {
  const query =
    'SELECT u.id, u.name, u.full_name, u.email, case when ur.user is null then "[]" else json_arrayagg(json_object("id", r.id, "name", r.name)) end roles, CASE u.status WHEN 1 THEN "Active" ELSE "Inactive" END status FROM user u left outer join user_role ur on ur.user = u.id left outer join role r on r.id = ur.role WHERE u.id=?'

  sql.query(query, id, (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    if (res.length) {
      result(null, res[0])
      return
    }

    result({ kind: 'not_found' }, null)
  })
}

User.updateById = (id, user, result) => {
  sql.query(
    'UPDATE user SET name = ?, full_name = ?, email = ?, status = ? WHERE id = ?',
    [
      user.name.trim(),
      user.full_name.trim(),
      user.email.trim(),
      user.status,
      id
    ],
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

      result(null, { id, ...toWeb(user) })
    }
  )
}

User.chgPwd = async (id, user, result) => {
  if (user.prevPass.trim() === user.password.trim()) {
    result({ kind: 'same_password' }, null)
    return
  }

  sql.query(`SELECT * FROM user WHERE id = '${id}'`, async (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    if (res.length === 0) {
      result({ kind: 'not_found' }, null)
      return
    }

    const ok = await comparePassword(user.prevPass.trim(), res[0].password)

    if (!ok) {
      result({ kind: 'wrong_curr_password' }, null)
      return
    }

    const password = await passwordHash(user.password.trim())

    sql.query(
      'UPDATE user SET password = ? WHERE id = ?',
      [password, id],
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
        log.error(err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'cannot_delete' }, null)
        return
      }

      sql.query('DELETE FROM user WHERE id = ?', id, (err, res) => {
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

User.removeAll = (result) => {
  sql.query('DELETE FROM user', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = User
