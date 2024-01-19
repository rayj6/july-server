const colors = require("colors");
const si = require("systeminformation");
const nodemailer = require("nodemailer");

class SideFunctions {
    HandleServerRuntimes() {
        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        setInterval(function () {
            seconds++;

            if (seconds === 60) {
                seconds = 0;
                minutes++;

                if (minutes === 60) {
                    minutes = 0;
                    hours++;
                }
            }

            // Format the time as "hour:minute:second"
            const formattedTime =
                "Running time: " + colors.yellow(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);

            // Move the cursor to the beginning of the line and clear the line
            process.stdout.write("\r\x1b[K");

            // Display the formatted time
            process.stdout.write(formattedTime);
        }, 1000); // Update every second (1000 milliseconds)
    }

    async getHardwareInfo() {
        try {
            const cpuTemp = await si.cpuTemperature();
            const gpuTemp = await si.graphics();

            console.log("CPU Temperature:", cpuTemp.main);
            console.log("GPU Temperature:", gpuTemp.controllers[0].temperatureGPU);
        } catch (error) {
            console.error("Error retrieving hardware information:", error.message);
        }
    }
    GenerateRandomString(length) {
        const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

    GetCurrentDateTime() {
        const now = new Date();

        const day = now.getDate(); // Returns the day of the month (1-31)
        const month = now.getMonth() + 1; // Returns the month (0-11); adding 1 to make it 1-12
        const year = now.getFullYear(); // Returns the year (4 digits)
        const hour = now.getHours();
        const minute = now.getMinutes();

        return `${day}|${month}|${year}_${hour}:${minute}`;
    }

    SendEmail(content, to) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "littlejuly@gmail.com",
                pass: "Admin4126@",
            },
        });

        // Email options
        const mailOptions = {
            from: "littlejuly@gmail.com",
            to: to,
            subject: "Subject of your email",
            text: "Body of your email",
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });
    }
}

module.exports = SideFunctions;
