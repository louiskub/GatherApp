import LikePostHandler from "/js/components/like_post_handler.js";

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('postid') || urlParams.get('postId');

async function showPostDetail() {
    async function fetchPost() {
        const urlParams = window.location.search;
        let response = await fetch(`/api/post${urlParams}`);
        if (!response.ok) {
            alert("Post not found");
            return;
        }
        let post = await response.json();
        console.log(post)
        return post;
    }

    function chooseImg(profileImg){
        if (profileImg == "" || profileImg == null) 
            return "https://tr.rbxcdn.com/30DAY-Avatar-310966282D3529E36976BF6B07B1DC90-Png/352/352/Avatar/Png/noFilter"
        else if(profileImg.length < 200) 
            return profileImg
        else 
            return "data:image/jpeg;base64," + profileImg
    }

    let post = await fetchPost();
    let isOwner = post.isOwner;
    post = post.post;
    let owner = post.owner;
    let activity = post.activity;
    let actTypes = post.actTypes;
    let participants = post.participants;
    post = post.post

    const postName = document.querySelector(".post_act_name h2");
    postName.textContent = post.postName;

    const postOwner = document.querySelector(".actbox1_left");
    postOwner.querySelector("img").src = chooseImg(owner.profileImg)
    postOwner.querySelector("h2").textContent = owner.username

    const deadline = document.querySelector(".deadline")
    deadline.textContent = `Application Deadline: ${new Date(activity.closeDateTime).toLocaleString()}`
    
    const postImg = document.querySelector(".act_img img");
    postImg.src = `data:image/jpeg;base64, ${post.coverPageImg}`;

    const postDesc = document.querySelector(".act_descript");
    postDesc.textContent = post.detail;

    const googleMap = document.querySelector(".googlemap iframe");
    googleMap.src = activity.googleMapLink;


    const miniInfo = document.querySelector(".act_miniinfo");
    const miniLeft = miniInfo.querySelector(".act_miniinfo_left");
    const miniRight = miniInfo.querySelector(".act_miniinfo_right");

    let formattedDate = new Date(activity.actDatetime).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).toUpperCase().split(" ")
    formattedDate[2] = formattedDate[2].replace(",", " -")
    formattedDate = formattedDate.join(" ")
    miniLeft.querySelector("h1").textContent = formattedDate;
    miniLeft.querySelector("h2").textContent = post.postName;
    miniLeft.querySelector("h3").textContent = activity.actName;
    miniLeft.querySelectorAll("p")[0].textContent = `Accepted : ${post.curParticipant}/ ${post.maxParticipant}`;
    miniLeft.querySelectorAll("p")[1].textContent = `Registered : ${post.totalApplicant}`;
    
    ///////////////// หัวใจ /////////////////
    new LikePostHandler( miniRight.querySelector('i'), 
                        miniRight.querySelector(".likes_num"), 
                        post.id, post.like, post.isLiked);

    ///////////////// Participants /////////////////
    const memberContainer = document.querySelector(".member_container")
    if (participants.length == 0) {
        const tagP = document.createElement("p")
        tagP.textContent = "No participants yet."
        memberContainer.appendChild(tagP)
    }
    else 
        participants.forEach((part) => {
            const tagA = document.createElement("a")
            tagA.href = `/profile?username=${part.username}`

            const profileImg = document.createElement("img")
            profileImg.classList.add("avatar")
            profileImg.src = chooseImg(part.profileImg)

            tagA.appendChild(profileImg)
            memberContainer.appendChild(tagA)
        })
    
    const tagContainer = document.querySelector(".tag_container");
    actTypes.forEach((actType) => {
        const tag = document.createElement("div");
        tag.classList.add("tag");
        tag.textContent = actType;
        tagContainer.appendChild(tag);
    })

    const editBut = document.querySelector(".edit_but");
    const viewBut = document.querySelector(".view_but");
    const cancelBut = document.querySelector(".cancel_post_but");
    const regBut = document.querySelector(".reg_but");
    const appBut = document.querySelector(".app_but");

    if (isOwner) {
        editBut.style.display = "block";
        viewBut.style.display = "block";
        cancelBut.style.display = "block";
    }else {
        if (!post.isApplied){
            regBut.style.display = "block";
            if (post.isAttached)
                appBut.style.display = "block";
        }
    }

    ///////////////// Button Event /////////////////
    console.log(regBut)
    regBut.addEventListener("click", async function() {
        console.log("Registering...")
        const urlParams = new URLSearchParams(window.location.search)
        const postId = urlParams.get('postid') || urlParams.get('postId');
        
        let apiSettings = {
            method: "POST",
            credentials: 'include',
            headers: {'Content-Type': 'application/json'}
        }

        const fileToBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(",")[1]); // ตัด "data:image/png;base64," ออก
                reader.onerror = (error) => reject(error);
            });
        };
        if (post.isAttached){
            let fileInput = document.getElementById("fileInput").files[0]
            if (!fileInput) 
                return alert("Please attach a file before submitting.")
            apiSettings.body = JSON.stringify(
                { fileAttached: await fileToBase64(fileInput)}
            )
        }
        let response = await fetch(`/api/user/applypost?postid=${postId}`, apiSettings)
        if (!response.ok) 
            // alert("Failed to register for this activity!")
            console.log(response)
        else {
            if (response.redirected)
                window.location.href = response.url
            else {
                response = await response.json();
                if (response.error) {
                    alert(response.error)
                } else {
                    alert("You have successfully registered for this activity!")
                    window.location.reload()
                }
            }
        }
    })

    document.querySelector(".cancel_post_but").addEventListener("click", function() {
        alert("You have canceled this activity!");
    });
}


document.addEventListener("DOMContentLoaded", async function() {
    await showPostDetail();
});

function openPopup() {
    document.getElementById("popup_app").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function closePopup() {
    document.getElementById("popup_app").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function submitApplication() {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("Please attach a file before submitting.");
    } else {
        alert("Application submitted successfully!");
        closePopup();
    }
}

// const heart = document.querySelector('.heart i');
// const likesNum = document.querySelector('.likes_num');

// heart.addEventListener("click", async (event) => {
//     event.stopPropagation();
//     event.preventDefault();

//     async function likePost() {
//         // const urlParams = window.location.search;
//         const urlParams = new URLSearchParams(window.location.search);
//         const postId = urlParams.get('postid') || urlParams.get('postId');
//         let response = await fetch(`/api/post/togglelike/${postId}`, {
//             method: "POST",
//             credentials: 'include'
//         })
//         if (response.ok) {
//             if (response.redirected)
//                 window.location.href = response.url
//             else {
//                 response = await response.json();
//                 return response
//             }
//         } else {
//             return { error: response.status }
//         }
//     }

//     let response = await likePost();
//     // console.log(response)
//     if (response.error) {
//         console.error("Like error:", response.error);
//     }
//     else if (response.isLiked){
//         heart.classList.replace("fa-regular", "fa-solid");
//         likesNum.textContent = response.like;
//     }
//     else {
//         heart.classList.replace("fa-solid", "fa-regular");
//         likesNum.textContent = response.like;
//     }
// });