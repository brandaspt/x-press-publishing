const express = require("express")
const sqlite3 = require("sqlite3")

const router = express.Router({ mergeParams: true })

const validateBody = (req, res, next) => {
    const { name, issueNumber, publicationDate, artistId } = req.body.issue
    if (!name || !issueNumber || !publicationDate || !artistId) return res.sendStatus(400)
    db.get(`SELECT * FROM Artist WHERE id = ${artistId}`, (err, artist) => {
        if (err) next(err)
        else {
            if (!artist) return res.sendStatus(400)
            else next()
        }
    })
}

const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite", err => {
    if (err) {
        console.log(err)
    } else {
        console.log("connected to database")
    }
})

router.param("issueId", (req, res, next, issueId) => {
    db.get(`SELECT * FROM Issue WHERE id = ${issueId}`, (err, issue) => {
        if (err) {
            next(err)
        } else if (issue) {
            req.issue = issue
            next()
        } else {
            res.sendStatus(404)
        }
    })
})

router.get("/", (req, res, next) => {
    db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, (err, issues) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({ issues })
        }
    })
})

router.get("/:issueId", (req, res, next) => {
    res.status(200).send({ issue: req.issue })
})

router.post("/", validateBody, (req, res, next) => {
    const { name, issueNumber, publicationDate, artistId } = req.body.issue
    const seriesId = req.params.seriesId
    db.run(
        `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)
        VALUES ("${name}", ${issueNumber}, "${publicationDate}", ${artistId}, ${seriesId})`,
        function (err) {
            if (err) {
                next(err)
            } else {
                db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (err, issue) => {
                    if (err) next(err)
                    else {
                        res.status(201).json({ issue })
                    }
                })
            }
        }
    )
})

router.put("/:issueId", validateBody, (req, res, next) => {
    const { name, issueNumber, publicationDate, artistId } = req.body.issue
    const seriesId = req.params.seriesId
    const issueId = req.params.issueId
    console.log("here")
    db.run(
        `UPDATE Issue SET name = "${name}", issue_number = ${issueNumber}, publication_date = "${publicationDate}", artist_id = ${artistId}, series_id = ${seriesId} WHERE id = ${issueId}`,
        err => {
            if (err) {
                next(err)
            } else {
                db.get(`SELECT * FROM Issue WHERE id = ${issueId}`, (err, issue) => {
                    if (err) next(err)
                    else {
                        res.status(200).json({ issue })
                    }
                })
            }
        }
    )
})

router.delete("/:issueId", (req, res, next) => {
    db.run(`DELETE FROM Issue WHERE id = ${req.params.issueId}`, err => {
        if (err) {
            next(err)
        } else {
            res.sendStatus(204)
        }
    })
})

module.exports = router
