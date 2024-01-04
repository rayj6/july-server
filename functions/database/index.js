const colors = require("colors");
const connection = require("./database.config");
const bodyParser = require("body-parser");

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

    Login(app) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        app.post("/authentication/login", (req, res) => {
            const { email, password } = req.body;

            // Check if email or password is missing
            if (!email || !password) {
                return res.status(400).json({ message: "email and password are required" });
            }

            // Query the database to check if the user exists
            connection.query("SELECT * FROM users WHERE account = ? AND password = ?", [email, password], (err, result) => {
                if (err) {
                    console.error("Error logging in:", err);
                    res.status(500).json({ message: "Internal server error" });
                } else {
                    if (result.length > 0) {
                        // res.send("Login successful");
                        const data = result;
                        data.forEach((element) => {
                            res.send(element.userid);
                        });
                    } else {
                        res.status(401).json({ message: "Invalid email or password" });
                        res.send("Invalid email or password");
                    }
                }
            });
        });
    }

    CheckUser(app) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        app.post("/authentication/checkuser", (req, res) => {
            const { userid } = req.body;

            // Query the database to check if the user exists
            connection.query("SELECT * FROM users WHERE userid = ?", [userid], (err, result) => {
                if (err) {
                    console.error("Error logging in:", err);
                    res.status(500).json({ message: "Internal server error" });
                } else {
                    if (result.length > 0) {
                        res.send("User already registered");
                    } else {
                        res.status(401).json({ message: "Invalid email or password" });
                        res.send("Invalid email or password");
                    }
                }
            });
        });
    }

    Register(app, userId) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        app.post("/authentication/register", (req, res) => {
            const { email, password } = req.body;

            // Check if email or password is missing
            if (!email || !password) {
                return res.status(400).json({ message: "email and password are required" });
            }

            // Insert user into the database
            connection.query("INSERT INTO users (userid, account, password) VALUES (?, ?, ?)", [userId, email, password], (err, result) => {
                if (err) {
                    console.error("Error registering user:", err);
                    res.send("Internal server error");
                } else {
                    // res.send("User registered successfully");
                    res.send(userId);
                }
            });
        });
    }
}

module.exports = Database;
