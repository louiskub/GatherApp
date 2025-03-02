const popup = document.getElementById('createPostPopup');
const writeButton = document.getElementById('menu-write-button');
const cancelButton = document.querySelector('.cancel_but');
const createButton = document.querySelector('.create_but');
const imageUpload = document.getElementById('imageUpload');
const previewImage = document.getElementById('previewImage');
const uploadText = document.querySelector('.preview_text');

// ฟังก์ชันแสดง Popup เมื่อคลิกปุ่ม Cancel
cancelButton.addEventListener('click', () => {
    popup.style.display = 'none';
    document.body.classList.remove('no-scroll');
});

// ฟังก์ชันแสดง Popup เมื่อคลิกปุ่ม Create
writeButton.addEventListener('click', () => {
    popup.style.display = 'flex';
    document.body.classList.add('no-scroll');
});

// ฟังก์ชัน triggerUpload
function triggerUpload() {
    imageUpload.click(); // ทำให้การคลิกที่ preview กระตุ้นการคลิกที่ input[type="file"]
}

// ฟังการเปลี่ยนแปลงไฟล์ที่เลือก
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0]; // รับไฟล์ที่เลือก
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result; // แสดงภาพที่เลือก
            previewImage.style.display = 'block'; // แสดงภาพที่เลือก
            uploadText.style.display = 'none'; // ซ่อนข้อความ "Upload Image"
        };
        reader.readAsDataURL(file); // อ่านไฟล์ที่เลือกเพื่อแสดงในรูปแบบ Base64
    }
});

// ผูกเหตุการณ์คลิกที่ preview ให้เรียกฟังก์ชัน triggerUpload
const preview = document.querySelector('.preview');
preview.addEventListener('click', triggerUpload);

document.addEventListener("DOMContentLoaded", function () {
    let deadlineInput = document.getElementById("deadline");
    let eventInput = document.getElementById("eventdate");
    let deadlineErrorMsg = document.getElementById("deadline-error-msg");
    let eventErrorMsg = document.getElementById("event-error-msg");

    function updateMinDateTime() {
        let now = new Date();
        let minDateTime = now.toISOString().slice(0, 16);

        deadlineInput.min = minDateTime;
        eventInput.min = minDateTime;
    }

    function validateDeadline() {
        let deadlineValue = new Date(deadlineInput.value);
        let now = new Date();

        if (deadlineValue < now) {
            deadlineErrorMsg.style.display = "block";
            deadlineInput.value = "";
        } else {
            deadlineErrorMsg.style.display = "none";
            validateEventDate(); // ตรวจสอบ Event Date ด้วย
        }
    }

    function validateEventDate() {
        let deadlineValue = new Date(deadlineInput.value);
        let eventValue = new Date(eventInput.value);
        let now = new Date();

        if (eventValue < now || (deadlineInput.value && eventValue <= deadlineValue)) {
            eventErrorMsg.style.display = "block";
            eventInput.value = "";
        } else {
            eventErrorMsg.style.display = "none";
        }
    }

    // ตั้งค่า min เมื่อโหลดหน้าเว็บ
    updateMinDateTime();

    // ตรวจสอบเมื่อมีการเปลี่ยนค่า
    deadlineInput.addEventListener("input", validateDeadline);
    eventInput.addEventListener("input", validateEventDate);
});

///////////////////// Fetch SELECT TAG //////////////////////////////////////////////////////////////

async function fetchAllActTypes(){
    try {
        let response = await fetch("/api/acttype");
        if (!response.ok) {
            return [];
        }
        else {
            response = await response.json();
            return response;
        }
        
    } catch (error) {
        console.error("Error loading JSON:", error);
        return [];
    }
}

const tagOptions = document.getElementById('tag-options');
(async function() {
    let actTypes = await fetchAllActTypes();
    actTypes.forEach((actType) => {
        let div = document.createElement('div')
        div.dataset.value = actType
        div.textContent = actType
        tagOptions.appendChild(div)
    })
})();


