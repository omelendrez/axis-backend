const sql = require('./db')
const { toWeb, loadModel } = require('../helpers/utils')
const { log } = require('../helpers/log')
const { sendError } = require('../errors/error-monitoring')
// constructor
const CourseModuleRel = function (payload) {
  loadModel(payload, this)
}

CourseModuleRel.create = (payload, result) => {
  sql.query(
    'INSERT INTO course_module_rel (course,module) VALUES ?',
    payload,
    (err, res) => {
      if (err) {
        sendError('CourseModuleRel.create', err)
        log.error(err)
        result(err, null)
        return
      }

      result(null, { id: res.insertId, ...payload })
    }
  )
}

CourseModuleRel.getAll = (id, result) => {
  const query =
    'SELECT cir.id, ci.name FROM course_module ci INNER JOIN course_module_rel cir ON cir.module = ci.id WHERE cir.course = ? ORDER BY ci.name;'

  sql.query(query, id, (err, res) => {
    if (err) {
      sendError('CourseModuleRel.getAll', err)
      log.error(err)
      result(err, null)
      return
    }

    const data = res.map((data) => toWeb(data))

    result(null, data)
  })
}

CourseModuleRel.getAllAvailable = (id, result) => {
  const query =
    'SELECT i.id, i.name FROM course_module i WHERE i.id NOT IN (SELECT module FROM course_module_rel WHERE course = ?) ORDER BY i.name;'

  sql.query(query, id, (err, res) => {
    if (err) {
      sendError('CourseModuleRel.getAllAvailable', err)
      log.error(err)
      result(err, null)
      return
    }

    const data = res.map((data) => toWeb(data))

    result(null, data)
  })
}

CourseModuleRel.remove = (id, result) => {
  sql.query('DELETE FROM course_module_rel WHERE id = ?', id, (err, res) => {
    if (err) {
      sendError('CourseModuleRel.remove', err)
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

CourseModuleRel.removeAll = (result) => {
  sql.query('DELETE FROM course_module_rel', (err, res) => {
    if (err) {
      sendError('CourseModuleRel.removeAll', err)
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = CourseModuleRel
