import Post from "/js/components/post.js";
import PostInDate from "/js/components/post_in_date.js";

function imgSelection(img, failed="https://tr.rbxcdn.com/30DAY-Avatar-310966282D3529E36976BF6B07B1DC90-Png/352/352/Avatar/Png/noFilter"){
  if (img == "" || img == null) 
      return failed
  else if(img.length < 200) 
      return img
  else 
      return "data:image/jpeg;base64," + img
}

let originalSexValue = "";
let currentSexValue = "";

async function fetchMyProfile() {
  try {
    var path = window.location.search;
    let response = await fetch(`api/user/profile${path}`, {
      method: "GET",
      credentials: "include",
    });
    response = await response.json();
    let isOwner = response.isOwner;
    response = response.user;
    document.getElementById(
      "profilepic"
    ).src = imgSelection(response.profileImg);
    document.getElementById("behaviorscore").value =
      "✨ Behavior Score ✨ : " + response.behaviorScores || "---";
    document.getElementById("username").value = response.username || "---";
    document.getElementById("name").value = response.firstName || "---";
    document.getElementById("surname").value = response.lastName || "---";
    document.getElementById("email").value = response.email || "---";
    document.getElementById("birthdate").value = response.dateOfBirth ? response.dateOfBirth.split("T")[0]: "--";
    document.getElementById("sex").value = response.sex || "---";
    currentSexValue = response.sex;
    document.getElementById("bio").value = response.bio || "---";

    let receivedRatings = response.receivedRatings;

    setTimeout(() => {
      adjustTextareaHeight();
    }, 200);

    if (receivedRatings !== undefined) {
      renderStars(receivedRatings);
    }
    if (!isOwner){
      document.querySelector(".edit-button").innerHTML = ""
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}

function adjustTextareaHeight() {
  const textarea = document.getElementById("bio");
  if (textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }
}

async function toggleEdit() {
  if (window.userProfile.isGoogle) 
    enableEditMode();
  else {
    document.getElementById("popupContainer").style.display = "flex";
    document.getElementById("checkpassword").value = "";
  }
}

function togglePassword() {
  var passwordField = document.getElementById("checkpassword");
  if (!passwordField.value) {
    passwordField.value = "";
    return;
  }
  if (passwordField.type === "password") {
    passwordField.type = "text";
  } else {
    passwordField.type = "password";
  }
}

async function confirmPassword() {
  let checkpass = document.getElementById("checkpassword").value;
  let errorMessage = document.getElementById("error-message");

  if (!checkpass) {
    errorMessage.innerText = "Please enter your password!";
    errorMessage.style.display = "block";
    return;
  }

  let response = await fetch("/api/auth/checkpassword", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: checkpass }),
  });

  let result = await response.json();
  if (result.status === "success") {
    closePopup();
    enableEditMode();
  } else {
    errorMessage.innerText = "Passwords do not match!";
    errorMessage.style.display = "block";
  }
}

function enableEditMode() { 
  document.getElementById("editbtn").style.display = "none";
  document.getElementById("savebtn").style.display = "inline-block";
  document.getElementById("cancelbtn").style.display = "flex";
  document.getElementById("upload_container").style.display = "inline-block";
  document.getElementById("imageUpload").value = "";

  document.getElementById("name").disabled = false;
  document.getElementById("surname").disabled = false;
  document.getElementById("email").disabled = false;
  document.getElementById("birthdate").disabled = false;

  document.getElementById("sex").style.display = "none";
  document.getElementById("sex-dropdown-container").style.display = "block";
  if (window.matchMedia("(max-width: 768px)").matches) {
    document.getElementById("usernamelabel").style.marginTop = "20px";
  }
  if (window.matchMedia("(max-width: 576px)").matches) {
    document.getElementById("imageUpload").style.marginTop = "30px";
    document.getElementById("usernamelabel").style.marginTop = "-20px";
  }
  const sexDropdown = document.getElementById("sex-dropdown");
  const standardSexes = ["Male", "Female", "Non-Binary", "Prefer not to say"];

  if (standardSexes.includes(currentSexValue)) {
    sexDropdown.value = currentSexValue;
    document.getElementById("custom-sex").style.display = "none";
  } else {
    sexDropdown.value = "custom";
    document.getElementById("custom-sex").style.display = "block";
    document.getElementById("custom-sex").value = currentSexValue;
  }

  document.getElementById("bio").disabled = false;
}

function closePopup() {
  document.getElementById("popupContainer").style.display = "none";
  document.getElementById("checkpassword").value = "";
}

