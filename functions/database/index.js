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
                                        user: "rayjohnson4126@gmail.com",
                                        pass: "jmomreuxjzatidar",
                                    },
                                });

                                // Email options
                                const mailOptions = {
                                    from: "rayjohnson4126@gmail.com",
                                    to: "nguyentu5526@gmail.com",
                                    subject: "LittleJuly Password Reset",
                                    text: `Dear ${username},
We hope this email finds you well.
                                    
As part of our commitment to ensuring the security of your account, we have recently updated your password on LittleJuly.com. 
This is a routine measure to help protect your personal information and ensure a safe and secure online experience.
                                    
Your new password is: ${newPassword.toUpperCase()}
                                    
To log in, simply visit LittleJuly.com and enter your email address along with the provided password. 
Once logged in, we recommend changing your password to something more personalized. 
You can do this by visiting the account settings section on our website.
                                    
If you did not request a password reset or have any concerns about the security of your account, 
please contact our support team immediately at support@littlejuly.com. We take the security of your information seriously, 
and our team is always here to assist you.
                                    
Thank you for being a valued member of LittleJuly.com. We appreciate your understanding and cooperation in maintaining the highest standards of security.
                                    
Best regards,
Customer Support Team
LittleJuly.com`,
                                };

                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        console.error(error);
                                    } else {
                                        console.log(colors.green("\tEmail sent: " + info.response));
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
