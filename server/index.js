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
app.get("/movies-in-store/:storeId", async (req, res) => {
    const { storeId } = req.params;
    const query = `
        SELECT DISTINCT f.film_id, f.title
        FROM film f
        JOIN inventory i ON f.film_id = i.film_id
        WHERE i.store_id = ?;
    `;
    try {
        const [results] = await connection.query(query, [storeId]);

        if (results.length === 0) {
            return res.status(404).json({ error: "No movies found for the given store ID." });
        }

        res.json(results);
    } catch (error) {
        console.error("Error fetching movies for store:", error);
        res.status(500).json({ error: "Error fetching movies. Please try again." });
    }
});

// Route to fetch top actors by store ID
app.get("/top-actors-in-store/:storeId", async (req, res) => {
    const { storeId } = req.params;
    const query = `
        SELECT a.actor_id, a.first_name, a.last_name, COUNT(fa.film_id) AS film_count
        FROM actor a
        JOIN film_actor fa ON a.actor_id = fa.actor_id
        JOIN inventory i ON fa.film_id = i.film_id
        WHERE i.store_id = ?
        GROUP BY a.actor_id
        ORDER BY film_count DESC
        LIMIT 5;
    `;
    try {
        const [results] = await connection.query(query, [storeId]);

        if (results.length === 0) {
            return res.status(404).json({ error: "No actors found for the given store ID." });
        }

        res.json(results);
    } catch (error) {
        console.error("Error fetching top actors for store:", error);
        res.status(500).json({ error: "Error fetching top actors. Please try again." });
    }
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

//feature 2
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
    

    try {
        // Execute the query
        const [rows] = await connection.execute(query, [id]);

        if (rows.length) {
            res.json(rows[0]); // Send the film details
        } else {
            res.status(404).json({ message: "Film not found" });
        }
    } catch (error) {
        console.error("Error fetching film details:", error);
        res.status(500).json({ message: "Error fetching film details" });
    }
});

// feature 4
app.get("/actors-list", async (req, res) => {
    try {
        console.log("Fetching actors from the database...");
        const query = `SELECT first_name, last_name FROM actor ORDER BY first_name, last_name`;
        const [rows] = await connection.query(query);
        console.log("Query successful. Data fetched:", rows);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching actors list:", error);
        res.status(500).json({ error: "An error occurred while fetching the actors list." });
    }
});

// Endpoint to fetch actor details by full name (case-insensitive)
app.get("/actor-details", async (req, res) => {
    const { fullName } = req.query;

    if (!fullName) {
        return res.status(400).json({ error: "Full name is required." });
    }

    const nameParts = fullName.trim().split(" ");

    if (nameParts.length < 2) {
        return res.status(400).json({ error: "Full name must include both first and last names." });
    }

    const firstName = nameParts[0]; // Assume the first word is the first name
    const lastName = nameParts.slice(1).join(" "); // Assume the rest is the last name

    const query = `
        SELECT actor_id, first_name, last_name
        FROM actor
        WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?)
    `;

    try {
        const [results] = await connection.query(query, [firstName, lastName]);

        if (results.length === 0) {
            return res.status(404).json({ error: "No actor found with the given name." });
        }

        res.json(results[0]); // Return the first match
    } catch (error) {
        console.error("Error fetching actor details:", error);
        res.status(500).json({ error: "An error occurred while fetching actor details." });
    }
});

// Endpoint to fetch top 5 most rented films for an actor
app.get("/actor-top-films/:actorId", async (req, res) => {
    const { actorId } = req.params;

    const query = `
        SELECT f.film_id, f.title, COUNT(rental_id) AS rental_count
        FROM film f
        JOIN film_actor fa ON f.film_id = fa.film_id
        JOIN inventory i ON f.film_id = i.film_id
        JOIN rental r ON i.inventory_id = r.inventory_id
        WHERE fa.actor_id = ?
        GROUP BY f.film_id
        ORDER BY rental_count DESC
        LIMIT 5
    `;

    try {
        const [results] = await connection.query(query, [actorId]);

        if (results.length === 0) {
            return res.status(404).json({ error: "No films found for the given actor." });
        }

        res.json(results);
    } catch (error) {
        console.error("Error fetching actor's top films:", error);
        res.status(500).json({ error: "An error occurred while fetching the actor's top films." });
    }
});

