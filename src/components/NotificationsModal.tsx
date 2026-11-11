import React from 'react';
import { Bell, X, Flame, Heart, UserPlus, Gift, MessageCircle, Check } from 'lucide-react';
import { NotificationItem } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkAllRead,
  onNotificationClick,
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'streak_alert':
        return <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-cyan-400" />;
      case 'gift':
        return <Gift className="w-4 h-4 text-purple-400" />;
      default:
        return <MessageCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-[#0c0d14] border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl max-h-[80vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onMarkAllRead();
                audioEngine.playLikeSound();
              }}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60 space-y-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onNotificationClick(notif)}
              className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                notif.read ? 'hover:bg-slate-900/40 text-slate-400' : 'bg-purple-950/20 text-white hover:bg-purple-950/30'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={notif.actor.avatar}
                  alt={notif.actor.displayName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0c0d14] border border-slate-800 flex items-center justify-center">
                  {getIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed">
                  <span className="font-bold text-white">{notif.actor.displayName} </span>
                  <span className="text-slate-300">{notif.text}</span>
                </p>
                <span className="text-[10px] text-slate-500 mt-0.5 block">{notif.timestamp}</span>
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
