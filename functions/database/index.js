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
                    // res.send("Login successful");
                    const data = result;
                    data.forEach((element) => {
                        console.log(element.userid);

                        connection.query("UPDATE users SET password = ? WHERE userid = ?  ", [newPassword.toUpperCase(), element.userid], (err, result) => {
                            if (err) {
                                console.error("Error registering user:", err);
                                res.send("Internal server error");
                            } else {
                                // res.send("User registered successfully");
                                console.log("New password: " + newPassword.toUpperCase());
                                res.send("Please check your email to get your new password");

                                const transporter = nodemailer.createTransport({
                                    service: "gmail",
                                    auth: {
                                        user: "nguyentu5526@gmail.com",
                                        pass: "Admin4126@",
                                    },
                                });

                                // Email options
                                const mailOptions = {
                                    from: "nguyentu5526@gmail.com",
                                    to: "rayjohnson4126@gmail.com",
                                    subject: "YOUR NEW LITTLEJULY PASSWORD",
                                    text: `Your new password: ${newPassword.toUpperCase()}`,
                                };

                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        console.error(error);
                                    } else {
                                        console.log("Email sent: " + info.response);
                                    }
                                });
                            }
                        });
                    });
                } else {
                    res.status(401).json({ message: "User not exist" });
                    res.send("User not exist");
                }
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
