import loadCss from "/js/components/reuse_func.js";
loadCss("/css/components/post_in_date.css");

class PostInDate {
    constructor(date, posts = []) {
        this.date = date;
        this.posts = posts; // Array ของ Post objects
    }

    render() {
        // Container หลัก
        const container = document.createElement("div");
        container.classList.add("post-in-date");

        // Title (วันที่)
        const title = document.createElement("h1");
        title.textContent = this.date;
        container.appendChild(title);

        // Post container
        const allPostContainer = document.createElement("div");
        allPostContainer.classList.add("all-post-container");

        // เพิ่ม Post ที่อยู่ใน array
        this.posts.forEach(post => {
            allPostContainer.appendChild(post.render());
        });

        container.appendChild(allPostContainer);
        return container;
    }
}

// ทำให้ PostInDate เป็น global object
export default PostInDate;