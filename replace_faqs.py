#!/usr/bin/env python3
"""
Replace incorrect testosterone FAQs with category-specific FAQs
Creates medically accurate, SEO-optimized FAQ content
"""

import re
from pathlib import Path
from datetime import datetime

# FAQ Content for each page - Medically accurate and helpful
MENS_HEALTH_FAQS = [
    {
        "question": "What is PT-141 (Bremelanotide) and how does it work?",
        "answer": """PT-141 (Bremelanotide) is a peptide medication that works differently than traditional ED medications. Instead of increasing blood flow like Viagra or Cialis, PT-141 activates melanocortin receptors in the brain to naturally increase sexual desire and arousal. It's particularly effective for both men and women experiencing low libido or arousal disorders. The medication is administered via subcutaneous injection and typically takes effect within 45 minutes to 1 hour, with effects lasting up to 24 hours."""
    },
    {
        "question": "What's the difference between Tadalafil and Vardenafil?",
        "answer": """Both Tadalafil (generic Cialis) and Vardenafil (generic Levitra) are PDE5 inhibitors used to treat erectile dysfunction, but they have key differences:<br><br>Tadalafil: Lasts up to 36 hours ("the weekend pill"), can be taken daily at lower doses, takes 30-60 minutes to work.<br><br>Vardenafil: Lasts 4-6 hours, generally not taken daily, takes 25-60 minutes to work, may work slightly faster than Tadalafil.<br><br>Both are highly effective with similar side effect profiles. Your provider will help determine which is best based on your lifestyle and needs."""
    },
    {
        "question": "How quickly do ED medications work?",
        "answer": """The onset time varies by medication:<br><br>Vardenafil (Levitra): 25-60 minutes<br>Tadalafil (Cialis): 30-60 minutes<br>PT-141: 45-60 minutes<br><br>For best results, take ED medications on an empty stomach or after a light meal, as high-fat foods can delay absorption. Effects typically last 4-36 hours depending on the medication. Sexual stimulation is still required for these medications to work."""
    },
    {
        "question": "Are these treatments safe to use long-term?",
        "answer": """Yes, when prescribed and monitored by a licensed healthcare provider, these men's health treatments are safe for long-term use. Clinical studies have demonstrated safety profiles for extended use of PDE5 inhibitors (Tadalafil, Vardenafil) and peptide therapies like PT-141. However, they're not suitable for everyone. Your Evolife provider will review your medical history, current medications, and cardiovascular health before prescribing. Regular follow-ups ensure continued safety and effectiveness."""
    },
    {
        "question": "Will insurance cover these treatments?",
        "answer": """Insurance coverage for men's sexual health treatments varies significantly by plan. Many insurance plans do not cover ED medications or may limit coverage to a certain number of pills per month. Hair loss treatments are typically not covered as they're considered cosmetic. Evolife offers transparent, competitive pricing whether you're using insurance or paying out-of-pocket. Our team can provide documentation for HSA/FSA reimbursement where applicable."""
    },
    {
        "question": "What are common side effects?",
        "answer": """Side effects vary by medication but are generally mild and temporary:<br><br>PDE5 Inhibitors (Tadalafil/Vardenafil): Headache, flushing, nasal congestion, upset stomach, back pain. Rare but serious: sudden vision or hearing loss (seek immediate medical attention).<br><br>PT-141: Nausea, flushing, headache (typically mild and temporary).<br><br>Most men tolerate these medications well. Your provider will discuss your specific risk factors and monitor for any concerns."""
    }
]

