require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---------- DATABASE ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ---------- DB TEST ----------
app.get("/db-test", async (req, res) => {
  try {
    const r = await pool.query("SELECT 1 as ok");
    res.json(r.rows);
  } catch (e) {
    console.error("DB TEST ERROR:", e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- GET EMPLOYEES ----------
app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM public.employees ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET EMPLOYEES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- ADD EMPLOYEE ----------
app.post("/employees", async (req, res) => {
  const {
    name,
    address,
    mobile,
    father,
    mother,
    pan,
    aadhar,
    doj
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name required" });
  }

  try {
    const insert = await pool.query(
      `INSERT INTO public.employees
      (name, address, mobile, father, mother, pan, aadhar, doj)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id`,
      [name, address, mobile, father, mother, pan, aadhar, doj]
    );

    const id = insert.rows[0].id;
    const empId = "VM-" + String(id).padStart(3, "0");

    await pool.query(
      "UPDATE public.employees SET emp_id=$1 WHERE id=$2",
      [empId, id]
    );

    res.json({ emp_id: empId });
  } catch (err) {
    console.error("ADD EMPLOYEE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- DELETE ----------
app.delete("/employees/:empId", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM public.employees WHERE emp_id=$1",
      [req.params.empId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
