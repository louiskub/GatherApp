class UserSearchCard{

    constructor(username="", profileImg=""){
        this.username = username
        if (profileImg && profileImg.length < 200)
            this.profileImg = profileImg;
        else if (profileImg)
            this.profileImg = "data:image/jpeg;base64," + profileImg;
        else 
            this.profileImg = "https://tr.rbxcdn.com/30DAY-Avatar-310966282D3529E36976BF6B07B1DC90-Png/352/352/Avatar/Png/noFilter";
    }

    render(){
        const tagA = document.createElement("a")
        tagA.classList.add("search-user-info")
        tagA.href = `/profile?username=${this.username}`
        
        const img = document.createElement("img")
        img.src = this.profileImg
        img.alt = "user"
        img.classList.add("search-user-image")

        const div = document.createElement("div")
        div.classList.add("search-user-name")
        div.textContent = this.username

        tagA.appendChild(img)
        tagA.appendChild(div)
        return tagA
    }
}

export default UserSearchCard