const popup = document.getElementById('createPostPopup');
const writeButton = document.querySelector('.write-button');
const cancelButton = document.querySelector('.cancel_but');
const createButton = document.querySelector('.create_but');
const imageUpload = document.getElementById('imageUpload');
const previewImage = document.getElementById('previewImage');
const uploadText = document.querySelector('.upload_text');

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





///////////////////// MULTI SELECT TAG //////////////////////////////////////////////////////////////
const tagContainer = document.getElementById('tag-container');
const tagOptions = document.getElementById('tag-options');
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
function validateForm() {
    const activityName = document.querySelector('.create_act_name input').value;
    const description = document.querySelector('.descript_create').value;
    const eventDate = document.getElementById('eventdate').value;
    const deadline = document.getElementById('deadline').value;
    const participantsNeeded = document.querySelector('.parti_needed input').value;
    
    // ตรวจสอบว่าแต่ละฟิลด์ถูกกรอกหรือไม่
    if (!activityName || !description || !eventDate || !deadline || !participantsNeeded) {
        alert("Please fill out all required fields.");
        return false;
    }

    // ตรวจสอบว่าได้เลือกแท็กหรือไม่
    const selectedTags = document.querySelectorAll('.tag-item');
    if (selectedTags.length === 0) {
        alert("Please select at least one tag.");
        return false;
    }

    // ตรวจสอบว่าเลือกจำนวนผู้เข้าร่วมมากกว่า 0 หรือไม่
    if (parseInt(participantsNeeded) <= 0) {
        alert("Please enter a valid number for participants needed.");
        return false;
    }

    // ตรวจสอบการเลือก Province และ Amphure
    const provinceSelect = document.querySelector('#Province');
    const amphureSelect = document.querySelector('#Amphure');
    if (provinceSelect && provinceSelect.value === "null") {
        alert("Please select a province.");
        return false;
    }

    if (amphureSelect && amphureSelect.value === "null") {
        alert("Please select an amphure.");
        return false;
    }

    // ตรวจสอบ Google Map Link (กรอกลิงก์ iframe หรือ link ปกติ)
    const googleMapLink = document.querySelector('.input_map_link input').value;
    if (!googleMapLink) {
        alert("Please enter a Google Map Link.");
        return false;
    }

    // ตรวจสอบการอัปโหลดภาพ (Preview Image)
    const imageUpload = document.getElementById('imageUpload');
    if (!imageUpload.files.length) {
        alert("Please upload an image.");
        return false;
    }

    // ถ้าทุกอย่างโอเค return true
    return true;
}

// ฟังก์ชันที่ใช้ในปุ่ม Create
createButton.addEventListener('click', () => {
    // เรียกใช้งาน validateForm ก่อนที่จะอนุญาตให้โพสต์
    if (validateForm()) {
        alert("Create Post successfully!");
        popup.style.display = 'none';
    }
});


