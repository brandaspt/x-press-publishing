const sqlite3 = require("sqlite3")

const db = new sqlite3.Database("./database.sqlite", err => {
    if (err) {
        console.log(err)
    }
    console.log("Connected to database")
})

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS Artist")
    db.run("DROP TABLE IF EXISTS Series")
    db.run("DROP TABLE IF EXISTS Issue")
    db.run(
        `CREATE TABLE IF NOT EXISTS Artist (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    biography TEXT NOT NULL,
    is_currently_employed INTEGER DEFAULT 1
  );`,
        err => {
            if (err) {
                console.log(err)
            } else {
                console.log("Artist table created")
            }
        }
    )
    db.run(
        `CREATE TABLE IF NOT EXISTS Series (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL);`,
        err => {
            if (err) {
                console.log(err)
            } else {
                console.log("Series table created")
            }
        }
    )
    db.run(
        `CREATE TABLE IF NOT EXISTS Issue (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        issue_number INTEGER NOT NULL,
        publication_date TEXT NOT NULL,
        artist_id INTEGER NOT NULL,
        series_id INTEGER NOT NULL,
        FOREIGN KEY(artist_id) REFERENCES Artist(id),
        FOREIGN KEY(series_id) REFERENCES Series(id));`,
        err => {
            if (err) {
                console.log(err)
            } else {
                console.log("Issue table created")
            }
        }
    )
})
