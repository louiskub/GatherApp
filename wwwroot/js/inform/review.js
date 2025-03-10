import loadCss from "/js/components/reuse_func.js";
import Method from "/js/components/method/Method.js";
var met = new Method();
var rating = -1;
const urlParams = new URLSearchParams(window.location.search);

async function fetchReview(){
    let response = await fetch(`api/user/reviewreport/review${window.location.search}`);
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
    
    const reviewProfile = document.querySelector(".review-profile-container");
    reviewProfile.querySelector(".profile-img").src =  met.imgSelection(response.profileImg, "https://media.istockphoto.com/id/1434150819/th/%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%96%E0%B9%88%E0%B8%B2%E0%B8%A2/%E0%B8%94%E0%B8%AD%E0%B8%A2%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%99%E0%B8%99%E0%B8%97%E0%B9%8C-%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88-%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%97%E0%B8%A8%E0%B9%84%E0%B8%97%E0%B8%A2.jpg?s=612x612&w=0&k=20&c=apydflyhZVs-g88s3Isql-Plx94MwFkDYnAoNPt964c=")
    reviewProfile.querySelector(".profile-username").textContent = response.username;
}

async function initBtn(){
    const submitBtn = document.querySelector(".submit-button-container");
    submitBtn.querySelector(".cancel-btn").addEventListener("click",() => {window.changePage("Redirecting to home...", "/home", "success")});

    submitBtn.querySelector(".submit-btn").addEventListener("click", async function(){
        const title = document.querySelector(".review-title")
        const reviewText = document.querySelector(".review-text")
        if (title.value == "")
            return window.showToast("Please enter a title", "error")
        if (reviewText.value == "")
            return window.showToast("Please enter a review", "error")
        if (rating == null)
            return window.showToast("Please give a rating", "error")
        
        const username = urlParams.get('username');
        let response = await fetch(`api/reviews/rate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ratedUsername: urlParams.get('username'),
                postId: urlParams.get('postId') || urlParams.get('postid'),
                score: rating,
                comment: title.value + " : " +  reviewText.value
            })
        })
        if (!response.ok){
            response = await response.text()
            return window.showToast(response, "error")
        }
        else if(response.redirected){
            return window.redirectToLogin()
        }
        else {
            response = await response.json();
            window.changePage("Reviewed successfully. Redirecting to home...", `/`, "success")
        }
    })
}

document.addEventListener("DOMContentLoaded", async function() {
    await window.userProfileLoaded;
    await loadCss("/css/inform/review.css");
    await fetchReview();
    await initBtn();
    const stars = document.querySelectorAll(".star");
    const ratingText = document.getElementById("ratingText");

    stars.forEach(star => {
        star.addEventListener("click", function() {
            rating = this.getAttribute("data-value");
            updateStars(rating);
            ratingText.textContent = `You give ${rating} ${rating == 1 ? 'star' : 'stars'}`;
        });
    });

    function updateStars(rating) {
        stars.forEach(star => {
            star.classList.toggle("active", star.getAttribute("data-value") <= rating);
        });
    }
});