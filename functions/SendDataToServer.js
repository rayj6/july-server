export default async function sendDataToServer(data, url, to) {
    try {
        console.log(email + password);
        const response = await axios.post(`http://localhost:3300/${url}`, data);

        console.log("Server response:", response.data);
        window.location.href = to;
    } catch (error) {
        console.error("Error sending data to server:", error);
    }
}
