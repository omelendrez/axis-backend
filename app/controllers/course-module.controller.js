const CourseModule = require('../models/course-module.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const courseModule = new CourseModule({
    name: req.body.name
  })

  CourseModule.create(courseModule, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message: 'Course-module with same name already exists in database.'
        })
      } else {
        res.status(500).send({
          message:
            err.message ||
            'Some error occurred while creating the Course-module.'
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

  CourseModule.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Course-Modules.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findAllView = (req, res, next) => {
  CourseModule.getAllView(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Course-Modules.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findOne = (req, res, next) => {
  CourseModule.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Course-module with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Course-module with id ' + req.params.id
        })
      }
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findByCourse = (req, res, next) => {
  CourseModule.findByCourse(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Course-module for course with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message:
            'Error retrieving Course-module for course with course id ' +
            req.params.id
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

  CourseModule.updateById(
    req.params.id,
    new CourseModule(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === 'not_found') {
          res.status(404).send({
            message: `Not found Course-module with id ${req.params.id}.`
          })
        } else {
          res.status(500).send({
            message: 'Error updating Course-module with id ' + req.params.id
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
  CourseModule.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(400).send({
            message:
              'Course-module has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Course-module with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Course-module with id ' + req.params.id
          })
      }
    } else {
      res.send({ message: 'Course-module was deleted successfully!' })
      next()
    }
  })
}

exports.deleteAll = (req, res, next) => {
  CourseModule.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message ||
          'Some error occurred while removing all Course-Modules.'
      })
    } else
      res.send({ message: 'All Course-Modules were deleted successfully!' })
    next()
  })
}
