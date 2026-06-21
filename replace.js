const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath);
        } else if (dirPath.endsWith('.vue') || dirPath.endsWith('.js')) {
            let content = fs.readFileSync(dirPath, 'utf8');
            let modified = false;

            if (content.includes('http://localhost:3000')) {
                // Reemplazar urls entre comillas dobles
                content = content.replace(/"http:\/\/localhost:3000([^"\n]*)"/g, '\`${window.API_URL || \'http://localhost:3000\'}$1\`');
                // Reemplazar urls en backticks existentes
                content = content.replace(/http:\/\/localhost:3000/g, '${window.API_URL || \'http://localhost:3000\'}');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(dirPath, content);
                console.log('Modified:', dirPath);
            }
        }
    });
}

walkDir(srcDir);
