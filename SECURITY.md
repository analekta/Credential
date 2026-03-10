# Security Best Practices

This document provides security recommendations for the Credential application.

## Current Security Implementation

✅ Admin panel password protection
✅ Session-based authentication
✅ HTTP-only cookies (prevents XSS attacks)
✅ Protected API endpoints
✅ 24-hour session expiration

## Immediate Actions (Before Going Live)

### 1. Change the Admin Password

**File:** `config.json`

```json
{
  "adminPassword": "change-this-to-a-strong-password!"
}
```

Use a strong password:
- At least 12 characters
- Mix of uppercase and lowercase letters
- Include numbers and special characters
- Example: `Cert!Loader#2024@Secure`

### 2. Change Session Secret

**File:** `server.js` (line 16)

```javascript
secret: 'credential-secret-key-change-in-production',
```

Change to something random:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then update the `server.js` file with the generated secret.

### 3. Use HTTPS in Production

If deploying to the internet, enable HTTPS:

**In config.json or server.js:**
```javascript
cookie: {
  secure: true,  // Set to true only with HTTPS
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000
}
```

### 4. Restrict Admin URL Access

Consider restricting access to `/admin.html`:

- **Option A:** IP Whitelisting in firewall
- **Option B:** VPN access only
- **Option C:** Authentication proxy (nginx)

## Deployment Checklist

- [ ] Admin password changed (strong password)
- [ ] Session secret changed (random value)
- [ ] HTTPS enabled (if internet-facing)
- [ ] Firewall configured
- [ ] Regular backups of `students.json`
- [ ] Logs monitored for suspicious activity
- [ ] Access restricted to trusted network only

## Future Security Enhancements

### Short Term (Recommended)

#### 1. **Add Rate Limiting** ⭐ HIGH PRIORITY

Rate limiting prevents brute force attacks on the admin login by limiting login attempts.

**Install express-rate-limit:**
```bash
npm install express-rate-limit
```

**Add to server.js:**
```javascript
import rateLimit from 'express-rate-limit';

// Rate limit for login attempts - max 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to login endpoint
app.post('/api/admin/login', loginLimiter, (req, res) => {
  // existing code...
});
```

**Benefits:**
- Protects against brute force password attacks
- Locked out after 5 failed attempts for 15 minutes
- Logged in server console with skip/error counts

#### 2. **Environment Variables** ⭐ ALREADY IMPLEMENTED

You already have this set up! Here's how it works:

**File Structure:**
```
.env              (NOT in Git) - Your actual secrets
.env.example      (In Git)     - Template only
```

**Your `.env` file:**
```env
ADMIN_PASSWORD=analekta@secretary26
SESSION_SECRET=83c4e7a0fd5abebb543b2d9772b3b960d7e92e4f1b8d1f26a0aca79dad78051d
NODE_ENV=development
```

**How server.js uses them:**
```javascript
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.SESSION_SECRET || 'fallback-secret';
```

**Benefits:**
- Passwords not in code
- Easy to change per environment
- .env is in .gitignore (stays private)
- GitHub cloners use .env.example as template

**For Different Environments:**

_Local Development:_
```bash
# .env file (not committed)
ADMIN_PASSWORD=your-dev-password
SESSION_SECRET=dev-secret-123
NODE_ENV=development
```

_Production:_
```bash
# Set directly on server
export ADMIN_PASSWORD="production-strong-password"
export SESSION_SECRET="production-random-secret"
export NODE_ENV=production
npm start
```

_Using dotenv package (Optional):_
```bash
npm install dotenv
```

Then add to top of server.js:
```javascript
import dotenv from 'dotenv';
dotenv.config();
```

#### 3. **Add Logging**
   - Log all admin actions
   - Track login attempts (success/failure)
   - Monitor file downloads

**Example logging addition:**
```javascript
// Add to login endpoint
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const timestamp = new Date().toISOString();
  const { password } = req.body;

  if (password === config.adminPassword) {
    console.log(`[${timestamp}] ✅ Successful admin login`);
    // ...
  } else {
    console.log(`[${timestamp}] ❌ Failed login attempt`);
    // ...
  }
});
```

#### 4. **Password Hashing**
   - Use bcrypt instead of plain text
   - Requires updating both login logic and config storage

**Install bcrypt:**
```bash
npm install bcrypt
```

#### Medium Term

1. **Two-Factor Authentication (2FA)**
   - Add TOTP or SMS verification
   - Extra layer of security

2. **Role-Based Access Control**
   - Different permission levels
   - Audit trail for changes

3. **Database Migration**
   - Replace JSON file with PostgreSQL/MongoDB
   - Better data integrity and security
   - Transaction support

4. **API Keys**
   - For external integrations
   - Separate from admin password

### Long Term

1. **OAuth/SSO Integration**
   - Google, Microsoft, or custom OIDC
   - Professional authentication system

2. **Certificate Request System**
   - Students request certificates (not just ID+phone)
   - Email verification
   - Download link expiration

3. **Encryption at Rest**
   - Encrypt sensitive data in students.json
   - Encrypt PDF certificates on disk

4. **Compliance Features**
   - GDPR data deletion
   - Audit logs retention
   - Data export functionality

## Common Security Mistakes to Avoid

❌ Don't commit `config.json` with passwords to Git
❌ Don't use HTTP in production
❌ Don't share the admin password in plain text
❌ Don't disable `httpOnly` cookies
❌ Don't use generic session secrets
❌ Don't leave default passwords unchanged
❌ Don't store student data insecurely

## Monitoring & Maintenance

1. **Regular Backups**
   - Backup `students.json` daily
   - Store backups securely offline

2. **Log Review**
   - Check server logs for errors
   - Monitor for unauthorized access attempts
   - Review certificate download logs

3. **Updates**
   - Keep Node.js updated
   - Update npm packages regularly
   - Monitor security advisories

4. **Access Control**
   - Limit who knows the admin password
   - Change password if someone leaves
   - Keep access restricted to trusted users

## Support & Reporting

If you discover a security vulnerability:

1. Do not publicly disclose it
2. Document the issue
3. Test in a safe environment
4. Contact the developer with details

Remember: Security is an ongoing process, not a one-time setup!
