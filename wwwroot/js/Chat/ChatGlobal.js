let connection;

async function startGlobalChatConnection() {
    try {
        connection = new signalR.HubConnectionBuilder()
            .withUrl("/globalChatHub", { withCredentials: true }) 
            .withAutomaticReconnect()
            .build();

        console.log("Connecting to Global Chat...");
        await connection.start();
        console.log("Connected to Global ChatHub");

        setupGlobalChatListeners();
    } catch (err) {
        console.error("Global Chat connection failed: ", err);
        setTimeout(startGlobalChatConnection, 5000);
    }
}

startGlobalChatConnection();

function setupGlobalChatListeners() {
    if (!connection) {
        console.error("Connection is not initialized!");
        return;
    }

    connection.on("ReceiveGlobalMessage", (username, message, sentAt, profileImageUrl) => {
        console.log("[DEBUG] ReceiveGlobalMessage:", { username, message, sentAt, profileImageUrl });
        appendGlobalMessage(username, message, sentAt, profileImageUrl);
    });

    connection.on("LoadGlobalMessages", (messages) => {
        if (!Array.isArray(messages)) {
            console.error("Invalid response from server! Expected array but got:", messages);
            return;
        }

        const chatBox = document.getElementById("globalChatBox");
        chatBox.innerHTML = ""; 

        messages.forEach((msg) => {
            appendGlobalMessage(msg.username, msg.message, msg.sentAt, msg.profileImg);
        });
    });

    connection.on("Error", (errorMessage) => {
        alert("Error: " + errorMessage);
    });

    console.log("Global Chat listeners set up!");
}

function appendGlobalMessage(username, message, sentAt, profileImageUrl) {
    console.log("Adding global message:", { username, message, sentAt, profileImageUrl });
    let chatBox = document.getElementById("globalChatBox");
    if (!chatBox) {
        console.error("globalChatBox not found!");
        return;
    }

    let formattedTime = "Unknown Time";
    try {
        let date = new Date(sentAt);
        if (!isNaN(date.getTime())) {
            formattedTime = date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });
        } else {
            console.error("Invalid Date Format:", sentAt);
        }
    } catch (error) {
        console.error("Error parsing date:", error, "Raw value:", sentAt);
    }

    let messageElement = document.createElement("div");
    messageElement.classList.add("chatMessage");
    messageElement.innerHTML = `
        <img src="${profileImageUrl}" alt="Profile" class="profile-pic">
        <div class="message-details">
            <div class="message-header">
                <strong class="username">${username}</strong>
                <small class="message-time">${formattedTime}</small>
            </div>
            <div class="message-content">
                <p class="message-text">${message}</p>
            </div>
        </div>
    `;
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendGlobalMessage() {
    if (connection.state !== signalR.HubConnectionState.Connected) {
        alert("Cannot send message. Not connected to the chat server.");
        return;
    }

    const message = document.getElementById("globalMessageInput").value.trim();
    if (!message) return;

    try {
        await connection.invoke("SendGlobalMessage", message); 
        document.getElementById("globalMessageInput").value = "";
    } catch (err) {
        console.error("Failed to send global message: ", err);
    }
}

async function loadGlobalMessages() {
    try {
        console.log("Sending LoadGlobalMessages request");
        await connection.invoke("LoadGlobalMessages");
    } catch (err) {
        console.error("Failed to load global messages:", err);
    }
}
