import fs from 'fs';

const buffer = fs.readFileSync('out.json');
// Handle potentially weird encoding by just trying utf8 first, or utf16le
try {
    const data = JSON.parse(buffer.toString('utf16le'));
    data.forEach(file => {
        file.messages.forEach(msg => {
            console.log(`${file.filePath}:${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})`);
        });
    });
} catch (e) {
    console.log("Failed parsing utf16le. trying utf8");
    try {
        const data = JSON.parse(buffer.toString('utf8'));
        data.forEach(file => {
            file.messages.forEach(msg => {
                console.log(`${file.filePath}:${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})`);
            });
        });
    } catch (e2) {
        console.log(e2);
    }
}
