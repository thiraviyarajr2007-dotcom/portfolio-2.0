# Developer Portfolio Website

A modern, responsive portfolio website built with HTML, CSS, and JavaScript.

## Features

- **Hero Section**: Eye-catching introduction with name, title, and tagline
- **About Me**: Profile section with bio and personal information
- **Projects**: Showcase of 3 featured projects with descriptions and links
- **Skills**: Visual representation of technical skills with progress bars
- **Contact Form**: Functional contact form with social media links
- **Responsive Design**: Fully responsive layout for mobile and desktop
- **Smooth Animations**: Subtle animations and smooth scrolling navigation

## Customization Guide

### 1. Personal Information
Edit `index.html` to update:
- Name in hero section (line 35)
- Title/role (line 36)
- Tagline (line 37)
- About me bio (lines 49-51)

### 2. Projects
Update project cards (starting line 60):
- Replace placeholder images with your project screenshots
- Update project titles, descriptions, and technologies
- Add your GitHub and live demo links

### 3. Skills
Modify skills section (starting line 130):
- Add/remove skill items
- Adjust progress bar percentages in the `style` attribute
- Change icons using Font Awesome classes

### 4. Contact & Social Links
Update social media links (line 195):
- Replace `#` with your actual profile URLs
- Add/remove social platforms as needed

### 5. Colors
Customize the color scheme in `styles.css` (lines 9-16):
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* Modify other colors as needed */
}
```

### 6. Images
Replace placeholder images:
- Profile picture: Update `src` in line 48 of `index.html`
- Project images: Update `src` in project cards

## How to Use

1. Open `index.html` in a web browser to view the portfolio
2. Customize the content following the guide above
3. Deploy to GitHub Pages, Netlify, or any hosting service

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- Google Fonts (Poppins)
- Font Awesome Icons

## Browser Support

Works on all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

Enjoy building your portfolio!
