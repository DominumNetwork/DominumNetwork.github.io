import { Card } from "@/components/ui/card";

interface ConnectionStatus {
  discord: boolean;
  firebase: boolean;
  websocket: boolean;
}

interface ChatSidebarProps {
  connectionStatus: ConnectionStatus;
  onSettingsClick: () => void;
}

export function ChatSidebar({ connectionStatus, onSettingsClick }: ChatSidebarProps) {
  const getStatusColor = (isConnected: boolean) => 
    isConnected ? "bg-green-500" : "bg-red-500";

  const getStatusText = (isConnected: boolean) => 
    isConnected ? "Connected" : "Disconnected";

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-comments text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-medium text-gray-900">Chatlify Relay</h1>
            <p className="text-sm text-gray-500">Discord Bridge</p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fab fa-discord text-indigo-500 text-lg"></i>
              <span className="text-sm font-medium text-gray-700">Discord</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 ${getStatusColor(connectionStatus.discord)} rounded-full`}></div>
              <span className={`text-xs font-medium ${connectionStatus.discord ? 'text-green-600' : 'text-red-600'}`}>
                {getStatusText(connectionStatus.discord)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-database text-orange-500 text-lg"></i>
              <span className="text-sm font-medium text-gray-700">Firebase</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 ${getStatusColor(connectionStatus.firebase)} rounded-full`}></div>
              <span className={`text-xs font-medium ${connectionStatus.firebase ? 'text-green-600' : 'text-red-600'}`}>
                {getStatusText(connectionStatus.firebase)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-plug text-blue-500 text-lg"></i>
              <span className="text-sm font-medium text-gray-700">WebSocket</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 ${getStatusColor(connectionStatus.websocket)} rounded-full`}></div>
              <span className={`text-xs font-medium ${connectionStatus.websocket ? 'text-green-600' : 'text-red-600'}`}>
                {connectionStatus.websocket ? 'Live' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary text-white">
            <i className="fas fa-comment-dots"></i>
            <span className="font-medium">Live Chat</span>
          </div>
          <button 
            onClick={onSettingsClick}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <i className="fas fa-cog"></i>
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>GitHub Codespaces Ready</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