// feature 5
app.get("/search-films", async (req, res) => {
    const { query, category } = req.query;

    // Validate query parameters
    if (!query || !category) {
        return res.status(400).json({ error: "Query and category are required." });
    }

    try {
        let sqlQuery;
        let params = [`%${query}%`]; // Search term with wildcards

        // Adjust query based on category
        if (category === "title") {
            sqlQuery = `
                SELECT DISTINCT f.film_id, f.title, c.name AS genre
                FROM film f
                LEFT JOIN film_category fc ON f.film_id = fc.film_id
                LEFT JOIN category c ON fc.category_id = c.category_id
                WHERE f.title LIKE ? COLLATE utf8_general_ci;
            `;
        } else if (category === "actor") {
            sqlQuery = `
                SELECT DISTINCT f.film_id, f.title, c.name AS genre, 
                                CONCAT(a.first_name, ' ', a.last_name) AS actor
                FROM film f
                JOIN film_actor fa ON f.film_id = fa.film_id
                JOIN actor a ON fa.actor_id = a.actor_id
                LEFT JOIN film_category fc ON f.film_id = fc.film_id
                LEFT JOIN category c ON fc.category_id = c.category_id
                WHERE CONCAT(a.first_name, ' ', a.last_name) LIKE ? COLLATE utf8_general_ci;
            `;
        } else if (category === "genre") {
            sqlQuery = `
                SELECT DISTINCT f.film_id, f.title, c.name AS genre
                FROM film f
                JOIN film_category fc ON f.film_id = fc.film_id
                JOIN category c ON fc.category_id = c.category_id
                WHERE c.name LIKE ? COLLATE utf8_general_ci;
            `;
        } else {
            return res.status(400).json({ error: "Invalid category. Choose 'title', 'actor', or 'genre'." });
        }

        // Execute the query
        const [results] = await connection.execute(sqlQuery, params);

        if (results.length === 0) {
            return res.status(404).json({ error: "No matching films found." });
        }

        res.json(results); // Return the search results
    } catch (error) {
        console.error("Error searching for films:", error);
        res.status(500).json({ error: "An error occurred while searching for films." });
    }
});

//feature 7
// Rent a movie
app.post("/rent-movie", async (req, res) => {
    const { inventoryId, movieName, customerId, staffId } = req.body;

    // Check if required fields are provided
    if (!inventoryId && !movieName) {
        return res.status(400).json({ error: "Inventory ID or Movie Name is required." });
    }

    if (!customerId || !staffId) {
        return res.status(400).json({ error: "Customer ID and Staff ID are required." });
    }

    try {
        let inventoryQuery = `
            SELECT i.inventory_id
            FROM inventory i
            JOIN film f ON i.film_id = f.film_id
            WHERE i.inventory_id = ? OR f.title = ?
            LIMIT 1;
        `;

        // Fetch inventory ID if movie name is provided
        const [inventoryResult] = await connection.query(inventoryQuery, [inventoryId || null, movieName || null]);
        if (inventoryResult.length === 0) {
            return res.status(404).json({ error: "Movie not found or not available." });
        }

        const movieInventoryId = inventoryResult[0].inventory_id;

        // Check if the movie is already rented out
        const rentalAvailabilityQuery = `
            SELECT *
            FROM rental
            WHERE inventory_id = ? AND return_date IS NULL
            LIMIT 1;`;
        const [rentalAvailability] = await connection.query(rentalAvailabilityQuery, [movieInventoryId]);

        if (rentalAvailability.length > 0) {
            return res.status(400).json({ error: "Movie is already rented out." });
        }

        // Insert a new rental record
        const rentalInsertQuery = `
            INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id, last_update)
            VALUES (NOW(), ?, ?, ?, NOW());
        `;
        await connection.query(rentalInsertQuery, [movieInventoryId, customerId, staffId]);

        res.status(201).json({ message: "Movie rented out successfully!" });
    } catch (error) {
        console.error("Error renting out the movie:", error);
        res.status(500).json({ error: "Error occurred while renting the movie. Please try again." });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});