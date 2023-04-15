const express = require("express")
const cors = require("cors")
const { log } = require("./helpers/log.js")
require('dotenv').config()

const app = express()

app.use(cors())

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Axis." })
})

require("./routes/user.routes.js")(app)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  log.info(`Server is running on port ${PORT}.`)
})
