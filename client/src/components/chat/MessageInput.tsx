import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  username: string;
  onSendMessage: (username: string, message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ username, onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(username, message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="relative">
            <Input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              disabled={disabled}
              maxLength={500}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button type="button" className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-smile"></i>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Connected as: <strong>{username}</strong></span>
              <span>•</span>
              <span>{message.length}/500</span>
            </div>
          </div>
        </div>
        <Button 
          type="submit"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!message.trim() || disabled}
        >
          <i className="fas fa-paper-plane"></i>
        </Button>
      </form>
    </div>
  );
}
