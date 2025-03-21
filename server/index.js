import express from "express";
import mysql from "mysql2/promise"; // Use the promise version
import cors from "cors";

// Create an express app
const app = express();
app.use(cors());
app.use(express.json());

// Create a MySQL connection using the promise API
const connection = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
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
        //console.log("Fetching actors from the database...");
        const query = `SELECT first_name, last_name FROM actor ORDER BY first_name, last_name`;
        const [rows] = await connection.query(query);
        //console.log("Query successful. Data fetched:", rows);
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
app.post("/rentals", async (req, res) => {
    const { customerId, inventoryId, staffId } = req.body;

    try {
        // Check if inventory item is available
        const [inventoryCheck] = await connection.query(
            "SELECT * FROM inventory WHERE inventory_id = ? AND inventory_id NOT IN (SELECT inventory_id FROM rental WHERE return_date IS NULL)",
            [inventoryId]
        );

        if (inventoryCheck.length === 0) {
            return res.status(400).json({ error: "Inventory item not available." });
        }

        const [result] = await connection.query(
            "INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id) VALUES (NOW(), ?, ?, ?)",
            [inventoryId, customerId, staffId]
        );

        res.json({ message: "Rental created successfully.", rentalId: result.insertId });
    } catch (error) {
        console.error("Error creating rental:", error);
        res.status(500).json({ error: "Error creating rental." });
    }
});

//feature 8
app.get("/customers", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Query to fetch customers with pagination
        const [customers] = await connection.query(
            "SELECT customer_id, first_name, last_name, email FROM customer LIMIT ? OFFSET ?",
            [limit, offset]
        );

        // Query to count total customers
        const [totalCustomersResult] = await connection.query(
            "SELECT COUNT(*) AS total FROM customer"
        );
        const totalCustomers = totalCustomersResult[0].total;

        res.json({
            customers,
            totalCustomers,
            currentPage: page,
            totalPages: Math.ceil(totalCustomers / limit),
        });
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ error: "Error fetching customers" });
    }
});

//feature 9

app.get("/search-customers", async (req, res) => {
    const customerId = req.query.customerId;
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;

    let query = "SELECT customer_id, first_name, last_name, email FROM customer WHERE 1=1"; // 1=1 for easy AND clauses
    const queryParams = [];

    if (customerId) {
        query += " AND customer_id = ?";
        queryParams.push(customerId);
    }
    if (firstName) {
        query += " AND first_name LIKE ?";
        queryParams.push(`%${firstName}%`);
    }
    if (lastName) {
        query += " AND last_name LIKE ?";
        queryParams.push(`%${lastName}%`);
    }

    try {
        const [customers] = await connection.query(query, queryParams);
        res.json(customers);
    } catch (error) {
        console.error("Error searching customers:", error);
        res.status(500).json({ error: "Error searching customers" });
    }
});

//feature 10

// In your Express.js backend
app.post("/customers", async (req, res) => {
    const { firstName, lastName, email, addressId, storeId, active } = req.body; // Extract from request body

    // Basic input validation
    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: "First name, last name, and email are required." });
    }

    try {
        const [result] = await connection.query(
            "INSERT INTO customer (first_name, last_name, email, address_id, store_id, active, create_date) VALUES (?, ?, ?, ?, ?, ?, NOW())",
            [firstName, lastName, email, addressId, storeId, active]
        );

        res.status(201).json({ message: "Customer added successfully", customerId: result.insertId });
    } catch (error) {
        console.error("Error adding customer:", error);
        res.status(500).json({ error: "Error adding customer. Please try again." });
    }
});

//feature 11

app.get("/customers/:customerId", async (req, res) => {
    const { customerId } = req.params;
    try {
        const [rows] = await connection.query(
            "SELECT customer_id, first_name, last_name, email, address_id, store_id, active FROM customer WHERE customer_id = ?",
            [customerId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Customer not found." });
        }
        res.json(rows);
    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ error: "Error fetching customer." });
    }
});

app.put("/customers/:customerId", async (req, res) => {
    const { customerId } = req.params;
    const { first_name, last_name, email, address_id, store_id, active } = req.body;

    try {
        const [result] = await connection.query(
            "UPDATE customer SET first_name = ?, last_name = ?, email = ?, address_id = ?, store_id = ?, active = ?, last_update = NOW() WHERE customer_id = ?",
            [first_name, last_name, email, address_id, store_id, active, customerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Customer not found." });
        }

        res.json({ message: "Customer updated successfully." });
    } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ error: "Error updating customer." });
    }
});

//feature 12

app.delete("/customers/:customerId", async (req, res) => {
    const { customerId } = req.params;

    try {
        const [result] = await connection.query(
            "DELETE FROM customer WHERE customer_id = ?",
            [customerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Customer not found." });
        }

        res.json({ message: "Customer deleted successfully." });
    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ error: "Error deleting customer." });
    }
});

//feature 13

app.get("/customers/:customerId/details", async (req, res) => {
    const { customerId } = req.params;

    try {
        const [customer] = await connection.query(
            "SELECT * FROM customer WHERE customer_id = ?",
            [customerId]
        );

        if (customer.length === 0) {
            return res.status(404).json({ error: "Customer not found." });
        }

        res.json(customer[0]);
    } catch (error) {
        console.error("Error fetching customer details:", error);
        res.status(500).json({ error: "Error fetching customer details." });
    }
});

//feature 14

app.put("/rentals/:rentalId/return", async (req, res) => {
    const { rentalId } = req.params;

    try {
        const [result] = await connection.query(
            "UPDATE rental SET return_date = NOW() WHERE rental_id = ?",
            [rentalId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Rental not found." });
        }

        res.json({ message: "Rental returned successfully." });
    } catch (error) {
        console.error("Error returning rental:", error);
        res.status(500).json({ error: "Error returning rental." });
    }
});

app.get("/customers/:customerId/rentals", async (req, res) => {
    const { customerId } = req.params;

    try {
        const [rentals] = await connection.query(
            `SELECT rental.*, film.title, inventory.inventory_id
             FROM rental
             JOIN inventory ON rental.inventory_id = inventory.inventory_id
             JOIN film ON inventory.film_id = film.film_id
             WHERE rental.customer_id = ?`,
            [customerId]
        );

        res.json(rentals);
    } catch (error) {
        console.error("Error fetching rental history:", error);
        res.status(500).json({ error: "Error fetching rental history." });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});