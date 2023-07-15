const sql = require('./db')
const { toWeb, loadModel } = require('../helpers/utils')
const { log } = require('../helpers/log')
// constructor
const CourseAssessmentRel = function (payload) {
  loadModel(payload, this)
}

CourseAssessmentRel.create = (payload, result) => {
  sql.query(
    'INSERT INTO course_assessment_rel (course,assessment) VALUES ?',
    payload,
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      result(null, { id: res.insertId, ...payload })
    }
  )
}

CourseAssessmentRel.getAll = (id, result) => {
  const query = `SELECT cir.id, ci.name FROM course_assessment ci INNER JOIN course_assessment_rel cir ON cir.assessment = ci.id WHERE cir.course = ${id} ORDER BY ci.name;`

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

CourseAssessmentRel.getAllAvailable = (id, result) => {
  const query = `SELECT i.id, i.name FROM course_assessment i WHERE i.id NOT IN (SELECT assessment FROM course_assessment_rel WHERE course = ${id}) ORDER BY i.name;`

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

CourseAssessmentRel.remove = (id, result) => {
  sql.query(
    'DELETE FROM course_assessment_rel WHERE id = ?',
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

CourseAssessmentRel.removeAll = (result) => {
  sql.query('DELETE FROM course_assessment_rel', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = CourseAssessmentRel
