const sql = require('./db.js')
const { toWeb } = require('../helpers/utils')
const { log } = require('../helpers/log.js')
// constructor
const Trainee = function (trainee) {
  this.type = trainee.type
  this.badge = trainee.badge
  this.last_name = trainee.last_name
  this.first_name = trainee.first_name
  this.sex = trainee.sex
  this.state = trainee.state
  this.nationality = trainee.nationality
  this.birth_date = trainee.birth_date
  this.company = trainee.company
  this.status = trainee.status
}

Trainee.create = (trainee, result) => {
  const newTrainee = { ...trainee, status: 1 }

  sql.query(
    'SELECT COUNT(1) records FROM trainee WHERE last_name = ? AND first_name = ? AND DATE_FORMAT(birth_date, `%Y-%m-%d`) = ?',
    [newTrainee.last_name, newTrainee.first_name, newTrainee.birth_date],
    (err, res) => {
      if (err) {
        log.error('error: ', err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'already_exists' }, null)
        return
      }

      sql.query('INSERT INTO trainee SET ?', newTrainee, (err, res) => {
        if (err) {
          log.error('error: ', err)
          result(err, null)
          return
        }

        result(null, { id: res.insertId, ...newTrainee })
      })
    }
  )
}

Trainee.findById = (id, result) => {
  sql.query(
    `SELECT id, type, badge, last_name, first_name, sex, state, nationality, DATE_FORMAT(birth_date, '%Y-%m-%d') birth_date, company, status FROM trainee WHERE id = ${id}`,
    (err, res) => {
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
    }
  )
}

Trainee.getAll = ({ search, limit, offset }, result) => {
  let filter = ''
  const fields = [
    't.badge',
    'CONCAT(t.last_name,',
    ',t.first_name)',
    's.name',
    'n.nationality',
    'c.name'
  ]
  if (search) {
    filter = `WHERE CONCAT(${fields.join(
      ', '
    )}) LIKE '%${search}%' AND t.status=1`
  } else {
    filter = 'WHERE t.status=1'
  }
  const queryData = `SELECT t.id, t.type, t.badge, CONCAT(t.last_name,', ', t.first_name) full_name, t.sex, s.name state_name, n.nationality nationality_name, DATE_FORMAT(t.birth_date, '%d-%m-%Y') birth_date, c.name company_name, CASE WHEN t.status=1 THEN 'Active' WHEN t.status=0 THEN 'Inactive' END status_name FROM trainee t INNER JOIN state s ON t.state=s.id INNER JOIN nationality n ON t.nationality=n.id INNER JOIN company c ON t.company=c.code ${filter} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset};`
  const queryCount = `SELECT COUNT(1) records FROM trainee t INNER JOIN state s ON t.state=s.id INNER JOIN nationality n ON t.nationality=n.id INNER JOIN company c ON t.company=c.code ${filter};`

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

Trainee.updateById = (id, trainee, result) => {
  sql.query(
    'UPDATE trainee SET type = ?, badge = ?, last_name = ?, first_name = ?, sex = ?, state = ?, nationality = ?, birth_date = ?, company = ?, status = ? WHERE id = ?',
    [
      trainee.type,
      trainee.badge,
      trainee.last_name,
      trainee.first_name,
      trainee.sex,
      trainee.state,
      trainee.nationality,
      trainee.birth_date,
      trainee.company,
      trainee.status,
      id
    ],
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

      result(null, { id, ...toWeb(trainee) })
    }
  )
}

Trainee.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM training WHERE trainee = ?',
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

      sql.query('DELETE FROM trainee WHERE id = ?', id, (err, res) => {
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

Trainee.removeAll = (result) => {
  sql.query('DELETE FROM trainee', (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Trainee
