const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = app => {
  const user = require("../controllers/user.controller.js")

  const router = require("express").Router()

  // Create a new user
  router.post("/", secure, user.create)

  // Retrieve all user
  router.get("/", secure, user.findAll)

  // Retrieve a single user with id
  router.get("/:id", secure, user.findOne)

  // Update a user with id
  router.put("/:id", secure, user.update)

  // Update a user with id
  router.put("/:id/chgpwd", secure, user.chgPwd)

  // Delete a user with id
  router.delete("/:id", secure, user.delete)

  // Delete all user
  router.delete("/", secure, user.deleteAll)

  // Log in user
  router.post("/login", user.login)

  app.use('/api/user', router)
}
