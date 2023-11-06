const CourseModuleRel = require('../models/course-module-rel.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  CourseModuleRel.create(req.body, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message: 'Module already exists in database for this course.'
        })
      } else {
        res.status(500).send({
          message: err.message || 'Some error occurred while adding the module.'
        })
      }
    } else {
      res.send(data)
    }
  })
}

exports.findAll = (req, res) => {
  CourseModuleRel.getAll(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving modules.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findAllAvailable = (req, res) => {
  CourseModuleRel.getAllAvailable(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving modules.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.delete = (req, res) => {
  CourseModuleRel.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(400).send({
            message:
              'Module has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found module with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete module with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Module was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  CourseModuleRel.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all modules.'
      })
    } else res.send({ message: 'All modules were deleted successfully!' })
  })
}
