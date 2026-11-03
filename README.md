# Elvora

Elvora is an online fashion store with a customer storefront and an admin panel. It offers thoughtfully selected styles for everyday living, presented in a warm, minimal design.

The frontend is built with Next.js and runs on its own. The backend is not connected yet, so pages currently use sample data.

## Features

### Storefront
- **Landing page** with an announcement bar, hero carousel and featured sections
- **Product listing** with category and filter sidebar
- **Wishlist** where shoppers can save items, pick a size and move items to the bag
- **Cart and checkout** with quantity controls, order summary and Indian rupee formatting
- **Profile** with account details, orders and saved information
- **Search** from the header, which opens the product page with the query

### Accounts
- Customer login and registration
- Forgot password
- Separate admin login

### Admin panel
- Dashboard
- Orders
- Products
- Categories
- Users

## Pages

| Route | Description |
| --- | --- |
| `/landing` | Store home (also opened by `/`) |
| `/product_page` | Product listing |
| `/paticular_product_page` | Product details (placeholder) |
| `/wish_list` | Wishlist |
| `/checkout` | Cart and checkout (`/cart` redirects here) |
| `/profile` | Customer account |
| `/user_login` | Customer login |
| `/user_register` | Customer registration |
| `/forgot-password` | Password reset request |
| `/admin_login` | Admin login |
| `/admin_dashboard` | Admin dashboard |
| `/Admin_Order` | Manage orders (placeholder) |
| `/Admin_Product` | Manage products (placeholder) |
| `/Admin_Category` | Manage categories |
| `/Admin_Users` | Manage users (placeholder) |

## Layouts

Pages share layouts so navigation stays consistent:

- **Storefront pages** share one layout with the announcement bar, header and footer.
- **Admin pages** share one layout with the admin sidebar.
- **Login and registration pages** are shown on their own, with no header or sidebar.

## Tech Stack

- [Next.js](https://nextjs.org/) with the App Router
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- Google Fonts: Kulim Park and Krona One

## Current Status

- The frontend is complete enough to browse every page and move between them.
- Login, registration and password reset do not check credentials yet. They only move the user to the next page.
- Products, wishlist and cart items are sample data held in the page.
- Product details and the admin Orders, Products and Users pages are placeholders.
- The category links in the header and footer all open the product listing, because filtering is not built yet.

## Roadmap

- Connect the frontend to the backend API
- Real authentication for customers and admins
- Product detail page
- Working category filtering and search results
- Admin tools for managing orders, products, categories and users
- Saving the cart and wishlist per account
