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

    SendEmail(username, password) {
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
            
Your new password is: ${password}
            
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
}

module.exports = SideFunctions;
