"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, Trash2, X, Briefcase, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: string | null;
  isRead: boolean;
  createdAt: string;
  alert?: {
    name: string;
  } | null;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=20");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "markRead",
          notificationIds,
        }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job_match":
        return <Briefcase className="h-4 w-4 text-green-500" />;
      case "system":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-zinc-400" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors"
      >
        <Bell className="h-5 w-5 text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Tout lire
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 hover:bg-zinc-800/50 transition-colors ${
                        !notif.isRead ? "bg-zinc-800/30" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.isRead ? "font-medium text-zinc-100" : "text-zinc-300"}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-600">
                              {formatDate(notif.createdAt)}
                            </span>
                            {notif.alert && (
                              <Badge variant="outline" className="text-[10px] py-0">
                                {notif.alert.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex gap-1">
                          {!notif.isRead && (
                            <button
                              onClick={() => markAsRead([notif.id])}
                              className="text-zinc-500 hover:text-green-500 p-1"
                              title="Marquer comme lu"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="text-zinc-500 hover:text-red-500 p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-zinc-700 bg-zinc-800/50">
              <a
                href="/parametres#alerts"
                className="block text-center text-xs text-zinc-400 hover:text-zinc-200"
              >
                Gérer mes alertes →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
