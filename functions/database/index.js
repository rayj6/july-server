const colors = require("colors");
const connection = require("./database.config");
const bodyParser = require("body-parser");
const SideFunctions = require("../sideFunctions/index");
const nodemailer = require("nodemailer");

const _SideFunction = new SideFunctions();

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

    SendChatData(userid, chatQuestion, chatAnswer) {
        connection.query(
            "INSERT INTO ChatHistory (userid, chatQuestion, chatAnswer, date) VALUES (?, ?, ?, ?)",
            [userid, chatQuestion, chatAnswer, _SideFunction.GetCurrentDateTime()],
            (err, result) => {
                if (err) {
                    console.error("Error registering user:", err);
                    console.log("Internal server error");
                }
            }
        );
    }

    SendHealthData(userid, chatQuestion, chatAnswer) {
        connection.query(
            "INSERT INTO HealthHistory (userid, chatQuestion, chatAnswer, date) VALUES (?, ?, ?, ?)",
            [userid, chatQuestion, chatAnswer, _SideFunction.GetCurrentDateTime()],
            (err, result) => {
                if (err) {
                    console.error("Error registering user:", err);
                    console.log("Internal server error");
                }
            }
        );
    }

    SendNoteData(userid, chatQuestion, chatAnswer) {
        connection.query(
            "INSERT INTO NoteHistory (userid, chatQuestion, chatAnswer, date) VALUES (?, ?, ?, ?)",
            [userid, chatQuestion, chatAnswer, _SideFunction.GetCurrentDateTime()],
            (err, result) => {
                if (err) {
                    console.error("Error registering user:", err);
                    console.log("Internal server error");
                }
            }
        );
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
            const { email, password, username, age, gender, nationality } = req.body;

            // Check if email or password is missing
            if (!email || !password) {
                return res.status(400).json({ message: "email and password are required" });
            }

            // Insert user into the database
            connection.query(
                "INSERT INTO users (userid, account, password, username, age, gender, nationality) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [userId, email, password, username, age, gender, nationality],
                (err, result) => {
                    if (err) {
                        console.error("Error registering user:", err);
                        res.send("Internal server error");
                    } else {
                        // res.send("User registered successfully");
                        res.send(userId);
                    }
                }
            );
        });
    }

    Recovery(app, newPassword) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        app.post("/authentication/recovery", (req, res) => {
            const { username, email } = req.body;

            connection.query("SELECT * FROM users WHERE username = ? AND account = ? ", [username, email], (err, result) => {
                if (result.length > 0) {
                    const data = result;
                    data.forEach((element) => {
                        connection.query("UPDATE users SET password = ? WHERE userid = ?  ", [newPassword.toUpperCase(), element.userid], (err, result) => {
                            if (err) {
                                console.error("Error registering user:", err);
                                res.send("Internal server error");
                            } else {
                                // res.send("User registered successfully");
                                let GeneratedPassword = newPassword.toUpperCase();
                                res.send("Please check your email to get your new password");

                                _SideFunction.SendEmail(username, GeneratedPassword);
                            }
                        });
                    });
                } else {
                    res.status(401).json({ message: "User not exist" });
                    res.send("User not exist");
                }
            });
        });

        app.post("/authentication/recovery/changePassword", (req, res) => {
            const { email, password, newPassword } = req.body;

            connection.beginTransaction((err) => {
                if (err) throw err;

                connection.query("SELECT * FROM users WHERE account = ? AND password = ?", [email, password], (err, results) => {
                    if (err) {
                        return connection.rollback(() => {
                            throw err;
                        });
                    }

                    if (results.length > 0) {
                        // If a row is found, update the password
                        connection.query("UPDATE users SET password = ? WHERE account = ?", [newPassword, email], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    throw err;
                                });
                            }

                            // Commit the transaction if all queries were successful
                            connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        throw err;
                                    });
                                }
                                console.log("Password updated successfully!");
                                res.send("Password updated successfully !");
                            });
                        });
                    } else {
                        res.send("Internal server error");
                    }
                });
            });
        });
    }

    DeleteUser(app) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        app.post("/authentication/updatePassword", (req, res) => {
            const { userid } = req.body;

            connection.query("DELETE FROM users WHERE userid = ?", [userid], (err, result) => {
                if (err) {
                    console.error("Error registering user:", err);
                    res.send("Internal server error");
                } else {
                    // res.send("User registered successfully");
                    res.send("Delete user succesfully");
                }
            });
        });
    }
}

module.exports = Database;
