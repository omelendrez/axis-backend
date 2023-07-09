const sql = require('./db.js')
const {
  toWeb,
  getPaginationFilters,
  loadModel
} = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const Classroom = function (payload) {
  loadModel(payload, this)
}

Classroom.create = (classroom, result) => {
  const payload = {
    ...classroom,
    learners: classroom.learners || 0
  }

  sql.query(
    'SELECT COUNT(1) records FROM classroom WHERE course = ? AND start = ?',
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

      sql.query('INSERT INTO classroom SET ?', payload, (err, res) => {
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

Classroom.findById = (id, result) => {
  sql.query(
    'SELECT id, course, DATE_FORMAT(start, "%Y-%m-%d") start, learners FROM classroom WHERE id = ?;',
    [id],
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

Classroom.findByIdView = (id, result) => {
  sql.query(
    'SELECT co.name course, DATE_FORMAT(start, "%d/%m/%Y") start FROM classroom c INNER JOIN course co ON co.id = c.course WHERE c.id = ?;',
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

Classroom.getAll = (pagination, result) => {
  const fields = ['co.name', 'DATE_FORMAT(c.start, "%d/%m/%Y")']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT c.id, co.name course_name, DATE_FORMAT(c.start, '%d/%m/%Y') start, c.learners FROM classroom c INNER JOIN course co ON c.course = co.id ${filter} ORDER BY c.id DESC ${limits};`

  const queryCount = `SELECT COUNT(1) records FROM classroom c INNER JOIN course co ON c.course = co.id ${filter};`

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

Classroom.updateById = (id, classroom, result) => {
  sql.query(
    'UPDATE classroom SET course = ?, start = ?, learners = ? WHERE id = ?',
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

Classroom.remove = (id, result) => {
  sql.query(
    'SELECT learners records FROM classroom WHERE id = ?',
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

      sql.query('DELETE FROM classroom WHERE id = ?', id, (err, res) => {
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

Classroom.removeAll = (result) => {
  sql.query('DELETE FROM classroom', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Classroom
