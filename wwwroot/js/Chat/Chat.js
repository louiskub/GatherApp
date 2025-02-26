let connection;
let userId = getUserIdFromCookie();
let currentPostId = null;

async function startConnection() {
    try {
        connection = new signalR.HubConnectionBuilder()
            .withUrl("/chathub", { withCredentials: true }) 
            .withAutomaticReconnect()
            .build();

        console.log("Connecting to SignalR...");
        await connection.start();
        console.log("Connected to ChatHub");

        setupListeners();
    } catch (err) {
        console.error("Connection failed: ", err);
        setTimeout(startConnection, 5000);
    }
}

startConnection();

function setupListeners() {
    if (!connection) {
        console.error("Connection is not initialized!");
        return;
    }

    connection.on("ReceiveMessage", (username, message, sentAt) => {
        console.log("Message received from server:", username, message, sentAt);

        let chatBox = document.getElementById("chatBox");
        if (!chatBox) {
            console.error("chatBox not found!");
            return;
        }

        if (!username || !message || !sentAt) {
            console.error("❌ Missing data from server:", { username, message, sentAt });
            return;
        }

        let formattedTime = new Date(sentAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, 
        });

        let messageElement = document.createElement("div");
        messageElement.classList.add("chatMessage");
        messageElement.innerHTML = `<strong>${username}:</strong> ${message} <small>(${formattedTime})</small>`;

        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    connection.on("LoadPreviousMessages", (messages) => {
        console.log("Messages received from server:", messages); // Debug
    
        const chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = ""; 
    
        messages.forEach(({ username, message, sentAt }) => {
            console.log(`🔎 UserId: ${username}, Message: ${message}, SentAt: ${sentAt}`);
    
            // ตรวจสอบค่า sentAt
            let timeString = "Unknown Time";
            if (sentAt) {
                try {
                    let date = new Date(sentAt);
                    if (!isNaN(date.getTime())) {
                        timeString = date.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false
                        });
                    } else {
                        console.error("⚠️ Invalid Date Format:", sentAt);
                    }
                } catch (error) {
                    console.error("⛔ Error parsing date:", error, "Raw value:", sentAt);
                }
            }
    
            chatBox.innerHTML += `<p><strong>${username}:</strong> ${message} <small>(${timeString})</small></p>`;
        });
    
        chatBox.scrollTop = chatBox.scrollHeight;
    });
    
    connection.on("Error", (errorMessage) => {
        alert("Error: " + errorMessage);
    });
    
    console.log("✅ Listeners set up!");
    }

async function joinChat() {
    currentPostId = document.getElementById("postIdInput").value.trim();
    if (!currentPostId) {
        alert("Please enter a Post ID.");
        return;
    }

    try {
        await connection.invoke("JoinChat", currentPostId);
        document.getElementById("chatBox").innerHTML = ""; // ล้างแชทก่อนโหลดใหม่
        loadPreviousMessages();
    } catch (err) {
        alert("Failed to join chat: " + err);
    }
}

async function sendMessage() {
    if (!currentPostId) {
        alert("You must join a chat first.");
        return;
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
        alert("Cannot send message. Not connected to the chat server.");
        return;
    }

    const message = document.getElementById("messageInput").value.trim();
    if (!message) return;

    try {
        await connection.invoke("SendMessage", currentPostId, message); 
        document.getElementById("messageInput").value = "";
    } catch (err) {
        console.error("Failed to send message: ", err);
    }
}

async function loadPreviousMessages() {
    if (!currentPostId) return;
    try {
        await connection.invoke("LoadPreviousMessages", currentPostId);
    } catch (err) {
        console.error("Failed to load messages: ", err);
    }
}

function getUserIdFromCookie() {
    let cookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!cookie) {
        console.warn("JWT Token not found in cookies!");
        return null;
    }

    let token = cookie.split('=')[1];
    let payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.userId;
}
