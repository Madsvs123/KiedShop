# KaiedShop

KaiedShop is a bilingual online store for medical equipment, books, and supplies. Shoppers browse the catalog, add items to a cart, apply coupons, and pay with a card or PayPal. Store staff use a separate admin panel to manage products, orders, customers, categories, and coupons.

The shop is available in English and Arabic. Arabic uses a right-to-left layout, and the language can follow the visitor’s country.

Shoppers can filter the catalog by price, brand, and stock, and sort by name. Products they open are kept in the browser as a recently viewed list on the home page and product page.

## Intended users

- **Shoppers** who want to search products, check out, and track orders.
- **Store administrators** who need to keep the catalog, inventory, orders, and promotions up to date.

## Technologies

| Area | Stack |
| --- | --- |
| Storefront and admin | React 18, Vite, React Router, Chakra UI |
| Client data | Redux Toolkit, TanStack Query, Axios |
| Internationalization | i18next (English and Arabic) |
| API | Node.js, Express, JWT, Multer, Nodemailer |
| Database | MongoDB with Mongoose |
| Payments | Stripe and PayPal |
| Real time | Socket.IO (order notifications) |

The customer site is served at `/`. The admin panel is served at `/admin`.

## Setup

You need Node.js and a running MongoDB instance.

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

Set these values in `backend/.env`:

- `PORT` (default `5001`)
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL` (`http://localhost:5173`)
- `STRIPE_SECRET_KEY` if you want card payments
- SMTP settings if you want password-reset email

Load sample categories, products, users, orders, and coupons:

```bash
npm run seed
```

Seeding replaces existing data in the database. Start the API:

```bash
npm run dev
```

The API listens on `http://localhost:5001`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

Stripe and PayPal keys are only required for those payment methods. Start the storefront:

```bash
npm run dev
```

Open `http://localhost:5173`. The admin panel is at `http://localhost:5173/admin`.

### Demo accounts

After seeding:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@medistore.com | admin123 |
| Customer | john@example.com | password123 |

## Scripts

| Location | Command | Purpose |
| --- | --- | --- |
| `backend` | `npm run dev` | API with auto-reload |
| `backend` | `npm start` | API without auto-reload |
| `backend` | `npm run seed` | Replace the database with sample data |
| `frontend` | `npm run dev` | Vite development server |
| `frontend` | `npm run build` | Production frontend build |

## License

KaiedShop is released under the [MIT License](LICENSE).
