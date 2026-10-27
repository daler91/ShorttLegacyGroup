# Shortt Legacy Group OPC – website

The website for **Shortt Legacy Group OPC**, an IT consulting and technology solutions company in Arakkonam, Tamil Nadu. Its tagline is *Building a Smarter Tomorrow*.

It is a single-page static site built with plain HTML, CSS and JavaScript. There is no build step and nothing to install. It is set up to be hosted on [Railway](https://railway.com).

## What's on the page

| Section | Contents |
| --- | --- |
| Hero | "Building a Smarter Tomorrow" headline, a short introduction, buttons, and quick links to phone and email |
| Services | Cloud Solutions, Data & Analytics, Application Development, IT Consulting, Innovation & Solutions |
| About | Who we are, the proprietor and the company's values |
| How we work | A four-step process: Listen → Plan → Build → Support |
| Contact | Phone, email, address with directions, and a message form |

The colours, logo and service icons follow the company banner: navy and gold, with one accent colour per service.

## Preview it on your computer

Open `public/index.html` in a browser, or run a small local server:

```bash
python3 -m http.server 8000 --directory public
# then visit http://localhost:8000
```

## Files

```
public/                    Everything that gets published
  index.html               The page: all text and structure
  404.html                 "Page not found" page
  assets/css/styles.css    Colours, fonts and layout (brand colours are at the top)
  assets/js/main.js        Mobile menu, scroll effects and the contact form
  assets/img/              Logo (colour and white), icons and the social-share image
  favicon.ico, site.webmanifest
railway.json               Railway deploy settings
```

Only the `public/` folder is served, so notes or files you keep at the top level of the repository won't appear on the website.

## Editing content

- **Text**: all wording is in `public/index.html`. Search for the sentence you want to change.
- **Phone, email or address**: these appear in several places in `public/index.html` (the top bar, hero, call-to-action band, contact section, footer and the structured data near the top). The form also uses them, via `CONTACT_EMAIL` and `WHATSAPP_NUMBER` at the top of `public/assets/js/main.js`. Change every copy.
- **Colours**: edit the variables at the top of `public/assets/css/styles.css`, for example `--navy` and `--gold`.
- **Logo**: `public/assets/img/logo.png` and `logo-white.png` were cut out of the banner image. If you have the original logo file (SVG or a high-resolution PNG with a transparent background), save it over these two files to get sharper edges.

## How the contact form works

The site has no server-side code, so the form doesn't store anything. When a visitor clicks:

- **Send by email**, their email app opens with the message already written, addressed to shorttlegacygroup@gmail.com.
- **Send on WhatsApp**, WhatsApp opens with the message ready to send to +91 94427 15232.

If you would rather receive enquiries without the visitor's email app opening, you can connect a form service such as Formspree or Web3Forms later.

## Hosting on Railway

Railway's builder (Railpack) recognises the `public/` folder as a static site and serves it with the Caddy web server, so no build or start command is needed. `railway.json` pins that builder and adds a health check, so each new version only goes live once it responds.

1. Merge the pull request into `main`.
2. In Railway, choose **New Project → Deploy from GitHub repo** and pick this repository. Authorise Railway's GitHub app if it asks.
3. When the first deploy finishes, open the service and go to **Settings → Networking**. Click **Generate Domain** to get a free `…up.railway.app` address.
4. **Custom domain** (for example `shorttlegacygroup.com`): in the same Networking section, add the domain, then create the DNS records Railway shows (usually a CNAME) at your domain registrar. Railway sets up HTTPS automatically.

After that, every change merged into `main` redeploys the site automatically.

Because the site is plain files, the `public/` folder can also be published on any other static host (Netlify, Cloudflare Pages, GitHub Pages and so on).

## Before going live

- [ ] Read through the service descriptions and the About text. They are a first draft written from the banner, so adjust them to match exactly what you offer.
- [ ] Confirm that +91 94427 15232 is on WhatsApp. If it isn't, remove the "Send on WhatsApp" button from `public/index.html`.
- [ ] Once the site has its final address (the Railway domain or your custom domain), change `og:image` in `public/index.html` to the full address, for example `https://shorttlegacygroup.com/assets/img/og-image.jpg`. This makes WhatsApp, Facebook and LinkedIn show the preview image when the link is shared. Add a `<link rel="canonical">` tag and a `"url"` entry in the structured data at the same time.
- [ ] Optional: create a free Google Business Profile for the Arakkonam address so the company appears in Google Maps and local search.

## Credits

- Fonts: [Montserrat](https://fonts.google.com/specimen/Montserrat), [Inter](https://fonts.google.com/specimen/Inter) and [Kaushan Script](https://fonts.google.com/specimen/Kaushan+Script), from Google Fonts under the SIL Open Font License.
- Icons: adapted from [Lucide](https://lucide.dev) (ISC licence). The WhatsApp icon is from [Simple Icons](https://simpleicons.org) (CC0).
