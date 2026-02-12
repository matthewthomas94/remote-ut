const fs = require('fs');
const https = require('https');

// Update these for each request
const FILE_KEY = 'n9fY0515CGP0xpEtgisxB9';
const NODE_ID = '27734-53817';
const TOKEN = 'figd_PirPpFXXKX1xwmofHkLTXA27txjlqGQOqg-ErdwT';

const options = {
    hostname: 'api.figma.com',
    path: `/v1/files/${FILE_KEY}/nodes?ids=${NODE_ID}`,
    headers: {
        'X-Figma-Token': TOKEN
    }
};

function printNode(node, depth = 0) {
    const indent = '  '.repeat(depth);
    let extra = '';

    if (node.type === 'TEXT') {
        extra = `[TEXT: "${node.characters.replace(/\n/g, '\\n')}"]`;
    } else if (node.fills && node.fills.some(f => f.type === 'IMAGE')) {
        extra = `[IMAGE]`;
    } else if (node.type === 'RECTANGLE' && node.fills && node.fills.length > 0) {
        // Try to identify if it's a button or background
        const fill = node.fills[0];
        if (fill.type === 'SOLID') {
            const { r, g, b } = fill.color;
            extra = `[BG: rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})]`;
        }
    }

    console.log(`${indent}${node.name} (${node.type}) ${extra}`);

    if (node.children) {
        node.children.forEach(c => printNode(c, depth + 1));
    }
}

const req = https.get(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error(`Error: ${res.statusCode}`);
            return;
        }

        try {
            const json = JSON.parse(data);
            // Handle colon vs dash in ID
            const nodeIdKey = NODE_ID.replace('-', ':');
            const node = json.nodes[nodeIdKey]?.document;

            if (node) {
                printNode(node);
            } else {
                console.log('Node not found. Keys:', Object.keys(json.nodes));
            }

        } catch (e) {
            console.error('Error parsing JSON', e);
        }
    });
});
