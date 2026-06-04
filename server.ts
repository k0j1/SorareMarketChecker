import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy GraphQL queries to Sorare API
  app.post("/api/sorare/graphql", async (req, res) => {
    try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        if (typeof authHeader === "string") {
          headers["Authorization"] = authHeader;
        }

        const audHeader = req.headers["jwt-aud"] || req.headers["JWT-AUD"];
        if (typeof audHeader === "string") {
          headers["JWT-AUD"] = audHeader;
        }

      const response = await fetch("https://api.sorare.com/graphql", {
        method: "POST",
        headers,
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      
      // Pass through JWT headers if present
      const jwtHeader = response.headers.get("JWT-AUD-token") || response.headers.get("authorization");
      if (jwtHeader) {
        res.setHeader("JWT-AUD-token", jwtHeader);
        if (!response.headers.get("JWT-AUD-token")) {
           // Provide fallback if authorization was used
           res.setHeader("authorization", jwtHeader);
        }
      }

      res.status(response.status).json(data);
    } catch (error: any) {
      console.error("Proxy Error:", error);
      res.status(500).json({ error: "Failed to fetch from Sorare API", details: error.message });
    }
  });

  // Proxy user salt query to Sorare API
  app.get("/api/sorare/users/:email", async (req, res) => {
    try {
      const response = await fetch(`https://api.sorare.com/api/v1/users/${encodeURIComponent(req.params.email)}`);
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error("Salt Proxy Error:", error);
      res.status(500).json({ error: "Failed to fetch salt from Sorare API", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express 5 routing for wildcard
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
