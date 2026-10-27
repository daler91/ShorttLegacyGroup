# Shortt Legacy Group OPC – website

The website for **Shortt Legacy Group OPC**, an IT consulting and technology solutions company in Arakkonam, Tamil Nadu. Its tagline is *Building a Smarter Tomorrow*. It is live at **https://shorttlegacygroup.com/**.

It is a single-page static site built with plain HTML, CSS and JavaScript. There is no build step. It is hosted on Cloudflare Workers as static files, and a small script in the same Worker handles the contact form.

## What's on the page

| Section | Contents |
| --- | --- |
| Hero | "Building a Smarter Tomorrow" headline, a short introduction, buttons, and quick links to phone and email |
| Services | IT Recruitment, Data & Analytics, Application Development, IT Consulting, Innovation & Solutions |
| About | Who we are, the proprietor and the company's values |
| How we work | A four-step process: Listen → Plan → Build → Support |
| Contact | Phone, email, address with directions, and a message form |

A floating WhatsApp button sits in the bottom corner of every screen. The colours, logo and service icons follow the company banner: navy and gold, with one accent colour per service.

## Preview it on your computer

For a quick look, open `public/index.html` in a browser, or run:

```bash
python3 -m http.server 8000 --directory public
# then visit http://localhost:8000
```

That serves only the static files, so the contact form shows its "email or WhatsApp us instead" message.

To run the whole site, contact form included, use Cloudflare's dev server:

1. Create a file named `.dev.vars` containing `CONTACT_TO="you@example.com"`.
2. Run `npx wrangler dev`.

Emails aren't really sent in this mode: Wrangler saves each one as a file under `.wrangler/tmp`.

## Files

```
public/                    Everything that gets published
  index.html               The page: all text and structure
  404.html                 "Page not found" page
  _headers                 Security and caching headers
  robots.txt, sitemap.xml  For search engines
  assets/css/styles.css    Colours, fonts and layout (brand colours are at the top)
  assets/js/main.js        Mobile menu, scroll effects and the contact form
  assets/fonts/            Self-hosted fonts and their licence
  assets/img/              Logo (colour and white), icons and the social-share image
  favicon.ico, site.webmanifest
worker/index.js            Handles the contact form (POST /api/contact)
wrangler.jsonc             Cloudflare settings for the Worker
```

Only the `public/` folder is published as the website, so notes or files you keep at the top level of the repository won't appear on it.

## Editing content

- **Text**: all wording is in `public/index.html`. Search for the sentence you want to change.
- **Phone, email or address**: these appear in several places in `public/index.html`:
  - the top bar, hero, call-to-action band, contact section and footer
  - the structured data near the top
  - the floating WhatsApp button at the bottom (`wa.me/919442715232`)

  The form also uses them, via `CONTACT_EMAIL` and `WHATSAPP_NUMBER` at the top of `public/assets/js/main.js`. Change every copy.
- **Colours**: edit the variables at the top of `public/assets/css/styles.css`, for example `--navy` and `--gold`.
- **Logo**: `public/assets/img/logo.png`, `logo-320.png` (a smaller copy for the header) and `logo-white.png` were cut out of the banner image. If you have the original logo file (SVG or a high-resolution PNG with a transparent background), replace all three for sharper edges.
- **The inline script in `index.html`**: the small `<script>` in the page's `<head>` is allowed by its sha256 hash in `public/_headers`. If you change it, recompute the hash and update `_headers`:

  ```bash
  python3 -c "import re,hashlib,base64;s=re.search(r'<script>(.*?)</script>',open('public/index.html',encoding='utf-8').read(),re.S).group(1);print(\"'sha256-\"+base64.b64encode(hashlib.sha256(s.encode()).digest()).decode()+\"'\")"
  ```
- **Security headers**: `public/_headers` limits what the browser may load to this site's own files and Cloudflare Web Analytics. If you later add something from another website (a map, a video, a chat widget), or turn on a Cloudflare feature that adds scripts to the page, allow its address there. Otherwise the browser will block it.

## How the contact form works

