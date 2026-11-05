
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/notes";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not load notes");
      const data = await response.json();
      setNotes(data);
      setMessage("");
    } catch {
      setMessage("Cannot connect to the server. Please check your backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage("Please enter both a title and content.");
      return;
    }

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save note");

      setTitle("");
      setContent("");
      setEditingId(null);
      setMessage(editingId ? "Note updated successfully!" : "Note added successfully!");
      await loadNotes();
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    }
  }

  function startEditing(note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteNote(id) {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete note");

      if (editingId === id) {
        setEditingId(null);
        setTitle("");
        setContent("");
      }

      setMessage("Note deleted successfully!");
      await loadNotes();
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    }
  }

  const filteredNotes = notes.filter((note) => {
    const query = search.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="app">
      <header className="header">
        <div className="brand">✿ NoteNest</div>
        <p>A little space for all your big ideas ✨</p>
      </header>

      <main className="container">
        <section className="form-card">
          <div className="form-heading">
            <span className="heading-icon">✎</span>
            <div>
              <h1>{editingId ? "Edit your note" : "Create a note"}</h1>
              <p className="subtitle">
                Capture your ideas, tasks and thoughts.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Note title</label>
            <input
              id="title"
              type="text"
              placeholder="Give your note a title..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              required
            />

            <label htmlFor="content">Note content</label>
            <textarea
              id="content"
              placeholder="Write something worth remembering..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              required
            />

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingId ? "✓ Save changes" : "+ Add Note"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditingId(null);
                    setTitle("");
                    setContent("");
                    setMessage("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && (
            <p className="message" role="status">
              {message}
            </p>
          )}

          <div className="quick-tips">
            <h3>💡 Quick tips</h3>
            <p>• Use meaningful titles to find notes easily.</p>
            <p>• Search, edit or delete your notes anytime.</p>
            <p>• Your notes are saved in the database.</p>
          </div>
        </section>

        <section className="notes-section">
          <div className="notes-heading">
            <div>
              <h2>🌼 Your Notes</h2>
              <p>{notes.length} saved note(s)</p>
            </div>
          </div>

          <input
            className="search-input"
            type="search"
            placeholder="⌕  Search by title or content..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search notes"
          />

          {loading ? (
            <div className="empty-state">Loading your notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <h3>{search ? "No matching notes" : "Your nest is empty!"}</h3>
              <p>
                {search
                  ? "Try another search term."
                  : "Add your first note and watch it appear here."}
              </p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <article className="note-card" key={note.id}>
                  <div className="note-card-heading">
                    <span className="note-dot">✿</span>
                    <h3>{note.title}</h3>
                  </div>

                  
<p className="note-content">{note.content}</p>

<div className="note-date">
  <span>🕒</span>
  <span>
    Added on{" "}
    {note.created_at
      ? new Date(
          note.created_at.replace(" ", "T") + "Z"
        ).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "Date unavailable"}
  </span>
</div>

<div className="note-actions">

                    <button
                      className="edit-btn"
                      onClick={() => startEditing(note)}
                    >
                      ✎ Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteNote(note.id)}
                    >
                      ♡ Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>Made with ♡ · NoteNest — keep every thought in one place.</footer>
    </div>
  );
}

export default App;
