const sql = require('./db.js')
const { toWeb, loadModel } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const CourseAssesmentRel = function (payload) {
  loadModel(payload, this)
}

CourseAssesmentRel.create = (payload, result) => {
  sql.query(
    'INSERT INTO course_assesment_rel (course,assesment) VALUES ?',
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

CourseAssesmentRel.getAll = (id, result) => {
  const query = `SELECT cir.id, ci.name FROM course_assesment ci INNER JOIN course_assesment_rel cir ON cir.assesment = ci.id WHERE cir.course = ${id} ORDER BY ci.name;`

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

CourseAssesmentRel.getAllAvailable = (id, result) => {
  const query = `SELECT i.id, i.name FROM course_assesment i WHERE i.id NOT IN (SELECT assesment FROM course_assesment_rel WHERE course = ${id}) ORDER BY i.name;`

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

CourseAssesmentRel.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM course_assesment_rel WHERE assesment = ?;',
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
        'DELETE FROM course_assesment_rel WHERE id = ?',
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

CourseAssesmentRel.removeAll = (result) => {
  sql.query('DELETE FROM course_assesment_rel', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = CourseAssesmentRel
