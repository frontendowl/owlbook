const USER = require("./config.js");

const sqlite3 = require("sqlite3").verbose();
const dbFile = "./book_status.db";
const sqlUpdate = "UPDATE Convertions SET step = ?, msg = ? WHERE file_id = ?";

const fse = require("fs-extra");

const { Calibre } = require("node-calibre");
const calibre = new Calibre();

const mailer = require("nodemailer");
const transport = mailer.createTransport(USER.mailerSettings);

async function convert(file) {
  try {
    const db = new sqlite3.Database(dbFile);
    let step = 0;
    const updateStatus = msg => {
      step++;
      db.run(sqlUpdate, [step, msg, file.id], err => {
        if (err) {
          return console.error("SQL update error:\n", err);
        }
      });
    };

    const epubPath = file.tempFilePath + ".epub";
    await fse.rename(file.tempFilePath, epubPath);
    updateStatus("CONVERTING...");

    const bookName = file.name.replace(/(epub)$/i, "mobi");
    const mobiPath = await calibre.ebookConvert(epubPath, "mobi");
    updateStatus("SENDING");
    fse.unlink(epubPath);

    const msg = {
      from: USER.from,
      to: USER.to,
      subject: bookName,
      text: `Your book '${bookName}' is converted.\nPleasant reading!`,
      attachments: [
        {
          content: fse.createReadStream(mobiPath),
          filename: bookName
        }
      ]
    };
    const mailInfo = await transport.sendMail(msg);
    updateStatus("done");
    fse.unlink(mobiPath);
  } catch (err) {
    console.error("\nCONVERTION ERROR: ", err);
  }
}

module.exports = {
  convert: convert
};
