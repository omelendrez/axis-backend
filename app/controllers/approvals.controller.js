const Approvals = require('../models/approvals.model')

exports.finance = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const finance = new Approvals({
    finance_status: req.body.finance_status
  })

  Approvals.finance(req.params.id, finance, req.decoded, (err, data) => {
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
    }
  })
}
