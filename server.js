require("dotenv").config();

const express = require("express");
const cors = require("cors");

// IMPORTANT: node-fetch v2 syntax
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ENV CHECK (VERY IMPORTANT)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase environment variables");
}

// ---------- ROOT TEST ----------
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ---------- GET EMPLOYEES ----------
app.get("/employees", async (req, res) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?order=id.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("GET /employees ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- ADD EMPLOYEE ----------
app.post("/employees", async (req, res) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/employees`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("POST /employees ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
