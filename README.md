# LookupUSA Landing Page

Landing page for the Instant Checkmate USA (People Search / Background Check) CPA offer.

- **Network:** Vault Media (Offer ID 21851460, $65 CPA, USA only)
- **Domain:** lookupusa.online
- **Hosting:** GitHub Pages (static) + Cloudflare DNS
- **Tracking:** Facebook Pixel, CPV Lab Pro, Google Apps Script lead capture

## Project structure

```
lookupusa-landing/
├── index.html        # main landing page
├── styles.css         # all styles
├── script.js          # form handling, tracking, animations
├── privacy.html       # privacy policy
├── terms.html         # terms of service
├── google_apps_script.gs  # paste into Google Apps Script for lead capture
├── _headers           # security headers (Cloudflare)
└── .gitignore
```

## Setup

1. **Google Apps Script (lead capture)**
   - Create a new Google Sheet.
   - Extensions → Apps Script → paste the contents of `google_apps_script.gs`.
   - Deploy → New deployment → Web app → Execute as **Me**, Access **Anyone**.
   - Copy the Web App URL into `GOOGLE_SCRIPT_URL` in `script.js`.

2. **Facebook Pixel**
   - Replace `FB_PIXEL_ID` placeholder in `script.js` with your real Pixel ID.

3. **CPV Lab Pro**
   - Replace `CPV_LAB_POSTBACK_URL` placeholder in `script.js` with your campaign tracking URL.

4. **Vault Media offer parameters**
   - Replace `AFF_CLICK_ID` in `script.js` with your Vault Media click/tracking ID.
   - Replace `SUB_AFF_ID` in `script.js` with your sub-affiliate ID.
   - `aff_sub1`/`aff_sub2`/`aff_sub3` (first name, last name, state) are filled automatically from the form.

5. **Deploy to GitHub Pages**
   - Push this repo to GitHub.
   - Settings → Pages → deploy from `main` branch, root folder.

6. **Cloudflare DNS**
   - Point `lookupusa.online` CNAME to `<username>.github.io`.
   - Enable "Proxied" for security headers / caching.

See the deployment checklist (Phase 6) for full step-by-step instructions.

## Compliance

- All copy is written to comply with Facebook Ads policy (no sensational/forbidden terms).
- FCRA disclaimer included on the landing page footer and legal pages.
- Privacy Policy and Terms of Service linked in the footer of every page.
