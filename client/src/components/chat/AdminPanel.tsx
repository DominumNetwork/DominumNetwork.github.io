import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserMinus, UserPlus, Trash2, X } from "lucide-react";
import type { BannedUser } from '@shared/schema';
import { getUserRank, getRankConfig, isStaffRank } from '@shared/ranks';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bannedUsers: BannedUser[];
  onBanUser: (username: string) => void;
  onUnbanUser: (username: string) => void;
  onClearMessages: () => void;
  messageCount: number;
  currentUser?: string;
}

export function AdminPanel({ 
  isOpen, 
  onClose, 
  bannedUsers, 
  onBanUser, 
  onUnbanUser, 
  onClearMessages,
  messageCount,
  currentUser = "AdminUser"
}: AdminPanelProps) {
  const [banInput, setBanInput] = useState('');
  const [unbanInput, setUnbanInput] = useState('');

  if (!isOpen) return null;

  const userRank = getUserRank(currentUser);
  const userRankConfig = getRankConfig(userRank);
  const hasModPermissions = isStaffRank(userRank);

  if (!hasModPermissions) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-96 bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You need staff permissions to access the admin panel.
            </p>
            <p className="text-sm mt-2">
              Current rank: <span 
                className="font-bold px-2 py-1 rounded text-xs"
                style={{
                  color: userRankConfig.color,
                  backgroundColor: userRankConfig.backgroundColor
                }}
              >
                [{userRankConfig.name}]
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBanUser = () => {
    if (banInput.trim()) {
      onBanUser(banInput.trim());
      setBanInput('');
    }
  };

  const handleUnbanUser = () => {
    if (unbanInput.trim()) {
      onUnbanUser(unbanInput.trim());
      setUnbanInput('');
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={onClearMessages}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              <i className="fas fa-trash mr-2"></i>
              Clear All Messages
            </Button>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-900">User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Ban User Form */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="block text-xs font-medium text-gray-700 mb-2">Ban User</label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={banInput}
                  onChange={(e) => setBanInput(e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleBanUser}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  Ban
                </Button>
              </div>
            </div>

            {/* Unban User Form */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="block text-xs font-medium text-gray-700 mb-2">Unban User</label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={unbanInput}
                  onChange={(e) => setUnbanInput(e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleUnbanUser}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  Unban
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banned Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-900">Banned Users</CardTitle>
          </CardHeader>
          <CardContent>
            {bannedUsers.length === 0 ? (
              <p className="text-sm text-gray-500">No banned users</p>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {bannedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span className="text-gray-700">{user.username}</span>
                    <button
                      onClick={() => onUnbanUser(user.username)}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      <i className="fas fa-undo"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-900">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Messages:</span>
                <span className="font-medium">{messageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Banned Users:</span>
                <span className="font-medium">{bannedUsers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
