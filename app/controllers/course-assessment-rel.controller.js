const CourseAssessmentRel = require('../models/course-assessment-rel.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  CourseAssessmentRel.create(req.body, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message: 'Assessment already exists in database for this course.'
        })
      } else {
        res.status(500).send({
          message:
            err.message || 'Some error occurred while adding the assessment.'
        })
      }
    } else {
      res.send(data)
    }
  })
}

exports.findAll = (req, res) => {
  CourseAssessmentRel.getAll(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving assessments.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findAllAvailable = (req, res) => {
  CourseAssessmentRel.getAllAvailable(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving assessments.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.delete = (req, res) => {
  CourseAssessmentRel.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(400).send({
            message:
              'Assessment has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found assessment with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete assessment with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Assessment was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  CourseAssessmentRel.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all assessments.'
      })
    } else res.send({ message: 'All assessments were deleted successfully!' })
  })
}
