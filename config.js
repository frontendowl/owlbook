const EBOOK_EMAIL = "YOUR EBOOK EMAIL ADDRESS";

const SENDER_EMAIL = "YOUR GMAIL ADDRESS FOR SENDING FILES";
const SENDER_PASSWORD = "YOUR EMAIL PASSWORD"

const SENDER_NAME = "NAME";

const SENDER_MAIL_SETTINGS = {
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASSWORD
  }
};

module.exports = {
  to: EBOOK_EMAIL,
  from: {
    address: SENDER_EMAIL,
    name: SENDER_NAME
  },
  mailerSettings: SENDER_MAIL_SETTINGS
};
