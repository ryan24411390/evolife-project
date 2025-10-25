const fs = require('fs');
const path = require('path');

// Link mapping for internal pages
const linkMap = {
  'href="/"': 'href="index.html"',
  "href='/'": "href='index.html'",
  'href="/pricing"': 'href="pricing.html"',
  "href='/pricing'": "href='pricing.html'",
  'href="/microdosing"': 'href="microdosing.html"',
  "href='/microdosing'": "href='microdosing.html'",
  'href="/longevity"': 'href="longevity.html"',
  "href='/longevity'": "href='longevity.html'",
  'href="/testosterone"': 'href="testosterone.html"',
  "href='/testosterone'": "href='testosterone.html'",
  'href="/contact-us"': 'href="contact-us.html"',
  "href='/contact-us'": "href='contact-us.html'",
  'href="/blog"': 'href="blog.html"',
  "href='/blog'": "href='blog.html'",
  'href="/compounded-medications"': 'href="compounded-medications.html"',
  "href='/compounded-medications'": "href='compounded-medications.html'",
  'href="/medications-safety-information"': 'href="medications-safety-information.html"',
  "href='/medications-safety-information'": "href='medications-safety-information.html'",
  'href="/privacy-policy"': 'href="privacy-policy.html"',
  "href='/privacy-policy'": "href='privacy-policy.html'",
  'href="/terms-conditions"': 'href="terms-conditions.html"',
  "href='/terms-conditions'": "href='terms-conditions.html'",
};

// Additional blog post links
const blogPosts = [
  'blog_can-glp-1s-help-treat-pcos-symptoms',
  'blog_difference-between-glp-1-and-compounded-glp-1',
  'blog_fridays-weight-loss-program-real-results-personalized-plans',
  'blog_glp-1s-and-menopause',
  'blog_glp-1s-to-your-vacation-weight-loss-plan',
  'blog_how-glp-1-weight-loss-medications-work',
  'blog_microdosing-from-fridays-trip-you-want-to-be-on',
];

blogPosts.forEach(post => {
  linkMap[`href="/${post}"`] = `href="${post}.html"`;
  linkMap[`href='/${post}'`] = `href='${post}.html'`;
  // Handle /blog/ prefix (convert /blog/post-name to blog_post-name.html)
  const shortName = post.replace('blog_', '');
  linkMap[`href="/blog/${shortName}"`] = `href="${post}.html"`;
  linkMap[`href='/blog/${shortName}'`] = `href='${post}.html'`;
});

// Add links with trailing slashes
linkMap['href="/pricing/"'] = 'href="pricing.html"';
linkMap["href='/pricing/'"] = "href='pricing.html'";
linkMap['href="/microdosing/"'] = 'href="microdosing.html"';
linkMap["href='/microdosing/'"] = "href='microdosing.html'";
linkMap['href="/longevity/"'] = 'href="longevity.html"';
linkMap["href='/longevity/'"] = "href='longevity.html'";
linkMap['href="/testosterone/"'] = 'href="testosterone.html"';
linkMap["href='/testosterone/'"] = "href='testosterone.html'";
linkMap['href="/contact-us/"'] = 'href="contact-us.html"';
linkMap["href='/contact-us/'"] = "href='contact-us.html'";

const cleanDir = path.join(__dirname, '..', 'clean');

// Get all HTML files
const htmlFiles = fs.readdirSync(cleanDir).filter(file => file.endsWith('.html'));

console.log(`Found ${htmlFiles.length} HTML files to process`);

let totalReplacements = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(cleanDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;

  // Replace all mapped links
  Object.entries(linkMap).forEach(([oldLink, newLink]) => {
    const regex = new RegExp(oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = (content.match(regex) || []).length;
    if (matches > 0) {
      content = content.replace(regex, newLink);
      fileReplacements += matches;
    }
  });

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${file}: ${fileReplacements} links updated`);
    totalReplacements += fileReplacements;
  } else {
    console.log(`  ${file}: No changes needed`);
  }
});

console.log(`\n✅ Complete! Updated ${totalReplacements} links across ${htmlFiles.length} files`);
