const sql = require('./db')
const { toWeb, getPaginationFilters, loadModel } = require('../helpers/utils')
const { sendError } = require('../errors/error-monitoring')
// constructor
const CourseModule = function (payload) {
  loadModel(payload, this)
}

CourseModule.create = (courseModule, result) => {
  const newCourse = { ...courseModule }
  sql.query(
    'SELECT COUNT(1) records FROM course_module WHERE name=?',
    [courseModule.name],
    (err, res) => {
      if (err) {
        sendError('CourseModule.create', err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'already_exists' }, null)
        return
      }
      sql.query('INSERT INTO course_module SET ?', newCourse, (err, res) => {
        if (err) {
          sendError('CourseModule.create', err)
          result(err, null)
          return
        }

        result(null, { id: res.insertId, ...newCourse })
      })
    }
  )
}

CourseModule.findById = (id, result) => {
  sql.query('SELECT * FROM course_module WHERE id = ?', id, (err, res) => {
    if (err) {
      sendError('CourseModule.findById', err)
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

CourseModule.findByCourse = (id, result) => {
  sql.query(
    'SELECT cm.id, cm.name FROM course_module cm INNER JOIN course_module_rel cmr ON cmr.module = cm.id WHERE cmr.course = ? ORDER BY 2;',
    [id],
    (err, res) => {
      if (err) {
        sendError('CourseModule.findByCourse', err)
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

CourseModule.getAll = (pagination, result) => {
  const fields = ['c.name']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT c.id, c.name FROM course_module c ${filter} ORDER BY c.name ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM course_module c ${filter};`

  const query = `${queryData}${queryCount}`

  sql.query(query, (err, res) => {
    if (err) {
      sendError('CourseModule.getAll', err)
      result(err, null)
      return
    }

    const records = res[0]
    const count = res[1][0].records

    const rows = records.map((data) => toWeb(data))

    result(null, { rows, count })
  })
}

CourseModule.updateById = (id, courseModule, result) => {
  sql.query(
    'UPDATE course_module SET name = ? WHERE id = ?',
    [courseModule.name, id],
    (err, res) => {
      if (err) {
        sendError('CourseModule.updateById', err)
        result(err, null)
        return
      }

      if (res.affectedRows === 0) {
        result({ kind: 'not_found' }, null)
        return
      }

      result(null, { id, ...toWeb(courseModule) })
    }
  )
}

CourseModule.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM course_module_rel WHERE module = ?;',
    id,
    (err, res) => {
      if (err) {
        sendError('CourseModule.remove', err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'cannot_delete' }, null)
        return
      }

      sql.query('DELETE FROM course_module WHERE id = ?', id, (err, res) => {
        if (err) {
          sendError('CourseModule.remove', err)
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

// CourseModule.removeAll = (result) => {
//   sql.query('DELETE FROM course_module', (err, res) => {
//     if (err) {
//       sendError('CourseModule.removeAll', err)
//       result(err, null)
//       return
//     }

//     result(null, res.affectedRows)
//   })
// }

module.exports = CourseModule
