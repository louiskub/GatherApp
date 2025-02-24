document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".reg_but").addEventListener("click", function() {
        alert("You have successfully registered for this activity!");
    });
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

const heart = document.querySelector('.heart');
const likesNum = document.querySelector('.likes_num');

heart.addEventListener('click', () => {
    const isLiked = heart.classList.toggle('liked');
    let likes = parseInt(likesNum.textContent);

    if (isLiked) {
        heart.textContent = '❤️'; 
        likes++;
    } else {
        heart.textContent = '🤍'; 
        likes--;
    }

    likesNum.textContent = likes;
});