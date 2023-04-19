const auth = require("../middleware/auth");

const secure = auth.validateToken;

module.exports = (app) => {
  const state = require("../controllers/state.controller.js");

  const router = require("express").Router();

  router.post("/", secure, state.create);

  router.get("/", secure, state.findAll);

  router.get("/:id", secure, state.findOne);

  router.put("/:id", secure, state.update);

  router.delete("/:id", secure, state.delete);

  router.delete("/", secure, state.deleteAll);

  app.use("/api/state", router);
};
