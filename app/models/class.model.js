const sql = require('./db.js')
const {
  toWeb,
  getPaginationFilters,
  loadModel
} = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const Class = function (payload) {
  loadModel(payload, this)
}

Class.create = (classroom, result) => {
  const payload = {
    ...classroom,
    learners: classroom.learners || 0
  }

  sql.query(
    'SELECT COUNT(1) records FROM class WHERE course = ? AND start = ?',
    [payload.course, payload.start],
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

      sql.query('INSERT INTO class SET ?', payload, (err, res) => {
        if (err) {
          log.error(err)
          result(err, null)
          return
        }

        result(null, { id: res.insertId, ...payload })
      })
    }
  )
}

Class.findById = (id, result) => {
  sql.query(
    `SELECT id, course, DATE_FORMAT(start, '%Y-%m-%d') start, learners FROM class WHERE id = ${id}`,
    (err, res) => {
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
    }
  )
}

Class.findByIdView = (id, result) => {
  sql.query(
    'SELECT co.name course, DATE_FORMAT(start, "%d/%m/%Y") start FROM class c INNER JOIN course co ON co.id = c.course WHERE c.id = ?;',
    id,
    (err, res) => {
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
    }
  )
}

Class.getAll = (pagination, result) => {
  const fields = ['co.name', 'DATE_FORMAT(c.start, "%d/%m/%Y")']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT c.id, co.name course_name, DATE_FORMAT(c.start, '%d/%m/%Y') start, c.learners FROM class c INNER JOIN course co ON c.course = co.id ${filter} ORDER BY c.id DESC ${limits};`

  const queryCount = `SELECT COUNT(1) records FROM class c INNER JOIN course co ON c.course = co.id ${filter};`

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

Class.updateById = (id, classroom, result) => {
  sql.query(
    'UPDATE class SET course = ?, start = ?, learners = ? WHERE id = ?',
    [classroom.course, classroom.start, classroom.learners, id],
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

      result(null, { id, ...toWeb(classroom) })
    }
  )
}

Class.remove = (id, result) => {
  sql.query(
    'SELECT learners records FROM class WHERE id = ?',
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

      sql.query('DELETE FROM class WHERE id = ?', id, (err, res) => {
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

Class.removeAll = (result) => {
  sql.query('DELETE FROM class', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Class
