const Approval = require('../models/approval.model')

exports.approve = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const data = new Approval({
    approved: req.body.approved,
    updates: req.body.updates,
    reason: req.body.reason,
    hasId: req.body.hasId,
    status: req.body.status
  })

  Approval.approve(
    parseInt(req.params.id, 10),
    parseInt(req.params.status, 10),
    data,
    req.decoded,
    (err, data) => {
      if (err) {
        if (err.kind === 'not_found') {
          res.status(404).send({
            message: `Not found Training with id ${req.params.id}.`
          })
        } else {
          res.status(500).send({
            message: 'Error updating Training with id ' + req.params.id
          })
        }
      } else {
        res.send(data)
        next()
      }
    }
  )
}

exports.approveMultiple = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  Approval.approveMultiple(req.body, (err, data) => {
    if (err) {
      res.status(500).send({
        message: 'Error processing approval Training records'
      })
    } else {
      res.send(data)
      next()
    }
  })
}

exports.rejectMultiple = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  Approval.rejectMultiple(req.body, (err, data) => {
    if (err) {
      res.status(500).send({
        message: 'Error processing approval Training records'
      })
    } else {
      res.send(data)
      next()
    }
  })
}

exports.undo = (req, res, next) => {
  Approval.undo(parseInt(req.params.id, 10), (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'not_found':
          res.status(404).send({
            message: `Not found Training with id ${req.params.id}.`
          })
          break
        case 'cannot_undo':
          res.status(400).send({
            message: `There is nothing to undo for training with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: `Error undoing Training with id ${req.params.id}`
          })
      }
    } else {
      res.send(data)
      next()
    }
  })
}

exports.saveReason = (req, res, next) => {
  Approval.saveReason(parseInt(req.params.id, 10), req.body, (err, data) => {
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
