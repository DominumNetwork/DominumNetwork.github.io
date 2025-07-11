// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
var MemStorage = class {
  users;
  messages;
  bannedUsers;
  currentUserId;
  currentMessageId;
  currentBannedId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.messages = /* @__PURE__ */ new Map();
    this.bannedUsers = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentBannedId = 1;
    this.seedDemoMessages();
  }
  seedDemoMessages() {
    const demoMessages = [
      {
        id: 1,
        username: "Dominus_Elitus",
        message: "Welcome to Chatlify Relay! The new unified chat system is now live.",
        timestamp: Date.now() - 3e5,
        tag: "DISCORD",
        rank: "owner",
        customTags: null
      },
      {
        id: 2,
        username: "meancraft",
        message: "Great work on the integration! The rank system looks perfect.",
        timestamp: Date.now() - 24e4,
        tag: "DISCORD",
        rank: "developer",
        customTags: null
      },
      {
        id: 3,
        username: "TestUser",
        message: "Testing the web interface - looks amazing!",
        timestamp: Date.now() - 18e4,
        tag: "WEB",
        rank: "member",
        customTags: null
      },
      {
        id: 4,
        username: "Light slayer",
        message: "All moderation tools are working correctly.",
        timestamp: Date.now() - 12e4,
        tag: "DISCORD",
        rank: "head-admin",
        customTags: null
      }
    ];
    demoMessages.forEach((msg) => {
      this.messages.set(msg.id, msg);
    });
    this.currentMessageId = 5;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getMessages(limit = 100) {
    const allMessages = Array.from(this.messages.values()).sort((a, b) => a.timestamp - b.timestamp);
    return limit ? allMessages.slice(-limit) : allMessages;
  }
  async createMessage(insertMessage) {
    const id = this.currentMessageId++;
    const message = {
      ...insertMessage,
      id,
      rank: insertMessage.rank || null,
      customTags: insertMessage.customTags || null
    };
    this.messages.set(id, message);
    return message;
  }
  async clearMessages() {
    this.messages.clear();
  }
  async getBannedUsers() {
    return Array.from(this.bannedUsers.values());
  }
  async getBannedUser(username) {
    return this.bannedUsers.get(username);
  }
  async banUser(insertBannedUser) {
    const id = this.currentBannedId++;
    const bannedUser = {
      ...insertBannedUser,
      id,
      bannedAt: Date.now()
    };
    this.bannedUsers.set(insertBannedUser.username, bannedUser);
    return bannedUser;
  }
  async unbanUser(username) {
    this.bannedUsers.delete(username);
  }
  async isUserBanned(username) {
    return this.bannedUsers.has(username);
  }
};
var storage = new MemStorage();

// server/services/discord.ts
import { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes } from "discord.js";

// server/services/firebase.ts
import admin from "firebase-admin";
var FirebaseService = class {
  db;
  chatRef;
  banRef;
  isConnected = false;
  constructor() {
    this.initializeFirebase();
  }
  initializeFirebase() {
    try {
      if (!admin.apps.length) {
        const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://chatlify-database-default-rtdb.firebaseio.com";
        if (process.env.NODE_ENV === "development") {
          admin.initializeApp({
            databaseURL,
            projectId: process.env.VITE_FIREBASE_PROJECT_ID || "chatlify-database"
          });
        } else {
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL
          });
        }
      }
      this.db = admin.database();
      this.chatRef = this.db.ref("messages");
      this.banRef = this.db.ref("bannedUsers");
      this.isConnected = true;
      console.log("\u2705 Firebase initialized successfully");
    } catch (error) {
      console.error("\u274C Firebase initialization failed:", error);
      console.log("\u{1F4A1} Running in local storage mode - Firebase features disabled");
      this.isConnected = false;
    }
  }
  async saveMessage(messageData) {
    if (!this.isConnected) {
      throw new Error("Firebase is not connected");
    }
    try {
      await this.chatRef.push(messageData);
    } catch (error) {
      console.error("\u274C Error saving message to Firebase:", error);
      throw error;
    }
  }
  async clearMessages() {
    if (!this.isConnected) {
      throw new Error("Firebase is not connected");
    }
    try {
      await this.chatRef.remove();
    } catch (error) {
      console.error("\u274C Error clearing messages in Firebase:", error);
      throw error;
    }
  }
  async banUser(username) {
    if (!this.isConnected) {
      throw new Error("Firebase is not connected");
    }
    try {
      const snapshot = await this.banRef.once("value");
      const current = snapshot.val() || [];
      if (!current.includes(username)) {
        current.push(username);
        await this.banRef.set(current);
      }
    } catch (error) {
      console.error("\u274C Error banning user in Firebase:", error);
      throw error;
    }
  }
  async unbanUser(username) {
    if (!this.isConnected) {
      throw new Error("Firebase is not connected");
    }
    try {
      const snapshot = await this.banRef.once("value");
      let current = snapshot.val() || [];
      current = current.filter((u) => u !== username);
      await this.banRef.set(current);
    } catch (error) {
      console.error("\u274C Error unbanning user in Firebase:", error);
      throw error;
    }
  }
  async getBannedUsers() {
    if (!this.isConnected) {
      return [];
    }
    try {
      const snapshot = await this.banRef.once("value");
      return snapshot.val() || [];
    } catch (error) {
      console.error("\u274C Error getting banned users from Firebase:", error);
      return [];
    }
  }
  async getRecentMessages(limit = 100) {
    if (!this.isConnected) {
      return [];
    }
    try {
      const snapshot = await this.chatRef.limitToLast(limit).once("value");
      const messages2 = snapshot.val() || {};
      return Object.values(messages2);
    } catch (error) {
      console.error("\u274C Error getting messages from Firebase:", error);
      return [];
    }
  }
  isFirebaseConnected() {
    return this.isConnected;
  }
};
var firebaseService = new FirebaseService();

