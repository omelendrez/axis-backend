const sql = require('./db.js')
const {
  toWeb,
  getPaginationFilters,
  loadModel
} = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const CourseAssesment = function (payload) {
  loadModel(payload, this)
}

CourseAssesment.create = (assesment, result) => {
  const newAssesment = { ...assesment }
  sql.query(
    `SELECT COUNT(1) records FROM course_assesment WHERE name='${assesment.name}'`,
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
        'INSERT INTO course_assesment SET ?',
        newAssesment,
        (err, res) => {
          if (err) {
            log.error(err)
            result(err, null)
            return
          }

          result(null, { id: res.insertId, ...newAssesment })
        }
      )
    }
  )
}

CourseAssesment.findById = (id, result) => {
  sql.query(`SELECT * FROM course_assesment WHERE id = ${id}`, (err, res) => {
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

CourseAssesment.getAll = (pagination, result) => {
  const fields = ['c.name']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT c.id, c.name FROM course_assesment c ${filter} ORDER BY c.name ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM course_assesment c ${filter};`

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

CourseAssesment.updateById = (id, assesment, result) => {
  sql.query(
    'UPDATE course_assesment SET name = ? WHERE id = ?',
    [assesment.name, id],
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

      result(null, { id, ...toWeb(assesment) })
    }
  )
}

CourseAssesment.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM course_assesment_rel WHERE item = ?;',
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

CourseAssesment.removeAll = (result) => {
  sql.query('DELETE FROM course_item', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = CourseAssesment
