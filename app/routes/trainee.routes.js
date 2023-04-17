const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = app => {
  const trainee = require("../controllers/trainee.controller.js")

  const router = require("express").Router()

  router.post("/", secure, trainee.create)

  router.get("/", secure, trainee.findAll)

  router.get("/:id", secure, trainee.findOne)

  router.put("/:id", secure, trainee.update)

  router.delete("/:id", secure, trainee.delete)

  router.delete("/", secure, trainee.deleteAll)

  app.use('/api/trainee', router)
}
