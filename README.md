# Cava Agiou Nikolaou — Digital Menu (Static Site)

Ψηφιακό μενού για την Cava Agiou Nikolaou. Vanilla HTML/CSS/JavaScript χωρίς framework. Τρέχει τοπικά με node server ή deploy σε οποιονδήποτε static host.

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — CSS variables, animations, backdrop-filter
- **Vanilla JavaScript** — χωρίς dependencies
- **Google Fonts** — Cinzel (display) + Montserrat (body)
- **Font Awesome 6** — social icons
- **Node.js** (optional) — `local_server.mjs` για local development

## Αρχεία

```
/
├── index.html          # Κύρια δομή της σελίδας
├── style.css           # Πλήρες design system
├── script.js           # Carousel + image collage logic
├── local_server.mjs    # Minimal Node HTTP server για local dev
└── assets/
    ├── cava.png
    ├── cava_1.png
    └── cava_3.png
```

## Sections

| ID | Περιγραφή |
|----|-----------|
| `#intro` | Hero section με asymmetric image collage |
| `#wines` | Κρασιά |
| `#spirits` | Ποτά / Spirits |
| `#cocktails` | Signature Cocktails |
| `#beers` | Μπύρες |
| `#soft-drinks` | Αναψυκτικά |

## Navigation Carousel

Οριζόντιο scrolling carousel με auto-scroll behavior:

- **Auto-scroll**: `requestAnimationFrame` loop, speed `0.7px/frame`
- **Pause on hover/touch**: 8 δευτερόλεπτα inactivity timeout πριν re-activation
- **Infinite loop**: Τριπλή αντιγραφή του HTML + reset `scrollLeft` όταν φτάνει το 1/3
- **Mobile support**: `touch-action: pan-x` όταν ο χρήστης αγγίξει
- **Clone hiding**: Κατά την manual scroll, τα clone items κρύβονται (`display: none`) για clean UX
- **Smooth anchor scroll**: Κλικ σε nav link → `scrollTo()` με offset για το fixed header

## Image Collage (Intro Section)

Asymmetric 3-slot layout με static fade animation:

```
┌──────────┐  ┌────────────────┐
│          │  │  slot-center   │  (28vw × 38vh)
│ slot-left│  └────────────────┘
│          │  ┌────────────────┐
│ (25vw ×  │  │  slot-right    │  (28vw × 30vh)
│  72vh)   │  └────────────────┘
└──────────┘
       [  TITLE BOX  ]
```

**Image rotation** — κάθε slot εναλλάσσει εικόνα ανεξάρτητα:
- Slot 1: κάθε 9 δευτερόλεπτα
- Slot 2: κάθε 13 δευτερόλεπτα
- Slot 3: κάθε 11 δευτερόλεπτα

Transition: `opacity: 0` (fade out, 1.5s) → load νέα εικόνα → `opacity: 1` (fade in)

**Preloading**: Νέα εικόνα φορτώνεται σε `Image()` object πριν γίνει visible για αποφυγή flicker.

## Design Tokens

```css
--bg-color: #BA9D75   /* Σκούρο μπεζ */
--accent:   #600010   /* Μπορντό */
--black:    #0a0a0a

font-family (display): 'Cinzel', serif
font-family (body):    'Montserrat', sans-serif
```

## Responsive Layout

- **Mobile (≤768px)**: Εικόνες αναδιατάσσονται (πάνω + κάτω), κείμενο στη μέση
- Navigation carousel: On mobile, clone items κρύβονται στο active mode

## Dynamic Navbar Height

Το height της navbar υπολογίζεται δυναμικά και εφαρμόζεται:
- `main { margin-top: navbarHeight }` — το περιεχόμενο ξεκινά κάτω από τη fixed μπάρα
- `section { scroll-margin-top: navbarHeight }` — τα anchors στοχεύουν σωστά

Ανανεώνεται και στο `resize` event για tablet/mobile rotation.

## Local Development

```bash
node local_server.mjs
# → http://localhost:3000
```

Ο server υποστηρίζει: `.html`, `.css`, `.js`, `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`

## Deploy

Static site — upload οπουδήποτε:

```bash
# S3
aws s3 sync . s3://your-bucket --exclude "*.mjs" --exclude "*.md"

# Ή απλά drag & drop σε Netlify / Vercel
```
