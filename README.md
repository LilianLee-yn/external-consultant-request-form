# External Consultant Hire Request — Webpage

A static, Proton-branded form for managers to request hiring an external consultant.

## What's in this folder

- `index.html` — the form
- `styles.css` — Proton-branded styling (Inter font, Proton purple `#6D4AFF`, gradients)
- `script.js` — form validation, conditional fields, and email submission
- `assets/proton-logo.svg` — header logo
- `assets/proton-logomark.svg` — favicon

## How to preview

Just double-click `index.html` to open it in your browser. No server needed.

## How submissions work

When a manager fills in the form and clicks **Submit request**, the page opens their default mail client (Apple Mail, Outlook, Proton Mail web, etc.) with a pre-filled email containing every answer, addressed to the recipients defined in `script.js`.

This is the simplest setup — no backend, no signup, nothing to host. The downside is that submission depends on the user's mail client being configured. If you'd prefer the form to silently POST to an inbox instead, see "Upgrading later" below.

## Updating the recipients

Open `script.js` and edit the top of the file:

```js
const PRIMARY_RECIPIENT_EMAIL = 'lilian.lee@proton.ch';

// TODO: replace with the HR / People team alias once confirmed.
const SECOND_RECIPIENT_EMAIL = '';
```

Once you have the second email, paste it inside the quotes — that's the only change needed. The form will then send to both addresses.

## Upgrading later (optional)

If you want submissions to land in an inbox without relying on the manager's mail client, swap the `submitForm()` function in `script.js` to POST to a service like:

- **Formspree** (`https://formspree.io`) — free tier, emails you submissions
- **Formsubmit** (`https://formsubmit.co`) — free, no signup
- An internal endpoint / Power Automate flow / etc.

The data collection in `collectFormData()` and the field labels in `FIELD_LABELS` already work for that — you just change how `submitForm()` delivers the payload.

## Hosting

If you want a shareable link, drop this folder onto:
- Netlify Drop (drag-and-drop, instant URL)
- GitHub Pages
- Internal company hosting

It's plain HTML/CSS/JS — works anywhere.
