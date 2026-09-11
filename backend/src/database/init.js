import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, "../config/schema.sql");

try {
  const sql = await fs.readFile(schemaPath, "utf8");

  await pool.query(sql);

  console.log("Database schema initialized successfully");
} catch (error) {
  console.error("Database initialization failed",error);
} finally {
  await pool.end();
}