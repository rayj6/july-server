const express = require("express");
const cors = require("cors");
const colors = require("colors");

const SideFunctions = require("./functions/sideFunctions/index");
const Bot = require("./functions/bot/index.js");
const Database = require("./functions/database/index.js");

const app = express();
const port = 3300;
const _SideFunction = new SideFunctions();
const _Bot = new Bot();
const _Database = new Database();

app.use(express.static("public"));
app.use(cors());
app.use((req, res, next) => {
    const clientIP = req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;
    console.log(`\tReceived a ${colors.green(req.method)} request to ${colors.green(req.path)} from ${colors.green(clientIP)}`);
    next(); // Call the next middleware in the chain
});

function errorHandler(err, req, res, next) {
    res.status(500);

    console.log(err);

    res.json({ error: err.message });
}

const randomString = _SideFunction.GenerateRandomString(52);
app.use(errorHandler);
_SideFunction.getHardwareInfo();
_Bot.ChatBot(app);
_Database.CheckConnection();
_Database.BotDatabase(app);
_Database.Register(app, randomString);
_Database.Login(app);
_Database.CheckUser(app);
_SideFunction.HandleServerRuntimes();

// Start the server
app.listen(port, () => {
    console.clear();
    console.log("Server is running on port: " + colors.green(`${port}`));
    console.log("Follow this link to access server: " + colors.green(`http://localhost:${port}`));
});
