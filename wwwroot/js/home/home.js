import Dropdown from "/js/components/dropdown.js";
import Post from "/js/components/post.js";
import PostInDate from "/js/components/post_in_date.js";


async function createDropDown(){
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

    const main = document.querySelector(".main");
    const sidenav = document.querySelector(".sidenav");
    const themeToggle = document.querySelector(".theme-switch");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    let actTypes = await fetchAllActTypes();
    const dropdowns = [
        new Dropdown("Any day", ["Today", "Tomorrow", "This week", "Next week", "This month"], "Any day").render(),
        new Dropdown("Any category", actTypes, "Any category").render(),
        new Dropdown("Any type", ["Online", "In person"], "Any type").render()
    ];
    dropdowns.forEach(dropdown => sidenav.appendChild(dropdown));
    

    // ตรวจจับการคลิกที่ body เพื่อปิด sidenav ถ้าคลิกนอกพื้นที่ที่ต้องการ
    document.addEventListener("click", function (event) {
        // ถ้าคลิกไม่อยู่ภายใน sidenav และไม่อยู่ใน dropdownToggle
        if (!sidenav.contains(event.target) && 
            !dropdownToggle.contains(event.target) &&
            !themeToggle.contains(event.target)
        ) {
            sidenav.classList.remove("active");
            main.classList.remove("shifted");
            document.body.style.overflow = "";
        }
    });
}

async function createProvincesAndDistricts() {
    const sidenav = document.querySelector(".sidenav");
    let provinceData = [], districtData = [];

    async function loadData(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error("Error loading JSON:", error);
            return [];
        }
    }

    provinceData = await loadData("/provinceSelcetor/json/provinces.json");
    districtData = await loadData("/provinceSelcetor/json/districts.json");

    function filterDistrict(provId) {
        return districtData.filter(a => a.province_id == provId).map(a => a.eng);
    }

    let provinceDropdown = new Dropdown("Any province", provinceData.map(p => p.eng), "Any province");
    let districtDropdown = new Dropdown("Any district", [], "Any district");
    
    let provinceElement = provinceDropdown.render();
    let districtElement = districtDropdown.render();

    provinceElement.style.display = "none";
    districtElement.style.display = "none";

    sidenav.appendChild(provinceElement);
    sidenav.appendChild(districtElement);

    // ใช้ MutationObserver แทนการ click เพื่อจับการเปลี่ยนแปลงข้อความในปุ่ม province
    const provinceBtn = provinceElement.querySelector(".dropdown-btn span");
    let prevProvince = provinceDropdown.defaultOption;

    const provinceObserver = new MutationObserver(() => {
        const selectedProv = provinceBtn.textContent;
        const selectedProvObj = provinceData.find(p => p.eng === selectedProv);
    
        if (selectedProvObj && selectedProv !== "Any province") {

            let filteredAmp = filterDistrict(selectedProvObj.id);

            // รีเซ็ต dropdown ของอำเภอทุกครั้งที่มีการเปลี่ยนแปลงจังหวัด
            districtDropdown = new Dropdown("Any district", filteredAmp, "Any district");
            let newDistrictElement = districtDropdown.render();
            
            let span = newDistrictElement.querySelector("span")
            const observer = new MutationObserver(() => {
                filterPostInDate();
            });
            observer.observe(span, { childList: true, subtree: true });

            sidenav.replaceChild(newDistrictElement, districtElement);
            districtElement = newDistrictElement;

            // ให้แสดง dropdown ของอำเภอ
            districtElement.style.display = "flex";
            prevProvince = selectedProv;
        } else {
            districtElement.style.display = "none";
            console.log("No province selected");
        }
    });
    provinceObserver.observe(provinceBtn, { childList: true });        
}

async function showPost(allPosts){
    const homeContent = document.querySelector(".home-content");
    console.log(homeContent);
    console.log(allPosts);

    allPosts.forEach((eachDate) => {
        let date = new Date(eachDate.date);
        let posts = eachDate.posts;
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
            // console.log(formattedDate);

            postList.push(new Post(
                post.id,formattedDate, post.postName, activity.province +", "+ activity.district, 
                post.curParticipant, post.maxParticipant, post.totalApplicant, 
                actType, 
                post.coverPageImg, post.like
            ));
        })
        let formattedDate
        let today = new Date()
        today.setHours(0, 0, 0, 0)
        if (date.toDateString() == new Date().toDateString())
            formattedDate = "Today"
        else {
            today.setDate(today.getDate() + 1)
            if (date.toDateString() == today.toDateString())
                formattedDate = "Tomorrow"
            else {
                formattedDate = date.toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                })
            }
        }
        homeContent.appendChild(new PostInDate(formattedDate, postList).render())
    })
}

