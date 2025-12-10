# Deployment Guide: OAuth Backend + Vercel Frontend

## Part 1: Deploy OAuth Backend to Railway

### 1. Sign up for Railway
- Go to https://railway.app/
- Sign up with GitHub (free tier: $5/month credit, no credit card needed)

### 2. Create New Project
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Connect your GitHub account
- Select your repository: `ServiceFlow-Website`
- Railway will auto-detect it's a Python app

### 3. Configure Environment Variables
In Railway dashboard, go to **Variables** tab and add:

```
VITE_SUPABASE_URL=https://gaalciqxfspclhnbvvxd.supabase.co
VITE_SUPABASE_SERVICE_KEY=sb_secret_-SIwlA01Kvf0BohjcVYcuw_TuwKKra0
FRONTEND_URL=https://service-flow-website.vercel.app
REDIRECT_URI=https://YOUR-APP.railway.app/auth/gmail/callback
```

**Important:** After deployment, Railway will give you a URL like `https://your-app.railway.app`. Copy this URL and:
1. Update `REDIRECT_URI` variable to: `https://your-app.railway.app/auth/gmail/callback`
2. Add this same URI to Google Cloud Console (next step)

### 4. Set Root Directory
- In Railway Settings → **Root Directory**: Set to `oauth_backend`
- This tells Railway to run the Flask app from that folder

### 5. Deploy
- Railway will automatically deploy
- Wait for build to complete (~2-3 minutes)
- You'll get a URL like: `https://serviceflow-oauth.railway.app`

---

## Part 2: Update Google Cloud Console

### 1. Add Production Redirect URI
- Go to https://console.cloud.google.com/apis/credentials
- Click your **Web Application** OAuth client
- Under **Authorized redirect URIs**, add:
  ```
  https://YOUR-APP.railway.app/auth/gmail/callback
  ```
  (Replace with your actual Railway URL)
- Click **SAVE**

---

## Part 3: Update Vercel Environment Variables

### 1. Go to Vercel Dashboard
- Open your project: https://vercel.com/matanslasky/service-flow-website
- Go to **Settings** → **Environment Variables**

### 2. Add/Update Variable
Add this variable:
```
VITE_OAUTH_BACKEND_URL=https://YOUR-APP.railway.app
```
(Replace with your actual Railway URL)

### 3. Redeploy
- Go to **Deployments** tab
- Click the 3 dots on latest deployment
- Click **Redeploy**

---

## Part 4: Test Production Setup

1. Go to your Vercel site: https://service-flow-website.vercel.app
2. Login
3. Go to Settings
4. Click "Connect Gmail"
5. Should redirect to Google OAuth
6. After authorization, should redirect back to your Vercel site
7. Check Supabase `gmail_credentials` table - should see your tokens!

---

## Troubleshooting

### Railway deployment fails
- Check logs in Railway dashboard
- Make sure `oauth_backend` is set as root directory
- Verify all environment variables are set

### OAuth redirect mismatch
- Double-check redirect URI in Google Cloud Console exactly matches Railway URL
- Must be HTTPS in production
- Must end with `/auth/gmail/callback`

### CORS errors
- Railway URL should already be allowed (Flask-CORS with `CORS(app)`)
- If issues persist, update `FRONTEND_URL` in Railway variables

### "Module not found" errors
- Make sure `requirements.txt` includes all dependencies
- Railway auto-installs from requirements.txt

---

## Alternative: Deploy to Render

If Railway doesn't work, you can use Render.com (also free):

1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect repository
5. Settings:
   - **Root Directory**: `oauth_backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
6. Add same environment variables
7. Deploy!

---

## Cost Summary

- **Railway**: Free ($5/month credit, no card needed)
- **Vercel**: Free (hobby plan)
- **Supabase**: Free (included in your current plan)
- **Total**: $0/month ✅

---

## Next Steps After Deployment

1. Test with multiple users
2. Monitor Railway logs for errors
3. Set up error alerts (Railway has built-in monitoring)
4. Consider upgrading to paid plans for production scale
