import loadCss from "/js/components/reuse_func.js";
import Method from "/js/components/method/Method.js";
var met = new Method();
const urlParams = new URLSearchParams(window.location.search);

async function fetchReport(){
    let response = await fetch(`api/user/reviewreport/report${window.location.search}`);
    if (!response.ok){
        response = await response.text()
        return window.changePage(response, "/home", "error")
    }
    else if(response.redirected){
        return window.redirectToLogin()
    }
    else {
        response = await response.json();
    }
    
    const reviewProfile = document.querySelector(".report-img-container");
    reviewProfile.querySelector(".img-profile").src =  met.imgSelection(response.profileImg, "https://media.istockphoto.com/id/1434150819/th/%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%96%E0%B9%88%E0%B8%B2%E0%B8%A2/%E0%B8%94%E0%B8%AD%E0%B8%A2%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%99%E0%B8%99%E0%B8%97%E0%B9%8C-%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88-%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%97%E0%B8%A8%E0%B9%84%E0%B8%97%E0%B8%A2.jpg?s=612x612&w=0&k=20&c=apydflyhZVs-g88s3Isql-Plx94MwFkDYnAoNPt964c=")
    reviewProfile.querySelector(".img-username").textContent = response.username;
    reviewProfile.style.backgroundImage = `url("${met.imgSelection(response.coverPageImg, "https://png.pngtree.com/thumb_back/fh260/background/20210911/pngtree-xiaguang-daytime-rape-flower-mountain-no-photography-picture-with-picture-image_851488.jpg")}")`
}

async function initBtn(){
    const submitBtn = document.querySelector(".report-btn-container");
    submitBtn.querySelector("#cancel-btn").addEventListener("click",() => {window.changePage("Redirecting to home...", "/home", "success")});
    submitBtn.querySelector("#report-btn").addEventListener("click", async function(){
        
        let selected = document.querySelectorAll(".report-choice.report-active")
        let reason = document.querySelector("#w3review").value
        if (selected.length == 0)
            return window.showToast("Please select some choices", "error")
        if (reason == "")
            return window.showToast("Please enter a reason", "error")
        if (reason.length > 500)
            return window.showToast("Reason must be less than 500 characters", "error")
        let reasons = []
        selected.forEach((el) => reasons.push(el.textContent))
        reasons = reasons.join(", ") + ": " + reason

        console.log(JSON.stringify({
            reportedUsername: urlParams.get('username'),
            postId: urlParams.get('postId') || urlParams.get('postid'),
            reason: reasons,
    }))

        let response = await fetch(`api/reports/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reportedUsername: urlParams.get('username'),
                postId: urlParams.get('postId') || urlParams.get('postid'),
                reason: reasons,
            })
        })

        if (!response.ok){
            response = await response.text()
            return window.showToast(response, "error")
        }
        else if (response.redirected){
            return window.redirectToLogin()
        }
        else {
            return window.changePage("Reported Successfully. Redirecting to home...", "/home", "success")
        }
    })
}

document.querySelectorAll(".report-choice").forEach((element) => {
    element.addEventListener("click", () => {
        const activeChoices = document.querySelectorAll(".report-choice.report-active").length;
        if (element.classList.contains("report-active") || activeChoices < 3) {
            element.classList.toggle("report-active");
        }
        else{
            window.showToast("You can only select 3 choices", "error");
        }
    });
});

document.addEventListener("DOMContentLoaded", async function() {
    await window.userProfileLoaded;
    await loadCss("/css/inform/report.css");
    await fetchReport();
    await initBtn();
});