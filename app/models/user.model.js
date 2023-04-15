const sql = require("./db.js")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { toWeb } = require('../helpers/utils')
const { log } = require("../helpers/log.js")
// constructor
const User = function (user) {
  this.email = user.email
  this.password = user.password
  this.name = user.name
  this.full_name = user.full_name
}

User.create = (user, result) => {
  const newUser = { ...user, status: 1 }
  sql.query("INSERT INTO user SET ?", newUser, (err, res) => {
    if (err) {
      log.error("error: ", err)
      result(err, null)
      return
    }

    result(null, { id: res.insertId, ...newUser })
  })
}

User.findById = (id, result) => {
  sql.query(`SELECT * FROM user WHERE id = ${id}`, (err, res) => {
    if (err) {
      log.error("error: ", err)
      result(err, null)
      return
    }

    if (res.length) {
      result(null, res[0])
      return
    }

    result({ kind: "not_found" }, null)
  })
}

User.login = (params, result) => {
  const query = `SELECT * FROM user WHERE name = '${params.name}'`
  sql.query(query, async (err, res) => {
    if (err) {
      log.error("error: ", err)
      result(err, null)
      return
    }

    if (res.length) {
      const ok = await bcrypt.compare(params.password, res[0].password)

      if (!ok) {
        log.error("error: user or password incorrect" + err)
        result({ kind: "wrong_password" }, null)
        return
      }

      const user = toWeb(res[0])
      const token = jwt.sign({
        data: user
      }, process.env.JWT_SECRET, { expiresIn: '1d' }, { algorithm: 'HS256' })

      result(null, { ...user, token })
      return
    }

    result({ kind: "not_found" }, null)
  })
}

User.getAll = (title, result) => {
  let query = "SELECT * FROM user"

  if (title) {
    query += ` WHERE title LIKE '%${title}%'`
  }

  sql.query(query, (err, res) => {
    if (err) {
      log.error("error: ", err)
      result(null, err)
      return
    }
    const results = res.map((user) => toWeb(user))
    result(null, results)
  })
}

User.updateById = (id, user, result) => {
  sql.query(
    "UPDATE user SET name = ?, full_name = ?, email = ?, status = ? WHERE id = ?",
    [user.first_name, user.last_name, user.phone, user.profile_id, user.organization_id, user.user_status_id, id],
    (err, res) => {
      if (err) {
        log.error("error: ", err)
        result(null, err)
        return
      }

      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null)
        return
      }

      result(null, { id: id, ...toWeb(user) })
    }
  )
}

User.chgPwd = async (id, user, result) => {
  sql.query(`SELECT * FROM user WHERE id = '${id}'`, async (err, res) => {
    if (err) {
      log.error("error: ", err)
      result(err, null)
      return
    }

    if (res.length == 0) {
      result({ kind: "not_found" }, null)
      return
    }

    const ok = await bcrypt.compare(user.prevPass, res[0].password)

    if (!ok) {
      result({ kind: "wrong_prev_password" }, null)
      return
    }

    const password = await bcrypt.hash(user.password, 10)

    sql.query(
      "UPDATE user SET password = ? WHERE id = ?",
      [password, id],
      (err, res) => {
        if (err) {
          log.error("error: ", err)
          result(null, err)
          return
        }

        if (res.affectedRows == 0) {
          result({ kind: "not_found" }, null)
          return
        }

        result(null, { id })
      }
    )
  })
}

User.remove = (id, result) => {
  sql.query("DELETE FROM user WHERE id = ?", id, (err, res) => {
    if (err) {
      log.error("error: ", err)
      result(null, err)
      return
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null)
      return
    }

    result(null, id)
  })
}

User.removeAll = result => {
  sql.query("DELETE FROM user", (err, res) => {
    if (err) {
      log.error("error: ", err)
      result(null, err)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = User
