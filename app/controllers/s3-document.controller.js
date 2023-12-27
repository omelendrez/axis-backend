const S3Document = require('../models/s3-document.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const data = new S3Document({
    file: req.body.file
  })

  S3Document.create(data, (err, data) => {
    if (err) {
      res.send({
        message: 'Error updating Training with id ' + req.params.file
      })
    } else {
      res.send(data)
      next()
    }
  })
}

exports.update = (req, res, next) => {
  S3Document.update(req.body, (err, data) => {
    if (err) {
      res.status(500).send({
        message: `Error saving reason for training with id ${req.params.id}`
      })
    } else {
      res.send(data)
      next()
    }
  })
}

exports.exists = (req, res, next) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  S3Document.exists(url, (err, data) => {
    if (err) {
      res.status(500).send({
        message: `Error checking document existence ${req.params.id}`
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.getAll = (req, res, next) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  S3Document.getAll(url, (err, data) => {
    if (err) {
      res.status(500).send({
        message: 'Error getting list of S3 documents'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.delete = (req, res, next) => {
  S3Document.delete(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message: `Error deleting s3 records with id ${req.params.id}`
      })
    } else {
      res.send(data)
      next()
    }
  })
}
