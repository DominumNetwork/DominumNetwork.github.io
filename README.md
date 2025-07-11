# Chatlify Relay - Discord Web Chat Integration

A unified Discord-Web chat integration system that provides real-time bidirectional messaging between Discord and a web interface with rank systems and moderation tools.

## Features

- 🎮 **Discord Integration** - Seamless message relay between Discord and web
- 🌐 **Web Interface** - Modern React-based chat interface
- 👑 **Rank System** - Complete user ranking with custom colors and permissions
- 🛡️ **Moderation Tools** - Ban/unban users, clear messages, admin controls
- 🔥 **Firebase Integration** - Real-time message storage and sync
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Dark Theme** - Beautiful dark UI matching Discord aesthetics

## Rank System

The system includes a complete rank hierarchy:
- **OWNER** - Full system control
- **CO-OWNER** - Administrative privileges
- **DEVELOPER** - Development team members
- **HEAD-ADMIN** - Senior administrators
- **ADMIN** - Standard administrators
- **HEAD-MOD** - Senior moderators
- **MOD** - Standard moderators
- **MEMBER** - Regular users
- **GUEST** - Temporary users

## GitHub Pages Setup

### 1. Repository Setup

1. Create a new repository on GitHub
2. Push this code to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial Chatlify Relay setup"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### 2. GitHub Secrets Configuration

Go to your repository → Settings → Secrets and variables → Actions, then add:

**Discord Secrets:**
- `DISCORD_TOKEN` - Your Discord bot token
- `DISCORD_CHANNEL_ID` - Discord channel ID for message relay

**Firebase Secrets:**
- `VITE_FIREBASE_API_KEY` - `AIzaSyD5vw97X6s1zFG4acJd5vFZ-gtW0JcMPaI`
- `VITE_FIREBASE_APP_ID` - `1:176144889050:web:93290107ab4ef56b67a1e3`
- `VITE_FIREBASE_PROJECT_ID` - `chatlify-database`
- `FIREBASE_DATABASE_URL` - `https://chatlify-database-default-rtdb.firebaseio.com`

### 3. Enable GitHub Pages

1. Go to Repository → Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy your site

### 4. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application and bot
3. Get your bot token and add it to GitHub secrets
4. Invite the bot to your server with appropriate permissions:
   - Send Messages
   - Read Message History
   - Use Slash Commands
5. Get the channel ID where you want the relay to work

## Deployment Options

### Option 1: GitHub Pages (Frontend) + GitHub Actions (Bot)
- Frontend hosted on GitHub Pages
- Discord bot runs via GitHub Actions
- Best for permanent hosting

### Option 2: Embeddable HTML
Use the `embed.html` file for simple embedding:
- Host the single HTML file anywhere
- Works with Google Sites, WordPress, etc.
- Direct Firebase integration

### Option 3: Full Stack Deployment
Deploy to platforms like Replit, Heroku, or Vercel for the full application.

## Environment Variables

Create a `.env` file with:

```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=your_discord_channel_id

# Firebase Configuration  
VITE_FIREBASE_API_KEY=AIzaSyD5vw97X6s1zFG4acJd5vFZ-gtW0JcMPaI
VITE_FIREBASE_APP_ID=1:176144889050:web:93290107ab4ef56b67a1e3
VITE_FIREBASE_PROJECT_ID=chatlify-database
FIREBASE_DATABASE_URL=https://chatlify-database-default-rtdb.firebaseio.com
```

## Discord Bot Commands

Available slash commands:
- `/clear` - Clear all chat messages (Admin only)
- `/ban <username>` - Ban a user from chat (Admin only)
- `/unban <username>` - Unban a user from chat (Admin only)

## Usage

1. Open the web interface
2. Set your username (or keep the auto-generated guest name)
3. Start chatting - messages sync between Discord and web in real-time
4. Admins can use moderation tools via the Admin panel

## File Structure

```
├── client/                 # React frontend
├── server/                 # Express backend & Discord bot
├── shared/                 # Shared types and utilities
├── embed.html             # Standalone embeddable version
├── .github/workflows/     # GitHub Actions configuration
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own Discord communities!