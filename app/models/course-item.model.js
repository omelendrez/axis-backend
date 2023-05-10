const sql = require('./db.js')
const { toWeb, getPaginationFilters } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const CourseItem = function (courseItem) {
  this.name = courseItem.name
}

CourseItem.create = (courseItem, result) => {
  const newCourse = { ...courseItem }
  sql.query(
    `SELECT COUNT(1) records FROM course_item WHERE name='${courseItem.name}'`,
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
      sql.query('INSERT INTO course_item SET ?', newCourse, (err, res) => {
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

CourseItem.findById = (id, result) => {
  sql.query(`SELECT * FROM course_item WHERE id = ${id}`, (err, res) => {
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

CourseItem.getAll = (pagination, result) => {
  const fields = ['c.name']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT c.id, c.name ${filter} ORDER BY c.name ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM course_item c ${filter};`

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

CourseItem.updateById = (id, courseItem, result) => {
  sql.query(
    'UPDATE course_item SET name = ? WHERE id = ?',
    [courseItem.name, id],
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

      result(null, { id, ...toWeb(courseItem) })
    }
  )
}

CourseItem.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM course_item_rel WHERE course_item = ?;',
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

      sql.query('DELETE FROM course_item WHERE id = ?', id, (err, res) => {
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

CourseItem.removeAll = (result) => {
  sql.query('DELETE FROM course_item', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = CourseItem
