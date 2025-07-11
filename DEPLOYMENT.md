# Chatlify Relay - GitHub Deployment Guide

## Quick Setup Steps

### 1. Create GitHub Repository
```bash
# In your project directory
git init
git add .
git commit -m "Initial Chatlify Relay setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chatlify-relay.git
git push -u origin main
```

### 2. Configure GitHub Secrets
Go to: Repository → Settings → Secrets and variables → Actions

Add these secrets:

**Required Discord Secrets:**
- `DISCORD_TOKEN` = Your Discord bot token
- `DISCORD_CHANNEL_ID` = Your Discord channel ID

**Firebase Secrets (already provided):**
- `VITE_FIREBASE_API_KEY` = `AIzaSyD5vw97X6s1zFG4acJd5vFZ-gtW0JcMPaI`
- `VITE_FIREBASE_APP_ID` = `1:176144889050:web:93290107ab4ef56b67a1e3`
- `VITE_FIREBASE_PROJECT_ID` = `chatlify-database`
- `FIREBASE_DATABASE_URL` = `https://chatlify-database-default-rtdb.firebaseio.com`

### 3. Enable GitHub Pages
1. Go to Repository → Settings → Pages
2. Set Source to **"GitHub Actions"**
3. Save - your site will be available at `https://YOUR_USERNAME.github.io/chatlify-relay`

### 4. Discord Bot Setup

1. **Create Discord Application:**
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Name it "Chatlify Relay"
   - Go to "Bot" section
   - Click "Add Bot"
   - Copy the token → Add to GitHub secrets as `DISCORD_TOKEN`

2. **Bot Permissions:**
   - In Bot settings, enable these permissions:
     - Send Messages
     - Read Message History
     - Use Slash Commands
     - View Channels

3. **Invite Bot to Server:**
   - Go to "OAuth2" → "URL Generator"
   - Select "bot" and "applications.commands"
   - Select the permissions above
   - Copy the URL and invite bot to your server

4. **Get Channel ID:**
   - In Discord, enable Developer Mode (User Settings → Advanced)
   - Right-click the channel you want to use
   - Copy ID → Add to GitHub secrets as `DISCORD_CHANNEL_ID`

## How It Works

### Frontend (GitHub Pages)
- Your web chat interface will be hosted at `https://YOUR_USERNAME.github.io/chatlify-relay`
- Users can access it directly in their browser
- Connects to Firebase for real-time messages

### Backend (GitHub Actions)
- Discord bot runs continuously via GitHub Actions
- Automatically restarts every 15 minutes to stay alive
- Relays messages between Discord and Firebase

### Alternative: Embed Anywhere
Use `embed.html` for simple embedding:
```html
<!-- Copy this file to any web host -->
<!-- Works with: Google Sites, WordPress, GitHub Pages, etc. -->
```

## Troubleshooting

### Bot Not Connecting
1. Check Discord token in GitHub secrets
2. Ensure bot has proper permissions
3. Verify bot is invited to the correct server

### Messages Not Syncing
1. Check Firebase configuration
2. Verify channel ID is correct
3. Check GitHub Actions logs for errors

### Web Interface Not Loading
1. Ensure GitHub Pages is enabled
2. Check if build succeeded in Actions tab
3. Verify Firebase credentials

## Maintenance

The bot will automatically:
- Restart every 15 minutes via GitHub Actions
- Handle reconnections if Discord goes down
- Sync all messages to Firebase

## Cost
- **GitHub Pages**: Free
- **GitHub Actions**: 2000 minutes/month free (more than enough)
- **Firebase**: Free tier supports 100 concurrent users
- **Discord Bot**: Free

Total cost: **$0/month** for most usage!