const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db/warnings.json');
const CLEANUP_INTERVAL = 60 * 1000; // Check for expired warnings every 1 minute

// Helper: Read data from JSON safely
function readDatabase() {
    try {
        if (!fs.existsSync(DB_PATH)) return [];
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Error reading database:', error.message);
        return [];
    }
}

// Helper: Write data to JSON safely
function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to database:', error.message);
    }
}

// Action: Add a warning to a user
async function addWarning(userId, reason, duration) {
    const warnings = readDatabase();
    const now = Date.now();
    
    const newWarning = {
        warningId: Math.random().toString(36).substr(2, 9),
        userId: userId,
        reason: reason,
        timestamp: now,
        expiresAt: now + duration
    };

    try {
        await warnings.push(newWarning);
        await writeDatabase(warnings);
        
        const userCount = await warnings.filter(w => w.userId === userId).length;
        console.log(`[WARN] User ${userId} warned. Reason: "${reason}". Total active warnings: ${userCount}`);
        return userCount;
    } catch (error) {
        console.error('Failed to warn member:', error);
    }

}

// Action: Get all active warnings for a user
function getUserWarnings(userId) {
    const warnings = readDatabase();
    return warnings.filter(w => w.userId === userId);
}

// Background Task: Clean up expired warnings
function startCleanupTask() {
    setInterval(() => {
        const warnings = readDatabase();
        const now = Date.now();
        
        // Filter out items where the expiration time has passed
        const activeWarnings = warnings.filter(w => w.expiresAt > now);
        const expiredCount = warnings.length - activeWarnings.length;

        if (expiredCount > 0) {
            writeDatabase(activeWarnings);
            console.log(`[CLEANUP] Removed ${expiredCount} expired warning(s).`);
        }
    }, CLEANUP_INTERVAL);
}

module.exports = {
    startCleanupTask,
    getUserWarnings,
    addWarning,
}

// ==========================================
// TEST EXECUTION
// ==========================================

// Start the automatic background cleaner
// startCleanupTask();

// console.log('Warning bot system initialized...');

// // Simulate issuing warnings
// addWarning('user_123', 'Spamming chat channels');
// addWarning('user_123', 'Using offensive language');
// addWarning('user_999', 'Inappropriate profile picture');

// // Check active warnings for a specific user
// console.log('\nFetching active warnings for user_123:');
// console.log(getUserWarnings('user_123'));
