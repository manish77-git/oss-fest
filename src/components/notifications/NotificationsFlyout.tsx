'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Heart, 
  ArrowUp, 
  UserCheck, 
  Users, 
  Sparkles, 
  Check, 
  X,
  ShieldCheck
} from 'lucide-react';
import { CampusNotification } from '@/types';

interface NotificationsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: CampusNotification[];
  onNotificationClick: (notif: CampusNotification) => void;
}

export const NotificationsFlyout: React.FC<NotificationsFlyoutProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
}) => {
  const [notifList, setNotifList] = useState<CampusNotification[]>(notifications);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: CampusNotification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />;
      case 'upvote':
        return <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />;
      case 'mentorship':
        return <UserCheck className="w-3.5 h-3.5 text-purple-600" />;
      case 'teammate':
        return <Users className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Campus Notifications
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-2 overflow-y-auto divide-y divide-neutral-50 dark:divide-neutral-900 flex-1">
          {notifList.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onNotificationClick(item);
                onClose();
              }}
              className={`p-3 rounded-2xl flex items-start gap-3 cursor-pointer transition-colors ${
                !item.read
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <div className="relative">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-indigo-500" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-neutral-950 shadow-xs">
                  {getIcon(item.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-neutral-400">{item.timeAgo}</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
                  {item.description}
                </p>
              </div>

              {!item.read && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
