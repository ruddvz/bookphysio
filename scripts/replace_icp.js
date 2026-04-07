/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx') || dirPath.endsWith('.js')) {
      callback(dirPath);
    }
  });
}

walkDir('c:/Users/pvr66/bookphysio/src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content
    .replace(/ICP Verified/g, 'IAP Verified')
    .replace(/ICP-Verified/g, 'IAP-Verified')
    .replace(/ICP Verified Clinicians/g, 'IAP Verified Clinicians')
    .replace(/ICP-verified/g, 'IAP-verified')
    .replace(/ICP verification/g, 'IAP verification')
    .replace(/ICP registration/g, 'IAP/State Council registration')
    .replace(/ICP Registration/g, 'IAP/State Council Registration')
    .replace(/ICP number/g, 'IAP/State Council number')
    .replace(/ICP-MH/g, 'IAP-MH')
    .replace(/ICP \(Indian Council of Physiotherapy\)/g, 'IAP (Indian Association of Physiotherapists) or State Council')
    .replace(/ICP Medical ID/g, 'IAP/State Council ID')
    .replace(/ICP documents/g, 'IAP documents')
    .replace(/ICP records/g, 'IAP records')
    .replace(/ICP Verify/g, 'IAP Verify')
    // Hindi translations
    .replace(/ICP पंजीकरण/g, 'IAP/State Council पंजीकरण')
    .replace(/ICP सत्यापन/g, 'IAP/State Council सत्यापन')
    .replace(/ICP नंबर/g, 'IAP/State Council नंबर')
    
    // Exact ICP standalone
    .replace(/>ICP</g, '>IAP<')
    .replace(/'ICP'/g, "'IAP'")
    
    // Variables
    .replace(/icp_registration_no/g, 'iap_registration_no')
    .replace(/ICP-DEMO-123/g, 'IAP-DEMO-123')
    .replace(/ICP-12345/g, 'IAP-12345');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Updated:', filePath);
  }
});
