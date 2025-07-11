import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  Collection,
} from "discord.js";
import "dotenv/config";
import admin from "firebase-admin";
import fetch from 'node-fetch';

// Firebase setup
admin.initializeApp({

  credential: admin.credential.applicationDefault(),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

const db = admin.database();
const chatRef = db.ref("messages");
const banRef = db.ref("bannedUsers");
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1353489805648068668/npcIVghnuD1D9t-erZbxOCIxRfksWhlIQWbKL5hCMXRg1h2ABTrmqI76VgI9bVp70pyF';

// Discord setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Relay messages from Discord to Firebase
client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.id !== process.env.DISCORD_CHANNEL_ID) return;

  const bannedSnap = await banRef.once("value");
  const bannedUsers = bannedSnap.val() || [];

  const username = msg.author.username;
  if (bannedUsers.includes(username)) return;

  await chatRef.push({
    username,
    message: msg.content,
    timestamp: Date.now(),
    tag: "DISCORD",
  });
});

// Slash command for /clear, /ban, /unban
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "clear") {
    await chatRef.remove();
    await interaction.reply("🧹 Chat cleared.");
  }

  if (commandName === "ban") {
    const user = options.getString("user");
    const snap = await banRef.once("value");
    const current = snap.val() || [];
    if (!current.includes(user)) {
      current.push(user);
      await banRef.set(current);
    }
    await interaction.reply(`❌ Banned user: ${user}`);
  }

  if (commandName === "unban") {
    const user = options.getString("user");
    const snap = await banRef.once("value");
    let current = snap.val() || [];
    current = current.filter((u) => u !== user);
    await banRef.set(current);
    await interaction.reply(`✅ Unbanned user: ${user}`);
  }
});

// Login
client.login(process.env.DISCORD_TOKEN);
