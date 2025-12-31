require("dotenv").config();
console.log("DB URL:", process.env.DATABASE_URL);

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

// ===============================
// PostgreSQL (Supabase) Connection
// ===============================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ===============================
// TEST DB CONNECTION
// ===============================
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB connection failed");
  }
});

// ===============================
// GET ALL EMPLOYEES
// ===============================
app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query(
  "SELECT * FROM employees ORDER BY id DESC"
);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch employees");
  }
});

// ===============================
// ADD EMPLOYEE (AUTO VM-XXX)
// ===============================
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
    return res.status(400).send("Name required");
  }

  try {
    // Get next emp number
    const insertResult = await pool.query(
  `INSERT INTO employees
  (name, address, mobile, father, mother, pan, aadhar, doj)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
  RETURNING id`,
  [name, address, mobile, father, mother, pan, aadhar, doj]
);

const id = insertResult.rows[0].id;
const empId = "VM-" + String(id).padStart(3, "0");

await pool.query(
  "UPDATE employees SET emp_id=$1 WHERE id=$2",
  [empId, id]
);

    res.json({ emp_id: empId });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add employee");
  }
});

// ===============================
// UPDATE EMPLOYEE
// ===============================
app.put("/employees/:empId", async (req, res) => {
  const empId = req.params.empId;
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

  try {
    await pool.query(
      `UPDATE employees SET
        name=$1,
        address=$2,
        mobile=$3,
        father=$4,
        mother=$5,
        pan=$6,
        aadhar=$7,
        doj=$8
       WHERE emp_id=$9`,
      [name, address, mobile, father, mother, pan, aadhar, doj, empId]
    );

    res.send("UPDATED");
  } catch (err) {
    console.error(err);
    res.status(500).send("Update failed");
  }
});

// ===============================
// DELETE EMPLOYEE
// ===============================
app.delete("/employees/:empId", async (req, res) => {
  const empId = req.params.empId;

  try {
    await pool.query(
      "DELETE FROM employees WHERE emp_id=$1",
      [empId]
    );

    res.send("DELETED");
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
});

// ===============================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
