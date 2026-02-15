# RE:GALIA — Scrollytelling Experience

Premium scrollytelling landing page for **RE:GALIA**, the official second-hand marketplace for [Galia Lahav](https://galialahav.com).

## Features

- **Scroll-linked 360° gown animation** — 192-frame image sequence rendered on HTML5 Canvas at 60fps
- **Framer Motion** spring physics for buttery-smooth frame interpolation
- **4-beat narrative** — The Icon → Certified Legacy → Circular Luxury → Your Dream, Within Reach
- **Luxury dark theme** — Deep obsidian `#050505` with champagne/gold accents
- **Elegant loading state** — "Preparing the Atelier…" progress bar
- **Responsive** — Desktop, tablet, and mobile optimized

## Tech Stack

| Layer      | Choice                        |
|------------|-------------------------------|
| Framework  | Next.js 14 (App Router)       |
| Styling    | Tailwind CSS                  |
| Animation  | Framer Motion (useScroll + useSpring) |
| Rendering  | HTML5 Canvas (60fps)          |
| Typography | Cormorant Garamond + Inter    |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
regalia-scroll/
├── app/
│   ├── page.tsx          # Main scrollytelling page
│   ├── layout.tsx        # Root layout with fonts
│   └── globals.css       # Dark scrollbar + luxury CSS
├── components/
│   └── CoutureCanvas.tsx # Reusable frame animation component
├── public/
│   └── frames/           # 192 JPG frames (frame_000 → frame_191)
└── package.json
```

---

© 2026 Galia Lahav. All rights reserved.
