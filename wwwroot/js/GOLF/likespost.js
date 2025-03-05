document.addEventListener("DOMContentLoaded", () => {
    initLikesPage();
    // initSakuraEffect();

    const likeBtns = document.querySelectorAll('.like-btn');

    likeBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // ป้องกันการทำงานของลิงก์
            e.stopPropagation(); // หยุดเหตุการณ์จากการ bubble ขึ้นไปที่ <a>

            // ลบ card เมื่อคลิกปุ่ม like-btn
            const card = btn.closest('.like-card');
            if (card) {
                animateCardRemoval(card); // เรียกใช้ฟังก์ชันลบการ์ด
            }
        });
    });
});

// ฟังก์ชันหลักสำหรับหน้า Likes
function initLikesPage() {
    const likesGrid = document.getElementById("likes-grid");
    if (!likesGrid) return;
    
    // สร้างและแสดงโพสต์
    renderPosts(likesGrid);
    
    // เพิ่ม event listener สำหรับปุ่มไลค์
    likesGrid.addEventListener("click", handleLikeButtonClick);
}

// สร้างและแสดงโพสต์
function renderPosts(container) {
    const posts = generateSamplePosts(50); // ลดจำนวนโพสต์ลงเพื่อประสิทธิภาพที่ดีขึ้น
    container.innerHTML = posts.map(createPostComponent).join("");
}

// สร้างข้อมูลตัวอย่าง
function generateSamplePosts(count) {
    // Define locations in the format "Province, District"
    const locations = [
        "Ang Thong, Meung Ang Thong",
        "Songkla, Hatyai",
        "Bangkok, Lat Krabang",
        "Nahon si thammarat, Meung Nakhon"
    ];
    
    return Array.from({ length: count }, (_, i) => {
        // Generate a random date within the next 60 days
        const currentDate = new Date();
        const randomDaysToAdd = Math.floor(Math.random() * 60);
        const randomDate = new Date(currentDate);
        randomDate.setDate(currentDate.getDate() + randomDaysToAdd);
        
        // Generate random hours and minutes
        randomDate.setHours(Math.floor(Math.random() * 24));
        randomDate.setMinutes(Math.floor(Math.random() * 60));
        
        // Format the date as "SAT, MAR 29 - 11:57 AM"
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        
        const dayOfWeek = days[randomDate.getDay()];
        const month = months[randomDate.getMonth()];
        const dayOfMonth = randomDate.getDate();
        
        let hours = randomDate.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        const minutes = String(randomDate.getMinutes()).padStart(2, '0');
        
        const formattedTime = `${dayOfWeek}, ${month} ${dayOfMonth} - ${hours}:${minutes} ${ampm}`;
        
        return {
            id: i + 1,
            image: `https://picsum.photos/400/240?random=${i}`,
            title: `Activity ${i + 1}`,
            time: formattedTime,
            location: locations[Math.floor(Math.random() * locations.length)],
            accepted: Math.floor(Math.random() * 10),
            total: Math.floor(Math.random() * 10) + 10,
            registered: Math.floor(Math.random() * 20),
            tags: ["Health", "Sport", "Game"].slice(0, Math.floor(Math.random() * 3) + 1),
        };
    });
}

// สร้าง HTML สำหรับโพสต์
function createPostComponent(post) {
    return `
        <a href="/post" class="like-card" data-id="${post.id}">
            <img src="${post.image}" alt="${post.title}">
            <div class="card-content">
                <h2 class="card-title">${post.title}</h2>
                <p class="time">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${post.time}
                </p>
                <p class="location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    ${post.location}
                </p>
                <div class="stats">
                    <span>Accepted: ${post.accepted}/${post.total}</span>
                    <span>Registered: ${post.registered}</span>
                </div>
                <div class="tags">
                    ${post.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
                </div>
                <button class="like-btn" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                    Liked
                </button>
            </div>
        </a>
    `;
}

// จัดการการคลิกปุ่มไลค์
function handleLikeButtonClick(e) {
    const likeBtn = e.target.closest(".like-btn");
    if (!likeBtn) return;
    
    const card = likeBtn.closest(".like-card");
    animateCardRemoval(card);
}

// แอนิเมชันการลบการ์ด
function animateCardRemoval(card) {
    card.style.transition = "opacity 0.5s, transform 0.5s";
    card.style.opacity = "0";
    card.style.transform = "scale(0.8)";
    
    setTimeout(() => {
        card.remove();
    }, 500);
}

// ฟังก์ชันสำหรับเอฟเฟกต์ซากุระ
// function initSakuraEffect() {
//     createSakura();
//     window.addEventListener("resize", createSakura);
// }

// // สร้างซากุระ
// function createSakura() {
//     const container = document.getElementById("sakura-container");
//     if (!container) return;
    
//     // ล้างซากุระเดิม
//     container.innerHTML = "";
    
//     const sakuraCount = 40; // ลดจำนวนลงเพื่อประสิทธิภาพที่ดีขึ้น
    
//     for (let i = 0; i < sakuraCount; i++) {
//         const sakura = document.createElement("div");
//         sakura.classList.add("sakura");
        
//         const size = Math.random() * 8 + 4;
//         const startPositionLeft = Math.random() * window.innerWidth;
//         const startOpacity = Math.random() * 0.5 + 0.3;
//         const durationSeconds = Math.random() * 5 + 5;
        
//         Object.assign(sakura.style, {
//             width: `${size}px`,
//             height: `${size}px`,
//             left: `${startPositionLeft}px`,
//             opacity: `${startOpacity}`,
//             animation: `sakuraFall ${durationSeconds}s linear infinite`,
//             animationDelay: `${Math.random() * 5}s`
//         });
        
//         container.appendChild(sakura);
//     }
// }