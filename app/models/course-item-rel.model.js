const sql = require('./db.js')
const { toWeb, loadModel } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
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
        log.error(err)
        result(err, null)
        return
      }

      result(null, { id: res.insertId, ...payload })
    }
  )
}

CourseItemRel.getAll = (id, result) => {
  const query = `SELECT cir.id, ci.name FROM course_item ci INNER JOIN course_item_rel cir ON cir.item = ci.id WHERE cir.course = ${id} ORDER BY ci.name;`

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

CourseItemRel.getAllAvailable = (id, result) => {
  const query = `SELECT i.id, i.name FROM course_item i WHERE i.id NOT IN (SELECT item FROM course_item_rel WHERE course = ${id}) ORDER BY i.name;`

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

CourseItemRel.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM course_item_rel WHERE item = ?;',
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

      sql.query('DELETE FROM course_item_rel WHERE id = ?', id, (err, res) => {
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

CourseItemRel.removeAll = (result) => {
  sql.query('DELETE FROM course_item_rel', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = CourseItemRel
