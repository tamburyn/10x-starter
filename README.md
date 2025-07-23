ać# BangProof B2B

## 1. Project Name

BangProof B2B

## 2. Project Description

BangProof B2B is a comprehensive platform designed for B2B commerce integrated with Shopify. The platform enables seamless order processing and product reservations while offering real-time updates on product availability via Shopify and Big Query integrations. It features an automated backend driven by n8n and webhooks, handling tasks such as user registration (with complete company and personal data collection) and automated billing processes including the issuance of proforma and final invoices through integration with wFirma.

## 3. Tech Stack

- **Astro 5**
- **TypeScript 5**
- **React 19**
- **Tailwind CSS 4**
- **Shadcn/ui**
- **Node.js 22.14.0** (as specified in .nvmrc)

## 4. Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd bangproof-b2b
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Ensure you are using Node.js version 22.14.0**:
   If you use nvm, you can run:
   ```bash
   nvm use
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 5. Available Scripts

The following scripts are available in the `package.json`:

- **dev**: Starts the Astro development server
  ```bash
  npm run dev
  ```
- **build**: Builds the project for production
  ```bash
  npm run build
  ```
- **preview**: Previews the production build
  ```bash
  npm run preview
  ```
- **astro**: Runs Astro CLI commands
  ```bash
  npm run astro
  ```
- **lint**: Runs ESLint
  ```bash
  npm run lint
  ```
- **lint:fix**: Runs ESLint with auto-fix
  ```bash
  npm run lint:fix
  ```
- **format**: Formats code using Prettier
  ```bash
  npm run format
  ```

## 6. Project Scope

The project is focused on delivering a robust B2B solution for Shopify stores. Key features include:

- **Real-Time Data Updates**: Integration with Shopify and Big Query ensures that product availability and production capacity data is updated in real time.
- **User Registration and Authentication**: Streamlined registration and login processes that capture comprehensive company and personal data without complex authorization steps.
- **Product Reservation and Purchase**: Enables customers to reserve and purchase products with immediate feedback and confirmation.
- **Automated Billing Processes**: After purchase, the system automatically triggers webhooks to issue a proforma invoice via wFirma, followed by a final invoice after order fulfillment.

## 7. Project Status

Version: 0.0.1

The project is under active development. Future updates will continue to refine features, enhance performance, and improve user experience based on feedback and performance metrics.

## 8. License

This project is licensed under the MIT License.