// shared/ranks.ts
var USER_RANKS = {
  "Dominus_Elitus": "owner",
  "meancraft": "developer",
  "mrbat8888": "developer",
  "Light slayer": "head-admin",
  "Ricplays": "admin",
  "Abyssal.": "admin",
  "VoidDestroyerXY": "head-admin"
};
function getUserRank(username) {
  if (USER_RANKS[username]) {
    return USER_RANKS[username];
  }
  if (username.startsWith("Guest")) {
    return "guest";
  }
  return "member";
}

// server/services/discord.ts
var DiscordService = class {
  client;
  isConnected = false;
  messageHandlers = [];
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });
    this.setupEventHandlers();
  }
  setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log(`\u{1F916} Discord bot logged in as ${this.client.user?.tag}`);
      this.isConnected = true;
      this.registerSlashCommands();
    });
    this.client.on(Events.MessageCreate, async (msg) => {
      if (msg.author.bot) return;
      if (msg.channel.id !== process.env.DISCORD_CHANNEL_ID) return;
      const username = msg.author.username;
      const isBanned = await storage.isUserBanned(username);
      if (isBanned) return;
      const messageData = {
        username,
        message: msg.content,
        timestamp: Date.now(),
        tag: "DISCORD",
        rank: getUserRank(username),
        customTags: null
      };
      await storage.createMessage(messageData);
      await firebaseService.saveMessage(messageData);
      this.messageHandlers.forEach((handler) => handler(messageData));
    });
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const { commandName, options } = interaction;
      try {
        if (commandName === "clear") {
          await storage.clearMessages();
          await firebaseService.clearMessages();
          await interaction.reply("\u{1F9F9} Chat cleared.");
        }
        if (commandName === "ban") {
          const user = options.getString("user");
          if (!user) {
            await interaction.reply("\u274C Please provide a username.");
            return;
          }
          await storage.banUser({ username: user });
          await firebaseService.banUser(user);
          await interaction.reply(`\u274C Banned user: ${user}`);
        }
        if (commandName === "unban") {
          const user = options.getString("user");
          if (!user) {
            await interaction.reply("\u274C Please provide a username.");
            return;
          }
          await storage.unbanUser(user);
          await firebaseService.unbanUser(user);
          await interaction.reply(`\u2705 Unbanned user: ${user}`);
        }
      } catch (error) {
        console.error("Error handling command:", error);
        await interaction.reply("\u274C An error occurred while processing the command.");
      }
    });
  }
  async registerSlashCommands() {
    const commands = [
      new SlashCommandBuilder().setName("clear").setDescription("Clear all chat messages"),
      new SlashCommandBuilder().setName("ban").setDescription("Ban a user from the chat").addStringOption(
        (option) => option.setName("user").setDescription("Username to ban").setRequired(true)
      ),
      new SlashCommandBuilder().setName("unban").setDescription("Unban a user from the chat").addStringOption(
        (option) => option.setName("user").setDescription("Username to unban").setRequired(true)
      )
    ];
    const rest = new REST().setToken(process.env.DISCORD_TOKEN || "");
    try {
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || ""),
        { body: commands }
      );
      console.log("\u2705 Discord slash commands registered");
    } catch (error) {
      console.error("\u274C Error registering slash commands:", error);
    }
  }
  async connect() {
    if (!process.env.DISCORD_TOKEN) {
      console.log("\u{1F4A1} Discord token not provided - Discord integration disabled");
      console.log("   Set DISCORD_TOKEN environment variable to enable Discord features");
      return;
    }
    try {
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error("\u274C Discord connection failed:", error);
      console.log("\u{1F4A1} Running without Discord integration - web chat only");
    }
  }
  async sendMessage(username, message) {
    if (!this.isConnected || !this.client.user) {
      throw new Error("Discord bot is not connected");
    }
    const channel = this.client.channels.cache.get(process.env.DISCORD_CHANNEL_ID || "");
    if (!channel || !channel.isTextBased()) {
      throw new Error("Discord channel not found or not a text channel");
    }
    await channel.send(`**${username}**: ${message}`);
  }
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }
  isDiscordConnected() {
    return this.isConnected;
  }
  disconnect() {
    this.client.destroy();
    this.isConnected = false;
  }
};
var discordService = new DiscordService();

