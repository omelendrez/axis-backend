const CourseAssesmentRel = require('../models/course-assesment-rel.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  CourseAssesmentRel.create(req.body, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message: 'Assesment already exists in database for this course.'
        })
      } else {
        res.status(500).send({
          message:
            err.message || 'Some error occurred while adding the assesment.'
        })
      }
    } else {
      res.send(data)
    }
  })
}

exports.findAll = (req, res) => {
  CourseAssesmentRel.getAll(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving assesments.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findAllAvailable = (req, res) => {
  CourseAssesmentRel.getAllAvailable(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving assesments.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.delete = (req, res) => {
  CourseAssesmentRel.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(400).send({
            message: 'Assesment has transactions and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found assesment with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete assesment with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Assesment was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  CourseAssesmentRel.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all assesments.'
      })
    } else res.send({ message: 'All assesments were deleted successfully!' })
  })
}
