# Shortt Legacy Group OPC – website

The website for **Shortt Legacy Group OPC**, an IT consulting and technology solutions company in Arakkonam, Tamil Nadu. Its tagline is *Building a Smarter Tomorrow*.

It is a single-page static site built with plain HTML, CSS and JavaScript. There is no build step and nothing to install, so it can be hosted almost anywhere for free.

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

Open `index.html` in a browser, or run a small local server from this folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

```
index.html              The page: all text and structure
assets/css/styles.css   Colours, fonts and layout (brand colours are at the top)
assets/js/main.js       Mobile menu, scroll effects and the contact form
assets/img/             Logo (colour and white), icons and the social-share image
favicon.ico, site.webmanifest
```

## Editing content

- **Text**: all wording is in `index.html`. Search for the sentence you want to change.
- **Phone, email or address**: these appear in several places in `index.html` (the top bar, hero, call-to-action band, contact section, footer and the structured data near the top). The form also uses them, via `CONTACT_EMAIL` and `WHATSAPP_NUMBER` at the top of `assets/js/main.js`. Change every copy.
- **Colours**: edit the variables at the top of `assets/css/styles.css`, for example `--navy` and `--gold`.
- **Logo**: `assets/img/logo.png` and `assets/img/logo-white.png` were cut out of the banner image. If you have the original logo file (SVG or a high-resolution PNG with a transparent background), save it over these two files to get sharper edges.

## How the contact form works

The site has no server, so the form doesn't store anything. When a visitor clicks:

- **Send by email**, their email app opens with the message already written, addressed to shorttlegacygroup@gmail.com.
- **Send on WhatsApp**, WhatsApp opens with the message ready to send to +91 94427 15232.

If you would rather receive enquiries without the visitor's email app opening, you can connect a form service such as Formspree, Web3Forms or Netlify Forms later.

## Publishing the site

**GitHub Pages (free):**

1. Merge this branch into `main`.
2. In the repository on GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`, and save.
4. After a minute or two the site will be live at `https://<username>.github.io/<repository>/`.

**Netlify or Cloudflare Pages:** connect the repository, or drag this folder into Netlify's deploy page. No build command is needed, and the publish directory is the repository root.

**Custom domain** (for example `shorttlegacygroup.com`): buy the domain, then add it under the host's custom-domain settings (on GitHub Pages: **Settings → Pages → Custom domain**).

## Before going live

- [ ] Read through the service descriptions and the About text. They are a first draft written from the banner, so adjust them to match exactly what you offer.
- [ ] Confirm that +91 94427 15232 is on WhatsApp. If it isn't, remove the "Send on WhatsApp" button from `index.html`.
- [ ] Once the site has its final web address, change `og:image` in `index.html` to the full address, for example `https://shorttlegacygroup.com/assets/img/og-image.jpg`. This makes WhatsApp, Facebook and LinkedIn show the preview image when the link is shared. Add a `<link rel="canonical">` tag and a `"url"` entry in the structured data at the same time.
- [ ] Optional: create a free Google Business Profile for the Arakkonam address so the company appears in Google Maps and local search.

## Credits

- Fonts: [Montserrat](https://fonts.google.com/specimen/Montserrat), [Inter](https://fonts.google.com/specimen/Inter) and [Kaushan Script](https://fonts.google.com/specimen/Kaushan+Script), from Google Fonts under the SIL Open Font License.
- Icons: adapted from [Lucide](https://lucide.dev) (ISC licence). The WhatsApp icon is from [Simple Icons](https://simpleicons.org) (CC0).
