import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
// import { createClient } from "graphql-ws";
// import WebSocket from "ws";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  
  // Setup Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected to Socket.IO:", socket.id);
    
    // Process Email/Password Authentication to obtain JWT
    socket.on("authenticate", async (data) => {
      console.log(`Client ${socket.id} authenticating using Email and Password...`);
      /*
      // == Architecture Reference for Real Implementation ==
      // [Step 1: API Request] Fetch Salt for User
      const saltResponse = await fetch("https://api.sorare.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query { currentUser { salt } }` // Adjust to actual salt query endpoint/params
        })
      });
      const saltData = await saltResponse.json();
      const userSalt = saltData?.data?.currentUser?.salt || "mock_salt";
      
      // [Step 2: Local Processing] Hash Password + Salt using bcrypt
      // const bcrypt = require('bcryptjs');
      // const hashedPassword = await bcrypt.hash(data.password, userSalt);
      
      // [Step 3: GraphQL] Request Login to obtain JWT token
      const loginResponse = await fetch("https://api.sorare.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation SignInMutation($input: signInInput!) {
            signIn(input: $input) {
              currentUser { slug }
              errors { message }
            }
          }`,
          variables: { input: { email: data.email, password: hashedPassword } }
        })
      });
      
      const jwtToken = loginResponse.headers.get('JWT-AUD-token'); // Varies based on API mechanism
      if (jwtToken) {
        socket.data.jwt = jwtToken;
        socket.emit("authenticated", { success: true });
      } else {
        socket.emit("authenticated", { success: false, error: "Authentication failed" });
      }
      */
      
      // Mocking successful authentication and JWT issuance
      setTimeout(() => {
        if (data.email && data.password) {
          socket.data.jwt = "MOCK_ISSUED_JWT_TOKEN";
          socket.emit("authenticated", { success: true });
          console.log(`Client ${socket.id} successfully authenticated. Mock JWT issued.`);
        } else {
          socket.emit("authenticated", { success: false, error: "Credentials required" });
        }
      }, 800);
    });

    socket.on("subscribe", (data) => {
      // Security Check: Only allow subscription if JWT is present
      if (!socket.data.jwt) {
        console.warn(`Client ${socket.id} attempted to subscribe without authentication. Rejecting.`);
        return;
      }
      
      console.log(`Client ${socket.id} subscribed to settings:`, data);
      socket.join("sorare-market");
      
      /*
      // == Real Subscriptions usage via graphql-ws ==
      const client = createClient({
        url: 'wss://ws.sorare.com/graphql',
        webSocketImpl: WebSocket,
        connectionParams: {
          Authorization: `Bearer ${socket.data.jwt}`,
        },
      });
      
      // Execute the subscribe query and route events back to the client via Socket.io
      // ...
      */
    });

    socket.on("unsubscribe", () => {
      socket.leave("sorare-market");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // MOCK MODE: Emit random events for preview purposes
  const mockPlayers = [
    "Kylian Mbappé", "Lionel Messi", "Erling Haaland", "Vinícius Júnior", 
    "Kevin De Bruyne", "Jude Bellingham", "Rodri", "Harry Kane", 
    "Mohamed Salah", "Takefusa Kubo", "Kaoru Mitoma", "Wataru Endo"
  ];
  
  const mockRarities = ["Limited", "Rare", "Super Rare", "Unique"];
  
  setInterval(() => {
    // Only emit to clients that have authenticated and joined the 'sorare-market' room
    const room = io.sockets.adapter.rooms.get("sorare-market");
    if (!room || room.size === 0) return;

    const player = mockPlayers[Math.floor(Math.random() * mockPlayers.length)];
    const rarity = mockRarities[Math.floor(Math.random() * mockRarities.length)];
    // ETH price slightly randomized between 0.001 and 1.000
    const ethPrice = (Math.random() * 0.1 + 0.001).toFixed(4);
    
    const payload = {
      data: {
        tokenOfferWasCreated: {
          id: `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          price: ethPrice,
          token: {
            player: {
              displayName: player,
              slug: player.toLowerCase().replace(/ /g, "-")
            },
            name: `${player} 2023-2024`,
            rarity: rarity
          },
          timestamp: new Date().toISOString()
        }
      }
    };
    
    io.to("sorare-market").emit("market-event", payload);
  }, 4000); // Emits every 4 seconds

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
