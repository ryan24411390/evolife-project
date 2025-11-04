const fs = require('fs');
const path = require('path');

// List of main pages to update
const mainPages = [
  'contact-us.html',
  'get-started.html',
  'testosterone.html',
  'mens-health.html',
  'peptides.html',
  'recovery.html',
  'weight-management.html'
];

// Footer updates to apply
const updates = [
  {
    // Remove duplicate lottie animation
    old: /<div class="lottie-animation"[^>]*><\/div><div class="lottie-animation"[^>]*><\/div>/g,
    new: ''
  },
  {
    // Update disclaimer wrapper with white text
    old: /<div class="footer_legal-disclaimer-wrapper">/g,
    new: '<div class="footer_legal-disclaimer-wrapper" style="color: white; max-width: 100%;">'
  },
  {
    // Update disclaimer text
    old: /The information provided on the Evolife Wellness website is for educational purposes only[^<]+<\/div>/,
    new: 'The online assessment on the Evolife Wellness website does not establish a doctor-patient relationship. Evolife partners with licensed healthcare providers who independently evaluate eligibility for treatments based on medical history and assessment responses. Providers retain full discretion in prescribing or declining compounded medications. Compounded medications are produced in FDA-registered facilities but have not been approved by the FDA for safety, efficacy, or quality. Results may vary based on individual adherence, medical guidance, and lifestyle factors. Evolife does not manufacture medications; product appearance may differ from images. All compounded medications are sourced from certified U.S. pharmacies adhering to strict safety standards. Medication costs are included in the program.</div>'
  },
  {
    // Update footer_bottom with white text
    old: /<div class="footer_bottom">/g,
    new: '<div class="footer_bottom" style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%;">'
  },
  {
    // Update copyright text color
    old: /<div class="text-block-3">©/g,
    new: '<div class="text-block-3" style="color: white;">©'
  },
  {
    // Update footer_bottom-links
    old: /<div class="footer_bottom-links">/g,
    new: '<div class="footer_bottom-links" style="display: flex; gap: 1rem; flex-wrap: wrap;">'
  },
  {
    // Update footer links to white
    old: /<a href="([^"]+)" (target="_blank" )?class="footer_link">/g,
    new: '<a href="$1" $2class="footer_link" style="color: white;">'
  }
];

const rootDir = path.join(__dirname, '..');

mainPages.forEach(page => {
  const filePath = path.join(rootDir, page);

  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${page} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Apply all updates
  updates.forEach(update => {
    content = content.replace(update.old, update.new);
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${page}`);
});

console.log('Footer updates complete!');