1. The visitor fills in the form and clicks **Send message**.
2. The page sends the message to `/api/contact` on the same site, which `worker/index.js` handles.
3. The script checks the message and emails it to the company inbox through Cloudflare Email Routing. Email Routing is free when it sends to a verified address.
4. The email's reply-to is set to the visitor's address, so clicking **Reply** answers them directly.

The Worker also guards against abuse:
- It only accepts messages sent from the site's own pages.
- It silently drops typical bot submissions: ones that fill in a hidden field, or that are sent within two seconds of the page loading.
- It can only deliver to addresses verified in Email Routing, so it can't be used to send email to anyone else.

If the message can't be sent, the form doesn't lose it. It offers to send it with the visitor's own email app or on WhatsApp instead. Without JavaScript, the form opens the visitor's email app. **Send on WhatsApp** opens WhatsApp with the message already written.

The inbox that receives enquiries is kept in a Cloudflare secret (`CONTACT_TO`), not in this public repository.

## Hosting on Cloudflare Workers

The Cloudflare Worker `shorttlegacygroup` is connected to this repository through Workers Builds. `wrangler.jsonc` holds its settings:
- serve the files in `public/` directly
- send requests that don't match a file to `worker/index.js`, which handles the contact form and returns `404.html` for anything else

Every change merged into `main` goes live automatically. Other branches get a preview version, which Cloudflare reports on pull requests.

Previews are built with `wrangler preview` and take their settings from the `previews` block in `wrangler.jsonc`. A preview doesn't see the live `CONTACT_TO` secret, so its contact form shows the email/WhatsApp fallback. That's expected.

The custom domain `shorttlegacygroup.com` is attached under the Worker's **Settings → Domains & Routes**. If `www.shorttlegacygroup.com` is attached too, both work, and the page tells search engines that the main address is `https://shorttlegacygroup.com/`.

## Setting up the contact form (one time)

**1. Turn on Email Routing.** Do this before the first deploy that includes the contact form, because the Worker's email binding needs it.
1. In the Cloudflare dashboard, open `shorttlegacygroup.com`, then **Email → Email Routing**, and follow the steps to enable it. This adds the DNS records it needs.
2. Under **Destination addresses**, add the inbox that should receive enquiries. Cloudflare emails that inbox a link: open it to verify the address.
3. Optional: create a custom address such as `hello@shorttlegacygroup.com` that forwards to the same inbox, so you have a free branded address.

**2. Tell the Worker where to send enquiries.**
1. Open **Workers & Pages → shorttlegacygroup → Settings → Variables and Secrets**.
2. Add a **Secret** named `CONTACT_TO`, set to the inbox you verified in step 1, and save.

**3. Test it.** Send a message from the website. The first email can land in spam; if it does, mark it **Not spam** so later ones arrive in the inbox.

To change where enquiries go later, verify the new address in Email Routing, then update the `CONTACT_TO` secret. If something isn't working, the Worker's **Logs** tab in the Cloudflare dashboard shows each request and any errors.

## Next steps

- [ ] Read through the service descriptions and the About text. They are a first draft written from the banner, so adjust them to match exactly what you offer.
- [ ] Add the site to [Google Search Console](https://search.google.com/search-console) and submit `https://shorttlegacygroup.com/sitemap.xml`.
- [ ] Create a free [Google Business Profile](https://www.google.com/business/) for the Arakkonam address, so the company appears in Google Maps and local search.
- [ ] Optional: turn on Cloudflare Web Analytics for free, cookie-free visitor statistics. The security headers already allow it.

## Credits

- **Fonts**: [Inter](https://rsms.me/inter/), [Montserrat](https://github.com/JulietaUla/Montserrat) and [Kaushan Script](https://fonts.google.com/specimen/Kaushan+Script), under the SIL Open Font License. They are hosted with the site.
  - Inter and Montserrat are trimmed to Latin characters and the weights the site uses.
  - Kaushan Script is used unmodified.
  - See `public/assets/fonts/LICENSE.txt`.
- **Icons**: adapted from [Lucide](https://lucide.dev) (ISC licence). The WhatsApp icon is from [Simple Icons](https://simpleicons.org) (CC0).
