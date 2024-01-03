const colors = require("colors");
const connection = require("./database.config");

class Database {
    CheckConnection() {
        connection.connect((err) => {
            if (err) throw err;
            console.log("Database status: " + colors.green("Connected"));
        });
    }
}

module.exports = Database;
