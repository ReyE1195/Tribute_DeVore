const carousel = document.querySelector('.carousel');
const marqueeTrack = document.querySelector('.marqueeTrack');
const prevBtn = document.querySelector('.prevBtn');
const nextBtn = document.querySelector('.nextBtn');

const galleryModal = document.getElementById('galleryModal');
const modalClose = galleryModal.querySelector('.modalClose');
const featuredImg = document.getElementById('featuredImg');
const featurePrev = galleryModal.querySelector('.featurePrev');
const featureNext = galleryModal.querySelector('.featureNext');
const modalGrid = galleryModal.querySelector('.modalGrid');

const photos = Array.from(marqueeTrack.querySelectorAll('img'));
let currentIndex = 0;

// --- The Marquee Track ---
photos.forEach((photo, index) => {
   photo.dataset.index = String(index);
   photo.tabIndex = 0;
   photo.decoding = "async";
   photo.title = photo.alt;
});

photos.forEach((photo) => {
    const copy = photo.cloneNode();
    copy.alt = "";
    copy.tabIndex = -1;
    copy.setAttribute("aria-hidden", "true");
    marqueeTrack.appendChild(copy);
});

// --- The Grid Inside the Dialog ---
photos.forEach((photo, index) => {
    const thumbButton = document.createElement('button');
    thumbButton.type = 'button';
    thumbButton.className = 'gridThumb';
    thumbButton.title = photo.alt;

    const thumbImg = document.createElement('img');
    thumbImg.src = photo.src;
    thumbImg.alt = photo.alt;
    thumbImg.loading = 'lazy';
    thumbImg.decoding = 'async';

    thumbButton.appendChild(thumbImg);
    thumbButton.addEventListener('click', () => showPhoto(index));
    modalGrid.appendChild(thumbButton);
});

// --- Once clicked on the image in-larges ---
function showPhoto(index) {
    currentIndex = index;
    const photo = photos[index];
    featuredImg.src = photo.src;
    featuredImg.alt = photo.alt;

    const thumbs = modalGrid.querySelectorAll('.gridThumb');
    thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('isActive', i === index);
    });
    thumbs[index].scrollIntoView({block: 'nearest', behavior: 'smooth'});
}

function openGallery(index) {
    galleryModal.showModal();
    showPhoto(index);
}

function stepPhoto(direction) {
    const next = (currentIndex + direction + photos.length) % photos.length;
    showPhoto(next);
}

featurePrev.addEventListener('click', () => stepPhoto(-1));
featureNext.addEventListener('click', () => stepPhoto(1));

galleryModal.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') stepPhoto(-1);
    if (event.key === 'ArrowRight') stepPhoto(1);
});

// --- Carousel Movement ---
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const autoSpeed = reduceMotion ? 0 : 40;

let position = 0;
let nudge = 0;
let loopWidth = 0;
let isHovered = false;
let hasFocus = false;
let lastTime = null;

function measureLoop() {
    loopWidth = marqueeTrack.scrollWidth / 2;
}
measureLoop();
window.addEventListener('load', measureLoop);
window.addEventListener('resize', measureLoop);

function animate(time) {
    if (lastTime === null) lastTime = time;
    const seconds = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    const isPaused = isHovered || hasFocus || galleryModal.open;
    if (!isPaused) position += autoSpeed * seconds;

    if (nudge !== 0) {
        const move = nudge * 0.12;
        position += move;
        nudge -= move;
        if (Math.abs(nudge) < 0.5) {
            position += nudge;
            nudge = 0;
        }
    }
    if (loopWidth > 0) {
        position = ((position % loopWidth) + loopWidth) % loopWidth;
    }
    marqueeTrack.style.transform = `translateX(${-position}px)`;
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// --- Side buttons move the strip about 28% of the visible width ---
function nudgeAmount() {
    return carousel.clientWidth * 0.28;
}
prevBtn.addEventListener('click', () => {nudge -= nudgeAmount(); });
nextBtn.addEventListener('click', () => {nudge += nudgeAmount(); });

carousel.addEventListener('mouseenter', () => {isHovered = true; });
carousel.addEventListener('mouseleave', () => {isHovered = false; });

carousel.addEventListener("focusin", (event) => {
    hasFocus = event.target.matches(":focus-visible");
});
carousel.addEventListener("focusout", () => { hasFocus = false; });

// --- The Gallery opens from the marquee track ---
marqueeTrack.addEventListener("click", (event) => {
    const clicked = event.target.closest("img");
    if (!clicked) return;
    openGallery(Number(clicked.dataset.index));
});

marqueeTrack.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const focused = event.target.closest("img");
    if (!focused) return;
    event.preventDefault();
    openGallery(Number(focused.dataset.index));
});

// --- Pill Button Color Cycle ---
const wordTags = document.querySelectorAll('.wordList li');
const cycleSeconds = 18;

wordTags.forEach((tag, i) => {
   tag.style.animationDelay = `${-(i * cycleSeconds) / wordTags.length}s`;
});

// --- Close the Gallery ---
modalClose.addEventListener('click', () => galleryModal.close());
galleryModal.addEventListener('close', () => { hasFocus = false; });