function cancelEdit() {
  document.getElementById("editbtn").style.display = "inline-block";
  document.getElementById("savebtn").style.display = "none";
  document.getElementById("cancelbtn").style.display = "none";

  document.getElementById("name").disabled = true;
  document.getElementById("surname").disabled = true;
  document.getElementById("email").disabled = true;
  document.getElementById("birthdate").disabled = true;

  document.getElementById("sex").style.display = "block";
  document.getElementById("sex-dropdown-container").style.display = "none";
  document.getElementById("sex").value = originalSexValue;
  currentSexValue = originalSexValue;

  document.getElementById("bio").disabled = true;
  reloadPage();
}

document.getElementById("sex-dropdown").addEventListener("change", function () {
  const selectedValue = this.value;
  if (selectedValue === "custom") {
    document.getElementById("custom-sex").style.display = "block";
    currentSexValue = document.getElementById("custom-sex").value;
  } else {
    document.getElementById("custom-sex").style.display = "none";
    currentSexValue = selectedValue;
  }
});

document.getElementById("custom-sex").addEventListener("input", function () {
  currentSexValue = this.value;
});

const imageUpload = document.getElementById("imageUpload");
let base64Image = "";

imageUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      base64Image = e.target.result;
      document.getElementById("profilepic").src = base64Image;
      adjustTextareaHeight;
      base64Image = e.target.result.replace(/^data:image\/[a-z]+;base64,/, "");
    };
    reader.readAsDataURL(file);
  }
});

