const sql = require('./db')
const { toWeb, loadModel } = require('../helpers/utils')
const { log } = require('../helpers/log')
const { sendError } = require('../errors/error-monitoring')
// constructor
const CourseItemRel = function (payload) {
  loadModel(payload, this)
}

CourseItemRel.create = (payload, result) => {
  sql.query(
    'INSERT INTO course_item_rel (course,item) VALUES ?',
    payload,
    (err, res) => {
      if (err) {
        sendError('CourseItemRel.create', err)
        log.error(err)
        result(err, null)
        return
      }

      result(null, { id: res.insertId, ...payload })
    }
  )
}

CourseItemRel.getAll = (id, result) => {
  const query =
    'SELECT cir.id, ci.name FROM course_item ci INNER JOIN course_item_rel cir ON cir.item = ci.id WHERE cir.course = ? ORDER BY ci.name;'

  sql.query(query, id, (err, res) => {
    if (err) {
      sendError('CourseItemRel.getAll', err)
      log.error(err)
      result(err, null)
      return
    }

    const data = res.map((data) => toWeb(data))

    result(null, data)
  })
}

CourseItemRel.getAllAvailable = (id, result) => {
  const query =
    'SELECT i.id, i.name FROM course_item i WHERE i.id NOT IN (SELECT item FROM course_item_rel WHERE course = ?) ORDER BY i.name;'

  sql.query(query, id, (err, res) => {
    if (err) {
      sendError('CourseItemRel.getAllAvailable', err)
      log.error(err)
      result(err, null)
      return
    }

    const data = res.map((data) => toWeb(data))

    result(null, data)
  })
}

CourseItemRel.remove = (id, result) => {
  sql.query('DELETE FROM course_item_rel WHERE id = ?', id, (err, res) => {
    if (err) {
      sendError('CourseItemRel.remove', err)
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

CourseItemRel.removeAll = (result) => {
  sql.query('DELETE FROM course_item_rel', (err, res) => {
    if (err) {
      sendError('CourseItemRel.removeAll', err)
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = CourseItemRel
