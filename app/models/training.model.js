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
    issued: training.issued ? training.issued : null,
    expiry: training.expiry ? training.expiry : null,
    prev_expiry: training.prev_expiry ? training.prev_expiry : null
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
    'SELECT id, course, DATE_FORMAT(start, "%Y-%m-%d") start, DATE_FORMAT(end, "%Y-%m-%d") end, DATE_FORMAT(issued, "%Y-%m-%d") issued, DATE_FORMAT(prev_expiry, "%Y-%m-%d") prev_expiry  FROM training WHERE id = ?',
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
  sql.query(
    `SELECT
        t.id,
        l.badge,
        l.type,
        t.certificate,
        t.finance_status,
        CONCAT(l.first_name, ' ', l.middle_name, ' ', l.last_name) full_name,
        DATE_FORMAT(l.birth_date, '%d/%m/%Y') birth_date,
        CASE
            WHEN l.sex = 'F' THEN 'Female'
            ELSE 'Male'
        END sex,
        n.nationality,
        c.name company,
        DATE_FORMAT(t.start, '%d/%m/%Y') start,
        DATE_FORMAT(t.end, '%d/%m/%Y') end,
        DATE_FORMAT(t.prev_expiry, '%d/%m/%Y') prev_expiry,
        DATE_FORMAT(t.issued, '%d/%m/%Y') issued,
        DATE_FORMAT(t.expiry, '%d/%m/%Y') expiry,
        t.status status_id,
        st.name state,
        s.state course_state,
        s.status status
    FROM
        learner l
            INNER JOIN
        training t ON l.id = t.learner
            INNER JOIN
        company c ON c.id = l.company
            INNER JOIN
        nationality n ON l.nationality = n.id
            INNER JOIN
        state st ON l.state = st.id
            INNER JOIN
        status s ON s.id = t.status
    WHERE
        t.id = ?;`,
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
  const query = `SELECT t.id, c.name course, DATE_FORMAT(t.start, '%d/%m/%Y') start, DATE_FORMAT(t.end, '%d/%m/%Y') end, DATE_FORMAT(t.prev_expiry, '%d/%m/%Y') prev_expiry, DATE_FORMAT(t.issued, '%d/%m/%Y') issued, DATE_FORMAT(t.expiry, '%d/%m/%Y') expiry, t.certificate, s.state FROM training t INNER JOIN course c ON t.course = c.id INNER JOIN status s ON t.status = s.id WHERE learner = ${id}`

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
    'CONCAT(l.first_name, " ", l.middle_name, " ", l.last_name) ',
    'c.name'
  ]

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT
  t.id,
  l.badge,
  CONCAT(l.first_name,
          ' ',
          l.middle_name,
          ' ',
          l.last_name) full_name,
  c.name company,
  t.status status_id,
  s.status
FROM
  learner l
      INNER JOIN
  training t ON l.id = t.learner
      INNER JOIN
  company c ON c.id = l.company
      INNER JOIN
  status s ON s.id = t.status
      INNER JOIN
  classroom cl ON t.course = cl.course
      AND t.start = cl.start
  ${filter} ${filter.length > 0 ? ' AND ' : ' WHERE '} cl.id = ? ${limits} ;`

  const queryCount = `SELECT COUNT(1) records FROM learner l INNER JOIN training t ON l.id = t.learner INNER JOIN company c ON c.id = l.company INNER JOIN status s ON s.id = t.status INNER JOIN classroom cl ON t.course = cl.course AND t.start = cl.start ${filter} ${
    filter.length > 0 ? ' AND ' : ' WHERE '
  } cl.id = ?;`

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
        'UPDATE training SET course = ?, start = ?, end = ?, issued = ?, prev_expiry = ? WHERE id = ?',
        [
          training.course,
          training.start,
          training.end,
          training.issued,
          res[0].expiry_type === 2 ? training.prev_expiry : null,
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

Training.getTracking = (trainingId, result) => {
  sql.query(
    'SELECT s.id status_id, s.status, u.full_name, DATE_FORMAT(t.updated, "%d/%m/%Y %H:%i:%s") updated FROM training_tracking t INNER JOIN status s ON t.status = s.id INNER JOIN user u ON t.user = u.id WHERE t.training = ? ORDER BY t.updated;',
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

Training.getMedicalData = (trainingId, result) => {
  const query = `
  SELECT
  t.status,
  CASE
    WHEN tm.training IS NULL THEN NULL
    ELSE JSON_ARRAYAGG(
      JSON_OBJECT(
        'systolic',
        tm.systolic,
        'diastolic',
        tm.diastolic
      )
    )
  END bp
FROM
  training_tracking t
  LEFT OUTER JOIN training_medical tm ON tm.training = t.training
  AND t.status = 4
WHERE
  t.training = ?
  AND t.status IN (4, 13)
GROUP BY
  t.status;
`
  sql.query(query, [trainingId], (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }
    result(null, res)
  })
}

Training.getCourseData = (trainingId, result) => {
  const query = `
  SELECT
    id,
    name,
    front_id_text,
    back_id_text,
    id_card,
    duration,
    validity,
    cert_type,
    expiry_type,
    opito_reg_code
FROM
    course
WHERE
    id = (SELECT
            course
        FROM
            training
        WHERE
            id = ?);`

  sql.query(query, [trainingId], (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res)
  })
}

Training.getCourseItemData = (trainingId, result) => {
  const query = `
  SELECT
      id, name
  FROM
      course_item
  WHERE
      id IN (SELECT
              item
          FROM
              course_item_rel
          WHERE
              course IN (SELECT
                      course
                  FROM
                      training
                  WHERE
                      id = ?))
  ORDER BY name;`

  sql.query(query, [trainingId], (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }
    result(null, res)
  })
}

module.exports = Training
