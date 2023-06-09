const sql = require('./db.js')
const {
  toWeb,
  loadModel,
  getPaginationFilters
} = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const Training = function (payload) {
  loadModel(payload, this)
}

Training.create = (training, result) => {
  const newTraining = {
    ...training,
    status: 1,
    expiry: training.expiry ? training.expiry : null
  }

  sql.query(
    'SELECT COUNT(1) records FROM training WHERE learner = ? AND course = ? AND DATE_FORMAT(start, "%Y-%m-%d") = ?',
    [newTraining.learner, newTraining.course, newTraining.start],
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

      sql.query('INSERT INTO training SET ?', newTraining, (err, res) => {
        if (err) {
          log.error(err)
          result(err, null)
          return
        }

        result(null, { id: res.insertId, ...newTraining })
      })
    }
  )
}

Training.findById = (id, result) => {
  sql.query(
    `SELECT id, learner, course, DATE_FORMAT(start, '%Y-%m-%d') start, DATE_FORMAT(expiry, '%Y-%m-%d') expiry, certificate, status FROM training WHERE id = ${id}`,
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

Training.findByIdView = (id, result) => {
  sql.query(
    'SELECT t.id, l.badge, l.type, t.certificate, co.cert_type, CONCAT(l.last_name, ", ", l.first_name) full_name, DATE_FORMAT(l.birth_date, "%d/%m/%Y") birth_date, CASE WHEN l.sex = "F" THEN "Female" ELSE "Male" END sex, n.nationality, c.name company,co.name course, DATE_FORMAT(t.start, "%d/%m/%Y") start, DATE_FORMAT(t.expiry, "%d/%m/%Y") expiry, t.status status_id, st.name state, s.state course_state, s.status FROM learner l INNER JOIN training t ON l.id = t.learner INNER JOIN company c ON c.id = l.company INNER JOIN nationality n ON l.nationality = n.id INNER JOIN state st ON l.state = st.id INNER JOIN course co ON co.id = t.course INNER JOIN status s ON s.id = t.status WHERE t.id = ?',
    id,
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

Training.getAll = (id, result) => {
  const query = `SELECT t.id, c.name course, DATE_FORMAT(t.start, '%d/%m/%Y') start, DATE_FORMAT(t.expiry, '%d/%m/%Y') expiry, t.certificate, s.state FROM training t INNER JOIN course c ON t.course = c.id INNER JOIN status s ON t.status = s.id WHERE learner = ${id}`

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

Training.getAllByClassroom = (id, pagination, result) => {
  const fields = [
    'l.badge',
    'CONCAT(l.last_name, ", ", l.first_name) ',
    'c.name'
  ]

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT t.id, l.badge, CONCAT(l.last_name, ', ', l.first_name) full_name,c.name company, t.status status_id, s.status FROM learner l INNER JOIN training t ON l.id = t.learner INNER JOIN company c ON c.id = l.company INNER JOIN status s ON s.id = t.status INNER JOIN class cl ON t.course = cl.course AND t.start = cl.start ${filter} ${
    filter.length > 0 ? ' AND ' : ' WHERE '
  } cl.id = ? ${limits} ;`
  const queryCount = `SELECT COUNT(1) records FROM learner l INNER JOIN training t ON l.id = t.learner INNER JOIN company c ON c.id = l.company INNER JOIN status s ON s.id = t.status INNER JOIN class cl ON t.course = cl.course AND t.start = cl.start ${filter} ${
    filter.length > 0 ? ' AND ' : ' WHERE '
  } cl.id = ?;`

  console.log(queryData)
  console.log(queryCount)

  const query = `${queryData}${queryCount}`

  sql.query(query, [id, id], (err, res) => {
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

Training.updateById = (id, training, result) => {
  sql.query(
    'UPDATE training SET learner = ?, course = ?, start = ?, expiry = ?, certificate = ?, status = ? WHERE id = ?',
    [
      training.learner,
      training.course,
      training.start,
      training.expiry,
      training.certificate,
      training.status,
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

      result(null, { id, ...toWeb(training) })
    }
  )
}

Training.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM tracking WHERE training = ?',
    id,
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      if (res[0].records > 1) {
        result({ kind: 'cannot_delete' }, null)
        return
      }

      sql.query('DELETE FROM tracking WHERE training = ?', id, () => {
        sql.query('DELETE FROM training WHERE id = ?', id, (err, res) => {
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
      })
    }
  )
}

Training.removeAll = (result) => {
  sql.query('DELETE FROM training', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

Training.addTracking = (trainingId, userId, status, result) => {
  sql.query(
    'INSERT INTO tracking (training, user, status) VALUES (?,?,?)',
    [trainingId, userId, status],
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }
      result(null, res)
    }
  )
}

Training.getTracking = (trainingId, result) => {
  sql.query(
    'SELECT s.status, u.full_name, DATE_FORMAT(t.updated, "%d/%m/%Y %H:%i:%s") updated FROM tracking t INNER JOIN status s ON t.status = s.id INNER JOIN user u ON t.user = u.id WHERE t.training = ?;',
    [trainingId],
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }
      result(null, res)
    }
  )
}

module.exports = Training
