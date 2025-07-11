# Chatlify Relay - Discord Web Chat Integration

## Overview

Chatlify Relay is a unified Discord-Web chat integration system that provides real-time bidirectional messaging between Discord and a web interface. The application features a Discord bot, web-based chat interface, user moderation tools, and persistent message storage with both Firebase and PostgreSQL database support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern single-page application using functional components and hooks
- **Tailwind CSS**: Utility-first CSS framework for responsive styling
- **Shadcn UI Components**: Pre-built, accessible UI component library
- **Wouter**: Lightweight client-side routing
- **TanStack React Query**: Server state management and caching

### Backend Architecture
- **Express.js Server**: RESTful API server with middleware for logging and error handling
- **WebSocket Server**: Real-time bidirectional communication using the `ws` library
- **Discord.js Bot**: Full-featured Discord bot with slash commands and message handling
- **Dual Database Support**: 
  - PostgreSQL with Drizzle ORM for primary data storage
  - Firebase Realtime Database for legacy compatibility and backup storage

### Build System
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Type-safe development across frontend and backend
- **ESBuild**: Production bundling for server code

## Key Components

### Chat Interface
- **Real-time Messaging**: Bidirectional message sync between Discord and web clients
- **Message History**: Persistent storage and retrieval of chat messages
- **User Management**: Username generation and display
- **Platform Identification**: Visual indicators showing message source (Discord/Web)

### Discord Integration
- **Bot Service**: Handles Discord API interactions and message relay
- **Slash Commands**: Admin commands for moderation within Discord
- **Channel Monitoring**: Listens to specific Discord channel for message events
- **User Ban Checking**: Validates user permissions before message relay

### Moderation System
- **Admin Panel**: Web-based interface for user management
- **Ban/Unban Users**: Real-time user moderation with immediate effect
- **Message Clearing**: Bulk message deletion functionality
- **Banned User List**: Visual management of restricted users

### WebSocket Communication
- **Real-time Updates**: Instant message delivery across all connected clients
- **Connection Status**: Live status indicators for Discord, Firebase, and WebSocket
- **Error Handling**: Graceful degradation and reconnection logic

## Data Flow

### Message Flow
1. **Discord → Web**: Discord bot receives message → stores in database → broadcasts via WebSocket → updates web clients
2. **Web → Discord**: Web client sends message → validates user → stores in database → sends to Discord channel → broadcasts to other web clients
3. **Persistence**: All messages stored in both PostgreSQL (primary) and Firebase (backup/legacy)

### Moderation Flow
1. **Ban User**: Admin action → updates database → broadcasts ban list → blocks future messages
2. **Clear Messages**: Admin action → clears database → broadcasts update → refreshes all clients

### Connection Management
1. **WebSocket Connection**: Client connects → receives initial data (messages, banned users, connection status)
2. **Discord Bot**: Connects on server start → maintains persistent connection → handles reconnection
3. **Database**: Multiple storage backends for redundancy and compatibility

## External Dependencies

### Discord Integration
- **Discord.js**: Official Discord API library for bot functionality
- **Discord Bot Token**: Required environment variable for authentication
- **Discord Channel ID**: Specific channel for message monitoring

### Firebase Services
- **Firebase Admin SDK**: Server-side Firebase integration
- **Firebase Realtime Database**: Legacy message and user storage
- **Firebase Project ID**: Required environment variable

### Database
- **PostgreSQL**: Primary database using Neon serverless
- **Drizzle ORM**: Type-safe database operations and migrations
- **Connection Pooling**: Efficient database connection management

### UI Framework
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Icon library for UI elements
- **React Hook Form**: Form validation and handling

## Deployment Strategy

### Development Environment
- **GitHub Codespaces**: Cloud-based development environment
- **Vite Dev Server**: Hot module replacement for fast development
- **Environment Variables**: Local `.env` file configuration

### Production Deployment
- **Single Server**: Express server serves both API and static files
- **WebSocket Integration**: WebSocket server runs on same HTTP server
- **Database Migrations**: Drizzle Kit for schema management
- **Build Process**: Vite builds frontend, ESBuild bundles backend

### Configuration Management
- **Environment Variables**: Centralized configuration for all services
- **Service Dependencies**: Graceful handling of missing services (Discord, Firebase)
- **Error Recovery**: Automatic reconnection and fallback mechanisms

### Scalability Considerations
- **Memory Storage Fallback**: In-memory storage when database unavailable
- **Service Isolation**: Independent service failures don't crash entire application
- **Real-time Performance**: WebSocket connections managed efficiently for multiple clients