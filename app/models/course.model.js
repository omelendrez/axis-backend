const sql = require('./db.js')
const {
  toWeb,
  getPaginationFilters,
  loadModel
} = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const Course = function (payload) {
  loadModel(payload, this)
}

Course.create = (course, result) => {
  const newCourse = { ...course }
  sql.query(
    `SELECT COUNT(1) records FROM course WHERE name='${course.name}'`,
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
      sql.query('INSERT INTO course SET ?', newCourse, (err, res) => {
        if (err) {
          log.error(err)
          result(err, null)
          return
        }

        result(null, { id: res.insertId, ...newCourse })
      })
    }
  )
}

Course.findById = (id, result) => {
  sql.query(`SELECT * FROM course WHERE id = ${id}`, (err, res) => {
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

Course.findByIdView = (id, result) => {
  sql.query(
    'SELECT c.id, c.name, ct.name type, CASE WHEN c.id_card = 1 THEN "Yes" ELSE "No" END card_id, CASE WHEN c.cert_id_card = 1 THEN "Yes" ELSE "No" END cert_card_id, c.front_id, c.back_id, c.duration, c.validity, TRIM(c.opito_reg_code) opito_code FROM course c INNER JOIN certificate_type ct ON c.cert_type = ct.id WHERE c.id = ?',
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

Course.getAll = (pagination, result) => {
  const fields = ['c.name', 'ct.name', 'c.opito_reg_code']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT c.id, c.name, ct.name cert_type_name, c.opito_reg_code FROM course c INNER JOIN certificate_type ct ON c.cert_type = ct.id ${filter} ORDER BY c.name ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM course c INNER JOIN certificate_type ct ON c.cert_type = ct.id ${filter};`

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

Course.updateById = (id, course, result) => {
  sql.query(
    'UPDATE course SET name = ?, front_id = ?, back_id = ?, duration = ?, validity = ?, cert_type = ?, cert_id_card = ?, id_card = ?, opito_reg_code = ? WHERE id = ?',
    [
      course.name,
      course.front_id,
      course.back_id,
      course.duration,
      course.validity,
      course.cert_type,
      course.cert_id_card,
      course.id_card,
      course.opito_reg_code,
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

      result(null, { id, ...toWeb(course) })
    }
  )
}

Course.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM training WHERE course = ?;',
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

      sql.query('DELETE FROM course WHERE id = ?', id, (err, res) => {
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

Course.removeAll = (result) => {
  sql.query('DELETE FROM course', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Course