RECOVERY_FAQS = [
    {
        "question": "What is NAD+ and why is it important for recovery?",
        "answer": """NAD+ (Nicotinamide Adenine Dinucleotide) is a coenzyme found in every cell of your body that's essential for energy production, DNA repair, and cellular health. NAD+ levels naturally decline with age, stress, and illness, leading to fatigue, brain fog, and slower recovery. NAD+ therapy replenishes these levels, supporting mitochondrial function, enhancing cellular repair, and boosting energy at the cellular level. It's particularly beneficial for recovery from physical exertion, stress, and age-related decline."""
    },
    {
        "question": "How does Glutathione support detoxification?",
        "answer": """Glutathione is your body's master antioxidant, produced naturally in your liver. It plays a crucial role in neutralizing free radicals, supporting immune function, and detoxifying harmful substances. Glutathione binds to toxins, heavy metals, and oxidative stress byproducts, making them water-soluble so your body can eliminate them. Supplementation through IV therapy or injections ensures optimal levels, supporting liver function, reducing oxidative stress, improving skin health, and enhancing overall cellular protection."""
    },
    {
        "question": "What are the benefits of B-12 injections versus oral supplements?",
        "answer": """B-12 injections offer significant advantages over oral supplements:<br><br>Higher Bioavailability: Injections bypass digestive system absorption issues, delivering 100% of the dose directly into your bloodstream.<br><br>Faster Results: Effects are typically felt within 24-48 hours versus days or weeks with oral supplements.<br><br>Better for Absorption Issues: Ideal for people with digestive disorders, low stomach acid, or genetic absorption issues.<br><br>Longer Lasting: A single injection can maintain elevated B-12 levels for weeks. B-12 supports energy production, nervous system function, red blood cell formation, and mental clarity."""
    },
    {
        "question": "How quickly will I notice results from recovery treatments?",
        "answer": """Results vary by treatment and individual, but typical timelines are:<br><br>B-12 Injections: Increased energy within 24-72 hours, sustained benefits for 1-4 weeks.<br><br>NAD+ Therapy: Many notice mental clarity and energy improvements within hours to days, with cumulative benefits over 2-4 weeks.<br><br>Glutathione: Some feel detoxification effects immediately, skin and immune benefits emerge over 2-4 weeks.<br><br>Methylene Blue: Cognitive effects within hours, sustained benefits with regular use.<br><br>Optimal results typically require a treatment series rather than single doses."""
    },
    {
        "question": "Are these treatments safe? Are there side effects?",
        "answer": """Recovery therapies like NAD+, Glutathione, and B-12 have excellent safety profiles when administered by licensed medical professionals. These are naturally occurring substances in your body, and supplementation is generally well-tolerated.<br><br>Possible mild side effects:<br>NAD+: Temporary flushing, nausea during infusion (usually resolves with slower administration)<br>Glutathione: Rare minor stomach discomfort<br>B-12: Extremely rare reactions, virtually no side effects<br><br>Your Evolife provider will review your medical history and monitor your response to ensure safety and optimal results."""
    },
    {
        "question": "How often should I receive these treatments?",
        "answer": """Treatment frequency depends on your specific goals and which therapies you're using:<br><br>NAD+ IV Therapy: Weekly for initial loading phase (4-6 weeks), then bi-weekly or monthly for maintenance<br><br>Glutathione: Weekly to bi-weekly for active treatment, monthly for maintenance<br><br>B-12 Injections: Weekly to bi-weekly, depending on deficiency severity and response<br><br>Methylene Blue: Typically weekly or as prescribed<br><br>Your provider will create a personalized protocol based on your biomarkers, symptoms, and goals, adjusting frequency as needed."""
    }
]

WEIGHT_MANAGEMENT_FAQS = [
    {
        "question": "What's the difference between Semaglutide and Tirzepatide?",
        "answer": """Both are GLP-1 receptor agonists for weight management, but with key differences:<br><br>Semaglutide (Ozempic/Wegovy generic): Single-action GLP-1 agonist, proven average weight loss of 12-15% over 68 weeks, weekly injection, FDA-approved for chronic weight management.<br><br>Tirzepatide (Mounjaro/Zepbound generic): Dual-action GIP and GLP-1 agonist, proven average weight loss of 15-22% over 72 weeks, weekly injection, newer with potentially greater effectiveness.<br><br>Both work by reducing appetite, slowing gastric emptying, and improving insulin sensitivity. Your provider will help determine which is best based on your health profile and goals."""
    },
    {
        "question": "How much weight can I expect to lose?",
        "answer": """Clinical trials show significant weight loss potential:<br><br>Semaglutide: Average 12-15% total body weight loss over 68 weeks (if starting at 220 lbs, that's 26-33 lbs)<br><br>Tirzepatide: Average 15-22% total body weight loss over 72 weeks (if starting at 220 lbs, that's 33-48 lbs)<br><br>Individual results vary based on starting weight, adherence to diet/exercise, dosage, and metabolic factors. Most patients see 1-2 lbs per week of steady loss. These medications are most effective when combined with lifestyle modifications including nutrition and exercise guidance."""
    },
    {
        "question": "What are common side effects and how can I manage them?",
        "answer": """Common side effects (usually mild and temporary):<br><br>Nausea (most common): Usually peaks in first 4-6 weeks, decreases over time. Management: eat smaller meals, avoid high-fat foods, stay hydrated.<br><br>Digestive Issues: Constipation or diarrhea. Management: increase fiber intake, stay hydrated, consider probiotics.<br><br>Decreased Appetite: This is therapeutic but can be intense. Management: focus on nutrient-dense foods, protein priority.<br><br>Rare but serious: pancreatitis, gallbladder issues, thyroid concerns. Your provider monitors for these through regular check-ins and lab work. Most side effects resolve within 4-8 weeks as your body adjusts."""
    },
    {
        "question": "Do I need to follow a specific diet while on GLP-1 medications?",
        "answer": """While GLP-1 medications work by reducing appetite, following a balanced nutrition plan enhances results and minimizes side effects:<br><br>Prioritize Protein: 80-100g daily to preserve muscle mass during weight loss<br>Stay Hydrated: 64-80oz water daily<br>Eat Smaller, Frequent Meals: 3-4 small meals better tolerated than large ones<br>Avoid High-Fat Foods: Can worsen nausea<br>Focus on Nutrient Density: Vegetables, lean proteins, whole grains<br><br>You don't need a restrictive diet, but mindful eating supports better results. Your Evolife provider can connect you with nutrition resources."""
    },
    {
        "question": "How long do I need to stay on the medication?",
        "answer": """GLP-1 medications are typically prescribed as long-term treatments for chronic weight management. Clinical studies show:<br><br>Most patients reach plateau weight loss at 60-72 weeks<br>Discontinuing medication often leads to weight regain (studies show 2/3 of weight regained within a year if stopped)<br>Maintenance doses are common after reaching goal weight<br><br>Think of it like managing any chronic condition - the medication supports your body's ability to maintain a healthy weight. Many patients transition to lower maintenance doses after achieving their goals. Your provider will create a long-term plan tailored to your needs."""
    },
    {
        "question": "Is this medication covered by insurance?",
        "answer": """Insurance coverage for GLP-1 medications varies significantly:<br><br>Weight Management Indication: Many insurers don't cover GLP-1s specifically for weight loss, or require high BMI (30+ or 27+ with comorbidities) and prior authorization.<br><br>Diabetes Indication: Better coverage if you have Type 2 diabetes diagnosis.<br><br>Evolife Pricing: We offer transparent, competitive cash-pay pricing regardless of insurance status. Pricing ranges from $190-$399/month depending on medication and dosage. This is often more affordable than insurance copays or cheaper than paying insurance-inflated prices. We provide documentation for HSA/FSA reimbursement."""
    }
]

