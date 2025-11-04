const fs = require('fs');
const path = require('path');

// LegitScript seal HTML with prominent styling
const legitScriptSealHTML = `
  <!-- LegitScript Certification Seal -->
  <div class="legitscript-seal-container" style="text-align: center; margin: 2rem auto; padding: 1.5rem 1rem; max-width: 300px;">
    <div style="margin-bottom: 0.5rem; color: #A3B19E; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">
      Verified & Certified
    </div>
    <script src="https://static.legitscript.com/seals/21133691.js"></script>
  </div>
  <!-- End LegitScript Seal -->
`;

let successCount = 0;
let skippedCount = 0;
let errorCount = 0;

console.log('Starting to add LegitScript certification seal to all HTML pages...\n');

// Get all HTML files in root directory (excluding backups)
const rootDir = path.join(__dirname, '..');
const files = fs.readdirSync(rootDir).filter(file =>
  file.endsWith('.html') && !file.endsWith('.backup.html')
);

console.log(`Found ${files.length} HTML files to process\n`);

files.forEach(file => {
  const filePath = path.join(rootDir, file);

    try {
      let content = fs.readFileSync(filePath, 'utf8');

      // Check if LegitScript seal is already present
      if (content.includes('legitscript.com/seals/21133691')) {
        console.log(`⏭️  SKIP: ${file} (already has LegitScript seal)`);
        skippedCount++;
        return;
      }

      let modified = false;

      // Strategy 1: Look for footer bottom section (Webflow pattern)
      // Add before the closing </div> of footer_bottom
      if (content.includes('class="footer_bottom"') || content.includes('class="footer__bottom"')) {
        // Find the footer bottom section
        const footerBottomRegex = /<div[^>]*class="footer_bottom[^"]*"[^>]*>[\s\S]*?<\/div>/;
        const match = content.match(footerBottomRegex);

        if (match) {
          const footerBottomSection = match[0];
          // Insert seal before the closing </div>
          const updatedSection = footerBottomSection.replace(/<\/div>$/, legitScriptSealHTML + '\n  </div>');
          content = content.replace(footerBottomSection, updatedSection);
          modified = true;
        }
      }

      // Strategy 2: If no footer_bottom found, try footer component
      if (!modified && content.includes('class="footer_component"')) {
        // Add before closing </div> of footer_component
        const footerComponentRegex = /<div[^>]*class="footer_component"[^>]*>([\s\S]*)<\/div>\s*<\/div>\s*<\/div>/;
        const match = content.match(footerComponentRegex);

        if (match) {
          // Find the last </div></div></div> sequence (end of footer_component)
          const lastThreeDivs = content.lastIndexOf('</div>\n</div>\n</div>');
          if (lastThreeDivs > 0) {
            content = content.substring(0, lastThreeDivs) +
                     legitScriptSealHTML + '\n' +
                     content.substring(lastThreeDivs);
            modified = true;
          }
        }
      }

      // Strategy 3: Look for semantic <footer> tag
      if (!modified && content.includes('<footer')) {
        // Add before closing </footer>
        const footerRegex = /<\/footer>/;
        if (footerRegex.test(content)) {
          content = content.replace(footerRegex, legitScriptSealHTML + '\n</footer>');
          modified = true;
        }
      }

      // Strategy 4: Look for footer links wrapper
      if (!modified && content.includes('footer_links-wrapper')) {
        const linksWrapperRegex = /<div[^>]*class="[^"]*footer_links-wrapper[^"]*"[^>]*>([\s\S]*?)<\/div>/;
        const match = content.match(linksWrapperRegex);

        if (match) {
          const linksWrapper = match[0];
          // Insert seal before the closing </div>
          const updatedWrapper = linksWrapper.replace(/<\/div>$/, legitScriptSealHTML + '\n  </div>');
          content = content.replace(linksWrapper, updatedWrapper);
          modified = true;
        }
      }

      // Strategy 5 (Fallback): Add just before closing </body> tag
      // This works for pages without traditional footers
      if (!modified && content.includes('</body>')) {
        // Create a standalone footer section with seal
        const standaloneFooterSection = `
<!-- LegitScript Certification Footer Section -->
<section class="legitscript-section" style="background: #2C3531; padding: 3rem 0; text-align: center;">
  <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
${legitScriptSealHTML}
  </div>
</section>

`;
        content = content.replace('</body>', standaloneFooterSection + '</body>');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ SUCCESS: ${file}`);
        successCount++;
      } else {
        console.log(`⚠️  WARNING: ${file} (no suitable footer location found)`);
        errorCount++;
      }

    } catch (error) {
      console.log(`❌ ERROR: ${file} - ${error.message}`);
      errorCount++;
    }
});

console.log('\n' + '='.repeat(70));
console.log('SUMMARY:');
console.log(`✅ Successfully updated: ${successCount} files`);
console.log(`⏭️  Skipped (already has seal): ${skippedCount} files`);
console.log(`⚠️  Warnings/Errors: ${errorCount} files`);
console.log('='.repeat(70));
