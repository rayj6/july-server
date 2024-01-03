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

function errorHandler(err, req, res, next) {
    res.status(500);

    console.log(err);

    res.json({ error: err.message });
}

app.use(errorHandler);
_SideFunction.getHardwareInfo();
_Bot.ChatBot(app);
_Database.CheckConnection();
_SideFunction.HandleServerRuntimes();

// Start the server
app.listen(port, () => {
    console.clear();
    console.log("Server is running on port: " + colors.green(`${port}`));
    console.log("Follow this link to access server: " + colors.green(`http://localhost:${port}`));
});
