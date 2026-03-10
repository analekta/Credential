# Credential - Student Certificate Delivery System

A simple web-based system for students to retrieve and download their certificates by entering their Student ID and phone number.

## Features

- 🎓 Student certificate retrieval using ID and phone number
- 📄 PDF certificate download
- 👨‍💼 Admin panel for managing students and certificates
- 🔒 Phone number verification for security
- 📊 Student limit enforcement (max 200 students for future scalability)
- 📱 Responsive design for mobile and desktop

## Project Structure

```
credential/
├── server.js          # Express backend server
├── package.json       # Node.js dependencies
├── students.json      # Student database (JSON file)
├── certificates/      # Folder for storing PDF certificates
├── public/
│   ├── index.html     # Student certificate download page
│   └── admin.html     # Admin panel for managing students
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd /path/to/credential
npm install
```

### 2. Configure Environment Variables

**For Local Development:**

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and update the values:
```env
ADMIN_PASSWORD=your-strong-password-here
SESSION_SECRET=change-this-to-a-random-value
```

**For Production Deployment:**

Set environment variables directly:
```bash
export ADMIN_PASSWORD="your-strong-password"
export SESSION_SECRET="generated-random-value"
export NODE_ENV="production"
npm start
```

Or use `.env` file (not committed to Git):
```bash
# Create .env with sensitive data (NOT tracked in Git)
echo "ADMIN_PASSWORD=your-strong-password" >> .env
echo "SESSION_SECRET=random-secret" >> .env
echo "NODE_ENV=production" >> .env
npm start
```

### 3. Create Certificates Folder

The certificates folder will be created automatically when you start the server. Place your student certificates here:

```
certificates/
├── STU001_certificate.pdf
├── STU002_certificate.pdf
└── ...
```

### 3. Start the Server

```bash
npm start
```

The application will run on `http://localhost:3000`

## Usage

### For Students: Download Certificate

1. Open `http://localhost:3000` in your browser
2. Enter your Student ID
3. Enter your Phone Number
4. Click "Download Certificate"

### For Admins: Add Students and Certificates

1. Open `http://localhost:3000/admin.html` in your browser
2. Fill in student details (ID, Name, Phone)
3. Select the PDF certificate file
4. Click "Add Student & Upload Certificate"

**Important**: After adding the student record, save the actual PDF file in the `certificates/` folder with the filename format: `{StudentID}_{CertificateName}.pdf`

For example, if you add:
- Student ID: `STU001`
- Certificate file: `certificate.pdf`

The file should be saved as: `certificates/STU001_certificate.pdf`

## Adding Student Records

### Option 1: Using the Admin Panel (Recommended)

1. Visit the admin page
2. Fill in student information
3. The student record is created in `students.json`
4. Manually copy the PDF certificate to the `certificates/` folder with the appropriate filename

### Option 2: Direct JSON Editing

Edit `students.json` directly:

```json
[
  {
    "id": "STU001",
    "name": "John Doe",
    "phone": "+1234567890",
    "certificateFile": "STU001_certificate.pdf"
  },
  {
    "id": "STU002",
    "name": "Jane Smith",
    "phone": "+9876543210",
    "certificateFile": "STU002_certificate.pdf"
  }
]
```

## API Endpoints

### Get Certificate

**POST** `/api/get-certificate`

Request body:
```json
{
  "studentId": "STU001",
  "phone": "+1234567890"
}
```

Response: PDF file download or error message

### Add/Update Student

**POST** `/api/students`

Request body:
```json
{
  "id": "STU001",
  "name": "John Doe",
  "phone": "+1234567890",
  "certificateFile": "STU001_certificate.pdf"
}
```

Response:
```json
{
  "success": true,
  "message": "Student record saved successfully."
}
```

### Get All Students

**GET** `/api/students`

Response:
```json
{
  "success": true,
  "data": [...],
  "total": 150
}
```

## 🔒 Admin Panel Security

The admin panel is now protected with password authentication:

**Default Password:** `admin123`

### Changing the Admin Password

1. Open `config.json`
2. Update the `adminPassword` field with a strong password:

```json
{
  "adminPassword": "your-strong-password-here"
}
```

### Security Features

✅ **Session-Based Authentication** - Secure session management with HTTP-only cookies
✅ **Password Protection** - Admin endpoints require valid password
✅ **Auto Logout** - Sessions expire after 24 hours
✅ **Protected Endpoints** - All admin API endpoints require authentication
✅ **Logout Button** - Easy logout functionality on admin panel

### How Admin Authentication Works

1. Admin visits `/admin.html`
2. Page checks if admin is authenticated
3. If not authenticated, login form appears
4. Admin enters password
5. Server validates password and creates secure session
6. Admin can now access the panel
7. All API calls include session cookie automatically
8. Logout clears the session

## Future Security Enhancements

For production use, consider:

- Use HTTPS (set `secure: true` in session config)
- Change the session secret in `server.js` (line 16)
- Use environment variables for sensitive data
- Add rate limiting for login attempts
- Use bcrypt for password hashing
- Add username + password authentication
- Consider OAuth/SSO integration

## File Upload Limitation

The current version stores certificate filenames in `students.json` but requires manual placement of PDF files in the `certificates/` folder. To automate file uploads, you'll need to:

1. Add a multer middleware to accept file uploads
2. Save files to the certificates folder
3. Update the backend to handle file uploads

## Future Enhancements

- [ ] Automated PDF file upload from admin panel
- [ ] Database support (MongoDB, PostgreSQL)
- [ ] Admin authentication
- [ ] Email notifications
- [ ] Certificate generation from template
- [ ] Bulk import from CSV
- [ ] Student self-registration

## Troubleshooting

### Certificate not found
- Ensure the certificate file exists in the `certificates/` folder
- Check the filename matches the `certificateFile` value in `students.json`
- Use the format: `{StudentID}_{filename}`

### Student not found
- Verify the exact Student ID and phone number (case-sensitive)
- Check the phone number format matches exactly as stored in `students.json`

### Port already in use
```bash
# Use a different port
PORT=3001 npm start
```

Or kill the process using port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

## License

MIT License - Feel free to use and modify this project.
