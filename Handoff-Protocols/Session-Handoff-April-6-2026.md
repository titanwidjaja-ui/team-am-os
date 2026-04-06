# Session Handoff - April 6, 2026

## Decisions Made This Session

### Design System (Locked April 5-6)
- **Dark theme**: Background #0A0A0F, elevated #111118
- **Refined Gold accent**: #C8A45C (iterated from purple > blue > gold)
- **Typography**: Satoshi (headlines, 700/900) + Inter (body) + Space Grotesk (data/meta)
- **Cards**: rgba(255,255,255,0.03) with 1px solid rgba(255,255,255,0.06)
- **Buttons**: Pill-shaped (border-radius: 100px), gold fill with dark text
- **Icons**: Lucide thin-line, always gold
- **No orbs, no gradients, no purple anywhere**
- **TNF reference** (coachtnf.com) is the structural/layout benchmark

### Pricing (Updated April 5-6)
- AM: $50/month (was $35)
- AM Pro: $100/month
- AM Max: $175/month
- AM Ultra: $400/month

### Branded Step Names (Updated April 6)
1. The Assessment (was "Where You Are Right Now")
2. The Strategy (was "Your Phase and Game Plan")
3. The Engine (was "Your Numbers")
4. The Fuel System (was "Your Nutrition System")
5. The Protocol (was "Your Training Program")
6. The Support Stack (was "Your Supplements and Hydration")
7. The Recovery Check (was "Your Recovery System")
8. The Operating System (was "Your Mindset and Operating Rules")
9. The Daily Engine (was "Your Daily System")
10. The Roadmap (unchanged)

### Font System (Updated April 6)
- Website: Satoshi + Inter + Space Grotesk (dark theme)
- Blueprint template: Satoshi + Inter + Space Grotesk (light theme, kept light by design)

## Current Status of Every Component

### Website (teamamtraining.com)
- **Status**: Dark theme live, pushed to GitHub Pages
- **Repo**: ~/Downloads/team-am-site (github.com/titanwidjaja-ui/team-am-site)
- **DNS**: Resolves to GitHub Pages IPs (185.199.x.x). HTTP works. HTTPS NOT YET WORKING (SSL cert needs provisioning in GitHub Pages settings > Enforce HTTPS)
- **Design**: Dark/gold theme with real blueprint screenshots in phone carousel
- **Files**: index.html, brand-kit.html, gallery.html, CNAME, img/ (6 photos + 3 blueprint screenshots)

### Jotform Intake
- **URL**: https://form.jotform.com/260871732972162
- **Status**: Connected as CTA across website
- **Sole Prop PDF**: ~/Downloads/Team-AM-Sole-Proprietorship-Declaration.pdf (for Jotform business verification)

### Pipeline
- **Google Apps Script**: team-am-pipeline.gs (in repo root and /tmp/)
- **Google Sheet**: 1n3W1MUXlUacN4PYiw71swLD_G_m-PAnCyojMtWKXFIw
- **Prompts tab**: Updated with Stage 2 v2.1 (A3), Stage 3 v2.1 (A4), KB v3 (A6)
- **Engine scripts**: All 3 functional (calc-layer.js, cleanup-text.js, verify-numbers.js)
- **Service account**: team-am-pipeline@team-am-492112.iam.gserviceaccount.com
- **Key file**: ~/Downloads/team-am-492112-979dd7cab56a.json
- **ANTHROPIC_API_KEY**: Not set in shell (stored in GAS PropertiesService)
- **API credit**: Need to verify remaining balance
- **Status**: Pipeline can run end-to-end IF the Anthropic API key is active in GAS

### Stripe
- **Status**: Not yet set up. Need Stripe account connected to pricing tiers.

### Domain
- **teamamtraining.com**: DNS resolves to GitHub Pages. HTTP 200. HTTPS needs SSL cert.
- **CNAME file**: Points to teamamtraining.com

### Blueprint Template
- **File**: ~/Downloads/Jordan-Rivera-Blueprint-10step-LIGHT.html
- **Status**: Near production-ready. Branded step names and new fonts applied.
- **Minor issues**: 1 em dash in HTML comment (line 2417), "optimize" x2 in visible text (lines 2299, 2507)

### Templates (All in /Templates/)
- Welcome-Message.md
- Onboarding-Call-Checklist.md
- Check-In-Response.md
- Graduation-Message.md
- Pipeline-Run-Checklist.md
- Coaching-Brief-Template.md

## What's Left Before Launch

### Critical (Must-Do)
1. **Enable HTTPS**: Go to GitHub Pages settings for team-am-site repo > Check "Enforce HTTPS"
2. **Stripe setup**: Create Stripe account, set up 4 pricing tiers, add payment links to website
3. **Fix blueprint minor issues**: Replace "optimize" (2x) in blueprint template
4. **Verify API credit**: Check Anthropic API balance (~$2.50 expected from $10 grant)
5. **Test pipeline end-to-end**: Run full pipeline with a test client to confirm everything connects

### Important (Should-Do Before First Client)
6. **Coaching brief for first client**: Fill out Coaching-Brief-Template.md
7. **Photo crops**: Alejandro to provide final cropped photos for website
8. **Mobile testing**: Test website on actual iPhone
9. **Testimonials**: Placeholder exists, will fill after first clients

### Nice-to-Have
10. **Grok review**: Inter-AI communication scripts (Track A, parked)
11. **Custom domain email**: team@teamamtraining.com or similar
12. **Analytics**: Add Google Analytics or similar to website

## File Locations

| Item | Path |
|---|---|
| Main repo | ~/Documents/GitHub/team-am-os |
| Website repo | ~/Downloads/team-am-site |
| Blueprint template | ~/Downloads/Jordan-Rivera-Blueprint-10step-LIGHT.html |
| Brand kit | ~/Downloads/team-am-site/brand-kit.html |
| Sole prop PDF | ~/Downloads/Team-AM-Sole-Proprietorship-Declaration.pdf |
| Service account key | ~/Downloads/team-am-492112-979dd7cab56a.json |
| Pipeline script | team-am-pipeline.gs (repo root) |
| Engine scripts | /Engine/calc-layer.js, cleanup-text.js, verify-numbers.js |
| AI prompts | /AI-Prompts/Stage-*.md, Team-AM-Coaching-KB-v3.md |
| Client templates | /Templates/*.md |
