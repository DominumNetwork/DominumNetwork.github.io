import { Client, GatewayIntentBits, Events, Collection, SlashCommandBuilder, REST, Routes } from "discord.js";
import { storage } from "../storage";
import { firebaseService } from "./firebase";
import { getUserRank } from "@shared/ranks";

export class DiscordService {
  private client: Client;
  private isConnected = false;
  private messageHandlers: ((message: any) => void)[] = [];

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log(`🤖 Discord bot logged in as ${this.client.user?.tag}`);
      this.isConnected = true;
      this.registerSlashCommands();
    });

    this.client.on(Events.MessageCreate, async (msg) => {
      if (msg.author.bot) return;
      if (msg.channel.id !== process.env.DISCORD_CHANNEL_ID) return;

      const username = msg.author.username;
      
      // Check if user is banned
      const isBanned = await storage.isUserBanned(username);
      if (isBanned) return;

      const messageData = {
        username,
        message: msg.content,
        timestamp: Date.now(),
        tag: "DISCORD" as const,
        rank: getUserRank(username),
        customTags: null,
      };

      // Store in local storage
      await storage.createMessage(messageData);
      
      // Store in Firebase
      await firebaseService.saveMessage(messageData);

      // Notify all message handlers (WebSocket connections)
      this.messageHandlers.forEach(handler => handler(messageData));
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const { commandName, options } = interaction;

      try {
        if (commandName === "clear") {
          await storage.clearMessages();
          await firebaseService.clearMessages();
          await interaction.reply("🧹 Chat cleared.");
        }

        if (commandName === "ban") {
          const user = options.getString("user");
          if (!user) {
            await interaction.reply("❌ Please provide a username.");
            return;
          }

          await storage.banUser({ username: user });
          await firebaseService.banUser(user);
          await interaction.reply(`❌ Banned user: ${user}`);
        }

        if (commandName === "unban") {
          const user = options.getString("user");
          if (!user) {
            await interaction.reply("❌ Please provide a username.");
            return;
          }

          await storage.unbanUser(user);
          await firebaseService.unbanUser(user);
          await interaction.reply(`✅ Unbanned user: ${user}`);
        }
      } catch (error) {
        console.error("Error handling command:", error);
        await interaction.reply("❌ An error occurred while processing the command.");
      }
    });
  }

  private async registerSlashCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear all chat messages"),
      
      new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user from the chat")
        .addStringOption(option =>
          option.setName("user")
            .setDescription("Username to ban")
            .setRequired(true)
        ),
      
      new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user from the chat")
        .addStringOption(option =>
          option.setName("user")
            .setDescription("Username to unban")
            .setRequired(true)
        ),
    ];

    const rest = new REST().setToken(process.env.DISCORD_TOKEN || "");
    
    try {
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || ""),
        { body: commands }
      );
      console.log("✅ Discord slash commands registered");
    } catch (error) {
      console.error("❌ Error registering slash commands:", error);
    }
  }

  async connect() {
    if (!process.env.DISCORD_TOKEN) {
      console.log("💡 Discord token not provided - Discord integration disabled");
      console.log("   Set DISCORD_TOKEN environment variable to enable Discord features");
      return;
    }

    try {
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error("❌ Discord connection failed:", error);
      console.log("💡 Running without Discord integration - web chat only");
    }
  }

  async sendMessage(username: string, message: string): Promise<void> {
    if (!this.isConnected || !this.client.user) {
      throw new Error("Discord bot is not connected");
    }

    const channel = this.client.channels.cache.get(process.env.DISCORD_CHANNEL_ID || "");
    if (!channel || !channel.isTextBased()) {
      throw new Error("Discord channel not found or not a text channel");
    }

    await channel.send(`**${username}**: ${message}`);
  }

  onMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler);
  }

  isDiscordConnected(): boolean {
    return this.isConnected;
  }

  disconnect() {
    this.client.destroy();
    this.isConnected = false;
  }
}

export const discordService = new DiscordService();