// shared/schema.ts
import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  message: text("message").notNull(),
  timestamp: integer("timestamp").notNull(),
  tag: text("tag").notNull(),
  // "DISCORD" or "WEB"
  rank: text("rank"),
  // User rank/role
  customTags: text("custom_tags").array()
  // Custom tags array
});
var bannedUsers = pgTable("banned_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  bannedAt: integer("banned_at").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true
});
var insertBannedUserSchema = createInsertSchema(bannedUsers).omit({
  id: true,
  bannedAt: true
});

// server/routes.ts
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  try {
    await discordService.connect();
  } catch (error) {
    console.error("Failed to connect to Discord:", error);
  }
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    console.log("New WebSocket connection established");
    ws.send(JSON.stringify({
      type: "connection_status",
      data: {
        discord: discordService.isDiscordConnected(),
        firebase: firebaseService.isFirebaseConnected(),
        websocket: true
      }
    }));
    storage.getMessages(50).then((messages2) => {
      ws.send(JSON.stringify({
        type: "initial_messages",
        data: messages2
      }));
    });
    storage.getBannedUsers().then((bannedUsers2) => {
      ws.send(JSON.stringify({
        type: "banned_users",
        data: bannedUsers2
      }));
    });
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        switch (message.type) {
          case "send_message":
            await handleSendMessage(message.data, ws);
            break;
          case "ban_user":
            await handleBanUser(message.data, ws);
            break;
          case "unban_user":
            await handleUnbanUser(message.data, ws);
            break;
          case "clear_messages":
            await handleClearMessages(ws);
            break;
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
        ws.send(JSON.stringify({
          type: "error",
          data: { message: "Failed to process message" }
        }));
      }
    });
    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });
  discordService.onMessage((messageData) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: "new_message",
          data: messageData
        }));
      }
    });
  });
  async function handleSendMessage(data, ws) {
    try {
      const validatedData = insertMessageSchema.parse({
        ...data,
        timestamp: Date.now(),
        tag: "WEB",
        rank: getUserRank(data.username),
        customTags: null
      });
      const isBanned = await storage.isUserBanned(validatedData.username);
      if (isBanned) {
        ws.send(JSON.stringify({
          type: "error",
          data: { message: "User is banned" }
        }));
        return;
      }
      const message = await storage.createMessage(validatedData);
      await firebaseService.saveMessage(validatedData);
      await discordService.sendMessage(validatedData.username, validatedData.message);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "new_message",
            data: message
          }));
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
      ws.send(JSON.stringify({
        type: "error",
        data: { message: "Failed to send message" }
      }));
    }
  }
  async function handleBanUser(data, ws) {
    try {
      const validatedData = insertBannedUserSchema.parse(data);
      const bannedUser = await storage.banUser(validatedData);
      await firebaseService.banUser(validatedData.username);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "user_banned",
            data: bannedUser
          }));
        }
      });
    } catch (error) {
      console.error("Error banning user:", error);
      ws.send(JSON.stringify({
        type: "error",
        data: { message: "Failed to ban user" }
      }));
    }
  }
  async function handleUnbanUser(data, ws) {
    try {
      await storage.unbanUser(data.username);
      await firebaseService.unbanUser(data.username);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "user_unbanned",
            data: { username: data.username }
          }));
        }
      });
    } catch (error) {
      console.error("Error unbanning user:", error);
      ws.send(JSON.stringify({
        type: "error",
        data: { message: "Failed to unban user" }
      }));
    }
  }
  async function handleClearMessages(ws) {
    try {
      await storage.clearMessages();
      await firebaseService.clearMessages();
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "messages_cleared",
            data: {}
          }));
        }
      });
    } catch (error) {
      console.error("Error clearing messages:", error);
      ws.send(JSON.stringify({
        type: "error",
        data: { message: "Failed to clear messages" }
      }));
    }
  }
  app2.get("/api/messages", async (req, res) => {
    try {
      const messages2 = await storage.getMessages();
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.get("/api/banned-users", async (req, res) => {
    try {
      const bannedUsers2 = await storage.getBannedUsers();
      res.json(bannedUsers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banned users" });
    }
  });
  app2.get("/api/status", async (req, res) => {
    res.json({
      discord: discordService.isDiscordConnected(),
      firebase: firebaseService.isFirebaseConnected(),
      websocket: true
    });
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
