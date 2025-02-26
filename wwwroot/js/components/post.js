class Post {
    constructor(postId, date, title, location, accepted, limitAccepted, registered, categories = [], imageUrl, like = 0) {
    // constructor(date, title, location, accepted, limitAccepted, registered, categories = [], imageUrl, like = 0) {
        this.postId = postId;
        this.date = date ?? "Unknown Date";
        this.title = title ?? "Untitled";
        this.location = location ?? "Unknown Location";
        this.accepted = accepted ?? 0;
        this.limitAccepted = limitAccepted ?? 1;
        this.registered = registered ?? 0;
        this.categories = Array.isArray(categories) ? categories : [];
        if (imageUrl && imageUrl.length < 200)
            this.imageUrl = imageUrl;
        else if (imageUrl)
            this.imageUrl = "data:image/jpeg;base64," + imageUrl;
        else 
            this.imageUrl = "https://neilpatel.com/wp-content/uploads/2017/09/blog-post-image-guide.jpg";
        this.like = like;
    }

    createPostImage() {
        const postImage = document.createElement("img");
        postImage.src = this.imageUrl;
        postImage.alt = this.title;
        return postImage;
    }

    createPostHeader() {
        const postHeader = document.createElement("div");
        postHeader.classList.add("post-header");

        const postDate = document.createElement("h4");
        postDate.classList.add("post-date");
        postDate.textContent = this.date;

        const postTitle = document.createElement("h3");
        postTitle.classList.add("post-title");
        postTitle.textContent = this.title;

        const postTitleLink = document.createElement("a");
        postTitleLink.href = "#";
        postTitleLink.appendChild(postTitle);

        postHeader.appendChild(postDate);
        postHeader.appendChild(postTitleLink);

        return postHeader;
    }

    createPostDetails() {
        const postDetail = document.createElement("div");
        postDetail.classList.add("post-detail");

        postDetail.innerHTML = `
            <div class="post-location"><i class="fa-solid fa-location-dot"></i> ${this.location}</div>
            <p class="post-accepted">Accepted: ${this.accepted}/${this.limitAccepted}</p>
            <p class="post-registered">Registered: ${this.registered}</p>
        `;

        const postCategory = document.createElement("div");
        postCategory.classList.add("post-category");
        this.categories.forEach(category => {
            const categoryLink = document.createElement("a");
            categoryLink.href = "#";
            categoryLink.textContent = `#${category}`;
            postCategory.appendChild(categoryLink);
        });
        postDetail.appendChild(postCategory);
        
        return postDetail;
    }

    createLikeButton() {
        const postLike = document.createElement("div");
        postLike.classList.add("post-like");

        const likeCount = document.createElement("div");
        likeCount.textContent = this.like;

        const likeButton = document.createElement("button");
        likeButton.classList.add("like-btn");
        
        const likeIcon = document.createElement("i");
        likeIcon.classList.add("fa-regular", "fa-heart");
        likeButton.appendChild(likeIcon);

        likeButton.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();

            if (likeIcon.classList.contains("fa-regular")) {
                likeIcon.classList.replace("fa-regular", "fa-solid");
                this.like++;
            } else {
                likeIcon.classList.replace("fa-solid", "fa-regular");
                this.like--;
            }
            likeCount.textContent = this.like;
        });

        postLike.appendChild(likeCount);
        postLike.appendChild(likeButton);
        return postLike;
    }

    render() {
        const postContainer = document.createElement("a");
        postContainer.href = "/post?postId=" + this.postId;
        postContainer.classList.add("post-container");
    
        const postContent = document.createElement("div");
        postContent.classList.add("post");
    
        postContent.appendChild(this.createPostImage());
    
        const postInfo = document.createElement("div");
        postInfo.classList.add("post-info");
        postInfo.appendChild(this.createPostHeader());
        postInfo.appendChild(this.createPostDetails());
    
        postContent.appendChild(postInfo);
        const likeButtonSection = this.createLikeButton();
        postContent.appendChild(likeButtonSection);
    
        postContainer.appendChild(postContent);
    
        // ให้แน่ใจว่าเมื่อคลิกที่ postContainer จะนำทางไปยังลิงก์ที่กำหนด
        postContainer.addEventListener("click", (event) => {
            // ตรวจสอบว่าไม่ได้คลิกที่ปุ่มไลค์
            if (!event.target.closest(".like-btn")) {
                window.location.href = postContainer.href;
            }
        });
    
        return postContainer;
    }
    
}

export default Post;
