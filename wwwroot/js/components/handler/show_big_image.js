export default class ShowBigImage {
    constructor(){
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/css/components/show_big_image.css";
        document.head.appendChild(link);
        
        this.init();
        this.images = document.querySelectorAll(".lightbox-img")
        // Initialize click events
        this.initEvents()
    }

    init(){
        if (document.getElementById("lightbox")) return

        // Create lightbox elements
        const lightbox = document.createElement("div")
        lightbox.id = "lightbox"
        lightbox.className = "lightbox"
    
        const lightboxContent = document.createElement("div")
        lightboxContent.className = "lightbox-content"
    
        const closeBtn = document.createElement("button")
        closeBtn.className = "lightbox-close"
        closeBtn.innerHTML = "&times;"
        closeBtn.setAttribute("aria-label", "Close")
    
        const img = document.createElement("img")
        img.className = "lightbox-full-img"
    
        // Assemble the elements
        lightboxContent.appendChild(closeBtn)
        lightboxContent.appendChild(img)
        lightbox.appendChild(lightboxContent)
        document.body.appendChild(lightbox)
    
        // Store references
        this.lightbox = lightbox
        this.lightboxImg = img
    
        // Add close event listeners
        closeBtn.addEventListener("click", () => this.closeLightbox())
        lightbox.addEventListener("click", (e) => {
          if (e.target === lightbox) this.closeLightbox()
        })
    
        // Close on escape key
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && this.lightbox.classList.contains("active")) {
            this.closeLightbox()
          }
        })
    }

    initEvents() {
        // Add click event to all lightbox images
    this.images.forEach((img) => {
        // Create container for the image if it's not already wrapped
        if (!img.parentElement.classList.contains("lightbox-container")) {
          const container = document.createElement("div")
          container.className = "lightbox-container"
          img.parentNode.insertBefore(container, img)
          container.appendChild(img)
  
          // Add overlay with text
          const overlay = document.createElement("div")
          overlay.className = "lightbox-overlay"
          overlay.innerHTML = "<span>View full image</span>"
          container.appendChild(overlay)
        }
  
        // Add click event
        img.parentElement.addEventListener("click", () => {
          const fullSrc = img.dataset.fullSrc || img.src
          this.openLightbox(fullSrc, img.alt)
        })
      })
      }
    
      openLightbox(src, alt = "") {
        // Set image source
        this.lightboxImg.src = src
        this.lightboxImg.alt = alt
    
        // Show lightbox
        this.lightbox.classList.add("active")
        document.body.style.overflow = "hidden" // Prevent scrolling
      }
    
      closeLightbox() {
        this.lightbox.classList.remove("active")
        document.body.style.overflow = "" // Restore scrolling
      }
}