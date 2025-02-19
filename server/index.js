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

app.get("/top5", async (req, res) => {
    try {
        const query = `
            SELECT f.film_id, f.title, c.name AS category, COUNT(f.title) AS rented
            FROM rental r
            JOIN inventory i ON i.inventory_id = r.inventory_id
            JOIN film f ON i.film_id = f.film_id
            JOIN film_category fc ON f.film_id = fc.film_id
            JOIN category c ON fc.category_id = c.category_id
            GROUP BY f.film_id, c.category_id
            ORDER BY rented DESC
            LIMIT 5;
        `;

        const [rows] = await connection.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching top 5 films:", error);
        res.status(500).send("Error fetching top 5 films");
    }
});


app.get('/film/:id', async (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT
            film.film_id,
            film.title,
            film.description,
            film.release_year,
            film.rating,
            category.name AS category
        FROM
            film
                JOIN film_category ON film.film_id = film_category.film_id
                JOIN category ON film_category.category_id = category.category_id
        WHERE
            film.film_id = ?;`;

    let dbConnection;

    try {
        // Get a connection from `connection`
        dbConnection = await connection.getConnection();

        // Execute the query
        const [rows] = await dbConnection.execute(query, [id]);

        if (rows.length) {
            res.json(rows[0]); // Send the film details
        } else {
            res.status(404).json({ message: "Film not found" });
        }
    } catch (error) {
        console.error("Error fetching film details:", error);
        res.status(500).json({ message: "Error fetching film details" });
    } finally {
        if (dbConnection) {
            dbConnection.release(); // Always release the connection
        }
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});