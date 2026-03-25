import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        correo VARCHAR(100)
      );
    `);
    console.log("Tabla usuarios lista");
  } catch (err) {
    console.error("Error creando tabla:", err);
  }
};

createTable();



app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /usuarios:", err);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});

app.post("/usuarios", async (req, res) => {
  try {
    const { nombre, correo } = req.body;
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, correo) VALUES ($1, $2) RETURNING *",
      [nombre, correo]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en POST /usuarios:", err);
    res.status(500).json({ error: "Error creando usuario" });
  }
});

app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo } = req.body;
    const result = await pool.query(
      "UPDATE usuarios SET nombre=$1, correo=$2 WHERE id=$3 RETURNING *",
      [nombre, correo, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en PUT /usuarios/:id", err);
    res.status(500).json({ error: "Error actualizando usuario" });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM usuarios WHERE id=$1", [id]);
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    console.error("Error en DELETE /usuarios/:id", err);
    res.status(500).json({ error: "Error eliminando usuario" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor en puerto ${port}`);
});