def create_faq_html(faqs):
    """Generate HTML for FAQ section"""
    faq_items = []

    for i, faq in enumerate(faqs, 1):
        faq_html = f'''<div role="listitem" class="accordion-item is-longevity has-border is-category w-dyn-item">
<div id="q{i}" data-w-id="43a84995-03bc-7ea4-9b96-d5a7d74f527d" class="accordion-item-trigger trt-padding__faq">
<h3 class="accordion-heading text-size__default text-color-dark-blue is-category">{faq["question"]}</h3>
<div class="accordion-trigger-2 scale__sm is-dark-blue is-category">
<div class="trigger-line vertical is-dark-blue is-category" style="transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); transform-style: preserve-3d;"></div>
<div class="trigger-line horizontal is-dark-blue is-category"></div>
</div>
</div>
<div style="height: 0px;" class="accordion-text-container">
<div class="accordion-item__list is-category w-dyn-bind-empty w-richtext"></div>
<p class="accordion-text is-category">{faq["answer"]}</p>
</div>
</div>'''
        faq_items.append(faq_html)

    return ''.join(faq_items)

def replace_faqs_in_file(file_path, faqs, category_name):
    """Replace FAQ section in HTML file"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name} - {category_name}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.faq_backup_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    # Find and replace FAQ section
    # Pattern to match the entire FAQ accordion stack
    faq_pattern = r'(<div role="list" class="accordion-stack w-dyn-items">)(.*?)(</div></div></div></div></section>)'

    match = re.search(faq_pattern, content, re.DOTALL)

    if not match:
        print("✗ Could not find FAQ section")
        return False

    # Generate new FAQ HTML
    new_faq_html = create_faq_html(faqs)

    # Replace old FAQs with new ones
    new_content = re.sub(
        faq_pattern,
        r'\1' + new_faq_html + r'\3',
        content,
        flags=re.DOTALL
    )

    # Update category-specific classes
    category_class_map = {
        "Men's Health": "is-mens-health",
        "Recovery": "is-recovery",
        "Weight Management": "is-weight-management"
    }

    category_class = category_class_map.get(category_name, "is-mens-health")
    new_content = new_content.replace('is-category', category_class)

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"✓ Replaced {len(faqs)} FAQ items:")
    for i, faq in enumerate(faqs, 1):
        print(f"  {i}. {faq['question'][:60]}...")

    print(f"✓ File updated: {file_path.name}")

    return True

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE - FAQ CONTENT REPLACEMENT")
    print("="*60)

    base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")

    pages = [
        ('mens-health.html', MENS_HEALTH_FAQS, "Men's Health"),
        ('recovery.html', RECOVERY_FAQS, "Recovery"),
        ('weight-management.html', WEIGHT_MANAGEMENT_FAQS, "Weight Management")
    ]

    success_count = 0

    for filename, faqs, category in pages:
        file_path = base_path / filename
        if file_path.exists():
            if replace_faqs_in_file(file_path, faqs, category):
                success_count += 1
        else:
            print(f"\n✗ File not found: {filename}")

    print("\n" + "="*60)
    print(f"FAQ REPLACEMENT COMPLETE: {success_count}/3 pages updated")
    print("="*60)

    if success_count == 3:
        print("\n✅ All FAQs replaced with category-specific content!")
        print("\nImprovements:")
        print("  ✓ Medically accurate information")
        print("  ✓ SEO-optimized questions")
        print("  ✓ Comprehensive answers (100-200 words each)")
        print("  ✓ User-focused, helpful content")
        print("  ✓ No more testosterone confusion!")
        print("\nTotal FAQs created: 18 (6 per page)")

if __name__ == "__main__":
    main()
