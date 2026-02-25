const track = document.getElementById('carouselTrack');
const container = document.getElementById('carouselWrapper');

const originalHTML = track.innerHTML;
track.innerHTML = originalHTML + originalHTML + originalHTML;

Array.from(track.children).forEach((child, index) => {
    if (index >= 5) child.classList.add('clone');
});

let scrollPos = 0;
let speed = 0.7;
let isPaused = false;
let restartTimer;
let pendingHref = null;

function animate() {
    if (!isPaused) {
        scrollPos += speed;
        if (scrollPos >= track.scrollWidth / 3) {
            scrollPos = 0;
        }
        container.scrollLeft = scrollPos;
    }
    requestAnimationFrame(animate);
}

// Υπολογισμός ύψους navbar και εφαρμογή σε:
// 1. margin-top του <main> ώστε το περιεχόμενο να ξεκινά κάτω από τη μπάρα
// 2. scroll-margin-top κάθε section (για browser-native anchor scroll)
function updateNavbarOffsets() {
    const navbar = document.querySelector('.navbar');
    const mainEl = document.querySelector('main');
    if (!navbar) return;

    const navbarHeight = navbar.offsetHeight;

    // Κρατάμε το <main> ακριβώς κάτω από τη fixed navbar
    if (mainEl) mainEl.style.marginTop = navbarHeight + 'px';

    // Κάθε section «ξέρει» πόσο να αφήσει για τη μπάρα
    document.querySelectorAll('.spacer-section').forEach(section => {
        section.style.scrollMarginTop = navbarHeight + 'px';
    });
}

window.addEventListener('load', updateNavbarOffsets);
window.addEventListener('resize', updateNavbarOffsets);
updateNavbarOffsets();

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
    }, 8000);
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
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            // Scroll ακριβώς στην κορυφή του section, αφαιρώντας το ύψος της μπάρας
            // Αποτέλεσμα: ο τίτλος εφάπτεται αμέσως κάτω από τη μπάρα
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

// Αρχική φόρτωση: κάθε slot παίρνει μια διαφορετική εικόνα αμέσως
function setInitialImages() {
    const shuffled = [...cavaImages].sort(() => Math.random() - 0.5);
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
    }, 1600); // Περιμένει να τελειώσει το fade out (1.5s transition)
}

function initIntroSystem() {
    setInitialImages();

    // Κάθε slot αλλάζει σε διαφορετικές χρονικές στιγμές για φυσικότητα
    const intervals = [9000, 13000, 11000];
    imageSlots.forEach((slot, i) => {
        setInterval(() => changeImage(slot), intervals[i]);
    });
}

window.addEventListener('load', () => {
    initIntroSystem();
    if (typeof updateNavbarOffsets === 'function') updateNavbarOffsets();
});