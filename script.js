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
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const commonFilenames = [];
    
    // Try common image naming patterns
    for (let i = 1; i <= 50; i++) {
        for (let ext of imageExtensions) {
            commonFilenames.push(`cars/${i}.${ext}`);
            commonFilenames.push(`cars/image${i}.${ext}`);
            commonFilenames.push(`cars/car${i}.${ext}`);
        }
    }
    
    // Check which images actually exist
    for (let imagePath of commonFilenames) {
        try {
            const response = await fetch(imagePath, { method: 'HEAD' });
            if (response.ok) {
                carImages.push(imagePath);
            }
        } catch (error) {
            // Image doesn't exist, continue
        }
    }
    
    // Also try to load any image files directly if browser supports it
    if (carImages.length === 0) {
        // Fallback: try a few common naming conventions
        const fallbackPaths = [
            'cars/1.jpg', 'cars/1.png', 'cars/car1.jpg', 'cars/car1.png',
            'cars/image1.jpg', 'cars/image1.png'
        ];
        
        for (let imagePath of fallbackPaths) {
            try {
                const response = await fetch(imagePath, { method: 'HEAD' });
                if (response.ok) {
                    carImages.push(imagePath);
                }
            } catch (error) {
                // Continue
            }
        }
    }
    
    if (carImages.length === 0) {
        document.querySelector('.cars-section').style.display = 'none';
        return;
    }
    
    // Sort images to ensure consistent order
    carImages.sort();
    initializeCarousel();
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
