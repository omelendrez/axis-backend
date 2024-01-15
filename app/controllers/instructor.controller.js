const Instructor = require('../models/instructor.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const instructor = new Instructor({
    training: req.body.training,
    date: req.body.date,
    module: req.body.module,
    instructor: req.body.instructor
  })

  Instructor.create(instructor, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        return res.status(400).send({
          message: 'An Instructor assignment already exists for this course.'
        })
      }
      return res.status(500).send({
        message:
          err.message ||
          'Some error occurred while creating the Instructor assigment.'
      })
    }
    res.send(data)
    next()
  })
}

exports.delete = (req, res, next) => {
  Instructor.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'not_found':
          res.status(404).send({
            message: `Not found Instructor assignment with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message:
              'Could not delete Instructor assignment with id ' + req.params.id
          })
      }
    } else
      res.send({ message: 'Instructor assignment was deleted successfully!' })
    next()
  })
}
