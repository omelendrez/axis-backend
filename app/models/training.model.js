/* eslint-disable quotes */
const sql = require('./db')

const findByIdView = require('./queries/findByIdView')
const verifyCertificate = require('./queries/verifyCertificate')

const { TRAINING_STATUS, getPaginationFilters } = require('../helpers/utils')
const { toWeb, loadModel } = require('../helpers/utils')
const { sendError } = require('../errors/error-monitoring')
// constructor
const Training = function (payload) {
  loadModel(payload, this)
}

Training.create = (training, result) => {
  const newTraining = {
    ...training,
    end: null,
    issued: null,
    expiry: null,
    prev_expiry: training.prev_expiry ? training.prev_expiry : null,
    instructor: training.instructor ? training.instructor : null,
    status: TRAINING_STATUS.NEW
  }

  if (!newTraining.start) {
    result({ kind: 'training_dates' }, null)
    return
  }

  sql.query(
    'SELECT COUNT(1) records FROM training WHERE learner = ? AND course = ? AND DATE_FORMAT(start, "%Y-%m-%d") = ?',
    [newTraining.learner, newTraining.course, newTraining.start],
    (err, res) => {
      if (err) {
        sendError('Training.create', err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'already_exists' }, null)
        return
      }

      sql.query('INSERT INTO training SET ?', newTraining, (err, res) => {
        if (err) {
          sendError('Training.create', err)
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
    'SELECT id, course, DATE_FORMAT(start, "%Y-%m-%d") start, DATE_FORMAT(end, "%Y-%m-%d") end, DATE_FORMAT(issued, "%Y-%m-%d") issued, DATE_FORMAT(expiry, "%Y-%m-%d") expiry, DATE_FORMAT(prev_expiry, "%Y-%m-%d") prev_expiry, instructor  FROM training WHERE id = ?',
    id,
    (err, res) => {
      if (err) {
        sendError('Training.findById', err)
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
  sql.query(findByIdView, [id, id, id, id, id, id, id], (err, res) => {
    if (err) {
      sendError('Training.findByIdView', err)
      result(err, null)
      return
    }

    if (res.length) {
      const results = {
        ...res[0][0],
        medical: res[1],
        course: res[2][0],
        items: res[3],
        tracking: res[4],
        contact_info: res[5],
        instructors: res[6]
      }
      result(null, results)
      return
    }

    result({ kind: 'not_found' }, null)
  })
}

Training.findAllById = (id, result) => {
  const query =
    "SELECT t.id, c.name course, s.status, u.full_name instructor, DATE_FORMAT(t.start, '%d/%m/%Y') start, DATE_FORMAT(t.end, '%d/%m/%Y') end, DATE_FORMAT(t.prev_expiry, '%d/%m/%Y') prev_expiry, DATE_FORMAT(t.issued, '%d/%m/%Y') issued, DATE_FORMAT(t.expiry, '%d/%m/%Y') expiry, t.certificate FROM training t INNER JOIN course c ON t.course = c.id INNER JOIN status s ON t.status = s.id LEFT OUTER JOIN user u ON t.instructor = u.id WHERE learner = ?"

  sql.query(query, id, (err, res) => {
    if (err) {
      sendError('Training.findAllById', err)
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
    'CONCAT(l.first_name, " ", l.last_name)',
    'CONCAT(l.last_name, " ", l.first_name)',
    'c.name'
  ]

  const dateFilter =
    date === 'no-date' ? '' : `'${date}' BETWEEN t.start AND t.end `
  const statusesFilter =
    statuses === 'no-statuses'
      ? ''
      : `t.status IN (${statuses.split('-').join(',')})`

  const { filter, limits } = getPaginationFilters(
    pagination,
    fields,
    dateFilter ? `${dateFilter} AND ${statusesFilter}` : statusesFilter
  )

  const queryData = `SELECT
      t.id,
      l.badge,
      CONCAT(l.first_name, ' ' , l.last_name) full_name,
      co.name company_name,
      c.name course_name,
      t.status,
      s.status status_name,
      DATE_FORMAT(t.start, '%d/%m/%Y') start,
      DATE_FORMAT(t.end, '%d/%m/%Y') end,
      i.full_name instructor,
      t.reject_reason
    FROM
      training t
    INNER JOIN
      course c
    ON
      t.course = c.id
    LEFT OUTER JOIN
      user i
    ON
      t.instructor = i.id
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
      sendError('Training.findByDate', err)
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
        sendError('Training.updateById', err)
        result(err, null)
        return
      }

      if (res[0].expiry_type === 2 && !training.prev_expiry) {
        result({ kind: 'missing_prev_expiry' }, null)
        return
      }

      sql.query(
        'UPDATE training SET course = ?, start = ?, end = ?, issued = ?, expiry = ?, prev_expiry = ?, instructor = ? WHERE id = ?',
        [
          training.course,
          training.start,
          training.end,
          training.issued,
          training.expiry,
          res[0].expiry_type === 2 ? training.prev_expiry : null,
          training.instructor,
          id
        ],
        (err, res) => {
          if (err) {
            sendError('Training.updateById', err)
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
        sendError('Training.remove', err)
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
            sendError('Training.remove', err)
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

Training.removeForce = (id, result) => {
  sql.query('DELETE FROM training_tracking WHERE training = ?;', id, (err) => {
    if (err) {
      sendError('Training.removeForce', err)
      result(err, null)
      return
    }

    sql.query('DELETE FROM training WHERE id = ?;', id, (err, res) => {
      if (err) {
        sendError('Training.removeForce', err)
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

// Training.removeAll = (result) => {
//   sql.query('DELETE FROM training;', (err, res) => {
//     if (err) {
//       sendError('Training.removeAll', err)
//       result(err, null)
//       return
//     }

//     result(null, res.affectedRows)
//   })
// }

Training.addTracking = (trainingId, userId, status, result) => {
  sql.query(
    'INSERT INTO training_tracking (training, user, status) VALUES (?,?,?);',
    [trainingId, userId, status],
    (err, res) => {
      if (err) {
        sendError('Training.addTracking', err)
        result(err, null)
        return
      }
      result(null, res)
    }
  )
}

Training.findActivePeriod = (result) => {
  const query = `SELECT
                  MIN(YEAR(start)) min,
                  MAX(YEAR(start)) max
                FROM
                  training
                WHERE
                  status = 11;
                `
  sql.query(query, (err, res) => {
    if (err) {
      sendError('Training.findActivePeriod', err)
      result(err, null)
      return
    }

    result(null, res[0])
  })
}

Training.findCourseMonthByYear = (year, result) => {
  const query = `
  SELECT
    c.id c,
    c.name course,
    MONTH(t.start) m,
    MONTHNAME(t.start) month,
    COUNT(*) value
  FROM
    training t
        INNER JOIN
    course c ON c.id = t.course
  WHERE
    YEAR(t.start) = ? AND t.status = 11
  GROUP BY c.id, c.name , MONTH(t.start) , MONTHNAME(t.start)
  ORDER BY 1, 3;`

  sql.query(query, [year, year], (err, res) => {
    if (err) {
      sendError('Training.findCourseMonthByYear', err)
      result(err, null)
      return
    }

    const data = res.map((data) => toWeb(data))

    result(null, data)
  })
}

Training.findLearnerByYear = (year, result) => {
  const query = `SELECT MONTH(start) m, MONTHNAME(start) month, COUNT(distinct learner) value
  FROM training
  WHERE YEAR(start)=?
  GROUP BY MONTH(start), MONTHNAME(start)
  ORDER BY 1;`

  sql.query(query, [year], (err, res) => {
    if (err) {
      sendError('Training.findLearnerByYear', err)
      result(err, null)
      return
    }

    const data = res.map((data) => toWeb(data))

    result(null, data)
  })
}

Training.findCourseByYear = (year, result) => {
  const query = `SELECT c.name course, COUNT(*) value
  FROM training t
  INNER JOIN course c ON t.course=c.id
  WHERE YEAR(start)=?
  GROUP BY c.name
  ORDER BY 2 desc;`

  sql.query(query, [year], (err, res) => {
    if (err) {
      sendError('Training.findCourseByYear', err)
      result(err, null)
      return
    }

    const data = res.map((data) => toWeb(data))

    result(null, data)
  })
}

Training.findCourseTypeByYear = (year, result) => {
  const query = `SELECT ct.name 'type', c.name 'course', count(*) 'count'
  FROM training t
  INNER JOIN course c ON t.course = c.id
  INNER JOIN certificate_type ct ON c.cert_type = ct.id
  WHERE YEAR(t.start)=?
  GROUP BY ct.name, c.name
  ORDER BY 1, 2;`

  sql.query(query, [year], (err, res) => {
    if (err) {
      sendError('Training.findCourseTypeByYear', err)
      result(err, null)
      return
    }

    const data = res.map((data) => toWeb(data))

    result(null, data)
  })
}

Training.findTrainingRecords = (params, result) => {
  const filters = params.search
    .replace('?', '')
    .split('&')
    .map((s) => {
      const searches = s.split('=')
      return { field: searches[0], value: searches[1] }
    })

  const conditions = ['WHERE t.status=11']

  filters
    .filter(({ field }) => !!field)
    .forEach(({ field, value }) => {
      let alias = ''
      let condition = ''
      switch (field) {
        case 'from':
        case 'to':
          // condition = `AND DATE_FORMAT(t.${field}, '%Y-%m-%d')='${value}'`
          break
        case 'company':
          alias = 'l'
          condition = `AND ${alias}.${field}='${value}'`
          break
        default:
          alias = 't'
          condition = `AND ${alias}.${field}='${value}'`
      }
      conditions.push(condition)
    })

  const from = filters.find((f) => f.field === 'from')
  const to = filters.find((f) => f.field === 'to')

  if (from && to) {
    conditions.push(
      `AND t.end BETWEEN DATE_FORMAT('${from.value}', '%Y-%m-%d') AND DATE_FORMAT('${to.value}', '%Y-%m-%d') `
    )
  }

  const count = `SELECT COUNT(*) as records FROM
  training t
      INNER JOIN
  learner l ON t.learner = l.id
      INNER JOIN
  course co ON t.course = co.id
      INNER JOIN
  company c ON l.company = c.id
${conditions.join(' ')};`

  sql.query(count, (err, res) => {
    if (err) {
      sendError('Training.findTrainingRecords', err)
      result(err, null)
      return
    }

    const { records } = res[0]

    if (records > 5000) {
      result({ kind: 'too_many', data: records }, null)
      return
    }

    const query = `SELECT
    ROW_NUMBER() OVER(ORDER BY t.id) AS row_num,
    l.first_name,
    l.last_name,
    DATE_FORMAT(l.birth_date, '%Y-%m-%d') birth_date,
    c.name company,
    co.name course,
    DATE_FORMAT(t.start, '%Y-%m-%d') start,
    DATE_FORMAT(t.end, '%Y-%m-%d') end,
    DATE_FORMAT(t.expiry, '%Y-%m-%d') expiry,
    DATEDIFF(t.expiry, NOW()) days,
    t.certificate
  FROM
    training t
        INNER JOIN
    learner l ON t.learner = l.id
        INNER JOIN
    course co ON t.course = co.id
        INNER JOIN
    company c ON l.company = c.id
  ${conditions.join(' ')};`

    sql.query(query, (err, res) => {
      if (err) {
        sendError('Training.findTrainingRecords', err)
        result(err, null)
        return
      }

      const data = res.map((data) => toWeb(data))

      result(null, { data, message: `${data.length || 'No'} records found` })
    })
  })
}

Training.verify = (id, result) => {
  sql.query(verifyCertificate, id, (err, res) => {
    if (err) {
      sendError('Training.verify', err)
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

module.exports = Training
