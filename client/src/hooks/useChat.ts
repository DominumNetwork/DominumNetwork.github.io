import { useState, useEffect } from 'react';

export function useChat() {
  const [username, setUsername] = useState<string>('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    // Generate a random username if not set
    if (!username) {
      const randomId = Math.floor(Math.random() * 1000);
      setUsername(`WebUser_${randomId}`);
    }
  }, [username]);

  const toggleAdminPanel = () => {
    setIsAdminPanelOpen(prev => !prev);
  };

  const toggleSettingsModal = () => {
    setIsSettingsModalOpen(prev => !prev);
  };

  return {
    username,
    setUsername,
    isAdminPanelOpen,
    setIsAdminPanelOpen,
    toggleAdminPanel,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    toggleSettingsModal,
  };
}
