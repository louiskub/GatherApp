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

    connection.on("ReceiveGlobalMessage", (isMine,username, message, sentAt, profileImageUrl) => {
        console.log("[DEBUG] ReceiveGlobalMessage:", {isMine, username, message, sentAt, profileImageUrl });
        appendGlobalMessage(isMine,username, message, sentAt, profileImageUrl);
    });

    connection.on("LoadPreviousGlobalMessages", (messages , postInvitations) => {
        console.log("[Debug] Received Messages from Server:", messages);
        console.log("[Debug] Received Post Invitations:", postInvitations);
    
        if (!Array.isArray(messages) || !Array.isArray(postInvitations)) {
            console.error("Invalid response from server! Messages or Post Invitations are not arrays.");
            return;
        }
    
        const chatBox = document.getElementById("globalChatBox");
        chatBox.innerHTML = ""; 
    
        // ✅ รวม messages และ postInvitations เป็น array เดียว
        const allItems = [
            ...messages.map(msg => ({
                type: "message",
                isMine: msg.IsMine ?? msg.isMine ?? false,
                username: msg.Username ?? msg.username ?? "Unknown",
                message: msg.Message ?? msg.message ?? "[No Message]",
                sentAt: msg.SentAt ?? msg.sentAt ?? new Date().toISOString(),
                profileImageUrl: msg.ProfileImg ?? msg.profileImg ?? "https://example.com/default-profile.jpg"
            })),
            ...postInvitations.map(inv => ({
                type: "invitation",
                postId: inv.postId ?? inv.PostId ?? null,
                postName: inv.postName ?? inv.PostName ?? "No Title",
                postDetail: inv.postDetail ?? inv.PostDetail ?? "No Details",
                username: inv.username ?? inv.Username ?? "Unknown",
                sentAt: inv.sentAt ?? inv.SentAt ?? new Date().toISOString()
            }))
        ];
    
        console.log("[Debug] All items before sort:", allItems);
    
        allItems.forEach(item => item.sentAt = new Date(item.sentAt));
    
        allItems.forEach(item => {
            if (isNaN(item.sentAt.getTime())) {
                console.error("[ERROR] Invalid Date detected:", item);
            }
        });
    
        allItems.sort((a, b) => a.sentAt - b.sentAt);
    
        console.log("[Debug] All items after sort:", allItems);
    
        allItems.forEach(item => {
            if (item.type === "message") {
                appendGlobalMessage(item.isMine, item.username, item.message, item.sentAt.toISOString(), item.profileImageUrl);
            } else if (item.type === "invitation") {
                appendPostInvitation(item.postId, item.postName, item.postDetail, item.username);
            }
        });
    
        console.log("[Debug] Messages and invitations rendered.");
    });

    function appendPostInvitation(postId, postName, postDetail, username) {

        if (!postId || !postName || !postDetail || !username) {
            console.error("[ERROR] appendPostInvitation received undefined values", { postId, postName, postDetail, username });
            return;
        }
        const chatBox = document.getElementById("globalChatBox");
        const inviteContainer = document.createElement("div");
        inviteContainer.className = "post-invite";
    
        inviteContainer.innerHTML = `
            <p><strong>${username}</strong> is inviting users to apply for:</p>
            <div class="post-details">
                <h4>${postName}</h4>
                <p>${postDetail}</p>
                <button onclick="applyForPost('${postId}')">Apply</button>
            </div>
        `;
    
        chatBox.appendChild(inviteContainer);
    }
    

    

    connection.on("Error", (errorMessage) => {
        alert("Error: " + errorMessage);
    });

    console.log("Global Chat listeners set up!");
}

document.addEventListener("DOMContentLoaded", function () {
    loadUserPosts();
});

