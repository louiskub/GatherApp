import Dropdown from "/js/components/dropdown.js";
import Post from "/js/components/post.js";
import PostInDate from "/js/components/post_in_date.js";

document.addEventListener("DOMContentLoaded", function () {
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

    const dropdowns = [
        new Dropdown("Any day", ["Today", "Tomorrow", "This week", "Next week", "This month"], "Any day"),
        new Dropdown("Any category", ["Art", "Games", "Pet & Animal", "Travel"], "Any category"),
        new Dropdown("Any type", ["Online", "In person"], "Any type")
    ];
    dropdowns.forEach(dropdown => sidenav.appendChild(dropdown.render()));

    const homeContent = document.querySelector(".home-content");
    const post1 = new Post("SAT, FEB 1 - 6.00 P.M.", "ACTIVITY NAME", "Fontaine", 8, 50, ["Category1", "Category2"], "https://staticg.sportskeeda.com/editor/2024/05/af09a-17157730211128-1920.jpg", 247);
    const post2 = new Post("SAT, FEB 1 - 8.00 P.M.", "ACTIVITY NAME 2", "Mondstadt", 5, 30, ["Games", "Fun"], "https://cdna.artstation.com/p/assets/images/images/056/458/766/large/mathias-zamecki-genshin-approval.jpg?1669289221");
    const post3 = new Post("SUN, FEB 2 - 10.00 A.M.", "ACTIVITY NAME 3", "Inazuma", 10, 100, ["Art", "Craft"], "https://assetsio.gnwcdn.com/How-to-get-to-Inazuma-in-Genshin-Impact-cover.jpg?width=1200&height=1200&fit=crop&quality=100&format=png&enable=upscale&auto=webp");

    const postInDateList = [
        new PostInDate("Today", [post1, post2, post3, post1, post2, post3, post1, post2, post3]),
        new PostInDate("Tomorrow", [post1, post2, post3, post1, post2, post3, post1, post2, post3]),
        new PostInDate("Sunday, February 20", [post1, post2, post3, post1, post2, post3, post1, post2, post3]),
        new PostInDate("Wednesday, March 31", [post1, post2, post3, post1, post2, post3, post1, post2, post3]),
    ];

    postInDateList.forEach(postInDate => homeContent.appendChild(postInDate.render()));
    
    dropdownToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        sidenav.classList.toggle("active");
        main.classList.toggle("shifted");
        updateBodyScroll(); // ตรวจสอบการปิดการเลื่อน
    });

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

    async function ProvincesAnddistricts() {
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

    ProvincesAnddistricts();

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
