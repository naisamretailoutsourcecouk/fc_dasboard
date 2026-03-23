# Amazon FC Stock Sentinel

A lightweight static dashboard for Amazon fulfilment center stock monitoring.

## Features

- Upload FC master, inventory, 6-month, 30-day, and 7-day order reports in CSV or JSON.
- Compute product-wise state demand share from the 6-month order report.
- Calculate FC-wise DRR using the 7-day report with 30-day fallback.
- Flag alerts when stock cover drops below 14 days.
- Prepare reusable WhatsApp, email, and Google Chat alert summaries.

## Run locally

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/index.html`.

## Host on GitLab Pages

This project is a static site, so it can be hosted directly on GitLab Pages.

### What is included

- `.gitlab-ci.yml` copies `index.html`, `styles.css`, `app.js`, and `README.md` into the `public/` folder.
- The Pages job runs only on the default branch.

### Deployment steps

1. Push this repository to GitLab.
2. Keep `index.html`, `styles.css`, and `app.js` in the repository root.
3. Merge or push the branch to your GitLab default branch.
4. Wait for the `pages` pipeline job to finish.
5. Open the published GitLab Pages URL for your project.

## Suggested columns

- FC master: `fc_code`, `fc_name`, `state`, `city`
- Inventory: `fc_code`, `sku`, `product_name`, `units`
- Orders: `order_date`, `fc_code`, `sku`, `product_name`, `state`, `city`, `units`
