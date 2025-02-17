import express from "express";
import mysql from "mysql2/promise"; // Use the promise version
import cors from "cors";

// Create an express app
const app = express();
app.use(cors());

// Create a MySQL connection using the promise API
const connection = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "CS490ip2",
    database: "sakila",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get("/actors", async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM actor LIMIT 10"); // Example query to get the first 10 actors
        res.json(rows); // Send the actors data as a JSON response
    } catch (error) {
        console.error("Error fetching actors:", error);
        res.status(500).send("Error fetching actors");
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});