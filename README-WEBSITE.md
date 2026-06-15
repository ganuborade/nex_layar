# NexLayar - Web Solutions Business Website

## Overview
NexLayar is a professional website for a web development business that specializes in:
- Custom web development for college students
- E-commerce solutions for shops and small businesses
- Professional web solutions and services

## Project Structure

```
nex_layar/
├── public/
│   ├── docs/                 # Documentation files
│   ├── images/               # Image assets
│   ├── src/
│   │   ├── scripts/
│   │   │   └── main.js      # JavaScript for interactivity
│   │   └── styles/
│   │       └── style.css    # Main stylesheet
│   ├── templates/
│   │   └── index.html       # Main homepage
│   └── videos/              # Video assets
├── package.json             # Project dependencies
├── LICENSE                  # Project license
└── README.md               # This file
```

## Files Created

### 1. **index.html** - Main Homepage
- Professional landing page with all sections
- Navigation bar with smooth scrolling
- Hero section with call-to-action
- Services showcase (6 main services)
- Portfolio section with project examples
- About section highlighting company strengths
- Contact form for customer inquiries
- Footer with social media links
- Fully responsive design

### 2. **style.css** - Styling
- Modern, clean design with gradient colors
- Purple (#7c3aed) and Pink (#ec4899) color scheme
- Responsive grid layouts
- Hover effects and animations
- Mobile-first responsive design
- Supports devices from 320px to 2560px width

### 3. **main.js** - Interactivity
- Mobile hamburger menu toggle
- Smooth scroll navigation
- Contact form validation and submission
- Intersection observer for scroll animations
- Navbar shadow effect on scroll

## Features

✅ **Responsive Design** - Works perfectly on mobile, tablet, and desktop
✅ **Modern UI** - Clean, professional appearance
✅ **Interactive Elements** - Smooth animations and transitions
✅ **Contact Form** - Functional contact form with validation
✅ **SEO Friendly** - Proper HTML structure and meta tags
✅ **Fast Loading** - Optimized CSS and JavaScript
✅ **Accessibility** - Semantic HTML and proper heading hierarchy

## Sections

1. **Navigation Bar** - Sticky navigation with links to all sections
2. **Hero Section** - Eye-catching header with CTAs
3. **Services** - 6 key services displayed in a grid
4. **Portfolio** - Recent projects showcase
5. **About** - Company information and highlights
6. **Contact** - Contact information and inquiry form
7. **Footer** - Links and social media

## How to Use

1. Open `public/templates/index.html` in a web browser
2. Click on navigation links to scroll to sections
3. Use the "Explore Services" or "Get Started" buttons
4. Fill out the contact form to send inquiries

## Customization

You can easily customize:
- **Colors**: Edit CSS variables in `style.css` (lines 8-14)
- **Content**: Update text in `index.html`
- **Images**: Add images to `public/images/` folder
- **Contact Info**: Update contact details in the footer and contact section
- **Services**: Add or modify services in the services grid

## Next Steps

1. Add your logo to the header
2. Upload project screenshots to portfolio section
3. Update contact information with your actual details
4. Add actual project images to the portfolio
5. Set up a backend for form submission
6. Consider adding more pages (About, Services details, Blog)
## Run Locally

1. Install dependencies (optional):

```
npm install
```

2. Serve the static `docs` folder locally:

```
npm start
```

## Deploy

Deploy to GitHub Pages using the included npm script (requires a git remote):

```
npm run deploy
```

This will publish the `docs` directory to GitHub Pages using `gh-pages` via `npx`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

ISC License - See LICENSE file for details

---

**Built with NexLayar** - Professional Web Solutions
