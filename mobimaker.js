const USER = require("./config.js");

const fse = require("fs-extra");

const { Calibre } = require("node-calibre");
const calibre = new Calibre();

const mailer = require("nodemailer");
const transport = mailer.createTransport(USER.mailerSettings);

async function convert(file) {
  try {

    const status = await fse.readJson(file.statusPath);
    const updateStatus = msg => {
      status.step++;
      status.msg = msg;
      fse.writeJson(file.statusPath, status, { spaces: 2 });
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