async function createPostInDate(){
    async function fetchAllPosts(){
        try {
            let response = await fetch("/api/post/allposts");
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
    let allPosts = await fetchAllPosts();
    showPost(allPosts)
}

async function filterPostInDate(){
    async function fetchFilterPosts(){
        try {
            const span = document.querySelectorAll(".sidenav .dropdown .dropdown-btn span");
            let queryParams = new URLSearchParams({
                date: span[0].innerText,
                category: span[1].innerText,
                actType: span[2].innerText,
                province: span[3].innerText,
                district: span[4].innerText
            });
            console.log(`/api/post/filter?${queryParams.toString()}`)
            let response = await fetch(`/api/post/filter?${queryParams.toString()}`);
            if (!response.ok) {
                console.log("case1")
                return [];
            }
            else {
                console.log("case2")
                response = await response.json();
                return response;
            }
        } catch (error) {
            console.log("case3")
            console.error("Error loading JSON:", error);
            return [];
        }
    }
    const elementsToDelete = document.querySelectorAll(".home-content .post-in-date");
    elementsToDelete.forEach(element => element.remove());
    let filterPosts = await fetchFilterPosts();
    console.log(filterPosts)
    showPost(filterPosts)
}

document.addEventListener("DOMContentLoaded", async function () {
    const main = document.querySelector(".main");
    const sidenav = document.querySelector(".sidenav");
    const themeToggle = document.querySelector(".theme-switch");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    // const mobileMediaQuery = window.matchMedia("(max-width: 768px)");

    function updateBodyScroll() {
        if (window.innerWidth <= 768 && sidenav.classList.contains("active")) {
            document.body.style.overflow = "hidden"; // ปิดการเลื่อนในจอเล็ก
        } else {
            document.body.style.overflow = ""; // เปิดการเลื่อนในจอใหญ่
        }
    }

    await createDropDown();
    await createPostInDate();
    await createProvincesAndDistricts();

    const dropdowns = document.querySelectorAll(".sidenav .dropdown .dropdown-btn");
    dropdowns.forEach((dropdown) => {
        let span = dropdown.querySelector("span")
        const observer = new MutationObserver(() => {
            filterPostInDate();
        });
        observer.observe(span, { childList: true, subtree: true });
    })

    dropdownToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        sidenav.classList.toggle("active");
        main.classList.toggle("shifted");
        updateBodyScroll(); // ตรวจสอบการปิดการเลื่อน
    });

    document.addEventListener("toggleSidebar", function () {
        sidenav.classList.remove("active");
        main.classList.remove("shifted", sidenav.classList.contains("active"));
    
        updateBodyScroll(); // ปรับการ scroll
    });

    function toggleProvincedistrictVisibility(dropdownValue) {
        const provinceDropdown = document.querySelector(".sidenav .dropdown:nth-of-type(4)");
        const districtDropdown = document.querySelector(".sidenav .dropdown:nth-of-type(5)");

        if (!provinceDropdown || !districtDropdown) return;

        if (dropdownValue === "In person") {
            provinceDropdown.style.display = "flex";
        } else {

            // ค้นหา option ของ default ค่า "Any province" และ "Any district"
            const provinceDefaultOption = [...provinceDropdown.querySelectorAll(".dropdown-content a")]
                .find(a => a.textContent === "Any province");

            const districtDefaultOption = [...districtDropdown.querySelectorAll(".dropdown-content a")]
                .find(a => a.textContent === "Any district");

            if (provinceDefaultOption) provinceDefaultOption.click(); // จำลองการกดเลือก default option
            if (districtDefaultOption) districtDefaultOption.click(); // จำลองการกดเลือก default option

            provinceDropdown.style.display = "none";
            districtDropdown.style.display = "none";
        }
    }

    const anyTypeDropdown = document.querySelector(".dropdown:nth-child(3)");
    const typeDropdownElement = anyTypeDropdown.querySelector(".dropdown-btn span");
    
    const typeObserver = new MutationObserver(() => {
        toggleProvincedistrictVisibility(typeDropdownElement.textContent);
    });
    typeObserver.observe(typeDropdownElement, { childList: true });
    window.addEventListener("resize", updateBodyScroll); // ตรวจสอบขนาดหน้าจอเมื่อเปลี่ยนขนาด
});