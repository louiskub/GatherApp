class UserProfileImage {
    constructor(username = "", profileImg = "", imgSize = "50px", imgBorder = "none", imgClass = "profile-img") {
        if (profileImg == "" || profileImg == null)
            this.profileImg = "https://tr.rbxcdn.com/30DAY-Avatar-310966282D3529E36976BF6B07B1DC90-Png/352/352/Avatar/Png/noFilter"
        else if(profileImg.length < 200)
            this.profileImg = profileImg
        else 
            this.profileImg = "data:image/jpeg;base64," + profileImg
        this.tagA = document.createElement("a")
        this.tagA.classList.add(imgClass)
        if (username != "")
            // this.tagA.href = `/profile?username=${username}`// EncodeURI
            // this.tagA.href = `/profile?username=${encodeURIComponent(username)}`// EncodeURI
            this.tagA.href = `/profile?username=${username}`// EncodeURI

        this.imgSize = imgSize
        this.imgBorder = imgBorder
        this.imgClass = imgClass
    }

    render() {

        let img = document.createElement("img")
        img.src = this.profileImg
        img.style.borderRadius = "50%"
        img.style.border = this.imgBorder
        img.style.width = this.imgSize
        img.style.height = this.imgSize
        img.style.objectFit = "cover"
        img.style.verticalAlign = "middle"
        img.style.display = "flex"
        img.alt = "Profile Image"

        this.tagA.appendChild(img)

        return this.tagA
    }
}

export default UserProfileImage