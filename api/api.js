const express = require("express")
const artistsRouter = require("./artists")
const seriesRouter = require("./series")

const router = express.Router()

router.use("/artists", artistsRouter)
router.use("/series", seriesRouter)

module.exports = router
