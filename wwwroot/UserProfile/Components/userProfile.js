class UserProfile{
    constructor(username="", profileImg=""){
        if (profileImg == "" || profileImg == null)
            this.profileImg = "https://tr.rbxcdn.com/30DAY-Avatar-310966282D3529E36976BF6B07B1DC90-Png/352/352/Avatar/Png/noFilter"
        else
            this.profileImg = "data:image/jpeg;base64," + profileImg
        this.tagA = document.createElement("a")
        this.tagA.classList.add("profile-img")
        if (username != "")
            this.tagA.href = `/profile?username=${username}`
    }

    render() {

        let img = document.createElement("img")
        img.src = this.profileImg
        img.style.borderRadius = "50%"
        img.style.border = "1px black solid"
        img.style.width = "50px"
        img.style.height = "50px"
        img.style.objectFit = "cover"
        img.style.verticalAlign = "middle"
        img.alt = "Profile Image"

        this.tagA.appendChild(img)

        return this.tagA
    }
}

export default UserProfile