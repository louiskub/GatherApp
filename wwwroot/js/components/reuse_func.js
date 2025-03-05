export default function loadCSS(url) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.type = "text/css";
    document.head.appendChild(link);
}

export function createPostImage(imageUrl) {
    const postImage = document.createElement("div");
    postImage.classList.add("post-image");
    postImage.style.backgroundImage = `url(${imageUrl})`;
    return postImage;
}