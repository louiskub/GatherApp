let connection;
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
        getUserChats();
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


    connection.on("LoadUserChats", (postIds) => {
        console.log("[DEBUG] Joined Posts:", postIds); // <-- เพิ่ม debug
        if (!Array.isArray(postIds) || postIds.length === 0) {
            console.error("Invalid postIds received:", postIds);
            return;
        }

        let chatList = document.getElementById("chatList");
        chatList.innerHTML = "";
    
        if (postIds.length === 0) {
            chatList.innerHTML = "<li>No joined chats</li>";
            return;
        }
    
        postIds.forEach( postId => {
            console.log("[DEBUG] Processing Post ID:", postId, "Type:", typeof postId);

            if (!postId || isNaN(postId)) {
                console.error("Invalid Post ID:", postId);
                return;
            }

            let chatItem = document.createElement("li");
            chatItem.textContent = `Post ${postId}`;
            chatItem.classList.add("chatItem");
            chatItem.onclick = () => {
                console.log("🖱️ Clicked on Post ID:", postId.toString());
                joinChat(parseInt(postId));
            };
            chatList.appendChild(chatItem);
        });
    });

    function appendMessage(IsMine, username, message, sentAt, profileImageUrl) {
        console.log("Adding message:", { IsMine, username, message, sentAt, profileImageUrl });
    
        let chatBox = document.getElementById("chatBox");
        if (!chatBox) {
            console.error("chatBox not found!");
            return;
        }
    
        if (!username || !message || !sentAt) {
            console.error("Missing data:", { username, message, sentAt });
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
                console.error("⚠️ Invalid Date Format:", sentAt);
            }
        } catch (error) {
            console.error("Error parsing date:", error, "Raw value:", sentAt);
        }
        
        let isMine = Boolean(IsMine);
    
        let messageElement = document.createElement("div");
        messageElement.classList.add("chatMessage");
        if (isMine) {
        messageElement.classList.add("my-message");
        } else {
            messageElement.classList.add("other-message");
        }
    
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
    
    connection.on("ReceiveMessage", (isMine,username, message, sentAt, profileImageUrl) => {
        console.log("[DEBUG] ReceiveMessage:", { isMine, username, message, sentAt, profileImageUrl });
        appendMessage(isMine,username, message, sentAt, profileImageUrl);
    });
    
    connection.on("LoadPreviousMessages", (messages) => {

        console.log("[DEBUG] Raw messages received:", messages); 
        console.log("[DEBUG] First message structure:", messages[0]); // 👀 ดูโครงสร้างข้อมูล
    
        if (!Array.isArray(messages)) {
            console.error("Invalid response from server! Expected array but got:", messages);
            return;
        }
    
        const chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = ""; 
    
        messages.forEach((msg) => {
            let isMine = msg.IsMine ?? msg.isMine ?? false;
            appendMessage(isMine, msg.username, msg.message, msg.sentAt, msg.profileImg);
        });
    });
    
    connection.on("Error", (errorMessage) => {
        alert("Error: " + errorMessage);
    });
    
    console.log("Listeners set up!");
    }   

    async function joinChat(postId) {
        console.log("joinChat() called with PostID:", postId);
    
        if (!postId) {
            alert("No available chat to join.");
            return;
        }
    
        console.log("Auto-joining Post ID:", postId);
    
        try {
            console.log("Calling JoinChat with PostID:", postId);
            await connection.invoke("JoinChat", postId.toString()); // 🔥 แปลงเป็น string
    
            console.log("Successfully joined chat with PostID:", postId);
            currentPostId = postId;
            document.getElementById("chatBox").innerHTML = "";
    
            loadPreviousMessages(postId); 
        } catch (err) {
            console.error("Failed to join chat:", err);
            alert("Failed to join chat: " + err);
        }
    }
    

async function getUserChats() {
    console.log("Fetching user chats...");
    try {
        await connection.invoke("GetUserChats");
    } catch (err) {
        console.error("Failed to fetch user chats:", err);
    }
}

async function sendMessage() {
    console.log("postId before sending:", currentPostId);
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
        console.log("Sending LoadPreviousMessages request with postId:", currentPostId);
        await connection.invoke("LoadPreviousMessages", currentPostId);
    } catch (err) {
        console.error("Failed to load messages:", err);
        console.error("Full error details:", JSON.stringify(err, null, 2));
    }
}
