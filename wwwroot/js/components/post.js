class Post {
    constructor(date, title, location, accepted, registered, categories, imageUrl, like=0) {
        this.date = date;
        this.title = title;
        this.location = location;
        this.accepted = accepted;
        this.registered = registered;
        this.categories = categories;
        this.imageUrl = imageUrl;
        this.like = like;

        // โหลด CSS
        // this.loadCSS("/wwwroot/css/components/post.css");
    }

    loadCSS(url) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        link.type = "text/css";
        document.head.appendChild(link);
    }

    render() {
        // Create main post container
        const postContainer = document.createElement("div");
        postContainer.classList.add("post-container");
        const postContent = document.createElement("div");
        // postContent.href = "/home/auth";
        postContent.classList.add("post");

        // Create post image
        const postImage = document.createElement("img");
        postImage.src = this.imageUrl;
        postImage.alt = this.title;
        postContent.appendChild(postImage);

        // Create post info container
        const postInfo = document.createElement("div");
        postInfo.classList.add("post-info");

        // Create post header
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

        // Create post details
        const postDetail = document.createElement("div");
        postDetail.classList.add("post-detail");

        const postLocation = document.createElement("div");
        postLocation.classList.add("post-location");
        postLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${this.location}`;

        const postAccepted = document.createElement("p");
        postAccepted.classList.add("post-accepted");
        postAccepted.textContent = `Accepted: ${this.accepted}/10`;

        const postRegistered = document.createElement("p");
        postRegistered.classList.add("post-registered");
        postRegistered.textContent = `Registered: ${this.registered}`;

        // Create post category links
        const postCategory = document.createElement("div");
        postCategory.classList.add("post-category");

        this.categories.forEach(category => {
            const categoryLink = document.createElement("a");
            categoryLink.href = "#";
            categoryLink.textContent = `#${category}`;
            postCategory.appendChild(categoryLink);
        });

        postDetail.appendChild(postLocation);
        postDetail.appendChild(postAccepted);
        postDetail.appendChild(postRegistered);
        postDetail.appendChild(postCategory);

        // Append header and details to post info
        postInfo.appendChild(postHeader);
        postInfo.appendChild(postDetail);

        // Create like button section
        const postLike = document.createElement("div");
        postLike.classList.add("post-like");

        const likeCount = document.createElement("div");
        likeCount.textContent = this.like;

        const likeButton = document.createElement("button");
        likeButton.classList.add("like-btn");
        const likeIcon = document.createElement("i");
        likeIcon.classList.add("fa-regular", "fa-heart");
        likeButton.appendChild(likeIcon);
        likeButton.addEventListener("click", function (event) {
            event.stopPropagation();
            const icon = this.querySelector("i");
            if (icon.classList.contains("fa-regular")) {
                icon.classList.remove("fa-regular");
                icon.classList.add("fa-solid"); // เปลี่ยนเป็นไอคอนหัวใจเต็ม ❤️
                this.previousElementSibling.textContent++; // เพิ่มจำนวนไลค์
            } else {
                icon.classList.remove("fa-solid");
                icon.classList.add("fa-regular"); // เปลี่ยนกลับเป็นหัวใจเปล่า 🤍
                this.previousElementSibling.textContent--; // ลดจำนวนไลค์
            }
        });
        postLike.appendChild(likeCount);
        postLike.appendChild(likeButton);

        // Append everything to post container
        postContent.appendChild(postInfo);
        postContent.appendChild(postLike);

        postContainer.appendChild(postContent);

        return postContainer;
    }
}

// Making Post class global
export default Post;
