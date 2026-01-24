"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, Trash2, X, Briefcase, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
        return <Briefcase className="h-4 w-4 text-white" />;
      case "system":
        return <AlertCircle className="h-4 w-4 text-zinc-400" />;
      default:
        return <Bell className="h-4 w-4 text-zinc-500" />;
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
      {/* Bell Button Premium */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 rounded-xl border transition-all duration-300 group",
          isOpen ? "bg-white border-white text-black shadow-lg" : "bg-black border-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
        )}
      >
        <Bell className={cn("h-4 w-4 transition-transform group-active:scale-90", isOpen ? "text-black" : "text-zinc-500")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-black shadow-sm animate-in zoom-in duration-300">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Premium */}
      {isOpen && (
        <>
          {/* Backdrop épuré */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel Monaco-style */}
          <div className="absolute right-0 top-14 w-[400px] bg-black border border-zinc-900 rounded-2xl shadow-2xl z-50 max-h-[640px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 bg-zinc-950/50 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5" />
                  Notifications System
                </h3>
                {unreadCount > 0 && (
                  <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                    {unreadCount} signal{unreadCount > 1 ? "eux" : "ement"} non lu{unreadCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="h-8 px-3 rounded-lg border border-zinc-900 bg-black text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-50"
                  >
                    Mark all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full border border-zinc-900 flex items-center justify-center text-zinc-600 hover:text-white hover:border-zinc-700 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1 scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-full w-fit mx-auto opacity-20">
                    <Bell className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-[11px] font-bold text-zinc-700 uppercase tracking-widest">System Clear</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-900">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "group p-5 hover:bg-zinc-950 transition-all cursor-pointer relative",
                        !notif.isRead ? "bg-zinc-950/30" : "opacity-60 hover:opacity-100"
                      )}
                      onClick={() => !notif.isRead && markAsRead([notif.id])}
                    >
                      <div className="flex items-start gap-4">
                        {/* Indicateur non lu Premium */}
                        {!notif.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white" />
                        )}
                        
                        {/* Icône refined */}
                        <div className="flex-shrink-0">
                          <div className={cn(
                            "p-2.5 rounded-xl border transition-all duration-300",
                            notif.type === 'job_match' ? "bg-zinc-900 border-zinc-800 text-white" : "bg-black border-zinc-900 text-zinc-600"
                          )}>
                            {getNotificationIcon(notif.type)}
                          </div>
                        </div>
                        
                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-[13px] tracking-tight leading-tight",
                            !notif.isRead ? "font-bold text-zinc-100" : "font-semibold text-zinc-400"
                          )}>
                            {notif.title}
                          </p>
                          <p className="text-[12px] text-zinc-500 mt-1.5 leading-relaxed font-medium">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                              {formatDate(notif.createdAt)}
                            </span>
                            {notif.alert && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-zinc-950 text-zinc-600 border border-zinc-900">
                                {notif.alert.name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions refined */}
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="h-8 w-8 rounded-full border border-zinc-900 flex items-center justify-center text-zinc-700 hover:text-white hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Premium */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950/50">
              <a
                href="/parametres#alerts"
                className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] hover:text-white transition-all"
              >
                Configure Strategic Alerts
                <TrendingUp className="h-3 w-3" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
