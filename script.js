const LANYARD_API = 'https://api.lanyard.rest/v1/users/954399296797675540';

async function fetchDiscordStatus() {
    try {
        const response = await fetch(LANYARD_API);
        const data = await response.json();
        
        if (data.success) {
            const user = data.data.discord_user;
            const activity = data.data.activities.length > 0 ? data.data.activities[0] : null;
            
            let html = `
                <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" alt="${user.username}">
                <span><strong>${user.username}#${user.discriminator}</strong></span>
            `;
            
            if (activity) {
                html += ` - ${activity.name}`;
                if (activity.details) {
                    html += `: ${activity.details}`;
                }
            }
            
            document.getElementById('lanyard-content').innerHTML = html;
        }
    } catch (error) {
        console.error('Error fetching Discord status:', error);
        document.getElementById('lanyard-content').innerHTML = 'Discord status unavailable';
    }
}

fetchDiscordStatus();

setInterval(fetchDiscordStatus, 30000);

// Carousel functionality
let currentSlide = 0;
let carImages = [];

async function loadCarImages() {
    try {
        // Load image list from JSON file
        const response = await fetch('cars/images.json');
        const imageList = await response.json();
        
        if (imageList && imageList.length > 0) {
            // Sort alphabetically and add cars/ prefix
            carImages = imageList
                .map(filename => `cars/${filename}`)
                .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
            
            initializeCarousel();
        } else {
            showPlaceholder();
        }
    } catch (error) {
        console.error('Error loading car images:', error);
        showPlaceholder();
    }
}

function showPlaceholder() {
    const track = document.getElementById('carousel-track');
    track.innerHTML = `
        <div class="carousel-slide">
            <div style="color: #888; text-align: center; padding: 40px;">
                <p style="margin-bottom: 10px;">No car images found.</p>
                <p style="font-size: 14px;">Add images to the "cars" folder and list them in cars/images.json</p>
                <p style="font-size: 12px; margin-top: 10px;">Example: ["photo1.webp", "mycar.jpg", "DSC_1234.png"]</p>
            </div>
        </div>
    `;
    // Hide navigation buttons when no images
    document.querySelectorAll('.carousel-button').forEach(btn => btn.style.display = 'none');
}

function initializeCarousel() {
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    
    // Create slides
    carImages.forEach((image) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `<img src="${image}" alt="Car">`;
        track.appendChild(slide);
    });
    
    // Create dots
    carImages.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (index === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });
    
    updateCarousel();
}

function changeSlide(direction) {
    currentSlide += direction;
    if (currentSlide >= carImages.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = carImages.length - 1;
    }
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carousel-track');
    const carousel = document.querySelector('.carousel');
    const dots = document.querySelectorAll('.dot');
    
    // Smooth slide transition
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Smooth height adjustment for different image sizes
    const currentImg = track.children[currentSlide].querySelector('img');
    if (currentImg && currentImg.complete) {
        adjustCarouselHeight(currentImg, carousel);
    } else if (currentImg) {
        currentImg.onload = () => adjustCarouselHeight(currentImg, carousel);
    }
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function adjustCarouselHeight(img, carousel) {
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    const maxWidth = carousel.clientWidth - 40; // 40px for padding
    const maxHeight = 400;
    
    let displayWidth = maxWidth;
    let displayHeight = maxWidth / aspectRatio;
    
    if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = maxHeight * aspectRatio;
    }
    
    carousel.style.height = (displayHeight + 40) + 'px';
}

// Load carousel on page load
document.addEventListener('DOMContentLoaded', loadCarImages);
