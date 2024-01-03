const openai = require("./chatbot.config.js");
const colors = require("colors");
const bodyParser = require("body-parser");

class Bot {
    ChatBot(app) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        // Create a route to receive data and insert it into the database
        app.post("/botchat", async (req, res) => {
            const { question } = req.body;
            let userInput = question;
            const chatHistory = [];
            try {
                // Construct messages by iterating over the history
                const messages = chatHistory.map(([role, content]) => ({
                    role,
                    content,
                }));

                // Add latest user input
                messages.push({ role: "user", content: userInput });

                // Call the API with user input & history
                const completion = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                });

                // Get completion text/content
                const completionText = completion.data.choices[0].message.content;

                console.log(colors.green("Bot: ") + completionText);
                res.send(completionText);

                // // Update history with user input and assistant response
                // chatHistory.push(["user", userInput]);
                // chatHistory.push(["assistant", completionText]);
            } catch (error) {
                console.error(colors.red(error));
            }
        });
    }
}

module.exports = Bot;
