# Vedikadai Admin Access Guide

## Admin URL

Open the admin portal directly:

```text
http://localhost:5173/admin
```

You can also open the storefront and click the small `admin` link in the footer.

## 5-Layer Security Login

Complete these steps in order. If any step fails, the login resets to Layer 1.

| Layer | Prompt | Correct Value |
| --- | --- | --- |
| 1 | Master Password | `Vedikadai@2024` |
| 2 | 4-digit PIN | `1998` |
| 3 | Where do our fancy crackers come from? | `Sivakasi` |
| 4 | Color sequence | Click `Red`, then `Gold`, then `Green` |
| 5 | Final Passphrase | `Ground Made Mass` |

## After Login

The dashboard has three tabs:

- `Manage Products`: add products, upload product images, set MRP, set selling price, and delete products.
- `View Orders`: see customer name, phone, address, ordered items, total price, and savings.
- `Store Contact`: update the phone number and email shown in the storefront footer.

## Important Note

This app uses browser `localStorage` only. Product data, orders, uploaded images, and store contact details are saved in the current browser on the current device.
