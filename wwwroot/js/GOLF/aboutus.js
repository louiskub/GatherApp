document.addEventListener("DOMContentLoaded", () => {
    const teamMembers = document.querySelectorAll(".team-member")
    const memberDetails = document.querySelectorAll(".member-details")
    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")
    const svg = document.querySelector(".bubbles-container")
  
    let currentIndex = 0
    const totalMembers = teamMembers.length
    const bubbles = []
    const numBubbles = 40
  
    function showTeamMember(index) {
      teamMembers.forEach((member, i) => {
        if (i === index) {
          member.classList.add("active")
        } else {
          member.classList.remove("active")
        }
      })
  
      memberDetails.forEach((detail, i) => {
        if (i === index) {
          detail.classList.add("active")
        } else {
          detail.classList.remove("active")
        }
      })
  
      currentIndex = index
    }
  
    function showNextMember() {
      const newIndex = (currentIndex + 1) % totalMembers
      showTeamMember(newIndex)
    }
  
    function showPrevMember() {
      const newIndex = (currentIndex - 1 + totalMembers) % totalMembers
      showTeamMember(newIndex)
    }
  
    prevBtn.addEventListener("click", showPrevMember)
    nextBtn.addEventListener("click", showNextMember)
  
    showTeamMember(currentIndex)
  
    // Bubble background
    for (let i = 0; i < numBubbles; i++) {
      createBubble(i)
    }
  
    function createBubble(id) {
      const bubble = {
        id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 20 + 5,
        color: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},1.0)`,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
      }
  
      bubbles.push(bubble)
  
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      circle.setAttribute("id", `bubble-${id}`)
      circle.setAttribute("cx", bubble.x)
      circle.setAttribute("cy", bubble.y)
      circle.setAttribute("r", bubble.size)
      circle.setAttribute("fill", bubble.color)
      circle.style.opacity = "0"
  
      svg.appendChild(circle)
  
      setTimeout(() => {
        animateBubbleAppearance(circle)
      }, id * 300)
    }
  
    function animateBubbleAppearance(circle) {
      let opacity = 0
  
      const animate = () => {
        opacity += 0.03
  
        if (opacity <= 0.7) {
          circle.style.opacity = opacity
          requestAnimationFrame(animate)
        } else {
          circle.style.opacity = "0.7"
        }
      }
  
      requestAnimationFrame(animate)
    }
  
    function animateBubbles() {
      bubbles.forEach((bubble) => {
        const circle = document.getElementById(`bubble-${bubble.id}`)
        if (!circle) return
  
        bubble.x += bubble.speedX
        bubble.y += bubble.speedY
  
        if (bubble.x <= 0 || bubble.x >= window.innerWidth) {
          bubble.speedX *= -1
        }
  
        if (bubble.y <= 0 || bubble.y >= window.innerHeight) {
          bubble.speedY *= -1
        }
  
        circle.setAttribute("cx", bubble.x)
        circle.setAttribute("cy", bubble.y)
      })
  
      requestAnimationFrame(animateBubbles)
    }
  
    animateBubbles()
  
    window.addEventListener("resize", () => {
      bubbles.forEach((bubble) => {
        bubble.x = Math.random() * window.innerWidth
        bubble.y = Math.random() * window.innerHeight
      })
    })
  })
  
  