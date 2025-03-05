import LikePostHandler from "/js/components/handler/like_post_handler.js";

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('postid') || urlParams.get('postId');

// Select DOM elements with a helper function
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

var post, isOwner, owner, activity, actTypes, participants

async function showPostDetail() {
    async function fetchPost() {
        let response = await fetch(`/api/post?postid=${postId}`);
        if (!response.ok) {
            alert("Post not found");
            return;
        }
        post = await response.json();
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

    post = await fetchPost();
    owner = post.owner;
    isOwner = owner.username == window.userProfile.username;
    activity = post.activity;
    actTypes = post.actTypes;
    participants = post.participants;
    post = post.post

    const postName = document.querySelector(".post_act_name h2");
    postName.textContent = post.postName;

    const postOwner = document.querySelector(".actbox1_left");
    postOwner.querySelector("a").href = `/profile?username=${owner.username}`
    postOwner.querySelector("img").src = chooseImg(owner.profileImg)
    postOwner.querySelector("h2").textContent = owner.username

    const deadline = document.querySelector(".deadline")
    deadline.textContent = `Application Deadline: ${new Date(activity.closeDateTime).toLocaleString()}`
    
    const postImg = document.querySelector(".act_img img");
    postImg.src = `data:image/jpeg;base64, ${post.coverPageImg}`;

    const postDesc = document.querySelector(".act_descript");
    postDesc.textContent = post.detail;

    const googleMap = document.querySelector(".googlemap");
    if (activity.googleMapLink && activity.googleMapLink.includes("https://www.google.com/maps/embed?pb="))
        googleMap.querySelector("iframe").src = activity.googleMapLink;
    else
        googleMap.removeChild(googleMap.querySelector("iframe"));


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
    miniLeft.querySelector("h3").innerHTML = `<i class="fa-solid fa-location-dot"></i> ` + activity.province + ", " + activity.district;
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
}


//////////////////////////////////////EDIT POPUP//////////////////////////////////////////////////////////////
// Get all required elements
const elements = {
  popup: $('#popup_create'),
  canceleditButton: $('.cancel_edit_but'),
  submiteditButton: $('.submit_edit_but'),
  imageUpload: $('#imageUpload'),
  previewImage: $('#previewImage'),
  uploadText: $('.preview_text'),
  tagContainer: $('#tag-container'),
  tagList: $('#tag-list'),
  tagOptions: $('#tag-options'),
  tagPlaceholder: $('#tag-placeholder'),
  tagLimitMsg: $('#tag-limit-msg'),
  preview: $('.preview'),
  locationContainer: $('.location_container')
};

// Constants
const MAX_TAGS = 3;
const MAX_IMAGE_SIZE = 2000000;

// Initialize event listeners
function initEventListeners() {
  // Image upload
  elements.preview.addEventListener('click', () => elements.imageUpload.click());
  elements.imageUpload.addEventListener('change', handleImageUpload);

  // Tag selection
  elements.tagContainer.style.position = 'relative';
  elements.tagOptions.style.zIndex = '2001';
  elements.tagContainer.style.zIndex = '1';

  elements.tagContainer.addEventListener('click', e => {
    if (!e.target.classList.contains('remove-tag')) {
      elements.tagOptions.classList.toggle('active');
    }
  });

  elements.tagOptions.addEventListener('click', handleTagSelection);
  elements.tagList.addEventListener('click', handleTagRemoval);

  document.addEventListener('click', e => {
    if (!elements.tagContainer.contains(e.target)) {
      elements.tagOptions.classList.remove('active');
    }
  });

  // Create button
  elements.submiteditButton.addEventListener('click', validateForm);

  elements.canceleditButton.addEventListener('click', () => {
    elements.popup.style.display = 'none';
    document.body.style.overflow = 'auto';
  })
}

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      elements.previewImage.src = e.target.result;
      elements.previewImage.style.display = 'block';
      elements.uploadText.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}

// Handle tag selection
function handleTagSelection(e) {
  if (e.target.dataset.value && !e.target.classList.contains('hidden')) {
    const value = e.target.dataset.value;
    const existingTags = [...elements.tagList.querySelectorAll('.tag-item')].map(tag => tag.dataset.value);

    if (!existingTags.includes(value) && existingTags.length < MAX_TAGS) {
      const tag = document.createElement('span');
      tag.className = 'tag-item';
      tag.dataset.value = value;
      tag.innerHTML = `${value} <span class="remove-tag">&times;</span>`;
      elements.tagList.appendChild(tag);
      updateTagPlaceholder();
      checkTagLimit();
    }
  }
}

