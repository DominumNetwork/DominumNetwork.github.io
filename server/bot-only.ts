import { discordService } from "./services/discord";
import { firebaseService } from "./services/firebase";

// Simple bot-only server for GitHub Actions hosting
async function startBot() {
  console.log("🤖 Starting Chatlify Relay Discord Bot...");

  try {
    // Connect to Discord
    await discordService.connect();
    
    // Set up message relay
    discordService.onMessage(async (messageData) => {
      console.log(`📨 Discord message from ${messageData.username}: ${messageData.message}`);
      
      // Save to Firebase
      try {
        await firebaseService.saveMessage(messageData);
      } catch (error) {
        console.error("Error saving to Firebase:", error);
      }
    });

    console.log("✅ Discord bot is running and connected to Firebase");
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log("\n🛑 Shutting down Discord bot...");
      discordService.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Failed to start Discord bot:", error);
    process.exit(1);
  }
}

startBot();