function loadUserPosts() {
    fetch("/api/user/getmyposts")
        .then(response => response.json())
        .then(posts => {
            const dropdown = document.getElementById("postSelectionDropdown");
            dropdown.innerHTML = `<option value="">-- Select a Post to Invite --</option>`;
            
            posts.forEach(post => {
                let option = document.createElement("option");
                option.value = post.id;
                option.textContent = post.postName;
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error("Error loading posts:", error));
}


function SendPostInvitation() {
    const dropdown = document.getElementById("postSelectionDropdown");
    let postId = dropdown.value;

    if (!postId) {
        alert("Please select a post first!");
        return;
    }

    postId = parseInt(postId, 10);
    console.log("[DEBUG] postId (before conversion):", postId, "Type:", typeof postId);
    connection.invoke("SendPostInvitation", postId)
    .catch(err => console.error("[ERROR] SendPostInvitation failed:", err));
}

connection.on("ReceivePostInvitation", (postId, postName, postDetail, username) => {
    const chatBox = document.getElementById("globalChatBox");
    const inviteContainer = document.createElement("div");
    inviteContainer.className = "post-invite";

    inviteContainer.innerHTML = `
        <p><strong>${username}</strong> is inviting users to apply for:</p>
        <div class="post-details">
            <h4>${postName}</h4>
            <p>${postDetail}</p>
            <button onclick="applyForPost('${postId}')">Apply</button>
        </div>
    `;

    chatBox.appendChild(inviteContainer);
});

function applyForPost(postId) {
    console.log("[DEBUG] Sending POST request to:", `http://localhost:5174/api/user/applypost?postid=${postId}`);

    fetch(`http://localhost:5174/api/user/applypost?postid=${postId}`, {  
        method: "POST",  
        headers: {
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
    })
    .then(data => {
        alert("Successfully applied for the post!");
    })
    .catch(error => {
        console.error("[ERROR] Failed to apply:", error);
        alert(`Error: ${error.message}`);
    });
}



function appendGlobalMessage(IsMine,username, message, sentAt, profileImageUrl) {
    console.log("Adding global message:", {IsMine, username, message, sentAt, profileImageUrl });
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
        document.getElementById("actionButton").innerHTML = '<i class="fa-solid fa-thumbs-up"></i>';
        document.getElementById("actionButton").classList.remove("active");
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
document.addEventListener("DOMContentLoaded", function () {
    let actionButton = document.getElementById("actionButton");
    actionButton.innerHTML = '<i class="fa-solid fa-thumbs-up"></i>';
});

document.getElementById("globalMessageInput").addEventListener("input", function () {
    let actionButton = document.getElementById("actionButton");

    actionButton.classList.remove("fade-in", "fade-out");

    if (this.value.trim() !== "") {
        if (actionButton.innerHTML !== '<i class="fa-solid fa-paper-plane"></i>') {
            actionButton.classList.add("fade-out");
            setTimeout(() => {
                actionButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i>'; 
                actionButton.classList.remove("fade-out");
                actionButton.classList.add("fade-in");
            }, 200);
        }
    } else {
        if (actionButton.innerHTML !== '<i class="fa-solid fa-thumbs-up"></i>') {
            actionButton.classList.add("fade-out");
            setTimeout(() => {
                actionButton.innerHTML = '<i class="fa-solid fa-thumbs-up"></i>'; 
                actionButton.classList.remove("fade-out");
                actionButton.classList.add("fade-in");
            }, 200);
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    let picker = document.getElementById("emojiPicker");
    picker.style.display = "none"; 
});

function toggleEmojiPicker() {
    let picker = document.getElementById("emojiPicker");
    picker.style.display = picker.style.display === "none" ? "flex" : "none";
}

async function sendEmoji(emoji) {

    if (connection.state !== signalR.HubConnectionState.Connected) {
        alert("Cannot send message. Not connected to the chat server.");
        return;
    }

    try {
        await connection.invoke("sendGlobalMessage", emoji);
        document.getElementById("emojiPicker").style.display = "none"; 
    } catch (err) {
        console.error("Failed to send emoji: ", err);
    }
}

document.addEventListener("click", function (event) {
    let picker = document.getElementById("emojiPicker");
    let emojiButton = document.getElementById("emojiButton");

    if (picker.style.display === "flex" && !picker.contains(event.target) && event.target !== emojiButton) {
        picker.style.display = "none";
    }
});

async function sendLike() {

    if (connection.state !== signalR.HubConnectionState.Connected) {
        alert("Cannot send message. Not connected to the chat server.");
        return;
    }

    try {
        await connection.invoke("sendGlobalMessage",'<i class="fa-solid fa-thumbs-up"></i>');
    } catch (err) {
        console.error("Failed to send like: ", err);
    }
}

async function handleSend() {
    const messageInput = document.getElementById("globalMessageInput");
    const message = messageInput.value.trim();

    if (message) {
        await sendGlobalMessage(); 
    } else {
        await sendLike();
    }
}

