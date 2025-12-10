# TradeX - Next Steps for Security Deployment

## ✅ Completed

- [x] Security audit performed
- [x] Critical vulnerabilities fixed
- [x] Upstash Redis credentials added to `.env.local`
- [x] Build test successful

---

## 📋 Remaining Steps

### 1. Test Rate Limiting Locally (5 minutes)

```powershell
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run test script
.\test-rate-limiting.ps1
```

**Expected result:** Attempts 1-5 return 401, attempts 6-7 return 429

---

### 2. Execute Database Migration (5 minutes)

1. Open Supabase Dashboard: https://app.supabase.com/
2. Go to SQL Editor
3. Open file: `security_password_hashing.sql`
4. Copy all content and paste in SQL Editor
5. Click "Run"
6. Verify: Run this query to confirm 0 plaintext passwords remain:
   ```sql
   SELECT COUNT(*) as plaintext_passwords_remaining
   FROM public.users 
   WHERE password IS NOT NULL 
   AND password != ''
   AND NOT (password LIKE '$2a$%' OR password LIKE '$2b$%');
   ```

---

### 3. Deploy to Vercel (10 minutes)

#### A. Add Environment Variables to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables for **Production, Preview, Development**:
   ```
   UPSTASH_REDIS_REST_URL=https://peaceful-gazelle-7430.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AR0GAAImcDFiMWM1ZDNkZThlZGE0ODZhOGE1YjRlYzE5ODBiYzIzYXAxNzQzMA
   ```

#### B. Commit and Push

```bash
git add .
git commit -m "feat: implement critical security fixes

- Add Upstash Redis rate limiting (5 attempts/15min)
- Implement bcrypt password hashing
- Secure cookies (httpOnly, secure, sameSite)
- Add security headers (HSTS, CSP, X-Frame-Options)
- Update dependencies"

git push origin main
```

#### C. Verify Deployment

After deployment completes:

1. **Test security headers:**
   ```bash
   curl -I https://your-app.vercel.app
   ```
   Look for: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`

2. **Test rate limiting in production:**
   - Try logging in with wrong password 6 times
   - Should see "Trop de tentatives" message on attempt 6

---

## 🔍 Post-Deployment Verification

- [ ] Security headers present in production
- [ ] Rate limiting works (test with wrong password)
- [ ] Login works with correct credentials
- [ ] Cookies are secure (check DevTools → Application → Cookies)
- [ ] No console errors
- [ ] Check Vercel logs for any issues
- [ ] Monitor Upstash dashboard for rate limiting activity

---

## 📊 Security Improvements Summary

| Feature | Before | After |
|---------|--------|-------|
| Password Storage | ❌ Plaintext | ✅ Bcrypt (cost 10) |
| Rate Limiting | ❌ None | ✅ 5 attempts/15min |
| Cookie Security | ❌ httpOnly: false | ✅ httpOnly, secure, sameSite |
| Security Headers | ❌ None | ✅ HSTS, CSP, X-Frame-Options |
| Vulnerabilities | ⚠️ 5 (2 critical) | ⚠️ Reduced (transitive deps) |

---

## 🆘 Troubleshooting

**Issue:** Rate limiting not working locally
- **Fix:** Ensure dev server restarted after adding `.env.local`

**Issue:** Login fails after database migration
- **Fix:** Normal - passwords are now hashed. Reset password in Supabase Dashboard

**Issue:** Build warnings about Upstash env vars
- **Fix:** Expected - env vars loaded at runtime for API routes, not at build time

**Issue:** CSP violations in console
- **Fix:** Check which resource is blocked, add domain to `next.config.ts` CSP

---

## 📞 Support Resources

- Upstash Dashboard: https://console.upstash.com/
- Supabase Dashboard: https://app.supabase.com/
- Vercel Dashboard: https://vercel.com/
- Security Setup Guide: `SECURITY_SETUP.md`
