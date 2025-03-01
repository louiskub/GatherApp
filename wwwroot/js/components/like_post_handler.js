class LikePostHandler{
    constructor(heart, likeNumEle, postId, initLikeNum, isLiked){
        this.heart = heart;
        this.likeNumEle = likeNumEle;
        this.postId = postId;
        this.initLikeNum = initLikeNum;
        this.isLiked = isLiked;
        (async () => {
            await this.putPostLikeNum()
            await this.likePost();
        })();
    }

    async putPostLikeNum(){
        this.likeNumEle.textContent = this.initLikeNum;
        let heart = this.heart;
        if (this.heart.tagName !== "I") 
            heart = this.heart.querySelector('i');
        
        if (this.isLiked)
            heart.classList.add("fa-solid", "fa-heart");
        else
            heart.classList.add("fa-regular", "fa-heart");
    }

    async likePost() {
        let heart = this.heart;
        let likeNum = this.likeNumEle;
        let postId = this.postId
        console.log(postId)
        heart.addEventListener("click", async (event) => {
            event.stopPropagation();
            event.preventDefault();
        
            async function likePost() {
                let response = await fetch(`/api/post/togglelike/${postId}`, {
                    method: "POST",
                    credentials: 'include'
                })
                if (response.ok) {
                    if (response.redirected)
                        window.location.href = response.url
                    else {
                        response = await response.json();
                        return response
                    }
                } else {
                    return { error: response.status }
                }
            }
            
            let response = await likePost();
            if (this.heart.tagName !== "I") 
                heart = this.heart.querySelector('i');
            if (response.error) {
                console.error("Like error:", response.error);
            }
            else if (response.isLiked){
                heart.classList.replace("fa-regular", "fa-solid");
                likeNum.textContent = response.like;
            }
            else {
                heart.classList.replace("fa-solid", "fa-regular");
                likeNum.textContent = response.like;
            }
        });
    }
}


export default LikePostHandler;