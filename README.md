# Otokai – Cloudflare-Powered Music Streaming Platform

**Otokai** is a modern, Cloudflare-native application built on the HSWLP:Next framework.  
It serves as a **personalized AI-driven music streaming and sharing platform**, designed for scalability and performance without the need for a traditional backend server.

Otokai allows users to **upload, manage, and share music** directly in the browser while leveraging Cloudflare’s global infrastructure for speed and reliability.

---

## ✨ Key Features

- 🔐 **Authentication & Onboarding**  
  Sign-up, login, email verification, and Cloudflare Turnstile captcha

- 🎵 **Music Upload & Playback**  
  Upload audio files to R2 object storage and stream them instantly

- 📂 **Database & Sessions**  
  D1 database with migrations, KV for session handling

- 💳 **Payments & Billing**  
  Stripe integration for credits, subscriptions, or premium features  
  Email notifications via Resend or Brevo

- ☁️ **Cloud-Optimized Deployment**  
  Built entirely on Cloudflare Workers, R2, D1, and KV  
  No external backend required

---

## 🚀 Getting Started (Local Development)

1. **Install dependencies**

   ```bash
   pnpm install

2. **Configure environment variables**
   Copy `.env.example` to `.env` and fill in your values.
   (For local dev, also copy `.dev.vars.example` → `.dev.vars`)

3. **Run migrations and start the dev server**

   ```bash
   pnpm db:migrate:dev
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment to Cloudflare

Deploy in one step:

```bash
pnpm run deploy
```

This will:

* Build the Worker
* Upload static assets (R2)
* Bind secrets, database, KV, and buckets via Wrangler

> ⚠️ Secrets must be configured manually with
> `wrangler secret put` or in the Cloudflare dashboard.

---

## 📂 Project Structure

* `src/constants.ts` → configuration constants
* `src/react-email/` → email templates
* `src/app/globals.css` → global styles
* `src/app/layout.tsx` → metadata & layout
* `wrangler.json` → Worker configuration

Preview email templates locally:

```bash
pnpm email:dev
```

→ [http://localhost:3001](http://localhost:3001)

---

## 🎶 About Otokai

Otokai is more than just a music player — it’s a **community-driven jukebox**:

* Upload and share your own tracks
* Create playlists and favorites
* Discover new music from other users
* Earn or spend credits for premium features

Built on the HSWLP\:Next foundation, Otokai demonstrates how Cloudflare’s edge technology can power modern, interactive SaaS products.

---

## 🛠️ Roadmap

Planned features for Otokai:

* 📱 Mobile-first responsive design
* 🎨 User playlists with artwork and customization
* 👥 Social features (likes, comments, shares)
* 🔍 AI-powered recommendations
* 🛒 Marketplace integration for tracks & samples

**One platform, many possibilities.
Built cleanly, built on Cloudflare.**
