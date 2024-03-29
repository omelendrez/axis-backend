const CourseItem = require('../models/course-item.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const courseItem = new CourseItem({
    name: req.body.name
  })

  CourseItem.create(courseItem, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message: 'Course-item with same name already exists in database.'
        })
      } else {
        res.status(500).send({
          message:
            err.message || 'Some error occurred while creating the Course-item.'
        })
      }
    } else {
      res.send(data)
      next()
    }
  })
}

exports.findAll = (req, res, next) => {
  const pagination = req.query

  CourseItem.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving CourseItems.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findAllView = (req, res, next) => {
  CourseItem.getAllView(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving CourseItems.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findOne = (req, res, next) => {
  CourseItem.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Course-item with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Course-item with id ' + req.params.id
        })
      }
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.update = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  CourseItem.updateById(
    req.params.id,
    new CourseItem(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === 'not_found') {
          res.status(404).send({
            message: `Not found Course-item with id ${req.params.id}.`
          })
        } else {
          res.status(500).send({
            message: 'Error updating Course-item with id ' + req.params.id
          })
        }
      } else {
        res.send(data)
        next()
      }
    }
  )
}

exports.delete = (req, res, next) => {
  CourseItem.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(400).send({
            message:
              'Course-item has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Course-item with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Course-item with id ' + req.params.id
          })
      }
    } else {
      res.send({ message: 'Course-item was deleted successfully!' })
      next()
    }
  })
}

// exports.deleteAll = (req, res) => {
//   CourseItem.removeAll((err) => {
//     if (err) {
//       res.status(500).send({
//         message:
//           err.message || 'Some error occurred while removing all CourseItems.'
//       })
//     } else {
//       res.send({ message: 'All CourseItems were deleted successfully!' })
//     }
//   })
// }
