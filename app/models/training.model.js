const sql = require('./db')

const findByIdView = require('./queries/findByIdView')

const { TRAINING_STATUS, getPaginationFilters } = require('../helpers/utils')
const { toWeb, loadModel } = require('../helpers/utils')
const { log } = require('../helpers/log')
// constructor
const Training = function (payload) {
  loadModel(payload, this)
}

Training.create = (training, result) => {
  const newTraining = {
    ...training,
    issued: null,
    expiry: null,
    prev_expiry: training.prev_expiry ? training.prev_expiry : null,
    instructor: training.instructor ? training.instructor : null,
    status: TRAINING_STATUS.NEW
  }

  if (!newTraining.start || !newTraining.end) {
    result({ kind: 'training_dates' }, null)
    return
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

      sql.query(
        'SELECT expiry_type FROM course WHERE id = ? ',
        [newTraining.course],
        (err, res) => {
          if (err) {
            log.error(err)
            result(err, null)
            return
          }

          if (res[0].expiry_type === 2 && !newTraining.prev_expiry) {
            result({ kind: 'missing_prev_expiry' }, null)
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
  )
}

Training.findById = (id, result) => {
  sql.query(
    'SELECT id, course, DATE_FORMAT(start, "%Y-%m-%d") start, DATE_FORMAT(end, "%Y-%m-%d") end, DATE_FORMAT(issued, "%Y-%m-%d") issued, DATE_FORMAT(prev_expiry, "%Y-%m-%d") prev_expiry, instructor  FROM training WHERE id = ?',
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

Training.findByIdView = (id, result) => {
  sql.query(findByIdView, [id, id, id, id, id], (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    if (res.length) {
      const results = {
        ...res[0][0],
        medical: res[1],
        course: res[2][0],
        items: res[3],
        tracking: res[4]
      }
      result(null, results)
      return
    }

    result({ kind: 'not_found' }, null)
  })
}

Training.findAll = (pagination, result) => {
  const fields = [
    'l.badge',
    'CONCAT(l.first_name, " ", l.middle_name, " ", l.last_name)',
    'CONCAT(l.first_name, " ", l.last_name, " ", l.middle_name)',
    'CONCAT(l.middle_name, " ", l.first_name, " ", l.last_name)',
    'CONCAT(l.middle_name, " ", l.last_name, " ", l.first_name)',
    'CONCAT(l.last_name, " ", l.first_name, " ", l.middle_name)',
    'CONCAT(l.last_name, " ", l.middle_name, " ", l.first_name)',
    'c.name'
  ]

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT
      t.id,
      l.badge,
      CONCAT(l.first_name, ' ' , l.middle_name, ' ' , l.last_name) full_name,
      co.name company_name,
      c.name course_name,
      t.status,
      s.status status_name,
      s.state state_name,
      DATE_FORMAT(t.start, '%d/%m/%Y') start
    FROM
      training t
    INNER JOIN
      course c
    ON
      t.course = c.id
    INNER JOIN
      learner l
    ON
      t.learner = l.id
    INNER JOIN
      company co
    ON
      l.company = co.id
    INNER JOIN
      status s
    ON
      t.status = s.id
    ${filter}
    ORDER BY t.id DESC
    ${limits};
  `

  const queryCount = `SELECT COUNT(1) records
    FROM
      training t
    INNER JOIN
      course c
    ON
      t.course = c.id
    INNER JOIN
      learner l
    ON
      t.learner = l.id
    INNER JOIN
      company co
    ON
      l.company = co.id
    INNER JOIN
      status s
    ON
      t.status = s.id
    ${filter};`

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

Training.findAllById = (id, result) => {
  const query = `SELECT t.id, c.name course, u.name instructor, DATE_FORMAT(t.start, '%d/%m/%Y') start, DATE_FORMAT(t.end, '%d/%m/%Y') end, DATE_FORMAT(t.prev_expiry, '%d/%m/%Y') prev_expiry, DATE_FORMAT(t.issued, '%d/%m/%Y') issued, DATE_FORMAT(t.expiry, '%d/%m/%Y') expiry, t.certificate, s.state FROM training t INNER JOIN course c ON t.course = c.id INNER JOIN status s ON t.status = s.id LEFT OUTER JOIN user u ON t.instructor = u.id WHERE learner = ${id}`

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

Training.findByDate = (date, statuses, pagination, result) => {
  const fields = [
    'l.badge',
    'CONCAT(l.first_name, " ", l.middle_name, " ", l.last_name)',
    'CONCAT(l.first_name, " ", l.last_name, " ", l.middle_name)',
    'CONCAT(l.middle_name, " ", l.first_name, " ", l.last_name)',
    'CONCAT(l.middle_name, " ", l.last_name, " ", l.first_name)',
    'CONCAT(l.last_name, " ", l.first_name, " ", l.middle_name)',
    'CONCAT(l.last_name, " ", l.middle_name, " ", l.first_name)',
    'c.name'
  ]

  const { filter, limits } = getPaginationFilters(
    pagination,
    fields,
    ` DATE_FORMAT(t.start, "%Y-%m-%d") = '${date}'  ${
      statuses ? `AND t.status IN (${statuses.split('-').join(',')})` : null
    }`
  )

  const queryData = `SELECT
      t.id,
      l.badge,
      CONCAT(l.first_name, ' ' , l.middle_name, ' ' , l.last_name) full_name,
      co.name company_name,
      c.name course_name,
      t.status,
      s.status status_name,
      s.state state_name,
      DATE_FORMAT(t.start, '%d/%m/%Y') start
    FROM
      training t
    INNER JOIN
      course c
    ON
      t.course = c.id
    INNER JOIN
      learner l
    ON
      t.learner = l.id
    INNER JOIN
      company co
    ON
      l.company = co.id
    INNER JOIN
      status s
    ON
      t.status = s.id
    ${filter}
    ORDER BY 3
    ${limits};
  `

  const queryCount = `SELECT COUNT(1) records
    FROM
      training t
    INNER JOIN
      course c
    ON
      t.course = c.id
    INNER JOIN
      learner l
    ON
      t.learner = l.id
    INNER JOIN
      company co
    ON
      l.company = co.id
    INNER JOIN
      status s
    ON
      t.status = s.id
    ${filter};`

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

Training.updateById = (id, training, result) => {
  sql.query(
    'SELECT expiry_type FROM course WHERE id = ? ',
    [training.course],
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      if (res[0].expiry_type === 2 && !training.prev_expiry) {
        result({ kind: 'missing_prev_expiry' }, null)
        return
      }

      sql.query(
        'UPDATE training SET course = ?, start = ?, end = ?, issued = ?, prev_expiry = ?, instructor = ? WHERE id = ?',
        [
          training.course,
          training.start,
          training.end,
          training.issued,
          res[0].expiry_type === 2 ? training.prev_expiry : null,
          training.instructor,
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
  )
}

Training.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM training_tracking WHERE training = ?',
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

      sql.query('DELETE FROM training_tracking WHERE training = ?', id, () => {
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
    'INSERT INTO training_tracking (training, user, status) VALUES (?,?,?)',
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

module.exports = Training
