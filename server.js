import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load configuration from environment variables or config.json
let config = {};

// Try to load from environment variables first
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.SESSION_SECRET || 'credential-secret-key-change-in-production';

if (adminPassword) {
  config.adminPassword = adminPassword;
} else {
  // Fallback to config.json for local development
  try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
  } catch (error) {
    console.error('⚠️  WARNING: No admin password configured!');
    console.error('Please set ADMIN_PASSWORD environment variable or create config.json');
    console.error('For development: set ADMIN_PASSWORD in .env file');
    process.exit(1);
  }
}

// Session configuration
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Student data file path
const studentsFile = path.join(__dirname, 'students.json');
const certificatesDir = path.join(__dirname, 'certificates');

// Ensure certificates directory exists
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

// Ensure students.json exists
if (!fs.existsSync(studentsFile)) {
  fs.writeFileSync(studentsFile, JSON.stringify([], null, 2));
}

// Load students from file
function loadStudents() {
  const data = fs.readFileSync(studentsFile, 'utf-8');
  return JSON.parse(data);
}

// Save students to file
function saveStudents(students) {
  fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2));
}

// Middleware to check if user is authenticated for admin
function isAuthenticated(req, res, next) {
  if (req.session && req.session.adminAuth) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized. Please log in to the admin panel.' });
  }
}

// API endpoint: Admin login
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    if (password === config.adminPassword) {
      req.session.adminAuth = true;
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error occurred.' });
  }
});

// API endpoint: Check admin authentication
app.get('/api/admin/check-auth', (req, res) => {
  res.json({ authenticated: req.session && req.session.adminAuth });
});

// API endpoint: Admin logout
app.post('/api/admin/logout', (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      res.json({ success: true, message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error occurred.' });
  }
});

// API endpoint: Get certificate by ID and phone
app.post('/api/get-certificate', (req, res) => {
  try {
    const { studentId, phone } = req.body;

    // Validation
    if (!studentId || !phone) {
      return res.status(400).json({ success: false, message: 'Student ID and phone number are required' });
    }

    // Check student limit (less than 200)
    const students = loadStudents();
    if (students.length >= 200) {
      return res.status(403).json({ success: false, message: 'System has reached maximum capacity (200 students). Certificate delivery is currently unavailable.' });
    }

    // Find student by ID and phone
    const student = students.find(s => s.id === studentId && s.phone === phone);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found. Please check your ID and phone number.' });
    }

    if (!student.certificateFile) {
      return res.status(404).json({ success: false, message: 'Certificate not available for this student.' });
    }

    const certificatePath = path.join(certificatesDir, student.certificateFile);

    // Check if certificate file exists
    if (!fs.existsSync(certificatePath)) {
      return res.status(404).json({ success: false, message: 'Certificate file not found.' });
    }

    // Send certificate file
    res.download(certificatePath, student.certificateFile, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error occurred.' });
  }
});

// API endpoint: Add/Update student
app.post('/api/students', isAuthenticated, (req, res) => {
  try {
    const { id, name, phone, certificateFile } = req.body;

    if (!id || !name || !phone) {
      return res.status(400).json({ success: false, message: 'ID, name, and phone are required' });
    }

    const students = loadStudents();
    const studentIndex = students.findIndex(s => s.id === id);

    if (studentIndex >= 0) {
      // Update existing student
      students[studentIndex] = { id, name, phone, certificateFile };
    } else {
      // Add new student
      students.push({ id, name, phone, certificateFile });
    }

    saveStudents(students);
    res.json({ success: true, message: 'Student record saved successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error occurred.' });
  }
});

// API endpoint: Get all students (for admin purposes)
app.get('/api/students', isAuthenticated, (req, res) => {
  try {
    const students = loadStudents();
    res.json({ success: true, data: students, total: students.length });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error occurred.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Certificate server running on http://localhost:${PORT}`);
});