async function saveProfile() {
  const userData = {
    firstName: document.getElementById("name").value,
    lastName: document.getElementById("surname").value,
    email: document.getElementById("email").value,
    dateOfBirth: document.getElementById("birthdate").value,
    sex: currentSexValue,
    bio: document.getElementById("bio").value,
    profileImg: base64Image,
  };

  try {
    let response = await fetch("/api/user/myprofile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    let result = await response.json();

    if (result.status === "updated") {
      if (result.token) {
        localStorage.setItem("authToken", result.token);
      }
      originalSexValue = currentSexValue;
    } else {
      alert("Profile update failed");
    }

    document.getElementById("editbtn").style.display = "inline-block";
    document.getElementById("savebtn").style.display = "none";
    document.getElementById("cancelbtn").style.display = "none";

    document.getElementById("name").disabled = true;
    document.getElementById("surname").disabled = true;
    document.getElementById("email").disabled = true;
    document.getElementById("birthdate").disabled = true;
    document.getElementById("sex").style.display = "block";
    document.getElementById("sex-dropdown-container").style.display = "none";
    document.getElementById("sex").value = currentSexValue;
    document.getElementById("bio").disabled = true;

    location.reload();
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Error updating profile: " + error.message);
  }
}

function reloadPage() {
  location.reload();
}
// user Tags
document.addEventListener("DOMContentLoaded", async function () {
  await window.userProfileLoaded;
  document.getElementById("editbtn").addEventListener("click", toggleEdit);
  document.getElementById("savebtn").addEventListener("click", saveProfile);
  document.getElementById("cancelbtn").addEventListener("click", cancelEdit);
  document.querySelector(".toggle-password").addEventListener("click", togglePassword);
  document.getElementById("confirm-btn").addEventListener("click", confirmPassword);
  document.getElementById("close-pop-btn").addEventListener("click", closePopup);
  async function fetchTags() {
    try {
      var path = window.location.search;
      let response = await fetch(`/api/post/user${path}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch posts");

      let data = await response.json();
      return data;
    } catch (error) {
      console.error("Error loading posts:", error);
      return [];
    }
  }

  function rendersTags(postWrapper) {
    const postsList = document.getElementById("tag-list");

    const actTypes = postWrapper && postWrapper.length > 0 ? postWrapper : [];
    const postItem = document.createElement("profile-tags");

    postItem.innerHTML = `
                        <span class="profile-tag">#${actTypes}</span>
                    `;

    postsList.appendChild(postItem);
  }

  const allTags = await fetchTags();
  const existingTags = new Set();

  if (Array.isArray(allTags)) {
    allTags.forEach((postWrapper) => {
      if (Array.isArray(postWrapper.actTypes)) {
        postWrapper.actTypes.forEach((actType) => {
          if (!existingTags.has(actType)) {
            existingTags.add(actType);
            rendersTags(actType);
          }
        });
      }
    });
  } else {
    console.error("Invalid posts structure:", allTags);
  }
});

const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

function renderStars(receivedRatings) {
  const starsContainer = document.getElementById("stars-container");
  starsContainer.innerHTML = "";

  const fullStars = Math.floor(receivedRatings);
  const hasHalfStar = receivedRatings % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    const star = document.createElement("div");
    star.className = "star star-full";
    star.innerHTML = starSvg;
    starsContainer.appendChild(star);
  }

  if (hasHalfStar) {
    const starContainer = document.createElement("div");
    starContainer.className = "star";

    const emptyStar = document.createElement("div");
    emptyStar.className = "star-empty";
    emptyStar.innerHTML = starSvg;

    const halfStar = document.createElement("div");
    halfStar.className = "star-half";
    halfStar.innerHTML = starSvg;

    starContainer.appendChild(emptyStar);
    starContainer.appendChild(halfStar);
    starsContainer.appendChild(starContainer);
  }

  const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < remainingStars; i++) {
    const star = document.createElement("div");
    star.className = "star star-empty";
    star.innerHTML = starSvg;
    starsContainer.appendChild(star);
  }

  const ratingvalue = document.getElementById("ratingvalue");
  ratingvalue.innerHTML = "(" + receivedRatings + ")";

  (function () {
    const sakuraContainer = document.getElementById("sakura-container");
    let windowWidth = window.innerWidth;

    for (let i = 0; i < 50; i++) {
      createPetal();
    }

    function createPetal() {
      const petal = document.createElement("div");
      petal.className = "sakura-petal";

      const left = Math.random() * windowWidth;
      const size = Math.random() * 15 + 15;
      const durationFall = Math.random() * 10 + 8;
      const delay = Math.random() * 15;

      const colors = ["light", "medium", "dark"];
      const colorClass = colors[Math.floor(Math.random() * colors.length)];
      petal.classList.add(colorClass);

      petal.style.left = `${left}px`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.animationDuration = `${durationFall}s`;
      petal.style.animationDelay = `${delay}s`;

      sakuraContainer.appendChild(petal);

      setTimeout(() => {
        petal.remove();
      }, (durationFall + delay) * 1000);
    }

    setInterval(createPetal, 300);

    window.addEventListener("resize", () => {
      windowWidth = window.innerWidth;
    });
  })();
}

document.addEventListener("DOMContentLoaded", function () {
  fetchMyProfile();
});

document.addEventListener("DOMContentLoaded", async function () {
  function createHidePost(posts){
      const showMoreBtn = document.createElement("a");
      const userPosts = document.getElementById("posts-list")
      const postContainer = document.querySelector(".postcontainer")
      const main = document.querySelector("main");

      showMoreBtn.textContent = "More Posts";
      showMoreBtn.classList.add("search-more-user-btn");
  
      const maxVisible = 6;
      let isExpanded = false;
      let postCount = posts.length;
  
      posts.forEach((post, index) => {
          if (index >= maxVisible) 
            post.style.display = "none";
          userPosts.appendChild(post);
      });
  
      if (postCount > maxVisible) {
          if (!postContainer.contains(showMoreBtn)) {
            postContainer.appendChild(showMoreBtn);
          }
  
          showMoreBtn.addEventListener("click", function (event) {
              event.preventDefault();
              isExpanded = !isExpanded;
              // ถ้ากด "More Users" จะต้องเพิ่ม card ที่ซ่อนไว้ลงใน DOM
              if (isExpanded) {
                  for (let i = maxVisible; i < postCount; i++) {
                      posts[i].style.display = "block";
                  }
              } else {
                  for (let i = maxVisible; i < postCount; i++) {
                      posts[i].style.display = "none";
                  }
                  document.querySelector(".posttitle").scrollIntoView({
                      behavior: "smooth",
                      block: "start" 
                  });
              }
  
              showMoreBtn.textContent = isExpanded ? "Less Posts" : "More Posts";
          });
      }
  }

  async function fetchPosts() {
    try {
      var path = window.location.search;
      let response = await fetch(`/api/post/user${path}`);

      if (!response.ok) throw new Error("Failed to fetch posts");

      let data = await response.json();
      return data;
    } catch (error) {
      console.error("Error loading posts:", error);
      return [];
    }
  }

  async function renderPosts(){
    let posts = await fetchPosts() 
    let postList = []
    posts.forEach((post) => {
                let owner = post.owner
                let activity = post.activity
                let actType = post.actTypes
                post = post.post
        
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
                postList.push(new Post(
                    post.id, formattedDate, post.postName, activity.province +", "+ activity.district, 
                    post.curParticipant, post.maxParticipant, post.totalApplicant, 
                    actType, 
                    post.coverPageImg, post.like, post.isLiked, activity.online
                ).render());
            })
    createHidePost(postList)
  }
  renderPosts()
});

// window.addEventListener("DOMContentLoaded", arrangePostsLayout);
// window.addEventListener("resize", arrangePostsLayout);

function adjustLayoutForScreenSize() {
  const container = document.querySelector(".container");
  const editButton = document.querySelector(".edit-button");
  const behaviorScore = document.querySelector(".behavior-score");

  if (window.innerWidth <= 768) {
    if (editButton && behaviorScore) {
      container.insertBefore(editButton, container.firstChild.nextSibling);
      container.insertBefore(behaviorScore, editButton.nextSibling);
    }
  } else {
  }
}


window.addEventListener("DOMContentLoaded", adjustLayoutForScreenSize);
window.addEventListener("resize", adjustLayoutForScreenSize);
