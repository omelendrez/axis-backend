const sql = require('./db.js')
const {
  toWeb,
  getPaginationFilters,
  loadModel
} = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const CourseAssessment = function (payload) {
  loadModel(payload, this)
}

CourseAssessment.create = (assessment, result) => {
  const newAssessment = { ...assessment }
  sql.query(
    `SELECT COUNT(1) records FROM course_assessment WHERE name='${assessment.name}'`,
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
        'INSERT INTO course_assessment SET ?',
        newAssessment,
        (err, res) => {
          if (err) {
            log.error(err)
            result(err, null)
            return
          }

          result(null, { id: res.insertId, ...newAssessment })
        }
      )
    }
  )
}

CourseAssessment.findById = (id, result) => {
  sql.query(`SELECT * FROM course_assessment WHERE id = ${id}`, (err, res) => {
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

CourseAssessment.getAll = (pagination, result) => {
  const fields = ['c.name']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT c.id, c.name FROM course_assessment c ${filter} ORDER BY c.name ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM course_assessment c ${filter};`

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

CourseAssessment.updateById = (id, assessment, result) => {
  sql.query(
    'UPDATE course_assessment SET name = ? WHERE id = ?',
    [assessment.name, id],
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

      result(null, { id, ...toWeb(assessment) })
    }
  )
}

CourseAssessment.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM course_assessment_rel WHERE assessment = ?;',
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

      sql.query(
        'DELETE FROM course_assessment WHERE id = ?',
        id,
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

          result(null, id)
        }
      )
    }
  )
}

CourseAssessment.removeAll = (result) => {
  sql.query('DELETE FROM course_assessment', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = CourseAssessment