// Handle tag removal
function handleTagRemoval(e) {
  if (e.target.classList.contains('remove-tag')) {
    elements.tagList.removeChild(e.target.parentElement);
    updateTagPlaceholder();
    checkTagLimit();
  }
}

// Update tag placeholder visibility
function updateTagPlaceholder() {
  elements.tagPlaceholder.style.display = 
    elements.tagList.querySelectorAll('.tag-item').length === 0 ? 'inline' : 'none';
}

// Check tag limit
function checkTagLimit() {
  const selectedCount = elements.tagList.querySelectorAll('.tag-item').length;
  const options = $$('.tag-options div[data-value]');
  
  if (selectedCount >= MAX_TAGS) {
    options.forEach(option => option.classList.add('hidden'));
    elements.tagLimitMsg.style.display = 'block';
  } else {
    options.forEach(option => option.classList.remove('hidden'));
    elements.tagLimitMsg.style.display = 'none';
  }
}

// Initialize date validation
function initDateValidation() {
  const deadlineInput = $('#deadline');
  const eventInput = $('#eventdate');
  const deadlineErrorMsg = $('#deadline-error-msg');
  const eventErrorMsg = $('#event-error-msg');

  // Set minimum date/time to now
  function updateMinDateTime() {
    const minDateTime = new Date().toISOString().slice(0, 16);
    deadlineInput.min = minDateTime;
    eventInput.min = minDateTime;
  }

  // Validate deadline
  function validateDeadline() {
    const deadlineValue = new Date(deadlineInput.value);
    const now = new Date();

    if (deadlineValue < now) {
      deadlineErrorMsg.style.display = "block";
      deadlineInput.value = "";
    } else {
      deadlineErrorMsg.style.display = "none";
      validateEventDate();
    }
  }

  // Validate event date
  function validateEventDate() {
    const deadlineValue = new Date(deadlineInput.value);
    const eventValue = new Date(eventInput.value);
    const now = new Date();

    if (eventValue < now || (deadlineInput.value && eventValue <= deadlineValue)) {
      eventErrorMsg.style.display = "block";
      eventInput.value = "";
    } else {
      eventErrorMsg.style.display = "none";
    }
  }

  updateMinDateTime();
  deadlineInput.addEventListener("input", validateDeadline);
  eventInput.addEventListener("input", validateEventDate);
}

// Fetch activity types
async function fetchAllActTypes() {
  try {
    const response = await fetch("/api/acttype");
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Error loading JSON:", error);
    return [];
  }
}

// Initialize activity types
async function initActivityTypes() {
  const actTypesAll = await fetchAllActTypes();
  actTypesAll.forEach(actType => {
    const div = document.createElement('div');
    div.dataset.value = actType;
    div.textContent = actType;
    elements.tagOptions.appendChild(div);
  });
}

// Select class for dropdowns
class Select {
  constructor(data, name) {
    this.select = document.createElement('select');
    this.select.id = name;
    this.select.name = name;
    this.select.appendChild(new Option(`Select ${name}`, null));
    data.forEach(e => {
      this.select.appendChild(new Option(e.eng, e.id));
    });
  }
  render() {
    return this.select;
  }
}

// Initialize provinces and amphures
async function initProvincesAndAmphures() {
  let province, amphure;

  // Fetch data
  try {
    const [provinceResponse, amphureResponse] = await Promise.all([
      fetch("/js/GOLF/provinces.json").then(res => res.json()),
      fetch("/js/GOLF/amphures.json").then(res => res.json())
    ]);
    
    province = provinceResponse;
    amphure = amphureResponse;
  } catch (error) {
    console.error("Error loading JSON:", error);
    return;
  }

  // Filter amphures by province
  function filterAmphure(provId) {
    return amphure.filter(a => a.province_id == provId);
  }

  const tempSpan = document.createElement("span");
  const provinceSel = new Select(province, "Province").render();
  
  elements.locationContainer.appendChild(provinceSel);
  elements.locationContainer.appendChild(tempSpan);
  
  provinceSel.addEventListener('change', function() {
    if (provinceSel.value != "null") {
      const filteredAmp = filterAmphure(provinceSel.value);
      const amphureSel = new Select(filteredAmp, "Amphure").render();
      elements.locationContainer.replaceChild(amphureSel, elements.locationContainer.lastChild);
    } else {
      elements.locationContainer.replaceChild(tempSpan, elements.locationContainer.lastChild);
    }
  });

  if (isOwner && activity.province){
    provinceSel.value = province.find((p) => {
      return p.eng == activity.province
    }).id;
    const filteredAmp = filterAmphure(provinceSel.value);
    const amphureSel = new Select(filteredAmp, "Amphure").render();
    elements.locationContainer.replaceChild(amphureSel, elements.locationContainer.lastChild);
    if (activity.district){
      amphureSel.value = filteredAmp.find((a) => {
        return a.eng == activity.district
      }).id;
    }
  }
}

