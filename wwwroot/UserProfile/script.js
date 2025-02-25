import UserProfile from "./Components/userProfile.js"

async function getMyProfile() {
    let myProfile
    const url = "http://localhost:5174/api/user/myprofile"
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI4OWZlNjFhZC0wN2Y4LTRlMWUtYmIyNi02MWZmYjM0NzU0ZmEiLCJ1bmlxdWVfbmFtZSI6ImxvdWlzMiIsIm5iZiI6MTczOTk4ODAyMSwiZXhwIjoxNzQwMDc0NDIxLCJpYXQiOjE3Mzk5ODgwMjF9.7kbI00DIXYu2PihKDvC63qMkQwXEzX5x9Mq-IifZKUY",
                "Accept": "application/json"
            }
        })
        
        if(!res.ok){
            console.log(res.statusText)
            myProfile = {}
        }
        else {
            myProfile = await res.json()
            let root = document.getElementById("root")
            let profile = new UserProfile(myProfile.username, myProfile.profileImg).render()
            root.appendChild(profile)
        }
    }
    catch (err){
        return new Error("User Unauthorized")
    }

    return myProfile
}

let myProfile = await getMyProfile()