///////////////////// MULTI SELECT TAG //////////////////////////////////////////////////////////////
const tagContainer = document.getElementById('tag-container');
const tagList = document.getElementById('tag-list');
const tagPlaceholder = document.getElementById('tag-placeholder');
const maxTags = 3;
const tagLimitMsg = document.getElementById('tag-limit-msg');

// เพิ่ม position relative ให้กับ tag-container และกำหนด z-index
tagContainer.style.position = 'relative'; // เพิ่ม position relative
tagOptions.style.zIndex = '2001'; // เพิ่ม z-index ให้กับ tag-options
tagContainer.style.zIndex = '1'; // ลด z-index ของ tag-container ถ้าจำเป็น

tagContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-tag')) return;
    tagOptions.classList.toggle('active');
});

tagOptions.addEventListener('click', function (e) {
    if (e.target.dataset.value && !e.target.classList.contains('hidden')) {
        const value = e.target.dataset.value;
        const existingTags = [...tagList.querySelectorAll('.tag-item')].map(tag => tag.dataset.value);

        if (!existingTags.includes(value) && existingTags.length < maxTags) {
            const tag = document.createElement('span');
            tag.className = 'tag-item';
            tag.dataset.value = value;
            tag.textContent = value;
            tag.innerHTML += ` <span class="remove-tag">&times;</span>`;
            tagList.appendChild(tag);
            updateTagPlaceholder();
            checkTagLimit();
        }
    }
});

tagList.addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-tag')) {
        const tag = e.target.parentElement;
        tagList.removeChild(tag);
        updateTagPlaceholder();
        checkTagLimit();
    }
});

document.addEventListener('click', function (e) {
    if (!tagContainer.contains(e.target)) {
        tagOptions.classList.remove('active');
    }
});

function updateTagPlaceholder() {
    if (tagList.querySelectorAll('.tag-item').length === 0) {
        tagPlaceholder.style.display = 'inline';
    } else {
        tagPlaceholder.style.display = 'none';
    }
}

function checkTagLimit() {
    const selectedCount = tagList.querySelectorAll('.tag-item').length;
    if (selectedCount >= maxTags) {
        document.querySelectorAll('.tag-options div[data-value]').forEach(option => {
            option.classList.add('hidden');
        });
        tagLimitMsg.style.display = 'block';
    } else {
        document.querySelectorAll('.tag-options div[data-value]').forEach(option => {
            option.classList.remove('hidden');
        });
        tagLimitMsg.style.display = 'none';
    }
}

updateTagPlaceholder();

///////////////////// SELECT PROVINCE & DISTRICT //////////////////////////////////////////////////////////////

class Select{
    constructor(data, name){
        this.select = document.createElement('select');
        this.select.id = name;
        this.select.name = name;
        this.select.appendChild(new Option(`Select ${name}`, null));
        data.forEach((e) => {
            this.select.appendChild(new Option(e.eng, e.id));
        });
    }
    render(){
        return this.select;
    }
}

async function ProvincesAndAmphures(){
    let province, filteredAmp, amphure 

    async function GetProvincesAndAmphures(){
        await fetch("/js/GOLF/provinces.json").then(response => response.json())
                        .then(data => {
                            province = data
                        })
                        .catch(error => console.error("Error loading JSON:", error));
        await fetch("/js/GOLF/amphures.json")
                        .then(response => response.json())
                        .then(data => {
                            amphure = data
                        })
                        .catch(error => console.error("Error loading JSON:", error));
    }

    async function filterAmphure(provId){
        filteredAmp = amphure.filter((a) => {
            if (provId == a.province_id)
                return a
        }) 
        
    }

    await GetProvincesAndAmphures()

    let test = document.querySelector(".location_container")
    let tempSpan = document.createElement("span")

    let provinceSel = new Select(province, "Province").render()
    test.appendChild(provinceSel);
    test.appendChild(tempSpan)
    provinceSel.addEventListener('change', function() {
        if (provinceSel.value != "null"){
            filterAmphure(provinceSel.value)
            let amphureSel = new Select(filteredAmp, "Amphure").render()
            test.replaceChild(amphureSel, test.lastChild)
        }
        else
        {
            test.replaceChild(tempSpan, test.lastChild)
        }
    })
}

ProvincesAndAmphures();