// Validate form before submission
async function validateForm() {
    // Get form values
    const activityName = $('.create_act_name input').value;
    const description = $('.descript_create').value;
    const eventDate = $('#eventdate').value;
    const deadline = $('#deadline').value;
    const participantsNeeded = $('.parti_needed input').value;
    const googleMapLink = $('.input_map_link input').value;
    const selectedTags = $$('.tag-item');
    const provinceSelect = $('#Province');
    const amphureSelect = $('#Amphure');
  
    // Check each field individually
    if (!elements.imageUpload.files.length) {
        window.showToast("Please upload an image.", "warning");
        return false;
    }
    
    if (elements.previewImage.src.length > MAX_IMAGE_SIZE) {
        window.showToast("Image size is too large. Please upload an image less than 2 MB.", "warning");
        return false;
    }

    if (!description) {
        window.showToast("Please enter activity description.", "warning");
        return false;
    }
    
    if (!activityName) {
      window.showToast("Please enter activity name.", "warning");
      return false;
    }
    
    if (selectedTags.length === 0) {
        window.showToast("Please select at least one tag.", "warning");
        return false;
    }

    if (!provinceSelect || provinceSelect.value === "null") {
        window.showToast("Please select a province.", "warning");
        return false;
    }
    
    if (!amphureSelect || amphureSelect.value === "null") {
        window.showToast("Please select an amphure.", "warning");
        return false;
    }
    
    if (!googleMapLink) {
        window.showToast("Please enter a Google Map Link.", "warning");
        return false;
    }
    
    if (!eventDate) {
      window.showToast("Please select event date.", "warning");
      return false;
    }
    
    if (!deadline) {
      window.showToast("Please select deadline date.", "warning");
      return false;
    }
    
    if (!participantsNeeded) {
      window.showToast("Please enter number of participants needed.", "warning");
      return false;
    }
  
    if (parseInt(participantsNeeded) <= 0) {
      window.showToast("Please enter a valid number for participants needed.", "warning");
      return false;
    }
  
    await editPost();
  }

