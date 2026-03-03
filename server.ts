import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("lumina.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    credits INTEGER DEFAULT 100,
    tier TEXT DEFAULT 'free'
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    amount INTEGER,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    video_url TEXT,
    title TEXT,
    description TEXT,
    hashtags TEXT,
    style TEXT,
    transition TEXT DEFAULT 'fade',
    transition_duration REAL DEFAULT 1.5,
    aspect_ratio TEXT DEFAULT '16:9',
    resolution TEXT DEFAULT '1080p',
    duration TEXT DEFAULT 'medium',
    camera_movement TEXT DEFAULT 'none',
    color_grading TEXT DEFAULT 'none',
    face_enhancement INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add projects table if it doesn't exist
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      video_url TEXT,
      title TEXT,
      description TEXT,
      hashtags TEXT,
      style TEXT,
      face_enhancement INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {
  console.error("Migration error (projects):", e);
}

// Migration: Add face_enhancement column if it doesn't exist
try {
  db.prepare("ALTER TABLE projects ADD COLUMN face_enhancement INTEGER DEFAULT 0").run();
} catch (e) {
  // Column already exists or table doesn't exist yet
}

// Migration: Add new columns if they don't exist
try {
  db.prepare("ALTER TABLE projects ADD COLUMN transition TEXT DEFAULT 'fade'").run();
  db.prepare("ALTER TABLE projects ADD COLUMN transition_duration REAL DEFAULT 1.5").run();
  db.prepare("ALTER TABLE projects ADD COLUMN aspect_ratio TEXT DEFAULT '16:9'").run();
  db.prepare("ALTER TABLE projects ADD COLUMN resolution TEXT DEFAULT '1080p'").run();
  db.prepare("ALTER TABLE projects ADD COLUMN duration TEXT DEFAULT 'medium'").run();
  db.prepare("ALTER TABLE projects ADD COLUMN camera_movement TEXT DEFAULT 'none'").run();
  db.prepare("ALTER TABLE projects ADD COLUMN color_grading TEXT DEFAULT 'none'").run();
} catch (e) {
  // Columns already exist
}

// Migration: Add is_public column if it doesn't exist
try {
  db.prepare("ALTER TABLE projects ADD COLUMN is_public INTEGER DEFAULT 0").run();
  db.prepare("ALTER TABLE projects ADD COLUMN generation_time INTEGER DEFAULT 0").run();
} catch (e) {
  // Column already exists
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY) 
    : null;

  // API Routes
  app.get("/api/user/:email", (req, res) => {
    const { email } = req.params;
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    if (!user) {
      const id = Math.random().toString(36).substring(7);
      db.prepare("INSERT INTO users (id, email, credits, tier) VALUES (?, ?, ?, ?)").run(id, email, 100, 'free');
      user = { id, email, credits: 100, tier: 'free' };
    } else if (user.credits < 10) {
      // Auto top-up for demo purposes
      db.prepare("UPDATE users SET credits = 100 WHERE email = ?").run(email);
      user.credits = 100;
    }
    
    res.json(user);
  });

  app.get("/api/projects/:email", (req, res) => {
    const { email } = req.params;
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const projects = db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC").all(user.id);
    res.json(projects);
  });

  app.get("/api/public-projects", (req, res) => {
    const projects = db.prepare("SELECT p.*, u.email as user_email FROM projects p JOIN users u ON p.user_id = u.id WHERE p.is_public = 1 ORDER BY p.created_at DESC LIMIT 50").all();
    res.json(projects);
  });

  app.post("/api/projects/toggle-public", (req, res) => {
    const { email, projectId, isPublic } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    db.prepare("UPDATE projects SET is_public = ? WHERE id = ? AND user_id = ?").run(isPublic ? 1 : 0, projectId, user.id);
    res.json({ success: true });
  });

  app.post("/api/projects", (req, res) => {
    const { email, project } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const { id, videoUrl, seoMetadata, style, faceEnhancement, transition, transitionDuration, aspectRatio, resolution, duration, cameraMovement, colorGrading, generationTime } = project;
    db.prepare(`
      INSERT INTO projects (id, user_id, video_url, title, description, hashtags, style, face_enhancement, transition, transition_duration, aspect_ratio, resolution, duration, camera_movement, color_grading, generation_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, 
      user.id, 
      videoUrl, 
      seoMetadata?.title || "Untitled", 
      seoMetadata?.description || "", 
      JSON.stringify(seoMetadata?.hashtags || []),
      style,
      faceEnhancement ? 1 : 0,
      transition || 'fade',
      transitionDuration || 1.5,
      aspectRatio || '16:9',
      resolution || '1080p',
      duration || 'medium',
      cameraMovement || 'none',
      colorGrading || 'none',
      generationTime || 0
    );
    res.json({ success: true });
  });

  app.post("/api/projects/delete", (req, res) => {
    const { email, projectId } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(projectId, user.id);
    res.json({ success: true });
  });

  app.post("/api/projects/clear", (req, res) => {
    const { email } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    db.prepare("DELETE FROM projects WHERE user_id = ?").run(user.id);
    res.json({ success: true });
  });

  app.post("/api/update-tier", (req, res) => {
    const { email, tier } = req.body;
    db.prepare("UPDATE users SET tier = ? WHERE email = ?").run(tier, email);
    res.json({ success: true });
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const { email, priceId } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.APP_URL}?success=true`,
        cancel_url: `${process.env.APP_URL}?canceled=true`,
        customer_email: email,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Deduct credits for video generation
  app.post("/api/deduct-credits", (req, res) => {
    const { email, amount } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    if (!user || user.credits < amount) {
      return res.status(400).json({ error: "Insufficient credits" });
    }

    db.prepare("UPDATE users SET credits = credits - ? WHERE email = ?").run(amount, email);
    res.json({ success: true, remainingCredits: user.credits - amount });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
