const express = require("express");
const fileUpload = require("express-fileupload");

const path = require("path");
const fse = require("fs-extra");

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
  const fileId = path.basename(file.tempFilePath);
  const statusPath = path.join(__dirname, "stat/", fileId + ".json");
  file.statusPath = statusPath;

  const curStatus = { step: 0, msg: "uploading" };
  fse
    .writeJson(statusPath, curStatus, { spaces: 2 })
    .then(() => {
      convert(file);
      res.json({ id: fileId });
    })
    .catch(err => {
      console.error("\nSERVER: ERROR with creating JSON\n", err);
      res.send("OOPS, something went wrong.\nPls, try again later");
    });
});

app.get("/status/:id", (req, res) => {
  const id = req.params.id;
  const statPath = path.join(__dirname, "/stat/", id + ".json");

  fse
    .readJson(statPath)
    .then(status => res.json(status))
    .catch(err => {
      console.error("\nSERVER: ERROR with status reading of", id, "\n", err);
      res.json({ error: true });
    });
});

app.listen(port, () => {
  console.log("==================================");
  console.log(`Server ON.\nApp listening on port ${port}`);
  console.log("==================================");
});
