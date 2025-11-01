// Database password dan Google Drive links
// PENTING: Ganti dengan password dan link yang sebenarnya
const PASSWORD_DATABASE = {
  1: {
    password: "Akutagawa123",
    driveLink: "https://drive.google.com/drive/folders/1LV2sSJ9XUv980AMQVz_de9MQRFi3r7ej?usp=sharing"
  },
  2: {
    password: "PschoGirl123",
    driveLink: "https://drive.google.com/drive/folders/1LV2sSJ9XUv980AMQVz_de9MQRFi3r7ej?usp=sharing"
  }
  ,
  2: {
    password: "Bunnygirl123",
    driveLink: "https://drive.google.com/drive/folders/1LV2sSJ9XUv980AMQVz_de9MQRFi3r7ej?usp=sharing"
  }
};

// Rate limiting storage (in-memory, akan reset setiap cold start)
const rateLimitStore = new Map();
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 menit

// Helper function untuk rate limiting
function checkRateLimit(ip, projectId) {
  const key = `${ip}-${projectId}`;
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }
  
  const record = rateLimitStore.get(key);
  
  // Reset jika window sudah lewat
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }
  
  // Check jika sudah melebihi limit
  if (record.attempts >= MAX_ATTEMPTS) {
    const timeLeft = Math.ceil((RATE_LIMIT_WINDOW - (now - record.firstAttempt)) / 1000 / 60);
    return { 
      allowed: false, 
      remainingAttempts: 0,
      message: `Terlalu banyak percobaan gagal. Coba lagi dalam ${timeLeft} menit.`
    };
  }
  
  // Increment attempts
  record.attempts++;
  rateLimitStore.set(key, record);
  
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - record.attempts };
}

// Main handler
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { projectId, password } = req.body;
    
    // Validate input
    if (!projectId || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Project ID dan password harus diisi' 
      });
    }
    
    // Get client IP for rate limiting
    const clientIp = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     'unknown';
    
    // Check rate limit
    const rateLimitCheck = checkRateLimit(clientIp, projectId);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ 
        success: false, 
        error: rateLimitCheck.message,
        remainingAttempts: 0
      });
    }
    
    // Check if project exists
    if (!PASSWORD_DATABASE[projectId]) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project tidak ditemukan' 
      });
    }
    
    const projectData = PASSWORD_DATABASE[projectId];
    
    // Verify password
    if (password === projectData.password) {
      // Success - return drive link
      return res.status(200).json({ 
        success: true, 
        driveLink: projectData.driveLink,
        message: 'Password benar! Membuka Google Drive...'
      });
    } else {
      // Wrong password
      return res.status(401).json({ 
        success: false, 
        error: 'Password salah! Silakan coba lagi.',
        remainingAttempts: rateLimitCheck.remainingAttempts
      });
    }
    
  } catch (error) {
    console.error('Error in verify-password:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Terjadi kesalahan server. Silakan coba lagi.' 
    });
  }
}