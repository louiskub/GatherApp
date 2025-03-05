document.addEventListener("DOMContentLoaded", () => {
    // Sample notifications data
    const notifications = [
      {
        id: 1,
        title: "New message from Sarah",
        message: "Hey, I just wanted to check in on the project status. How's it going?",
        time: "2 minutes ago",
        read: false,
        type: "info",
      },
      {
        id: 2,
        title: "Payment successful",
        message: "Your payment of $49.99 for Premium Plan has been processed successfully.",
        time: "1 hour ago",
        read: false,
        type: "success",
      },
      {
        id: 3,
        title: "System update",
        message: "The system will undergo maintenance tonight from 2 AM to 4 AM UTC.",
        time: "3 hours ago",
        read: false,
        type: "warning",
      },
      {
        id: 4,
        title: "Login attempt failed",
        message: "There was a failed login attempt from an unknown device. Please review your security settings.",
        time: "5 hours ago",
        read: true,
        type: "error",
      },
      {
        id: 5,
        title: "New feature available",
        message: "Check out our new dashboard analytics feature that helps you track performance in real-time.",
        time: "1 day ago",
        read: true,
        type: "info",
      },
    ]
  
    // DOM elements
    const notificationBell = document.getElementById("notification-bell")
    const notificationPopup = document.getElementById("notification-popup")
    const notificationsList = document.getElementById("notifications-list")
    const notificationCount = document.getElementById("notification-count")
    const markAllReadBtn = document.getElementById("mark-all-read")
    const closePopupBtn = document.getElementById("close-popup")
    const filterButtons = document.querySelectorAll(".filter-btn")
    const overlay = document.getElementById("overlay")
    const toastContainer = document.getElementById("toast-container")
    const themeToggle = document.getElementById("theme-toggle")
  
    // Demo buttons
    const addInfoBtn = document.getElementById("add-info")
    const addSuccessBtn = document.getElementById("add-success")
    const addWarningBtn = document.getElementById("add-warning")
    const addErrorBtn = document.getElementById("add-error")
  
    // Current filter
    let currentFilter = "all"
  
    // Toggle notification popup
    notificationBell.addEventListener("click", (e) => {
      e.stopPropagation()
      notificationPopup.classList.toggle("active")
      overlay.classList.toggle("active")
    })
  
    // Close popup when clicking outside
    document.addEventListener("click", (e) => {
      if (!notificationPopup.contains(e.target) && e.target !== notificationBell) {
        notificationPopup.classList.remove("active")
        overlay.classList.remove("active")
      }
    })
  
    // Close popup with close button
    closePopupBtn.addEventListener("click", () => {
      notificationPopup.classList.remove("active")
      overlay.classList.remove("active")
    })
  
    // Toggle dark mode
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark")
  
      // Update icon based on theme
      if (document.body.classList.contains("dark")) {
        themeToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        `
      } else {
        themeToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        `
      }
    })
  
    // Render notifications
    function renderNotifications() {
      notificationsList.innerHTML = ""
  
      let filteredNotifications = notifications
  
      // Apply filter
      if (currentFilter === "unread") {
        filteredNotifications = notifications.filter((notification) => !notification.read)
      } else if (currentFilter === "read") {
        filteredNotifications = notifications.filter((notification) => notification.read)
      }
  
      // Update notification count
      const unreadCount = notifications.filter((notification) => !notification.read).length
      notificationCount.textContent = unreadCount
  
      // Hide badge if no unread notifications
      if (unreadCount === 0) {
        notificationCount.style.display = "none"
      } else {
        notificationCount.style.display = "flex"
      }
  
      // Show empty state if no notifications
      if (filteredNotifications.length === 0) {
        notificationsList.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p class="empty-text">No notifications to display</p>
          </div>
        `
        return
      }
  
      // Render each notification
      filteredNotifications.forEach((notification) => {
        const notificationItem = document.createElement("div")
        notificationItem.className = `notification-item notification-type-${notification.type} ${
          !notification.read ? "unread" : ""
        }`
  
        // Get icon based on notification type
        let icon = ""
        switch (notification.type) {
          case "info":
            icon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
            break
          case "success":
            icon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
            break
          case "warning":
            icon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
            break
          case "error":
            icon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
            break
        }
  
        notificationItem.innerHTML = `
          <div class="notification-icon ${notification.type}">
            ${icon}
          </div>
          <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${notification.time}</div>
            <div class="notification-item-actions">
              <button class="notification-item-action mark-read" data-id="${notification.id}">
                ${notification.read ? "Mark as unread" : "Mark as read"}
              </button>
              <button class="notification-item-action delete" data-id="${notification.id}">Delete</button>
            </div>
          </div>
        `
  
        notificationsList.appendChild(notificationItem)
      })
  
      // Add event listeners to action buttons
      document.querySelectorAll(".notification-item-action.mark-read").forEach((button) => {
        button.addEventListener("click", function (e) {
          e.stopPropagation()
          const id = Number.parseInt(this.getAttribute("data-id"))
          toggleReadStatus(id)
        })
      })
  
      document.querySelectorAll(".notification-item-action.delete").forEach((button) => {
        button.addEventListener("click", function (e) {
          e.stopPropagation()
          const id = Number.parseInt(this.getAttribute("data-id"))
          deleteNotification(id)
        })
      })
    }
  
    // Toggle read status of a notification
    function toggleReadStatus(id) {
      const notification = notifications.find((n) => n.id === id)
      if (notification) {
        notification.read = !notification.read
        renderNotifications()
  
        // Show toast
        showToast(
          notification.read ? "Marked as read" : "Marked as unread",
          `"${notification.title}" has been marked as ${notification.read ? "read" : "unread"}.`,
          "info",
        )
      }
    }
  
    // Delete a notification
    function deleteNotification(id) {
      const index = notifications.findIndex((n) => n.id === id)
      if (index !== -1) {
        const deletedNotification = notifications[index]
        notifications.splice(index, 1)
        renderNotifications()
  
        // Show toast
        showToast("Notification deleted", `"${deletedNotification.title}" has been removed.`, "success")
      }
    }
  
    // Mark all notifications as read
    markAllReadBtn.addEventListener("click", () => {
      let unreadCount = 0
  
      notifications.forEach((notification) => {
        if (!notification.read) {
          notification.read = true
          unreadCount++
        }
      })
  
      renderNotifications()
  
      if (unreadCount > 0) {
        showToast(
          "All notifications read",
          `${unreadCount} notification${unreadCount !== 1 ? "s" : ""} marked as read.`,
          "success",
        )
      }
    })
  
    // Filter notifications
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const filter = this.getAttribute("data-filter")
        currentFilter = filter
  
        // Update active filter button
        filterButtons.forEach((btn) => btn.classList.remove("active"))
        this.classList.add("active")
  
        renderNotifications()
      })
    })
  
    // Show toast notification
    function showToast(title, message, type = "info") {
      const toast = document.createElement("div")
      toast.className = `toast ${type}`
      toast.innerHTML = `
        <div class="toast-content">
          <div class="toast-title">${title}</div>
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `
  
      toastContainer.appendChild(toast)
  
      // Add close button event listener
      toast.querySelector(".toast-close").addEventListener("click", () => {
        removeToast(toast)
      })
  
      // Auto remove after 5 seconds
      setTimeout(() => {
        removeToast(toast)
      }, 5000)
    }
  
    // Remove toast with animation
    function removeToast(toast) {
      toast.style.animation = "slideOut 0.3s ease forwards"
      setTimeout(() => {
        toast.remove()
      }, 300)
    }
  
    // Add demo notification buttons
    addInfoBtn.addEventListener("click", () => addNotification("info"))
    addSuccessBtn.addEventListener("click", () => addNotification("success"))
    addWarningBtn.addEventListener("click", () => addNotification("warning"))
    addErrorBtn.addEventListener("click", () => addNotification("error"))
  
    // Add a new notification
    function addNotification(type) {
      const titles = {
        info: "New information",
        success: "Task completed",
        warning: "Attention required",
        error: "Error occurred",
      }
  
      const messages = {
        info: "You have a new update available for your account.",
        success: "Your task has been completed successfully.",
        warning: "Your account storage is almost full.",
        error: "Failed to connect to the server. Please try again.",
      }
  
      const newNotification = {
        id: Date.now(),
        title: titles[type],
        message: messages[type],
        time: "Just now",
        read: false,
        type: type,
      }
  
      // Add to beginning of array
      notifications.unshift(newNotification)
      renderNotifications()
  
      // Show toast
      showToast("New notification", "You have received a new notification.", type)
  
      // Open popup if closed
      if (!notificationPopup.classList.contains("active")) {
        notificationPopup.classList.add("active")
        overlay.classList.add("active")
      }
    }
  
    // Initialize
    renderNotifications()
  })
  
  