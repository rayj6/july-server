const mysql = require("mysql");

const connection = mysql.createConnection({
    // host: "localhost",
    // user: "root",
    // password: "",
    // database: "july",
    // port: 3307,
    host: "0.tcp.ap.ngrok.io",
    user: "root",
    password: "",
    database: "july",
    port: 11664,
});

module.exports = connection;
