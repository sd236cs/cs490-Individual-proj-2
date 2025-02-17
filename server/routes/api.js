import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/data", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM your_table_name");
        res.json(rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default router;
