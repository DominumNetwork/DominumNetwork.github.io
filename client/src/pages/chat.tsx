import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { AdminPanel } from "@/components/chat/AdminPanel";
import { SettingsModal } from "@/components/chat/SettingsModal";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Chat() {
  const { 
    isConnected, 
    connectionStatus, 
    messages, 
    bannedUsers, 
    error,
    sendMessage,
    banUser,
    unbanUser,
    clearMessages
  } = useWebSocket();
  
  const {
    username,
    isAdminPanelOpen,
    toggleAdminPanel,
    isSettingsModalOpen,
    toggleSettingsModal
  } = useChat();

  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSendMessage = (username: string, message: string) => {
    sendMessage(username, message);
  };

  const handleBanUser = (username: string) => {
    banUser(username);
    toast({
      title: "User Banned",
      description: `${username} has been banned from the chat.`,
    });
  };

  const handleUnbanUser = (username: string) => {
    unbanUser(username);
    toast({
      title: "User Unbanned",
      description: `${username} has been unbanned.`,
    });
  };

  const handleClearMessages = () => {
    clearMessages();
    toast({
      title: "Messages Cleared",
      description: "All messages have been cleared from the chat.",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar 
        connectionStatus={connectionStatus}
        onSettingsClick={toggleSettingsModal}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <i className="fas fa-comments text-primary"></i>
                Chatlify Relay
              </h2>
              <p className="text-sm text-muted-foreground">
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <i className="fas fa-circle text-green-500 text-xs"></i>
                    Connected to relay
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <i className="fas fa-circle text-yellow-500 text-xs animate-pulse"></i>
                    Connecting...
                  </span>
                )} • {messages.length} messages
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{messages.length}</p>
                <p className="text-xs text-muted-foreground">Total Messages</p>
              </div>
              <Button
                onClick={toggleAdminPanel}
                variant="secondary"
                className="bg-secondary hover:bg-secondary/80"
              >
                <i className="fas fa-shield mr-2"></i>
                Admin
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <MessageList messages={messages} />
            <MessageInput 
              username={username}
              onSendMessage={handleSendMessage}
              disabled={!isConnected}
            />
          </div>

          {/* Admin Panel */}
          <AdminPanel
            isOpen={isAdminPanelOpen}
            onClose={toggleAdminPanel}
            bannedUsers={bannedUsers}
            onBanUser={handleBanUser}
            onUnbanUser={handleUnbanUser}
            onClearMessages={handleClearMessages}
            messageCount={messages.length}
            currentUser={username}
          />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={toggleSettingsModal}
      />
    </div>
  );
}
