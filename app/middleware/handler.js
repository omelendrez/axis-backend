function resp(req, res) {
  res.status(200).json(res.locals.data)
}

module.exports = { resp }
