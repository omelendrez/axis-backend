const CourseItemRel = require('../models/course-item-rel.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  CourseItemRel.create(req.body, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message: 'Item already exists in database for this course.'
        })
      } else {
        res.status(500).send({
          message: err.message || 'Some error occurred while adding the item.'
        })
      }
    } else {
      res.send(data)
    }
  })
}

exports.findAll = (req, res) => {
  CourseItemRel.getAll(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving items.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findAllAvailable = (req, res) => {
  CourseItemRel.getAllAvailable(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving items.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.delete = (req, res) => {
  CourseItemRel.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(400).send({
            message:
              'Item has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found item with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete item with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Item was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  CourseItemRel.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while removing all items.'
      })
    } else res.send({ message: 'All items were deleted successfully!' })
  })
}
