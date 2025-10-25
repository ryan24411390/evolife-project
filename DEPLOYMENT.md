# Evolife Website - Deployment Guide

## Overview
This is a static HTML website for Evolife Wellness that has been rebranded from the original Friday template. The site is fully self-contained, tracker-free, and ready for deployment.

## Project Structure
```
evolife-v1-clean/
├── evolife/              # ← Main deployment folder
│   ├── index.html        # Homepage
│   ├── pricing.html      # Pricing page
│   ├── blog.html         # Blog listing
│   ├── contact-us.html   # Contact page
│   ├── assets/
│   │   ├── css/          # Stylesheets
│   │   ├── js/           # JavaScript files
│   │   ├── images/       # Images and favicon
│   │   └── fonts/        # Web fonts
│   └── [other pages]     # Additional pages
```

## Deployment Options

### Option 1: Static Hosting (Recommended)
Deploy the `evolife-v1-clean/evolife/` folder to any static hosting service:

#### Netlify
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Navigate to the deployment folder: `cd evolife-v1-clean/evolife`
3. Deploy: `netlify deploy --prod`
4. Follow prompts to connect your site

#### Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to the deployment folder: `cd evolife-v1-clean/evolife`
3. Deploy: `vercel --prod`

#### GitHub Pages
1. Push the repository to GitHub
2. Go to Settings → Pages
3. Set source to `main` branch and `/evolife-v1-clean/evolife` folder
4. Site will be available at `https://[username].github.io/[repo-name]/`

#### AWS S3 + CloudFront
1. Create an S3 bucket
2. Enable static website hosting
3. Upload contents of `evolife-v1-clean/evolife/` folder
4. Set up CloudFront distribution for HTTPS
5. Update DNS records

### Option 2: Traditional Web Server
Deploy to any web server (Apache, Nginx, etc.):

1. Copy the `evolife-v1-clean/evolife/` folder to your web server
2. Set document root to the folder
3. Ensure all files have appropriate permissions
4. Configure SSL certificate
5. Test all pages load correctly

### Option 3: Docker Container
```dockerfile
FROM nginx:alpine
COPY evolife-v1-clean/evolife/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t evolife-website .
docker run -d -p 80:80 evolife-website
```

## Pre-Deployment Checklist

- [x] All HTML files updated with Evolife branding
- [x] Favicon added to all pages
- [x] Warrior's Protocol text updated
- [x] Social media links updated
- [x] Contact email updated to info@evolifewellness.com
- [x] Copyright text updated
- [ ] Custom domain configured
- [ ] SSL certificate installed
- [ ] Form submission endpoint configured (if using backend)
- [ ] Analytics configured (optional)
- [ ] Performance testing completed

## Testing Locally

Test the site locally before deployment:

```bash
# Navigate to the evolife directory
cd evolife-v1-clean/evolife

# Start a local server (Python 3)
python3 -m http.server 8000

# OR using Node.js
npx http-server -p 8000

# Visit in browser
open http://localhost:8000
```

## Post-Deployment Steps

1. **Verify all pages load correctly**
   - Test homepage, pricing, blog, contact pages
   - Check all internal links work
   - Verify images load properly

2. **Test on multiple devices**
   - Desktop browsers (Chrome, Firefox, Safari, Edge)
   - Mobile devices (iOS Safari, Android Chrome)
   - Tablet devices

3. **Performance check**
   - Run Google Lighthouse audit
   - Check page load times
   - Verify mobile responsiveness

4. **SEO verification**
   - Submit sitemap to Google Search Console
   - Verify meta tags are correct
   - Check structured data

5. **Set up monitoring** (optional)
   - Uptime monitoring
   - Analytics (Google Analytics, Plausible, etc.)
   - Error tracking

## Configuration

### Custom Domain
Point your domain's DNS records to your hosting provider:
- For static hosts: Follow provider's custom domain instructions
- For servers: Create A record pointing to server IP

### SSL Certificate
- Most static hosts (Netlify, Vercel) provide automatic SSL
- For custom servers: Use Let's Encrypt or purchase certificate

### Form Handling
The lead generator form currently redirects to Google Drive. To integrate with a backend:

1. Update form action in index.html and index_P2M1Nzgz.html
2. Configure your backend endpoint (e.g., Formspree, Basin, custom API)
3. Update form submission handling in JavaScript if needed

## Troubleshooting

### Images not loading
- Check file paths are relative
- Verify all images exist in assets/images/
- Check file permissions

### Styles not applying
- Clear browser cache
- Check CSS file paths in HTML
- Verify CSS files exist

### Links broken
- All internal links use relative paths
- Check for typos in href attributes
- Test all navigation links

## Support

For issues or questions:
- Email: info@evolifewellness.com
- Check the README.md in evolife-v1-clean/ folder

## Version
- **Current Version**: v1.0.0-deployment-ready
- **Last Updated**: October 25, 2025
- **Status**: ✅ Ready for deployment
