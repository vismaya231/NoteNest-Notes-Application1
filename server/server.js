
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new Database("notes.db");

// Create notes table
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Check whether the backend is working
app.get("/", (req, res) => {
  res.send("Notes App backend is running!");
});

// Get all notes
app.get("/api/notes", (req, res) => {
  const notes = db.prepare(
    "SELECT * FROM notes ORDER BY id DESC"
  ).all();

  res.json(notes);
});

// Add a note
app.post("/api/notes", (req, res) => {
  const { title, content } = req.body;

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({
      error: "Title and content are required."
    });
  }

  const result = db.prepare(
    "INSERT INTO notes (title, content) VALUES (?, ?)"
  ).run(title.trim(), content.trim());

  const note = db.prepare(
    "SELECT * FROM notes WHERE id = ?"
  ).get(result.lastInsertRowid);

  res.status(201).json(note);
});

// Update a note
app.put("/api/notes/:id", (req, res) => {
  const { title, content } = req.body;
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid note ID." });
  }

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({
      error: "Title and content are required."
    });
  }

  const result = db.prepare(
    "UPDATE notes SET title = ?, content = ? WHERE id = ?"
  ).run(title.trim(), content.trim(), id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Note not found." });
  }

  res.json({ message: "Note updated successfully." });
});

// Delete a note
app.delete("/api/notes/:id", (req, res) => {
  const result = db.prepare(
    "DELETE FROM notes WHERE id = ?"
  ).run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Note not found." });
  }

  res.json({ message: "Note deleted successfully." });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Notes App backend running at http://localhost:${PORT}`);
});
