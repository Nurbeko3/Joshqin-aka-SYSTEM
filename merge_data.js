const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const importPath = path.join(__dirname, 'talabalar_baza_2025-12-21 (1).json');

try {
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const importData = JSON.parse(fs.readFileSync(importPath, 'utf8'));

    if (!dbData.students) {
        dbData.students = [];
    }

    // Merge logic: Add new students, avoid duplicates if ID matches (optional, but good practice)
    const existingIds = new Set(dbData.students.map(s => s.id));

    let addedCount = 0;
    for (const student of importData) {
        if (!existingIds.has(student.id)) {
            dbData.students.push(student);
            addedCount++;
        }
    }

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
    console.log(`Successfully merged ${addedCount} students into db.json.`);
} catch (error) {
    console.error('Error during merge:', error);
    process.exit(1);
}
