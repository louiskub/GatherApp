document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".reg_but").addEventListener("click", function() {
        alert("You have successfully registered for this activity!");
    });
    document.querySelector(".cancel_post_but").addEventListener("click", function() {
        alert("You have canceled this activity!");
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

const heart = document.querySelector('.heart i');
const likesNum = document.querySelector('.likes_num');

heart.addEventListener('click', () => {
    let likes = parseInt(likesNum.textContent);

    if (heart.classList.contains('fa-regular')) {
        heart.classList.replace('fa-regular', 'fa-solid'); 
        likes++;
    } else {
        heart.classList.replace('fa-solid', 'fa-regular');
        likes--;
    }

    likesNum.textContent = likes;
});