// Edit post
async function editPost() {
  const isAttached = $('.check_attach_file input').checked;
  const provinceSelect = $('#Province');
  const amphureSelect = $('#Amphure');
  const provinceText = provinceSelect.options[provinceSelect.selectedIndex].text;
  const amphureText = amphureSelect.options[amphureSelect.selectedIndex].text;
  const googleMapLink = $('.input_map_link input').value;
  const activityName = $('.create_act_name input').value;
  const description = $('.descript_create').value;
  const participantsNeeded = $('.parti_needed input').value;
  const deadline = $('#deadline').value;
  const eventDate = $('#eventdate').value;
  const selectedTags = $$('.tag-item');

  // Extract iframe src if present
  const match = googleMapLink.match(/<iframe[^>]*\bsrc=["']([^"']+)["']/i);
  const resultMap = match ? match[1] : googleMapLink;

  // Prepare image data
  const sendImg = elements.previewImage.src.split(",")[1];
  
  // Prepare tags
  const tags = Array.from(selectedTags).map(tag => tag.dataset.value);

  // Set today's date
  const today = new Date();
  today.setHours(7, 0, 0, 0);
  
  try {
    const response = await fetch(`/api/post?postid=${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postName: activityName,
        detail: description,
        isAttached: isAttached,
        maxParticipant: participantsNeeded,
        closeDateTime: deadline,
        actDatetime: eventDate,
        province: provinceText,
        district: amphureText,
        online: false,
        googleMapLink: resultMap,
        actTypes: tags,
        coverPageImg: sendImg
      })
    });

    if (response.redirected) {
      elements.popup.style.display = 'none';
      window.redirectToLogin();
    } else if (!response.ok) {
      window.showToast("Failed to create post.", "error");
    } else {
      elements.popup.style.display = 'none';
      await window.showToast("Post updated successfully", "success");
      window.location.reload();
    }
  } catch (error) {
    console.error("Error:", error);
    window.showToast("Failed to create post.", "error");
  }
}

function editPostInit(){
  const isAttached = $('.check_attach_file input');
  const activityName = $('.create_act_name input');
  const description = $('.descript_create');
  const eventDate = $('#eventdate');
  const deadline = $('#deadline');
  const participantsNeeded = $('.parti_needed input');
  const googleMapLink = $('.input_map_link input');
  // ไม่ใช้ .value
  
  isAttached.checked = post.isAttached;
  activityName.value = post.postName;
  description.value = post.detail;
  let temp = new Date(activity.actDatetime);
  temp.setHours(temp.getHours() - temp.getTimezoneOffset() / 60);
  eventDate.value = temp.toISOString().slice(0, 16);

  temp = new Date(activity.closeDateTime);
  temp.setHours(temp.getHours() - temp.getTimezoneOffset() / 60);
  deadline.value = temp.toISOString().slice(0, 16);

  participantsNeeded.value = post.maxParticipant
  googleMapLink.value = `<iframe src="${activity.googleMapLink}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`  
  actTypes.forEach(actType => {
    const div = document.createElement('div');
    div.dataset.value = actType;
    div.textContent = actType;
    handleTagSelection({ target: div });
  })

  const byteCharacters = atob(post.coverPageImg);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  const file = new File([blob], "coverPageImg.jpg", { type: 'image/jpeg' });

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  elements.imageUpload.files = dataTransfer.files;

  elements.previewImage.src = `data:image/jpeg;base64, ${post.coverPageImg}`
  elements.previewImage.style.display = 'block';
  elements.uploadText.style.display = 'none';
}

async function userButtonHandler(){
  const editBut = document.querySelector(".edit_but");
  const viewBut = document.querySelector(".view_but");
  const cancelBut = document.querySelector(".cancel_post_but");
  const regBut = document.querySelector(".reg_but");
  const appBut = document.querySelector(".app_but");
  if (isOwner) {
      editBut.style.display = "block";
      // viewBut.style.display = "block";
      cancelBut.style.display = "block";
  }else {
      if (!post.isApplied){
          regBut.style.display = "block";
          if (post.isAttached)
              appBut.style.display = "block";
      }
      else {
          if (post.isParticipant){
              regBut.style.display = "block";
              regBut.textContent = "You are already a participant"
          }
          cancelBut.style.display = "block";
          cancelBut.textContent = "Cancel Registration"
      }
  }

  ///////////////// Button Event /////////////////
  if (!post.isParticipant)
    regBut.addEventListener("click", async function() {        
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
            console.log(response)
        else {
            if (response.redirected)
                window.redirectToLogin();
            else {
                response = await response.json();
                if (response.error) {
                    window.changePage(response.error, "/login", "error");
                } else {
                    window.changePage("You have successfully registered for this activity!", 
                                      window.location.pathname + window.location.search, 
                                      "success")
                }
            }
        }
    })

  cancelBut.addEventListener("click", async function() {
      let head, cont, noText, yesText;
      let apiPath, successMessage, failMessage, successRedirect;
      if (isOwner){
        head = "Delete this post?"
        cont = "Are you sure you want to delete this post? This action cannot be undone."
        noText = "Keep it"
        yesText = "Delete post"

        apiPath = `/api/post?postid=${postId}`
        successMessage = "Post deleted successfully"
        failMessage = "Failed to delete post"
        successRedirect = "/home"
      }
      else {
        head = "Cancel this registration?"
        cont = "Are you sure you want to cancel this registration? This action cannot be undone."
        noText = "Keep it"
        yesText = "Cancel registration"

        apiPath = `api/user/applypost?postid=${postId}`
        successMessage = "Post registration canceled successfully"
        failMessage = "Failed to cancel post registration"
        successRedirect = window.location.pathname + window.location.search
      }
    window.confirmAction(
      head,
      cont,
      noText,
      yesText,
      async () => await fetch(apiPath, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
      })
        .then(response => {
            if (response.ok) {
                window.changePage(successMessage, successRedirect, "success");
            } else {
                window.changePage(failMessage, "/home", "error");
            }
        })
    );
  });
}

document.addEventListener("DOMContentLoaded", async function() {
  await window.userProfileLoaded;
  await showPostDetail();
  await userButtonHandler();

  initEventListeners();
  initDateValidation();
  await initActivityTypes();
  await initProvincesAndAmphures();
  updateTagPlaceholder();
  if (isOwner)
    editPostInit();
});
