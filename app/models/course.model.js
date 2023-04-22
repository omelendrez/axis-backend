const sql = require('./db.js')
const { toWeb } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const Course = function (course) {
  this.code = course.code
  this.name = course.name
  this.front_id = course.front_id
  this.back_id = course.back_id
  this.id_card = course.id_card
  this.duration = course.duration
  this.validity = course.validity
  this.cert_type = course.cert_type
  this.cert_id_card = course.cert_id_card
  this.opito_reg_code = course.opito_reg_code
}

Course.create = (course, result) => {
  const newCourse = { ...course }
  sql.query(
    `SELECT COUNT(1) records FROM course WHERE code='${course.code}' OR name='${course.name}'`,
    (err, res) => {
      if (err) {
        log.error('error: ', err)
        result(null, err)
        return
      }

      if (res[0].records) {
        result({ kind: 'already_exists' }, null)
        return
      }
      sql.query('INSERT INTO course SET ?', newCourse, (err, res) => {
        if (err) {
          log.error('error: ', err)
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
      log.error('error: ', err)
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

Course.getAll = (search, result) => {
  let filter = ''
  const fields = ['c.code', 'c.name', 'ct.name', 'c.opito_reg_code']
  if (search) {
    filter = ` WHERE CONCAT(${fields.join(' , ')}) LIKE '%${search}%'`
  }

  const query = `SELECT c.id, c.code, c.name, c.front_id, c.back_id, CASE WHEN c.id_card=1 THEN 'Yes' ELSE 'No' END id_card, c.duration, c.validity, CASE WHEN c.cert_id_card=1 THEN 'Yes' ELSE 'No' END cert_id_card, c.opito_reg_code, ct.name cert_type_name FROM course c INNER JOIN certificate_type ct ON c.cert_type = ct.id ${filter} ORDER BY code;`

  sql.query(query, (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }
    const results = res.map((course) => toWeb(course))
    result(null, results)
  })
}

Course.updateById = (id, course, result) => {
  sql.query(
    'UPDATE course SET code = ?, name = ?, front_id = ?, back_id = ?, duration = ?, validity = ?, cert_type = ?, cert_id_card = ?, opito_reg_code = ? WHERE id = ?',
    [
      course.code,
      course.name,
      course.front_id,
      course.back_id,
      course.duration,
      course.validity,
      course.cert_type,
      course.cert_id_card,
      course.opito_reg_code,
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

      result(null, { id, ...toWeb(course) })
    }
  )
}

Course.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM training WHERE course IN (SELECT code FROM course WHERE id = ?);',
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

      sql.query('DELETE FROM course WHERE id = ?', id, (err, res) => {
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

Course.removeAll = (result) => {
  sql.query('DELETE FROM course', (err, res) => {
    if (err) {
      log.error('error: ', err)
      result(null, err)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Course
