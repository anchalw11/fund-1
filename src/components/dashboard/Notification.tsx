import { X } from 'lucide-react';
import { useState } from 'react';

interface NotificationProps {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  onClose: () => void;
}

export default function Notification({ title, message, type, onClose }: NotificationProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  const baseClasses = 'p-4 rounded-lg border flex items-start space-x-4';
  const typeClasses = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex-1">
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm">{message}</p>
      </div>
      <button onClick={() => { setVisible(false); onClose(); }} className="p-1 hover:bg-white/10 rounded-full">
        <X size={18} />
      </button>
    </div>
  );
}
