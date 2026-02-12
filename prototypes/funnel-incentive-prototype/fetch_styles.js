const fs = require('fs');
const https = require('https');

const FILE_KEY = 'n9fY0515CGP0xpEtgisxB9';
const NODE_ID = '27728-10268';
const TOKEN = 'figd_PirPpFXXKX1xwmofHkLTXA27txjlqGQOqg-ErdwT';

const options = {
    hostname: 'api.figma.com',
    path: `/v1/files/${FILE_KEY}/nodes?ids=${NODE_ID}`,
    headers: {
        'X-Figma-Token': TOKEN
    }
};

function rgbToHex(r, g, b) {
    const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const colors = new Set();
const textStyles = [];

function traverse(node) {
    // Extract Fills (Colors)
    if (node.fills) {
        node.fills.forEach(fill => {
            if (fill.type === 'SOLID' && fill.visible !== false) {
                const { r, g, b } = fill.color;
                const hex = rgbToHex(r, g, b);
                colors.add(hex);
            }
        });
    }

    // Extract Text Styles
    if (node.type === 'TEXT' && node.style) {
        textStyles.push({
            fontFamily: node.style.fontFamily,
            fontWeight: node.style.fontWeight,
            fontSize: node.style.fontSize
        });
    }

    // Recurse
    if (node.children) {
        node.children.forEach(traverse);
    }
}

const req = https.get(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error(`Error: ${res.statusCode} ${res.statusMessage}`);
            console.error(data);
            return;
        }

        try {
            const json = JSON.parse(data);
            const rootNode = json.nodes[NODE_ID.replace('-', ':')]; // API expects : not - sometimes, but let's try direct first.
            // Actually Figma API separates ids by comma, but keys in response might differ.
            // The node id in URL is 27728-10268, response keys usually match.

            // If the node ID passed in the URL has '-', the response usually has keys like '27728:10268'
            // Let's find the value regardless of key format
            const nodeValue = Object.values(json.nodes)[0]?.document;

            if (nodeValue) {
                traverse(nodeValue);

                console.log('/* Extracted Colors */');
                let colorIndex = 1;
                colors.forEach(c => {
                    console.log(`--color-${colorIndex++}: ${c};`);
                });

                console.log('\n/* Extracted Fonts (Snapshot) */');
                // Unique based on family+weight+size
                const uniqueFonts = [...new Set(textStyles.map(s => JSON.stringify(s)))].map(s => JSON.parse(s));
                uniqueFonts.sort((a, b) => b.fontSize - a.fontSize).forEach((f, i) => {
                    console.log(`--font-${i + 1}: ${f.fontWeight} ${f.fontSize}px '${f.fontFamily}';`);
                });

            } else {
                console.log('Node not found in response');
                console.log(JSON.stringify(json, null, 2));
            }

        } catch (e) {
            console.error('Error parsing JSON', e);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});
