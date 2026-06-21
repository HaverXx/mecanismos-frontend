const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        const filePath = path.join(dir, f);
        if (fs.statSync(filePath).isDirectory()) {
            walkDir(filePath);
        } else if (filePath.endsWith('.vue') || filePath.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Fix the double-nested broken pattern first
            // e.g. `${window.API_URL || '${window.API_URL || 'http://localhost:3000'}'}/path`
            // should become `${window.API_URL}/path`
            const brokenPattern = /\$\{window\.API_URL \|\| '\$\{window\.API_URL \|\| 'http:\/\/localhost:3000'\}'\}/g;
            if (brokenPattern.test(content)) {
                content = content.replace(brokenPattern, '${window.API_URL}');
                console.log('Fixed double-nested in:', filePath);
            }

            // Fix single-nested broken pattern
            // e.g. `${window.API_URL || 'http://localhost:3000'}`
            // should become `${window.API_URL}`
            const singlePattern = /\$\{window\.API_URL \|\| 'http:\/\/localhost:3000'\}/g;
            if (singlePattern.test(content)) {
                content = content.replace(singlePattern, '${window.API_URL}');
                console.log('Fixed single-nested in:', filePath);
            }

            // Fix any remaining raw http://localhost:3000
            if (content.includes('http://localhost:3000')) {
                content = content.replace(/http:\/\/localhost:3000/g, '${window.API_URL}');
                console.log('Fixed raw localhost in:', filePath);
            }

            fs.writeFileSync(filePath, content);
        }
    });
}

walkDir(srcDir);
console.log('Done!');
