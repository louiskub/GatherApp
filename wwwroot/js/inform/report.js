import loadCss from "/js/components/reuse_func.js";

document.querySelectorAll(".report-choice").forEach((element) => {
    element.addEventListener("click", () => {
        element.classList.toggle("report-active");
    });
});

document.addEventListener("DOMContentLoaded", async function() {
    await window.userProfileLoaded;
    await loadCss("/css/inform/report.css");
});