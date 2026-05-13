import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

// Initialize dummy DB if not exists
if (!fs.existsSync(DB_PATH)) {
  const initialData = {
    books: [
      { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", category: "Fiction", status: "Available", cover: "https://picsum.photos/seed/gatsby/400/600", mediumUrl: "https://medium.com/topic/fiction" },
      { id: "2", title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0061120084", category: "Classics", status: "Borrowed", cover: "https://picsum.photos/seed/mockingbird/400/600", mediumUrl: "https://medium.com/topic/culture" },
      { id: "3", title: "1984", author: "George Orwell", isbn: "978-0451524935", category: "Dystopian", status: "Available", cover: "https://picsum.photos/seed/1984/400/600", mediumUrl: "https://medium.com/topic/politics" },
      { id: "4", title: "The Catcher in the Rye", author: "J.D. Salinger", isbn: "978-0316769488", category: "Fiction", status: "Available", cover: "https://picsum.photos/seed/catcher/400/600" },
      { id: "5", title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", isbn: "978-0590353427", category: "Fantasy", status: "Available", cover: "https://picsum.photos/seed/hp1/400/600", mediumUrl: "https://medium.com/topic/fantasy" },
      { id: "6", title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "978-0547928227", category: "Fantasy", status: "Available", cover: "https://picsum.photos/seed/hobbit/400/600" },
    ]
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

app.use(express.json());

// Helper to read/write DB
const getDB = () => JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
const saveDB = (data: any) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// API Routes
app.get("/api/books", (req, res) => {
  const db = getDB();
  res.json(db.books);
});

app.post("/api/books", (req, res) => {
  const db = getDB();
  const newBook = { ...req.body, id: Date.now().toString() };
  db.books.push(newBook);
  saveDB(db);
  res.status(201).json(newBook);
});

app.put("/api/books/:id", (req, res) => {
  const db = getDB();
  const index = db.books.findIndex((b: any) => b.id === req.params.id);
  if (index !== -1) {
    db.books[index] = { ...db.books[index], ...req.body };
    saveDB(db);
    res.json(db.books[index]);
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

app.delete("/api/books/:id", (req, res) => {
  const db = getDB();
  const originalLength = db.books.length;
  db.books = db.books.filter((b: any) => b.id !== req.params.id);
  if (db.books.length < originalLength) {
    saveDB(db);
    res.status(204).send();
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
