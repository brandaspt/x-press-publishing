const express = require("express")
const sqlite3 = require("sqlite3")
const issuesRouter = require("./issues")

const router = express.Router()

const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite", err => {
    if (err) {
        console.log(err)
    } else {
        console.log("connected to database")
    }
})

router.param("seriesId", (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE id = ${seriesId}`, (err, row) => {
        if (err) {
            next(err)
        } else if (row) {
            req.series = row
            next()
        } else {
            res.sendStatus(404)
        }
    })
})

router.use("/:seriesId/issues", issuesRouter)

router.get("/", (req, res, next) => {
    db.all("SELECT * FROM Series", (err, series) => {
        if (err) {
            next(err)
        } else {
            res.status(200).send({ series })
        }
    })
})

router.get("/:seriesId", (req, res, next) => {
    res.status(200).send({ series: req.series })
})

router.post("/", (req, res, next) => {
    const { name, description } = req.body.series
    if (!name || !description) {
        return res.sendStatus(400)
    }
    db.run(
        `INSERT INTO Series (name, description) VALUES ("${name}", "${description}")`,
        function (err) {
            if (err) {
                next(err)
            } else {
                db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (err, series) => {
                    res.status(201).send({ series })
                })
            }
        }
    )
})

// PUT /series/:seriesId
router.put("/:seriesId", (req, res, next) => {
    const { name, description } = req.body.series
    if (!name || !description) {
        return res.sendStatus(400)
    }
    db.run(
        `UPDATE Series SET name = "${name}", description = "${description}" WHERE id = ${req.params.seriesId}`,
        function (err) {
            if (err) {
                next(err)
            } else {
                db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`, (err, series) => {
                    res.status(200).send({ series })
                })
            }
        }
    )
})

router.delete("/:seriesId", (req, res, next) => {
    db.get(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, (err, issue) => {
        if (err) {
            next(err)
        } else if (issue) {
            res.sendStatus(400)
        } else {
            db.run(`DELETE FROM Series WHERE id = ${req.params.seriesId}`, err => {
                if (err) {
                    next(err)
                } else {
                    res.sendStatus(204)
                }
            })
        }
    })
})

module.exports = router
