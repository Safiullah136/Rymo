const bcrypt = require("bcrypt");

const users = [
  {
    fullname: "Admin User",
    email: "admin@test.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: true,
  },
  {
    fullname: "Nabeel",
    email: "nabeel@test.com",
    password: bcrypt.hashSync("123456", 10),
  },
  {
    fullname: "Nabeela",
    email: "nabeela@test.com",
    password: bcrypt.hashSync("123456", 10),
  },
];

module.exports = users;
