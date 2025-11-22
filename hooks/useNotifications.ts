// hooks/useNotifications.ts
import { useState, useEffect } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Polling como fallback
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications?limit=2");
        if (response.ok) {
          const data = await response.json();
          if (data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(
              data.notifications.filter((n: any) => !n.read).length
            );
          }
        }
      } catch (error) {
        console.log("Error fetching notifications");
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  return { notifications, unreadCount, setNotifications, setUnreadCount };
}
