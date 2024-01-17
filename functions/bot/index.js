const colors = require("colors");
const bodyParser = require("body-parser");
const Database = require("../database/index.js");

const _Database = new Database();

class Bot {
    ChatBot(app) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        // Create a route to receive data and insert it into the database
        app.post("/bot-takenote", async (req, res) => {
            const { userid, question } = req.body;

            // Spawn a Python process
            const pythonProcess = spawn("python3", ["./BotCollection/TakeNote.py", question]);

            // Capture Python script output
            pythonProcess.stdout.on("data", (data) => {
                const pythonOutput = data.toString();
                console.log(colors.green(`Python Output: ${pythonOutput}`));
                res.send(`server Output: ${pythonOutput}`);
                _Database.SendNoteData(userid, question, pythonOutput);
            });

            // Handle errors
            pythonProcess.stderr.on("data", (data) => {
                console.error(`Python Error: ${data}`);
                res.status(500).send(`Python Error: ${data}`);
            });

            // Handle process exit
            pythonProcess.on("close", (code) => {
                console.log(`Python process exited with code ${code}`);
            });
        });

        app.post("/bot-chat", async (req, res) => {
            const { userid, question } = req.body;

            // Spawn a Python process
            const pythonProcess = spawn("python3", ["./BotCollection/Chat.py", question]);

            // Capture Python script output
            pythonProcess.stdout.on("data", (data) => {
                const pythonOutput = data.toString();
                console.log(colors.green(`Python Output: ${pythonOutput}`));
                res.send(`server Output: ${pythonOutput}`);
                _Database.SendChatData(userid, question, pythonOutput);
            });

            // Handle errors
            pythonProcess.stderr.on("data", (data) => {
                console.error(`Python Error: ${data}`);
                res.status(500).send(`Python Error: ${data}`);
            });

            // Handle process exit
            pythonProcess.on("close", (code) => {
                console.log(`Python process exited with code ${code}`);
            });
        });

        app.post("/bot-health", async (req, res) => {
            const { userid, question } = req.body;

            // Spawn a Python process
            const pythonProcess = spawn("python3", ["./BotCollection/Health.py", question]);

            // Capture Python script output
            pythonProcess.stdout.on("data", (data) => {
                const pythonOutput = data.toString();
                console.log(colors.green(`Python Output: ${pythonOutput}`));
                res.send(`server Output: ${pythonOutput}`);
                _Database.SendHealthData(userid, question, pythonOutput);
            });

            // Handle errors
            pythonProcess.stderr.on("data", (data) => {
                console.error(`Python Error: ${data}`);
                res.status(500).send(`Python Error: ${data}`);
            });

            // Handle process exit
            pythonProcess.on("close", (code) => {
                console.log(`Python process exited with code ${code}`);
            });
        });
    }
}

module.exports = Bot;
