/**
 * Batch Competitor Analysis Script
 * Analyzes all competitors from config file
 */

const CompetitorAnalyzer = require('./analyze-competitor');
const fs = require('fs');
const path = require('path');

async function analyzeAll() {
  const configPath = path.join(__dirname, 'competitors-config.json');

  if (!fs.existsSync(configPath)) {
    console.error('❌ Config file not found: competitors-config.json');
    console.log('Please create a config file with competitor URLs.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const competitors = config.competitors.filter(c => c.name !== 'NOTE' && c.url !== 'UPDATE_URLS_HERE');

  if (competitors.length === 0) {
    console.error('❌ No competitors configured. Please update competitors-config.json');
    process.exit(1);
  }

  console.log(`\n🚀 Starting batch analysis of ${competitors.length} competitors...\n`);

  const results = [];

  for (const competitor of competitors) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Analyzing: ${competitor.name}`);
      console.log(`Category: ${competitor.category}`);
      console.log(`${'='.repeat(60)}\n`);

      const analyzer = new CompetitorAnalyzer(competitor.url, competitor.name);
      await analyzer.init();
      const result = await analyzer.analyze();

      results.push({
        name: competitor.name,
        category: competitor.category,
        success: true,
        data: result
      });

      // Wait 2 seconds between analyses to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Failed to analyze ${competitor.name}:`, error.message);
      results.push({
        name: competitor.name,
        category: competitor.category,
        success: false,
        error: error.message
      });
    }
  }

  // Generate summary report
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 ANALYSIS SUMMARY');
  console.log(`${'='.repeat(60)}\n`);

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}\n`);

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name} (${result.category})`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });

  // Save summary
  const summaryPath = path.join(__dirname, 'reports', 'analysis-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log(`\n📄 Summary saved to: ${summaryPath}\n`);
  console.log('🎉 Batch analysis complete!\n');
}

// Run if called directly
if (require.main === module) {
  analyzeAll().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = analyzeAll;
