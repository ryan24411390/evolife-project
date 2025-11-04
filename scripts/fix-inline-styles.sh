#!/bin/bash

# Fix all inline styles in semaglutide-new.html
# Run from project root directory

FILE="semaglutide-new.html"
BACKUP="semaglutide-new.html.backup-$(date +%Y%m%d%H%M%S)"

echo "Creating backup: $BACKUP"
cp "$FILE" "$BACKUP"

echo "Applying fixes to $FILE..."

# Fix 1: Add font loading CSS before </head>
sed -i '' '/<link rel="icon" type="image\/png" href="assets\/images\/favicon.png">/a\
\
<!-- Font Loading CSS - Prevent FOUT -->\
<style>\
  body {\
    font-family: '"'"'Inter'"'"', -apple-system, BlinkMacSystemFont, '"'"'Segoe UI'"'"', sans-serif;\
  }\
  h1, h2, h3, .display-md, .display-lg, .display-sm, .hero__title {\
    font-family: '"'"'DM Serif Display'"'"', Georgia, serif;\
  }\
</style>
' "$FILE"

# Fix 2: Price suffix - line 74
sed -i '' 's|<span style="font-size: 1\.25rem; color: rgba(255,255,255,0\.7); font-weight: 400;">/month</span>|<span class="price-suffix">/month</span>|g' "$FILE"

# Fix 3: Body text white soft - line 75
sed -i '' 's|<p class="body-sm" style="color: rgba(255,255,255,0\.8);">|<p class="body-sm text-white-soft">|g' "$FILE"

# Fix 4: Button outline light - line 83
sed -i '' 's|<a href="#how-it-works" class="btn btn-outline btn-lg" style="border-color: white; color: white;">|<a href="#how-it-works" class="btn btn-outline btn-lg btn-light">|g' "$FILE"

# Fix 5: Text white dim - line 87
sed -i '' 's|<div class="mt-8" style="color: rgba(255,255,255,0\.9);">|<div class="mt-8 text-white-dim">|g' "$FILE"

# Fix 6: Hero placeholder - line 95
sed -i '' 's|<div style="width: 100%; height: 500px; background: rgba(255,255,255,0\.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white;">|<div class="placeholder placeholder--hero">|g' "$FILE"

# Fix 7-12: Icons (emoji spans) - lines 168, 179, 190, 201, 212, 223
sed -i '' 's|<span style="font-size: 2rem;">|<span class="icon-lg">|g' "$FILE"

# Fix 13-15: Progress bars - lines 348, 355, 362
sed -i '' 's|<div class="progress__bar" style="width: 75%;"></div>|<div class="progress__bar w-75"></div>|g' "$FILE"
sed -i '' 's|<div class="progress__bar" style="width: 85%;"></div>|<div class="progress__bar w-85"></div>|g' "$FILE"
sed -i '' 's|<div class="progress__bar" style="width: 70%;"></div>|<div class="progress__bar w-70"></div>|g' "$FILE"

# Fix 16: Doctor avatar - line 432
sed -i '' 's|<div style="width: 120px; height: 120px; border-radius: 50%; background: var(--color-secondary-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: bold; color: var(--color-secondary-dark);">|<div class="avatar avatar--doctor">|g' "$FILE"

# Fix 17-19: Testimonial avatars - lines 491, 510, 529
sed -i '' 's|<div class="testimonial__avatar" style="background: var(--color-secondary-light); display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--color-secondary-dark);">|<div class="testimonial__avatar avatar--testimonial">|g' "$FILE"

# Fix 20: Info box warning - line 598
sed -i '' 's|<div class="card mt-8" style="background: var(--color-info-light); border-left: 4px solid var(--color-info);">|<div class="card mt-8 info-box--warning">|g' "$FILE"

# Fix 21: Button outline light (final CTA) - line 803
sed -i '' 's|<a href="contact-us.html" class="btn btn-outline btn-xl" style="border-color: white; color: white;">|<a href="contact-us.html" class="btn btn-outline btn-xl btn-light">|g' "$FILE"

# Fix 22: Text white dim (final section) - line 807
# (Already handled by line 87 fix since it's the same pattern)

# Fix 23: Badge light - line 813
sed -i '' 's|<div class="badge" style="background: rgba(255,255,255,0\.2); color: white; padding: 8px 20px;">|<div class="badge badge--light">|g' "$FILE"

echo "✅ All fixes applied!"
echo "Backup saved as: $BACKUP"
echo ""
echo "Changes made:"
echo "  - Added font loading CSS"
echo "  - Replaced 22 inline styles with CSS classes"
echo ""
echo "Run: diff $BACKUP $FILE | head -50"
echo "to see the changes"
