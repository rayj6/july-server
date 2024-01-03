const colors = require("colors");
const si = require("systeminformation");

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
                "Running time: " + colors.green(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);

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
}

module.exports = SideFunctions;
