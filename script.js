// --- CONSTANTS ---
const SCROLL_SPEED = 0.7;
const RESTART_DELAY = 8000;        // ms before carousel resumes after interaction
const FADE_DURATION = 1600;        // ms — matches CSS transition (1.5s) + buffer
const IMAGE_INTERVALS = [9000, 13000, 11000]; // ms between image swaps per slot
const DEBOUNCE_DELAY = 150;        // ms for resize debounce

// --- CAROUSEL SETUP ---
const track = document.getElementById('carouselTrack');
const container = document.getElementById('carouselWrapper');

const originalCount = track.children.length; // capture before tripling
const originalHTML = track.innerHTML;
track.innerHTML = originalHTML + originalHTML + originalHTML;

Array.from(track.children).forEach((child, index) => {
    if (index >= originalCount) child.classList.add('clone');
});

let scrollPos = 0;
let isPaused = false;
let restartTimer;
let pendingHref = null;

function animate() {
    if (!isPaused) {
        scrollPos += SCROLL_SPEED;
        if (scrollPos >= track.scrollWidth / 3) {
            scrollPos = 0;
        }
        container.scrollLeft = scrollPos;
    }
    requestAnimationFrame(animate);
}

// --- NAVBAR OFFSET CALCULATION ---
// Υπολογισμός ύψους navbar και εφαρμογή σε:
// 1. margin-top του <main> ώστε το περιεχόμενο να ξεκινά κάτω από τη μπάρα
// 2. scroll-margin-top κάθε section (για browser-native anchor scroll)
const navbar = document.querySelector('.navbar');

function updateNavbarOffsets() {
    if (!navbar) return;

    const mainEl = document.querySelector('main');
    const navbarHeight = navbar.offsetHeight;

    // Κρατάμε το <main> ακριβώς κάτω από τη fixed navbar
    if (mainEl) mainEl.style.marginTop = navbarHeight + 'px';

    // Κάθε section «ξέρει» πόσο να αφήσει για τη μπάρα
    document.querySelectorAll('.spacer-section').forEach(section => {
        section.style.scrollMarginTop = navbarHeight + 'px';
    });
}

// Debounced resize handler
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateNavbarOffsets, DEBOUNCE_DELAY);
});
window.addEventListener('load', updateNavbarOffsets);
updateNavbarOffsets();

// --- CAROUSEL INTERACTION ---
function startInteraction(e) {
    const link = e.target.closest('a');
    if (link) {
        pendingHref = link.getAttribute('href');
    }
    isPaused = true;
    container.classList.add('is-active');
    clearTimeout(restartTimer);
}

function stopInteraction() {
    clearTimeout(restartTimer);
    restartTimer = setTimeout(() => {
        container.classList.remove('is-active');
        scrollPos = container.scrollLeft;
        isPaused = false;
        pendingHref = null;
    }, RESTART_DELAY);
}

container.addEventListener('mouseenter', startInteraction);
container.addEventListener('mouseleave', stopInteraction);
container.addEventListener('touchstart', startInteraction, { passive: true });
container.addEventListener('touchend', stopInteraction);

container.addEventListener('click', (e) => {
    if (pendingHref) {
        e.preventDefault();
        const targetId = pendingHref.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const navbarHeight = navbar.offsetHeight;
            // Scroll ακριβώς στην κορυφή του section, αφαιρώντας το ύψος της μπάρας
            window.scrollTo({
                top: targetElement.offsetTop - navbarHeight,
                behavior: 'smooth'
            });
        }

        clearTimeout(restartTimer);
        container.classList.remove('is-active');
        scrollPos = container.scrollLeft;
        isPaused = false;
        pendingHref = null;
    }
});

animate();

// --- STATIC COLLAGE IMAGE SYSTEM (fade only, no movement) ---
const cavaImages = ['cava.png', 'cava_1.png', 'cava_3.png'];
const imageSlots = document.querySelectorAll('.large-slot');
const imageIntervalIds = [];

// Fisher-Yates shuffle — unbiased
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Αρχική φόρτωση: κάθε slot παίρνει μια διαφορετική εικόνα αμέσως
function setInitialImages() {
    const shuffled = shuffle(cavaImages);
    imageSlots.forEach((slot, i) => {
        const img = shuffled[i % shuffled.length];
        slot.style.backgroundImage = `url('${img}')`;
        slot.style.opacity = '1';
    });
}

// Εναλλαγή εικόνας με απλό fade in/out — ΧΩΡΙΣ ΚΙΝΗΣΗ
function changeImage(slot) {
    // Fade out
    slot.style.opacity = '0';

    setTimeout(() => {
        // Φόρτωση νέας εικόνας στο background
        const current = slot.style.backgroundImage;
        let next;
        do {
            next = cavaImages[Math.floor(Math.random() * cavaImages.length)];
        } while (`url('${next}')` === current && cavaImages.length > 1);

        const preload = new Image();
        preload.src = next;
        preload.onload = () => {
            slot.style.backgroundImage = `url('${next}')`;
            // Fade in
            slot.style.opacity = '1';
        };
        preload.onerror = () => {
            slot.style.backgroundImage = `url('${next}')`;
            slot.style.opacity = '1';
        };
    }, FADE_DURATION);
}

function initIntroSystem() {
    setInitialImages();

    // Κάθε slot αλλάζει σε διαφορετικές χρονικές στιγμές για φυσικότητα
    imageSlots.forEach((slot, i) => {
        const interval = IMAGE_INTERVALS[i % IMAGE_INTERVALS.length];
        imageIntervalIds.push(setInterval(() => changeImage(slot), interval));
    });
}

window.addEventListener('load', () => {
    initIntroSystem();
    if (typeof updateNavbarOffsets === 'function') updateNavbarOffsets();
});
