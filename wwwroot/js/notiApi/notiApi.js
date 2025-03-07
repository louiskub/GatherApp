export async function fetchNotifications() {
    try {
        const response = await fetch("/api/user/notifications", {
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load notifications");
        }

        const data = await response.json();

        return data.map(noti => {
            const time = new Date(noti.createdAt);
            const formattedTime = time.toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });

            return {
                type: noti.type || "default", 
                title: noti.title || "Notification",
                message: noti.content,
                time: formattedTime 
            };
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}
