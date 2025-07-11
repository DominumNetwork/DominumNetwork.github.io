import { users, messages, bannedUsers, type User, type InsertUser, type Message, type InsertMessage, type BannedUser, type InsertBannedUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Message methods
  getMessages(limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearMessages(): Promise<void>;
  
  // Banned user methods
  getBannedUsers(): Promise<BannedUser[]>;
  getBannedUser(username: string): Promise<BannedUser | undefined>;
  banUser(user: InsertBannedUser): Promise<BannedUser>;
  unbanUser(username: string): Promise<void>;
  isUserBanned(username: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private bannedUsers: Map<string, BannedUser>;
  private currentUserId: number;
  private currentMessageId: number;
  private currentBannedId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.bannedUsers = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentBannedId = 1;
    
    // Add demo messages with ranks
    this.seedDemoMessages();
  }
  
  private seedDemoMessages() {
    const demoMessages = [
      {
        id: 1,
        username: "Dominus_Elitus",
        message: "Welcome to Chatlify Relay! The new unified chat system is now live.",
        timestamp: Date.now() - 300000,
        tag: "DISCORD" as const,
        rank: "owner",
        customTags: null
      },
      {
        id: 2,
        username: "meancraft",
        message: "Great work on the integration! The rank system looks perfect.",
        timestamp: Date.now() - 240000,
        tag: "DISCORD" as const,
        rank: "developer",
        customTags: null
      },
      {
        id: 3,
        username: "TestUser",
        message: "Testing the web interface - looks amazing!",
        timestamp: Date.now() - 180000,
        tag: "WEB" as const,
        rank: "member",
        customTags: null
      },
      {
        id: 4,
        username: "Light slayer",
        message: "All moderation tools are working correctly.",
        timestamp: Date.now() - 120000,
        tag: "DISCORD" as const,
        rank: "head-admin",
        customTags: null
      }
    ];
    
    demoMessages.forEach(msg => {
      this.messages.set(msg.id, msg);
    });
    this.currentMessageId = 5;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMessages(limit = 100): Promise<Message[]> {
    const allMessages = Array.from(this.messages.values())
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return limit ? allMessages.slice(-limit) : allMessages;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id,
      rank: insertMessage.rank || null,
      customTags: insertMessage.customTags || null
    };
    this.messages.set(id, message);
    return message;
  }

  async clearMessages(): Promise<void> {
    this.messages.clear();
  }

  async getBannedUsers(): Promise<BannedUser[]> {
    return Array.from(this.bannedUsers.values());
  }

  async getBannedUser(username: string): Promise<BannedUser | undefined> {
    return this.bannedUsers.get(username);
  }

  async banUser(insertBannedUser: InsertBannedUser): Promise<BannedUser> {
    const id = this.currentBannedId++;
    const bannedUser: BannedUser = {
      ...insertBannedUser,
      id,
      bannedAt: Date.now(),
    };
    this.bannedUsers.set(insertBannedUser.username, bannedUser);
    return bannedUser;
  }

  async unbanUser(username: string): Promise<void> {
    this.bannedUsers.delete(username);
  }

  async isUserBanned(username: string): Promise<boolean> {
    return this.bannedUsers.has(username);
  }
}

export const storage = new MemStorage();
