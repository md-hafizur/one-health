# Frontend Project Task: One-Health Application

## Project Goal
To develop a comprehensive frontend for the "One-Health" application, providing distinct dashboards and functionalities for different user roles (Admin, Collector, User) and managing user interactions through various modals and UI components.

## Key Features

### 1. User Authentication & Authorization
- **Login Page (`app/login/page.tsx`):** Provides a secure interface for existing users to log in and access their respective dashboards.
- **Register Page (`app/register/page.tsx`):** Enables new user registration, collecting essential personal and contact information. The registration form includes the following fields: `name`, `fatherName`, `motherName`, `spouseName`, `email`, `phone`, `presentAddress`, `district`, `upazila`, `serviceCode`, `photo`, and `signature`.
- **Role-Based Access Control:** Implements a system where access to specific dashboards, features, and data is determined by the user's assigned role (Admin, Collector, or User), ensuring data security and appropriate functionality.

### 2. User Dashboards
- **Admin Dashboard (`app/admin/dashboard/page.tsx`):** A comprehensive interface for administrators to manage users, view system-wide statistics, and perform high-level operations. Includes features like user management, system configuration, and data oversight.
- **Collector Dashboard (`app/collector/dashboard/page.tsx`):** Designed for data collectors, providing tools for new user registration, data entry, and tracking collection progress. Focuses on efficient data acquisition and submission.
- **User Dashboard (`app/user/dashboard/page.tsx`):** A personalized portal for individual users to view their health information, access digital health cards, manage personal details, and interact with relevant services.

### 3. Modals & Forms
- **Create Sub-Account Modal (`components/create-sub-account-modal.tsx`):** A modal interface for administrators or authorized users to create new sub-accounts, likely for family members or dependents, linked to a primary account.
- **Enhanced Sub-Account Modal (`components/enhanced-sub-account-modal.tsx`):** An extended version of the sub-account modal, potentially offering more advanced options for managing sub-account details, permissions, or linking existing accounts.
- **Payment Modal (`components/payment-modal.tsx`):** Facilitates secure payment processing for various services, such as health card activation or premium features. Integrates with payment gateways.
- **Register User Modal (`components/register-user-modal.tsx`):** A streamlined modal for quick user registration, possibly used in specific contexts like event sign-ups or by collectors for on-the-spot registrations.

### 4. Data Display & Management
- **Registered Users Table (`components/registered-users-table.tsx`):** A dynamic table component to display a list of all registered users. It will include features like pagination for handling large datasets, sorting capabilities for various columns (e.g., by name, registration date), and filtering options to quickly find specific users.
- **Family Relationship View (`components/family-relationship-view.tsx`):** A component designed to visualize and manage family relationships within the system. This could include displaying a hierarchical view of family members, adding or removing family members, and updating their relationship status.

### 5. Reusable UI Components (`components/ui/`)
- A collection of pre-built and styled UI components for consistency and rapid development, adhering to modern design principles. These components are designed to be highly reusable across the application.
    - `avatar.tsx`: Displays user avatars or profile pictures, often with fallback initials.
    - `badge.tsx`: Small, informative labels used for status, counts, or categories.
    - `button.tsx`: Interactive elements for triggering actions, available in various styles and sizes.
    - `card.tsx`: Flexible container components for grouping related content, often used for displaying information blocks.
    - `dialog.tsx`: Modal dialogs or pop-ups for user interaction, confirmations, or displaying additional content.
    - `input.tsx`: Form input fields for text, numbers, and other data types.
    - `label.tsx`: Accessible labels for form elements.
    - `select.tsx`: Dropdown menus for selecting options from a predefined list.
    - `sonner.tsx`: A component for displaying toast notifications or alerts to the user.
    - `table.tsx`: Structured display of tabular data, supporting rows, columns, and headers.
    - `tabs.tsx`: A navigation component that allows content to be organized into multiple sections, with only one section visible at a time.
    - `textarea.tsx`: Multi-line text input fields for longer user inputs.

## Technologies Used
- **Framework:** Next.js (React): A powerful React framework for building server-rendered React applications with features like routing, API routes, and optimized performance.
- **Styling:** Tailwind CSS, PostCSS: Tailwind CSS is a utility-first CSS framework for rapidly building custom designs. PostCSS is a tool for transforming CSS with JavaScript plugins, used here for processing Tailwind CSS.
- **UI Library:** Shadcn UI (implied by `components/ui` structure): A collection of reusable components built with Radix UI and Tailwind CSS, providing accessible and customizable UI elements.
- **TypeScript:** For type safety (`tsconfig.json`, `.d.ts` files): Ensures type checking throughout the codebase, improving code quality and reducing errors.
- **Linting:** ESLint (`eslint.config.mjs`): A static code analysis tool for identifying problematic patterns found in JavaScript/TypeScript code, ensuring code consistency and quality.

## Directory Structure Overview
- `app/`: This directory contains all the Next.js pages and layouts, organized to reflect the application's routing and user roles. Each subdirectory within `app/` typically represents a route segment.
- `components/`: This folder is dedicated to housing reusable React components. It includes specific components like modals and tables, as well as general UI elements that can be used across different parts of the application.
- `lib/`: Contains utility functions and helper modules, such as `utils.ts`, which provide common functionalities used throughout the frontend.
- `public/`: Stores static assets like images (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) that are served directly by Next.js.
- `.next/`: This directory is generated by Next.js during the build process and contains the build output, cached data, and server-side bundles.
- Configuration files: Includes essential project configuration files such as `next.config.ts` (Next.js configuration), `package.json` (project dependencies and scripts), `tsconfig.json` (TypeScript configuration), `eslint.config.mjs` (ESLint configuration), `postcss.config.mjs` (PostCSS configuration), and `.gitignore` (Git ignore rules).
