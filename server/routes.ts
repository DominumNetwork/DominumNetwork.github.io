import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { discordService } from "./services/discord";
import { firebaseService } from "./services/firebase";
import { insertMessageSchema, insertBannedUserSchema } from "@shared/schema";
import { getUserRank } from "@shared/ranks";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize Discord service
  try {
    await discordService.connect();
  } catch (error) {
    console.error("Failed to connect to Discord:", error);
  }

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');

    // Send initial data
    ws.send(JSON.stringify({
      type: 'connection_status',
      data: {
        discord: discordService.isDiscordConnected(),
        firebase: firebaseService.isFirebaseConnected(),
        websocket: true,
      }
    }));

    // Send recent messages
    storage.getMessages(50).then(messages => {
      ws.send(JSON.stringify({
        type: 'initial_messages',
        data: messages
      }));
    });

    // Send banned users
    storage.getBannedUsers().then(bannedUsers => {
      ws.send(JSON.stringify({
        type: 'banned_users',
        data: bannedUsers
      }));
    });

    // Handle incoming messages
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'send_message':
            await handleSendMessage(message.data, ws);
            break;
          case 'ban_user':
            await handleBanUser(message.data, ws);
            break;
          case 'unban_user':
            await handleUnbanUser(message.data, ws);
            break;
          case 'clear_messages':
            await handleClearMessages(ws);
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Failed to process message' }
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Discord message handler
  discordService.onMessage((messageData) => {
    // Broadcast to all connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'new_message',
          data: messageData
        }));
      }
    });
  });

  async function handleSendMessage(data: any, ws: WebSocket) {
    try {
      const validatedData = insertMessageSchema.parse({
        ...data,
        timestamp: Date.now(),
        tag: 'WEB',
        rank: getUserRank(data.username),
        customTags: null
      });

      // Check if user is banned
      const isBanned = await storage.isUserBanned(validatedData.username);
      if (isBanned) {
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'User is banned' }
        }));
        return;
      }

      // Store message
      const message = await storage.createMessage(validatedData);
      
      // Save to Firebase
      await firebaseService.saveMessage(validatedData);

      // Send to Discord
      await discordService.sendMessage(validatedData.username, validatedData.message);

      // Broadcast to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            data: message
          }));
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Failed to send message' }
      }));
    }
  }

  async function handleBanUser(data: any, ws: WebSocket) {
    try {
      const validatedData = insertBannedUserSchema.parse(data);
      const bannedUser = await storage.banUser(validatedData);
      await firebaseService.banUser(validatedData.username);

      // Broadcast ban update
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'user_banned',
            data: bannedUser
          }));
        }
      });
    } catch (error) {
      console.error('Error banning user:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Failed to ban user' }
      }));
    }
  }

  async function handleUnbanUser(data: any, ws: WebSocket) {
    try {
      await storage.unbanUser(data.username);
      await firebaseService.unbanUser(data.username);

      // Broadcast unban update
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'user_unbanned',
            data: { username: data.username }
          }));
        }
      });
    } catch (error) {
      console.error('Error unbanning user:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Failed to unban user' }
      }));
    }
  }

  async function handleClearMessages(ws: WebSocket) {
    try {
      await storage.clearMessages();
      await firebaseService.clearMessages();

      // Broadcast clear update
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'messages_cleared',
            data: {}
          }));
        }
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Failed to clear messages' }
      }));
    }
  }

  // API Routes
  app.get('/api/messages', async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.get('/api/banned-users', async (req, res) => {
    try {
      const bannedUsers = await storage.getBannedUsers();
      res.json(bannedUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch banned users' });
    }
  });

  app.get('/api/status', async (req, res) => {
    res.json({
      discord: discordService.isDiscordConnected(),
      firebase: firebaseService.isFirebaseConnected(),
      websocket: true,
    });
  });

  return httpServer;
}
