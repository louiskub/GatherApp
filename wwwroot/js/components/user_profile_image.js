class UserProfileImage{
    constructor(username="", profileImg="", imgSize="50px", imgBorder="1px black solid"){
        if (!profileImg)
            this.profileImg = "https://tr.rbxcdn.com/30DAY-Avatar-310966282D3529E36976BF6B07B1DC90-Png/352/352/Avatar/Png/noFilter"
        else
            // this.profileImg = "data:image/jpeg;base64," + profileImg
            this.profileImg = profileImg
        this.tagA = document.createElement("a")
        this.tagA.classList.add("profile-img")
        if (username != "")
            // this.tagA.href = `/profile?username=${username}`// EncodeURI
            // this.tagA.href = `/profile?username=${encodeURIComponent(username)}`// EncodeURI
            this.tagA.href = `/profile`

        this.imgSize = imgSize
        this.imgBorder = imgBorder
    }

    render() {

        let img = document.createElement("img")
        img.crossOrigin = "Anonymous"; // เพิ่ม crossOrigin
        img.src = this.profileImg
        img.style.borderRadius = "50%"
        img.style.border = this.imgBorder
        img.style.width = this.imgSize
        img.style.height = this.imgSize
        img.style.objectFit = "cover"
        img.style.verticalAlign = "middle"
        img.style.display = "flex"
        // img.style.zIndex = "10000"
        img.alt = "Profile Image"

        this.tagA.appendChild(img)

        return this.tagA
    }
}

export default UserProfileImage