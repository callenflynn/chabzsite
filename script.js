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
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'];
    
    // Try all files in the cars directory with common naming patterns
    const potentialImages = [];
    
    // Try numbered files 1-20
    for (let i = 1; i <= 20; i++) {
        for (let ext of imageExtensions) {
            potentialImages.push(`cars/${i}.${ext}`);
        }
    }
    
    // Try common prefixes
    const prefixes = ['image', 'car', 'photo', 'pic'];
    for (let prefix of prefixes) {
        for (let i = 1; i <= 20; i++) {
            for (let ext of imageExtensions) {
                potentialImages.push(`cars/${prefix}${i}.${ext}`);
                potentialImages.push(`cars/${prefix}_${i}.${ext}`);
            }
        }
    }
    
    // Check which images exist
    const checkPromises = potentialImages.map(async (imagePath) => {
        try {
            const img = new Image();
            return new Promise((resolve) => {
                img.onload = () => resolve(imagePath);
                img.onerror = () => resolve(null);
                img.src = imagePath;
            });
        } catch (error) {
            return null;
        }
    });
    
    const results = await Promise.all(checkPromises);
    carImages = results.filter(path => path !== null);
    
    if (carImages.length === 0) {
        // Show placeholder message
        const track = document.getElementById('carousel-track');
        track.innerHTML = '<div class="carousel-slide"><div style="color: #888; text-align: center;">Add car images to the "cars" folder<br>(name them like: 1.jpg, 2.jpg, etc.)</div></div>';
        return;
    }
    
    // Sort images naturally
    carImages.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });
    
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
