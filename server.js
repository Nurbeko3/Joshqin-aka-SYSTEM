const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001; // Standard HTTP port
const DB_FILE = path.join(__dirname, 'db.json');

// Ensure db.json exists with initial structure
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
        students: [],
        specialties: [],
        system_users: [],
        pending_updates: [],
        student_messages: [],
        gifted_applications: [],
        contests: [],
        settings: {
            disableStatusRollback: false
        }
    }));
}

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
    // API Endpoints
    if (req.url === '/api/data' && req.method === 'GET') {
        console.log(`[GET] ${req.url} - Ma'lumotlar so'ralmoqda...`);
        fs.readFile(DB_FILE, (err, data) => {
            if (err) {
                console.error("[XATOLIK] Bazani o'qishda xatolik:", err);
                res.writeHead(500);
                return res.end('Error reading data');
            }
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            });
            res.end(data);
        });
        return;
    }

    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        console.log(`[POST] ${req.url} - Ma'lumotlarni saqlash boshlandi...`);
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('error', (err) => {
            console.error("[XATOLIK] Stream o'qishda xatolik:", err);
            res.writeHead(500);
            res.end('Request stream error');
        });
        req.on('end', () => {
            const sizeMB = (body.length / (1024 * 1024)).toFixed(2);
            console.log(`[POST] Ma'lumotlarni yozish... (Hajmi: ${sizeMB} MB)`);
            fs.writeFile(DB_FILE, body, (err) => {
                if (err) {
                    console.error("[XATOLIK] Bazani saqlashda xatolik:", err);
                    res.writeHead(500);
                    return res.end('Error saving data');
                }
                console.log(`[OK] Ma'lumotlar saqlandi!`);
                res.writeHead(200);
                res.end('Saved');
            });
        });
        return;
    }

    // Static File Serving
    let filePath = '.' + req.url.split('?')[0]; // Ignore query params
    if (filePath === './') filePath = './index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Protect absolute path traversal
    const safePath = path.join(__dirname, filePath.replace(/\.\.\//g, ''));

    fs.readFile(safePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const os = require('os');

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`\n[XATOLIK] 80-port band!`);
        console.error(`Server ishga tushmadi, chunki 80-portni boshqa dastur ishlatayapti.`);
        console.error(`Iltimos, Skype, IIS, yoki boshqa web serverlarni o'chiring.`);
        console.error(`Yoki serverni Administrator sifatida ishga tushirib ko'ring.`);
        setTimeout(() => process.exit(1), 5000);
    } else {
        console.error(`[XATOLIK] Server xatosi: ${e.code}`);
        setTimeout(() => process.exit(1), 5000);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=================================================`);
    console.log(`EduDocs Server ishga tushdi!`);

    const nets = os.networkInterfaces();
    let localIP = 'localhost';

    console.log(`\nKirish manzillari:`);
    console.log(`1. Lokal:  http://localhost`);

    // Find Local IP
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`2. Wi-Fi:  http://${net.address}  <-- SHU MANZILNI TAVSIYA QILAMIZ`);
                localIP = net.address;
            }
        }
    }

    console.log(`\nDomenda: http://www.edu.docs.uz`);
    console.log(`=================================================\n`);
});
