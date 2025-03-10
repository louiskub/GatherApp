
document.addEventListener("DOMContentLoaded", function () {
    fetchLikedPosts();
});

function attachEventListeners() {
    const likeBtns = document.querySelectorAll('.like-btn');

    likeBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const postId = btn.closest('.like-card').getAttribute('data-post-id');

            toggleLike(postId);

            const card = btn.closest('.like-card');
            if (card) {
                animateCardRemoval(card);
            }
        });
    });
}

function toggleLike(postId) {
    fetch(`/api/post/togglelike/${postId}`, {
        method: 'POST',
        headers: {
            "content-type": "application/json",
        }
    })
    .then(response => {
        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            return response.text().then(text => {throw new Error(text)});
        }
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Invalid response format: Expected JSON but got " + contentType);
        }
        return response.json();
    })
}

function fetchLikedPosts() {
    fetch('/api/user/mylikedpost',{
        method: 'GET',
        headers: {
            "content-type": "application/json"
    }
})
    .then(response => {
        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            return response.text().then(text => {throw new Error(text)});
        }
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Invalid response format: Expected JSON but got " + contentType);
        }
        console.log("res",response)
        return response.json();
    })
    .then(posts => {
        let likesGrid = document.getElementById("likes-grid");
        likesGrid.innerHTML = "";

        if(posts.length === 0) {
            likesGrid.innerHTML = "<p class='no-likes'>You haven't liked any posts yet.</p>";
            return;
        }

        posts.forEach(post => {
            likesGrid.innerHTML += createPostComponent(post);

    });
        attachEventListeners();
})
    .catch(error => {
        console.error("[ERROR] Failed to load liked posts:", error);
        document.getElementById("likes-grid").innerHTML = "<p class='no-likes'>You haven't liked any posts yet.</p>";
    });
}

function createPostComponent(post) {
    let div1 = 
    `
        <a href="/post/${post.id}" class="like-card" data-post-id="${post.id}">
            <img src="data:image/jpeg;base64,${post.image}" alt="${post.postname}">
            <div class="card-content">
                <h2 class="card-title">${post.postname}</h2>
                <p class="time">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${post.actDatetime}
                </p>
    `
    let div2 =  
    `
                <p class="location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    ${post.district}, ${post.province}
                </p>
    `
    if (post.province == null && post.district == null) {
        div2 = `
                <p class="location">
                    <i class="fa-solid fa-globe"></i> Online Event
                </p>
        `
    }

    let div3 = `
                <div class="stats">
                    <span>Accepted: ${post.accepted}/${post.total}</span>
                    <span>Registered: ${post.registered}</span>
                </div>
                <div class="tags">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join("")}
                </div>
                    <button class="like-btn" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                    Liked
                </button>
                </div>
            </div>
        </a>
    `;

    return div1+div2+div3;
}


function handleLikeButtonClick(e) {
    const likeBtn = e.target.closest(".like-btn");
    if (!likeBtn) return;
    
    const card = likeBtn.closest(".like-card");
    animateCardRemoval(card);
}


function animateCardRemoval(card) {
    card.style.transition = "opacity 0.5s, transform 0.5s";
    card.style.opacity = "0";
    card.style.transform = "scale(0.8)";
    
    setTimeout(() => {
        card.remove();
    }, 500);
}
