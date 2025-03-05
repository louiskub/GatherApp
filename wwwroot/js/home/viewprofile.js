// const input = document.querySelector(".box");
// input.style.width = (input.value.length) + "ch";
// input.addEventListener('input', function() {
//     this.style.height = 'auto';  // รีเซ็ตความสูงทุกครั้ง
//     this.style.height = (this.scrollHeight) + 'px';  // ปรับขนาดความสูงให้พอดีตามข้อความ
//   });


// const textarea = document.querySelector(".box");
// textarea.style.height = 'auto'; // รีเซ็ตความสูง
//   // ปรับขนาดตามจำนวนตัวอักษร
// textarea.style.width = (textarea.value.length) + "ch"; // กำหนดความกว้างให้พอดี
// textarea.addEventListener('input', function() {
//     this.style.height = 'auto';  // รีเซ็ตความสูงทุกครั้ง
//     this.style.height = (this.scrollHeight) + 'px';  // ปรับขนาดความสูงให้พอดีตามข้อความ
//   });

// ฟังก์ชันสำหรับปรับขนาดของ input ทุกตัว (รวมทั้ง textarea ด้วย)
function adjustInputSize() {
    // เลือก input และ textarea ทั้งหมด
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="date"], textarea');
    
    // ทำการปรับขนาดให้เหมาะสมกับข้อความ
    inputs.forEach(input => {
        if (input.value) { // ตรวจสอบว่า input มีค่า
            input.style.width = (input.value.length + 1) + "ch"; // กำหนดความกว้างของ input
        }
        
        // ฟังก์ชันในการปรับขนาดความสูงของ textarea
        input.addEventListener('input', function() {
            input.style.height = 'auto';  // รีเซ็ตความสูงทุกครั้ง
            input.style.height = (input.scrollHeight) + 'px';  // ปรับขนาดความสูงให้พอดีตามข้อความ
        });
        
        // สำหรับ textarea
        if (textarea.value) {
            textarea.style.height = 'auto'; // รีเซ็ตความสูง
            textarea.style.height = (textarea.scrollHeight) + 'px'; // ปรับความสูงให้พอดีกับข้อความ
        }

        // textarea.addEventListener('textarea', function() {
        //     textarea.style.height = 'auto';  // รีเซ็ตความสูงทุกครั้ง
        //     textarea.style.height = (textarea.scrollHeight) + 'px';  // ปรับขนาดความสูงให้พอดีตามข้อความ
        // });
    });
}

// เมื่อข้อมูลโหลดเสร็จให้เรียกใช้ฟังก์ชัน
document.addEventListener("DOMContentLoaded", function() {
    adjustInputSize(); // เรียกใช้ฟังก์ชันปรับขนาด input และ textarea
});


// function adjustInputSize() {
//     // เลือก input และ textarea ทั้งหมด
//     const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="date"], textarea');
    
//     // ทำการปรับขนาดให้เหมาะสมกับข้อความ
//     inputs.forEach(input => {
//         // ถ้าเป็น input เช่น text, email, date จะปรับขนาดความกว้าง
//         if (input.type === 'text' || input.type === 'email' || input.type === 'date') {
//             if (input.value) { // ตรวจสอบว่า input มีค่า
//                 input.style.width = (input.value.length + 1) + "ch"; // กำหนดความกว้างของ input
//             }
//         }
        
//         // ฟังก์ชันในการปรับขนาดความสูงของ textarea
//         input.addEventListener('input', function() {
//             // ปรับขนาดความสูงของ textarea ให้เหมาะสม
//             if (input.tagName.toLowerCase() === 'textarea') {
//                 input.style.height = 'auto';  // รีเซ็ตความสูงทุกครั้ง
//                 input.style.height = (input.scrollHeight) + 'px';  // ปรับขนาดความสูงให้พอดีตามข้อความ
//             }
//             // สำหรับ input text/email/date ให้ปรับความกว้าง
//             if (input.type === 'text' || input.type === 'email' || input.type === 'date') {
//                 input.style.width = (input.value.length + 1) + "ch"; // ปรับความกว้าง
//             }
//         });
//     });
// }

// // เมื่อข้อมูลโหลดเสร็จให้เรียกใช้ฟังก์ชัน
// document.addEventListener("DOMContentLoaded", function() {
//     adjustInputSize(); // เรียกใช้ฟังก์ชันปรับขนาด input และ textarea
// });

function updateReviewScore(score) {
    const hearts = document.querySelectorAll(".heart");
    hearts.forEach(heart => {
        let heartScore = parseInt(heart.getAttribute("data-score"));
        heart.classList.toggle("dim", heartScore > score);
    });
}

// ทดสอบการเปลี่ยนค่า (เช่น คะแนน 3)
document.addEventListener("DOMContentLoaded", function() {
    updateReviewScore(3); // เปลี่ยนค่าเพื่อทดสอบ (1-5)
});