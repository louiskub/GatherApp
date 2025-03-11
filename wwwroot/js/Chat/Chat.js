let connection;
let currentPostId = null;

async function startConnection() {
    try {
        connection = new signalR.HubConnectionBuilder()
            .withUrl("/chathub", { withCredentials: true }) 
            .withAutomaticReconnect()
            .build();

        await connection.start();

        setupListeners();
        getUserChats();
    } catch (err) {
        setTimeout(startConnection, 5000);
    }
}

function chooseImg(coverImage){
    if (coverImage == "" || coverImage == null) 
        return "https://www.mcot.net/uploads/article/202409/fc9caee77c607de279ff9116c67c6ddf.jpeg"
    else if(coverImage.length < 200) 
        return coverImage
    else 
        return "data:image/jpeg;base64," + coverImage
}

startConnection();

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



function setupListeners() {
    if (!connection) {

        return;
    }


    connection.on("LoadUserChats", (posts) => {
        
        if (!Array.isArray(posts) || posts.length === 0) {
            return;
        }
        let chatList = document.getElementById("chatList");
        if (!chatList) {
            return;
        }
        chatList.innerHTML = "";
    
        if (posts.length === 0) {
            return;
        }
    
        posts.forEach( post => {

            if (!post.id || isNaN(post.id) || !post.postName) {
                return;
            }

            let chatItem = document.createElement("li");
            chatItem.classList.add("chatItem");
            let coverImg = document.createElement("img");
            coverImg.src = chooseImg(post.coverImage);
            coverImg.alt = post.postName;
            coverImg.classList.add("chatCover");

            let postText = document.createElement("div");
            postText.innerHTML = `<strong>${post.postName}</strong>`;
            postText.classList.add("chatText");

            chatItem.onclick = () => {
                joinChat(parseInt(post.id));
            };

            chatItem.appendChild(coverImg);
            chatItem.appendChild(postText);
            
            chatList.appendChild(chatItem);
        });
    });

    function appendMessage(IsMine, username, message, sentAt, profileImageUrl) {
    
        let chatBox = document.getElementById("chatBox");
        if (!chatBox) {
            return;
        }
    
        if (!username || !message || !sentAt) {
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
        <img src="${chooseImg(profileImageUrl)}" alt="Profile" class="profile-pic">
        <div class="message-details">
            <div class="${isMine ? 'my-message-header' : 'other-message-header'}">
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
        appendMessage(isMine,username, message, sentAt, profileImageUrl);
    });
    
    connection.on("LoadPreviousMessages", (messages) => {
    
        if (!Array.isArray(messages)) {
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
    
    }   

    async function joinChat(postId) {
    
        if (!postId) {
            alert("No available chat to join.");
            return;
        }
    
        try {
            await connection.invoke("JoinChat", postId.toString());
    
            currentPostId = postId;
            document.getElementById("chatBox").innerHTML = "";
    
            loadPreviousMessages(postId); 
        } catch (err) {
            alert("Failed to join chat: " + err);
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        let actionButton = document.getElementById("actionButton");
        actionButton.innerHTML = '<i class="fa-solid fa-thumbs-up"></i>';
    });

    document.getElementById("messageInput").addEventListener("input", function () {
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
    
    async function handleSend() {
        const messageInput = document.getElementById("messageInput");
        const message = messageInput.value.trim();
    
        if (message) {
            await sendMessage(); 
        } else {
            await sendLike();
        }
    }

async function getUserChats() {
    try {
        await connection.invoke("GetUserChats");
    } catch (err) {
    }
}

document.getElementById("messageInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) { 
        event.preventDefault();
        sendMessage(); 
    }
});

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
        document.getElementById("actionButton").innerHTML = '<i class="fa-solid fa-thumbs-up"></i>';
        document.getElementById("actionButton").classList.remove("active");
    } catch (err) {

    }

}

document.addEventListener("DOMContentLoaded", function () {
    let picker = document.getElementById("emojiPicker");
    picker.style.display = "none"; 
});

function toggleEmojiPicker() {
    let picker = document.getElementById("emojiPicker");
    picker.style.display = picker.style.display === "none" ? "flex" : "none";
}

async function sendEmoji(emoji) {
    if (!currentPostId) {
        alert("You must join a chat first.");
        return;
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
        alert("Cannot send message. Not connected to the chat server.");
        return;
    }

    try {
        await connection.invoke("SendMessage", currentPostId, emoji);
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
    if (!currentPostId) {
        alert("You must join a chat first.");
        return;
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
        alert("Cannot send message. Not connected to the chat server.");
        return;
    }

    try {
        await connection.invoke("SendMessage", currentPostId, '<i class="fa-solid fa-thumbs-up"></i>');
    } catch (err) {

    }
}

async function loadPreviousMessages() {
    if (!currentPostId) return;
    try {

        await connection.invoke("LoadPreviousMessages", currentPostId);
    } catch (err) {

    }
}


function toggleThemeMenu() {
    let menu = document.querySelector(".theme-dropdown");

    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function changeTheme(theme) {
    let chatBox = document.querySelector(".chatBox");

    chatBox.classList.remove("dark-theme", "blue-theme", "retro-theme","sunset-theme", "galaxy-theme");

    if (theme !== "default") {
        chatBox.classList.add(theme);
    }

    localStorage.setItem("chatTheme", theme);

    document.querySelector(".theme-dropdown").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    let savedTheme = localStorage.getItem("chatTheme") || "default";
    changeTheme(savedTheme);
});

