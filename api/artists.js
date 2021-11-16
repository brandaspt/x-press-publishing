const express = require("express")
const sqlite3 = require("sqlite3")

const router = express.Router()

const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite", err => {
    if (err) {
        console.log(err)
    } else {
        console.log("connected to database")
    }
})

const validateBody = (req, res, next) => {
    const { name, dateOfBirth, biography } = req.body.artist
    if (!name || !dateOfBirth || !biography) return res.sendStatus(400)
    req.body.artist.isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1
    next()
}

router.param("artistId", (req, res, next, artistId) => {
    db.get(`SELECT * FROM Artist WHERE Artist.id = ${artistId}`, (err, artist) => {
        if (err) {
            next(err)
        } else if (artist) {
            req.artist = artist
            next()
        } else {
            res.sendStatus(404)
        }
    })
})

router.get("/", (req, res, next) => {
    db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (err, artists) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({ artists })
        }
    })
})

router.get("/:artistId", (req, res, next) => {
    res.status(200).json({ artist: req.artist })
})

router.post("/", validateBody, (req, res, next) => {
    const { name, dateOfBirth, biography, isCurrentlyEmployed } = req.body.artist
    db.run(
        `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
  VALUES ("${name}", "${dateOfBirth}", "${biography}", ${isCurrentlyEmployed});`,
        function (err) {
            if (err) next(err)
            else {
                db.get(`SELECT * FROM Artist WHERE id=${this.lastID}`, (err, artist) => {
                    if (err) next(err)
                    else res.status(201).json({ artist })
                })
            }
        }
    )
})

router.put("/:artistId", validateBody, (req, res, next) => {
    const { name, dateOfBirth, biography, isCurrentlyEmployed } = req.body.artist
    db.run(
        `UPDATE Artist SET name="${name}",
          date_of_birth="${dateOfBirth}",
          biography="${biography}",
          is_currently_employed=${isCurrentlyEmployed}
        WHERE id=${req.params.artistId}`,
        err => {
            if (err) next(err)
            else {
                db.get(`SELECT * FROM Artist WHERE id=${req.params.artistId}`, (err, artist) => {
                    if (err) next(err)
                    else res.json({ artist })
                })
            }
        }
    )
})

router.delete("/:artistId", (req, res, next) => {
    db.run(`UPDATE Artist SET is_currently_employed=0 WHERE id=${req.params.artistId}`, err => {
        if (err) next(err)
        else {
            db.get(`SELECT * FROM Artist WHERE id=${req.params.artistId}`, (err, artist) => {
                if (err) next(err)
                else res.json({ artist })
            })
        }
    })
})

module.exports = router
