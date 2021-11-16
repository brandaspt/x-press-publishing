const cors = require("cors")
const morgan = require("morgan")
const express = require("express")
const errorHandler = require("errorhandler")
const apiRouter = require("./api/api")

const app = express()

const PORT = process.env.PORT || 4000

app.use(cors())
app.use(morgan("dev"))
app.use(express.json())

app.use("/api", apiRouter)

app.use(errorHandler())

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

module.exports = app
