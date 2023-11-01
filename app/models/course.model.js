const sql = require('./db')
const { toWeb, getPaginationFilters, loadModel } = require('../helpers/utils')
const { log } = require('../helpers/log')
// constructor
const Course = function (payload) {
  loadModel(payload, this)
}

Course.create = (course, result) => {
  const newCourse = { ...course }

  if (course.cert_type === 4 && !course.front_id_text) {
    result({ kind: 'missing_front_id' }, null)
    return
  }

  sql.query(
    'SELECT COUNT(1) records FROM course WHERE name = ?',
    [course.name],
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
  sql.query('SELECT * FROM course WHERE id = ?', id, (err, res) => {
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
    'SELECT c.id, c.name, ct.name type, CASE WHEN c.id_card = 1 THEN "Yes" ELSE "No" END card_id, c.front_id_text, c.back_id_text, c.duration, c.validity, c.expiry_type, CASE c.expiry_type WHEN 0 THEN "Certificate has no expiring date" WHEN 1 THEN "Expiring date calculated automatically" ELSE "FOET expiration date calculation" END expiry_type_name, TRIM(c.opito_reg_code) opito_code FROM course c INNER JOIN certificate_type ct ON c.cert_type = ct.id WHERE c.id = ?',
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

  const queryData = `SELECT c.id, c.name, ct.name cert_type_name, c.opito_reg_code, c.expiry_type FROM course c INNER JOIN certificate_type ct ON c.cert_type = ct.id ${filter} ORDER BY c.name ${limits};`
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
  if (course.cert_type === 4 && !course.front_id_text) {
    result({ kind: 'missing_front_id' }, null)
    return
  }

  sql.query(
    'UPDATE course SET name = ?, front_id_text = ?, back_id_text = ?, duration = ?, validity = ?, cert_type = ?, id_card = ?, expiry_type = ?, opito_reg_code = ? WHERE id = ?',
    [
      course.name,
      course.front_id_text,
      course.back_id_text,
      course.duration,
      course.validity,
      course.cert_type,
      course.id_card,
      course.expiry_type,
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
