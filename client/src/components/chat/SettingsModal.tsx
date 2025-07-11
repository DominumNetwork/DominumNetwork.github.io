import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuration Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discord Bot Token</label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  Set as <code className="bg-gray-200 px-1 rounded">DISCORD_TOKEN</code> in your environment
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discord Channel ID</label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  Set as <code className="bg-gray-200 px-1 rounded">DISCORD_CHANNEL_ID</code> in your environment
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Firebase Project ID</label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  Set as <code className="bg-gray-200 px-1 rounded">FIREBASE_PROJECT_ID</code> in your environment
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Codespaces Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>GitHub Codespaces Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>Create a new repository on GitHub with this code</li>
                  <li>Open the repository in GitHub Codespaces</li>
                  <li>Run <code className="bg-gray-200 px-1 rounded">npm install</code> to install dependencies</li>
                  <li>Create a <code className="bg-gray-200 px-1 rounded">.env</code> file with your environment variables</li>
                  <li>Configure Firebase service account credentials</li>
                  <li>Run <code className="bg-gray-200 px-1 rounded">npm run dev</code> to start the application</li>
                  <li>Access the web interface via the forwarded port</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
