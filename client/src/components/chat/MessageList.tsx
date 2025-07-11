import { useEffect, useRef } from 'react';
import type { Message } from '@shared/schema';
import { getRankConfig } from '@shared/ranks';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPlatformIcon = (tag: string) => {
    return tag === 'DISCORD' ? 'fab fa-discord' : 'fas fa-user';
  };

  const getPlatformColor = (tag: string) => {
    return tag === 'DISCORD' ? 'bg-indigo-600' : 'bg-blue-600';
  };

  const getPlatformLabel = (tag: string) => {
    return tag === 'DISCORD' ? 'Discord' : 'Web';
  };

  const getPlatformLabelColor = (tag: string) => {
    return tag === 'DISCORD' ? 'bg-indigo-600' : 'bg-blue-600';
  };

  const getRankStyle = (rank: string | null) => {
    if (!rank) return { color: '#888', backgroundColor: '#333' };
    const config = getRankConfig(rank);
    return {
      color: config.color,
      backgroundColor: config.backgroundColor
    };
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <i className="fas fa-comments text-4xl text-gray-300 mb-4"></i>
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        </div>
      ) : (
        messages.map((message) => {
          const rankStyle = getRankStyle(message.rank);
          const rankConfig = message.rank ? getRankConfig(message.rank) : null;
          
          return (
            <div key={message.id} className="message-bubble message-enter flex items-start space-x-3 mb-4 p-4 rounded-lg transition-all duration-200 hover:shadow-lg">
              <div className={`w-10 h-10 ${getPlatformColor(message.tag)} rounded-full flex items-center justify-center flex-shrink-0 platform-badge`}>
                <i className={`${getPlatformIcon(message.tag)} text-white text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded">
                    {formatTime(message.timestamp)}
                  </span>
                  
                  {/* Rank Badge */}
                  {rankConfig && (
                    <span 
                      className="rank-badge inline-flex items-center px-2 py-1 rounded text-xs font-bold"
                      style={{
                        color: rankStyle.color,
                        backgroundColor: rankStyle.backgroundColor
                      }}
                    >
                      [{rankConfig.name}]
                    </span>
                  )}
                  
                  {/* Platform Badge */}
                  <span className={`platform-badge inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPlatformLabelColor(message.tag)} text-white`}>
                    <i className={`${getPlatformIcon(message.tag)} mr-1`}></i>
                    {getPlatformLabel(message.tag)}
                  </span>
                </div>
                
                <div className="mb-2">
                  <span className="font-bold text-foreground text-sm">{message.username}</span>
                  <span className="text-muted-foreground ml-1">:</span>
                </div>
                
                <p className="text-foreground leading-relaxed break-words">{message.message}</p>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