/////////////////Check Input Before Create/////////////////////////////////////////////////////////
// ฟังก์ชันตรวจสอบการกรอกข้อมูลในฟอร์มทั้งหมด
async function validateForm() {
    const activityName = document.querySelector('.create_act_name input').value;
    const description = document.querySelector('.descript_create').value;
    const eventDate = document.getElementById('eventdate').value;
    const deadline = document.getElementById('deadline').value;
    const participantsNeeded = document.querySelector('.parti_needed input').value;
    // ตรวจสอบว่าแต่ละฟิลด์ถูกกรอกหรือไม่
    // ตรวจสอบการอัปโหลดภาพ (Preview Image)
    const imageUpload = document.getElementById('imageUpload');
    console.log(previewImage.src.length)
    if (!imageUpload.files.length) {
        window.showToast("Please upload an image.", "warning");
        return false;
    }
    if (previewImage.src.length > 2000000) {
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

    // if (!activityName || !description || !eventDate || !deadline || !participantsNeeded) {
    //     // window.showToast("Please fill out all required fields.");
    //     window.showToast("Please fill out all required fields.", "warning");
    //     return false;
    // }

    // ตรวจสอบว่าได้เลือกแท็กหรือไม่
    const selectedTags = document.querySelectorAll('.tag-item');
    if (selectedTags.length === 0) {
        window.showToast("Please select at least one tag.", "warning");
        return false;
    }

    // ตรวจสอบการเลือก Province และ Amphure
    const provinceSelect = document.querySelector('#Province');
    const amphureSelect = document.querySelector('#Amphure');
    if (provinceSelect && provinceSelect.value === "null") {
        window.showToast("Please select a province.", "warning");
        return false;
    }

    if (amphureSelect && amphureSelect.value === "null") {
        window.showToast("Please select an amphure.", "warning");
        return false;
    }

    // ตรวจสอบ Google Map Link (กรอกลิงก์ iframe หรือ link ปกติ)
    const googleMapLink = document.querySelector('.input_map_link input').value;
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
    
    // ตรวจสอบว่าเลือกจำนวนผู้เข้าร่วมมากกว่า 0 หรือไม่
    if (parseInt(participantsNeeded) <= 0) {
        window.showToast("Please enter a valid number for participants needed.", "warning");
        return false;
    }
    
    async function createPost() {
        const isAttached = document.querySelector(".check_attach_file input").checked
        const provinceText = provinceSelect.options[provinceSelect.selectedIndex].text;
        const amphureText = amphureSelect.options[amphureSelect.selectedIndex].text;

        const mapSrc = googleMapLink
        const match = mapSrc.match(/<iframe[^>]*\bsrc=["']([^"']+)["']/i);
        const resultMap = match ? match[1] : null;

        let sendImg = previewImage.src.split(",")[1]
        let tags = []
        selectedTags.forEach((tag) => {
            tags.push(tag.dataset.value)
        })

        let today = new Date();
        today.setHours(7, 0, 0, 0); // Set hour, minute, second, and millisecond to zero
        today = today.toISOString().split('.')[0]; // Remove milliseconds
        console.log("POSTING...")
        let response = await fetch("/api/post", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postName: activityName,
                detail: description,
                isAttached: isAttached,
                maxParticipant: participantsNeeded,
    
                // openDateTime: today,
                closeDateTime: deadline,
                actDatetime: eventDate,
    
                province: provinceText,
                district: amphureText,
                online: false,
                googleMapLink: resultMap,
    
                actTypes: tags,
                coverPageImg: sendImg
            })
        })
        .catch(error => {
            console.error("Error:", error);
            return
        })
        if (response.redirected){
            popup.style.display = 'none';
            window.redirectToLogin()
        }
        else if (!response.ok) {
            window.showToast("Failed to create post.", "error");
        }
        else {
            await window.changeToast("Post created successfully", "/", "success")
            popup.style.display = 'none';
        }
    }
    await createPost();
}

// ฟังก์ชันที่ใช้ในปุ่ม Create
createButton.addEventListener('click', async () => {
    // เรียกใช้งาน validateForm ก่อนที่จะอนุญาตให้โพสต์
    await validateForm();
});