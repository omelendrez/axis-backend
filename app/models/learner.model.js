const sql = require('./db.js')
const { toWeb, getPaginationFilters, loadModel } = require('../helpers/utils')
const { log } = require('../helpers/log.js')

// constructor
const Learner = function (payload) {
  loadModel(payload, this)
}

Learner.create = (learner, result) => {
  const newLearner = { ...learner, status: 1 }

  sql.query(
    'SELECT COUNT(1) records FROM learner WHERE last_name = ? AND first_name = ? AND DATE_FORMAT(birth_date, `%Y-%m-%d`) = ?',
    [newLearner.last_name, newLearner.first_name, newLearner.birth_date],
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

      sql.query('INSERT INTO learner SET ?', newLearner, (err, res) => {
        if (err) {
          log.error(err)
          result(err, null)
          return
        }

        result(null, { id: res.insertId, ...newLearner })
      })
    }
  )
}

Learner.findById = (id, result) => {
  sql.query(
    `SELECT id, type, badge, last_name, first_name, sex, state, nationality, DATE_FORMAT(birth_date, '%Y-%m-%d') birth_date, company, status FROM learner WHERE id = ${id}`,
    (err, res) => {
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
    }
  )
}

Learner.findByIdView = (id, result) => {
  sql.query(
    `SELECT t.id, t.type, t.badge, CONCAT(t.last_name, ', ', first_name) full_name,CASE WHEN t.sex = 'F' THEN 'Female' ELSE 'Male' END sex, s.name state, n.nationality, DATE_FORMAT(birth_date, '%d-%m-%Y') birth_date, c.name company, CASE WHEN t.status = 1 THEN 'Active' ELSE 'Inactive' END status FROM learner t INNER JOIN company c ON t.company = c.id INNER JOIN state s ON t.state = s.id INNER JOIN nationality n ON t.nationality = n.id WHERE t.id = ${id}`,
    (err, res) => {
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
    }
  )
}

Learner.getAll = (pagination, result) => {
  const fields = ['t.badge', 'CONCAT(t.last_name,", ",t.first_name)', 'c.name']

  const { filter, limits } = getPaginationFilters(
    pagination,
    fields,
    't.status=1'
  )

  const queryData = `SELECT t.id, t.type, t.badge, CONCAT(t.last_name,', ', t.first_name) full_name, c.name company FROM learner t INNER JOIN company c ON t.company=c.id ${filter} ORDER BY id DESC ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM learner t INNER JOIN company c ON t.company=c.id ${filter};`

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

Learner.updateById = (id, learner, result) => {
  sql.query(
    'UPDATE learner SET type = ?, badge = ?, last_name = ?, first_name = ?, sex = ?, state = ?, nationality = ?, birth_date = ?, company = ?, status = ? WHERE id = ?',
    [
      learner.type,
      learner.badge,
      learner.last_name,
      learner.first_name,
      learner.sex,
      learner.state,
      learner.nationality,
      learner.birth_date,
      learner.company,
      learner.status,
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

      result(null, { id, ...toWeb(learner) })
    }
  )
}

Learner.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM training WHERE learner = ?',
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

      sql.query('DELETE FROM learner WHERE id = ?', id, (err, res) => {
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

Learner.removeAll = (result) => {
  sql.query('DELETE FROM learner', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Learner
