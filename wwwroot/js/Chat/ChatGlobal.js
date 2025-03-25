let connection;

async function startGlobalChatConnection() {
    try {
        connection = new signalR.HubConnectionBuilder()
            .withUrl("/globalChatHub", { withCredentials: true }) 
            .withAutomaticReconnect()
            .build();

        await connection.start();

        setupGlobalChatListeners();
    } catch (err) {
        setTimeout(startGlobalChatConnection, 5000);
    }
}

startGlobalChatConnection();


function imgSelection(coverImage){
    if (coverImage == "" || coverImage == null) 
        return "https://tr.rbxcdn.com/30DAY-Avatar-310966282D3529E36976BF6B07B1DC90-Png/352/352/Avatar/Png/noFilter"
    else if(coverImage.length < 200) 
        return coverImage
    else 
        return "data:image/jpeg;base64," + coverImage
}

function changeChatPage() {
    let selectedPage = document.getElementById("chatTypeDropdown").value;
    window.location.href = selectedPage; 
}

document.addEventListener("DOMContentLoaded", function () {
    let currentPath = window.location.pathname.toLowerCase(); 
    let dropdown = document.getElementById("chatTypeDropdown");

    for (let option of dropdown.options) {
        if (currentPath.includes(option.value.toLowerCase())) {
            option.selected = true;
            break;
        }
    }
});


function setupGlobalChatListeners() {
    if (!connection) {
        return;
    }

    document.getElementById("globalMessageInput").addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) { 
            event.preventDefault();
            sendGlobalMessage(); 
        }
    });

    connection.on("ReceiveGlobalMessage", (isMine,username, message, sentAt, profileImageUrl) => {
        appendGlobalMessage(isMine,username, message, sentAt, profileImageUrl);
    });

    connection.on("LoadPreviousGlobalMessages", (messages , postInvitations) => {
    
        if (!Array.isArray(messages) || !Array.isArray(postInvitations)) {
            return;
        }
    
        const chatBox = document.getElementById("globalChatBox");
        chatBox.innerHTML = ""; 


        const allItems = [
            ...messages.map(msg => ({
                type: "message",
                isMine: msg.IsMine ?? msg.isMine ?? false,
                username: msg.Username ?? msg.username ?? "Unknown",
                message: msg.Message ?? msg.message ?? "[No Message]",
                sentAt: msg.SentAt ?? msg.sentAt ?? new Date().toISOString(),
                profileImageUrl: msg.profileImg
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
    
        allItems.forEach(item => item.sentAt = new Date(item.sentAt));
    
        allItems.forEach(item => {
            if (isNaN(item.sentAt.getTime())) {
            }
        });
    
        allItems.sort((a, b) => a.sentAt - b.sentAt);
    
        allItems.forEach(item => {
            if (item.type === "message") {
                appendGlobalMessage(item.isMine, item.username, item.message, item.sentAt.toISOString(), item.profileImageUrl);
            } else if (item.type === "invitation") {
                appendPostInvitation(item.postId, item.postName, item.postDetail, item.username);
            }
        });
    
    });

    function appendPostInvitation(postId, postName, postDetail, username) {

        if (!postId || !postName || !postDetail || !username) {
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
                <button onclick="viewPost('${postId}')">Apply</button>
            </div>
        `;
        chatBox.appendChild(inviteContainer);
    }
    connection.on("Error", (errorMessage) => {
        window.showToast("Error: " + errorMessage, "error");
    });

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
}


function SendPostInvitation() {
    const dropdown = document.getElementById("postSelectionDropdown");
    let postId = dropdown.value;

    if (!postId) {
        window.showToast("Please select a post first!", "error");
        return;
    }

    postId = parseInt(postId, 10);
    connection.invoke("SendPostInvitation", postId)
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
            <button onclick="viewPost('${postId}')">Apply</button>
        </div>
    `;

    chatBox.appendChild(inviteContainer);
});

function toggleReadMore(postId) {
    const detail = document.getElementById(`detail-${postId}`);
    if (detail.classList.contains("truncate")) {
        detail.classList.remove("truncate");
        detail.classList.add("expanded");
    } else {
        detail.classList.remove("expanded");
        detail.classList.add("truncate");
    }
}

function viewPost(postId) {
    
    window.location.href = `https://localhost:5174/post?postId=${postId}`;
}


function appendGlobalMessage(IsMine,username, message, sentAt, profileImageUrl) {
    let chatBox = document.getElementById("globalChatBox");
    if (!chatBox) {
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

        }
    } catch (error) {

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
        <img src="${imgSelection(profileImageUrl)}" alt="Profile" class="profile-pic">
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
        window.showToast("Cannot send message. Not connected to the chat server.", "error");
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

    }
}

async function loadGlobalMessages() {
    try {

        await connection.invoke("LoadGlobalMessages");
    } catch (err) {

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
        window.showToast("Cannot send message. Not connected to the chat server.", "error");
        return;
    }

    try {
        await connection.invoke("sendGlobalMessage", emoji);
        document.getElementById("emojiPicker").style.display = "none"; 
    } catch (err) {

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
        showToast("Cannot send message. Not connected to the chat server.", "error");
        return;
    }

    try {
        await connection.invoke("sendGlobalMessage",'<i class="fa-solid fa-thumbs-up"></i>');
    } catch (err) {

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

