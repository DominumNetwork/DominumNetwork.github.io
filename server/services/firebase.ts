import admin from "firebase-admin";

export class FirebaseService {
  private db: admin.database.Database;
  private chatRef: admin.database.Reference;
  private banRef: admin.database.Reference;
  private isConnected = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Initialize Firebase Admin
      if (!admin.apps.length) {
        const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://chatlify-database-default-rtdb.firebaseio.com";
        
        // For development, use certificate-free initialization
        if (process.env.NODE_ENV === 'development') {
          admin.initializeApp({
            databaseURL: databaseURL,
            projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'chatlify-database'
          });
        } else {
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: databaseURL,
          });
        }
      }

      this.db = admin.database();
      this.chatRef = this.db.ref("messages");
      this.banRef = this.db.ref("bannedUsers");
      this.isConnected = true;
      
      console.log("✅ Firebase initialized successfully");
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error);
      console.log("💡 Running in local storage mode - Firebase features disabled");
      this.isConnected = false;
    }
  }

  async saveMessage(messageData: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error("Firebase is not connected");
    }

    try {
      await this.chatRef.push(messageData);
    } catch (error) {
      console.error("❌ Error saving message to Firebase:", error);
      throw error;
    }
  }

  async clearMessages(): Promise<void> {
    if (!this.isConnected) {
      throw new Error("Firebase is not connected");
    }

    try {
      await this.chatRef.remove();
    } catch (error) {
      console.error("❌ Error clearing messages in Firebase:", error);
      throw error;
    }
  }

  async banUser(username: string): Promise<void> {
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
      console.error("❌ Error banning user in Firebase:", error);
      throw error;
    }
  }

  async unbanUser(username: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error("Firebase is not connected");
    }

    try {
      const snapshot = await this.banRef.once("value");
      let current = snapshot.val() || [];
      current = current.filter((u: string) => u !== username);
      await this.banRef.set(current);
    } catch (error) {
      console.error("❌ Error unbanning user in Firebase:", error);
      throw error;
    }
  }

  async getBannedUsers(): Promise<string[]> {
    if (!this.isConnected) {
      return [];
    }

    try {
      const snapshot = await this.banRef.once("value");
      return snapshot.val() || [];
    } catch (error) {
      console.error("❌ Error getting banned users from Firebase:", error);
      return [];
    }
  }

  async getRecentMessages(limit = 100): Promise<any[]> {
    if (!this.isConnected) {
      return [];
    }

    try {
      const snapshot = await this.chatRef.limitToLast(limit).once("value");
      const messages = snapshot.val() || {};
      return Object.values(messages);
    } catch (error) {
      console.error("❌ Error getting messages from Firebase:", error);
      return [];
    }
  }

  isFirebaseConnected(): boolean {
    return this.isConnected;
  }
}

export const firebaseService = new FirebaseService();
