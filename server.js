const express = require("express");
const fileUpload = require("express-fileupload");

const sqlite3 = require("sqlite3").verbose();
const dbFile = "./book_status.db";
const sqlNewConvertion =
  "INSERT INTO Convertions (file_id, step, msg) VALUES(?, ?, ?)";
const sqlBookStatus = "SELECT * FROM Convertions WHERE file_id = ?";

const path = require("path");

const mobimaker = require("./mobimaker.js");
const convert = mobimaker.convert;

const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "public/", "temp/")
  })
);

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.post("/tomobi", (req, res) => {
  const file = req.files.epubFile;
  file.id = path.basename(file.tempFilePath);

  const db = new sqlite3.Database(dbFile);

  db.run(sqlNewConvertion, [file.id, 0, "uploading"], err => {
    if (err) {
      console.error("\nS: ERROR with adding book to the Database\n", err);
      res.send("OOPS, something went wrong.\nPls, try again later");
    }
    convert(file);

    res.json({ id: file.id });
  });

  db.close();
});

app.get("/status/:id", (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbFile);
  db.get(sqlBookStatus, id, (err, data) => {
    if (err) {
      console.error(err.message);
      res.json({ error: true });
    } else if (data) {
      res.json(data);
    } else {
      console.error(`\nS: file id ${id} not found`);
      res.send("Can't read status: book id not found");
    }
  });
  db.close();
});

app.listen(port, () => {
  console.log("==================================");
  console.log(`Server ON.\nApp listening on port ${port}`);
  console.log("==================================");
});
