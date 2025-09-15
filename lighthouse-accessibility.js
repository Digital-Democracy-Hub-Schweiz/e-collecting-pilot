import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAccessibilityAudit() {
  const chrome = await launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['accessibility'],
    port: chrome.port,
  };
  
  const url = 'http://localhost:8080';
  console.log(`Running Lighthouse accessibility audit on ${url}...`);
  
  try {
    const runnerResult = await lighthouse(url, options);
    
    // Create accessibility-reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, 'accessibility-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Save the JSON report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonReportPath = path.join(reportsDir, `lighthouse-report-${timestamp}.json`);
    
    fs.writeFileSync(jsonReportPath, JSON.stringify(runnerResult.lhr, null, 2));
    
    console.log(`Accessibility audit completed. Report saved to: ${jsonReportPath}`);
    console.log(`Accessibility Score: ${runnerResult.lhr.categories.accessibility.score * 100}/100`);
    
    // Print summary of issues
    const audits = runnerResult.lhr.audits;
    const failedAudits = Object.entries(audits).filter(([key, audit]) => 
      audit.score !== null && audit.score < 1
    );
    
    console.log(`\nFound ${failedAudits.length} accessibility issues:`);
    failedAudits.forEach(([key, audit]) => {
      console.log(`- ${audit.title}: ${audit.description}`);
    });
    
    await chrome.kill();
    return jsonReportPath;
    
  } catch (error) {
    console.error('Error running Lighthouse audit:', error);
    await chrome.kill();
    throw error;
  }
}

runAccessibilityAudit().catch(console.error);