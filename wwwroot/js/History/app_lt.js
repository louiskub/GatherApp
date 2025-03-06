import HistoryActivity from "/js/History/historyContainer.js"

var inComming, pending, success, fail

async function fetchMyApp(){
    let response = await fetch('/api/user/myapplication')
    if (!response.ok)
        window.changePage("Error Fetching Data", "/home", "warning")
    if (response.redirected)
        window.changePage("Please Login First", "/login", "warning")
    response = await response.json()
    inComming = response.inComming
    success = response.success
    pending = response.pending
    fail = response.fail
}

async function loadContent(){
    await fetchMyApp()
    const ActivityList = document.querySelector(".pageLayout");
    ActivityList.appendChild(document.createElement("hr"))
    let textHeader = document.createElement("h1")

    textHeader.innerText = "Incoming"
    ActivityList.appendChild(textHeader)
    fail.forEach(act => {
        let post = act.post
        let activity = post.activity
        let actTypes = post.actTypes
        post = post.post
        const Post = new HistoryActivity(post.id, post.curParticipant, post.maxParticipant
            , activity.actDatetime, post.postName, "reject", actTypes, post.isOpened).render()
        ActivityList.appendChild(Post)
    });
    ActivityList.appendChild(document.createElement("hr"))

    
}

async function main(){
    await window.userProfileLoaded
    loadContent()
}


main()
