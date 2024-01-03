const colors = require("colors");
const connection = require("./database.config");

class Database {
    CheckConnection() {
        connection.connect((err) => {
            if (err) throw err;
            console.log("Database status: " + colors.green("Connected"));
        });
    }

    BotDatabase(app) {
        app.get("/botHistory", (req, res) => {
            connection.query("SELECT * FROM History", (err, results) => {
                if (err) {
                    console.error("Error executing MySQL query: " + err.stack);
                    res.status(500).send("Error fetching data from database");
                    return;
                }
                res.json(results);
            });
        });

        app.get("/botUsers", (req, res) => {
            connection.query("SELECT * FROM users", (err, results) => {
                if (err) {
                    console.error("Error executing MySQL query: " + err.stack);
                    res.status(500).send("Error fetching data from database");
                    return;
                }
                res.json(results);
            });
        });
    }
}

module.exports = Database;
