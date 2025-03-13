
# Find & Bask - Lost and Found Application

Find & Bask is a comprehensive lost and found management application that helps connect people who have lost items with those who have found them. This application simplifies the process of reporting, searching for, and claiming lost items.

## Features

- **User Authentication**: Secure signup and login process
- **Post Found Items**: Easily report and post items you've found
- **Search Lost Items**: Search for lost items using various filters
- **Claim Verification**: Secure process for verifying ownership claims
- **Messaging System**: Built-in chat to facilitate handovers
- **Admin Panel**: Complete database management and oversight
- **Success Stories**: Share and view successful item returns

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: React Context API, React Query
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI, Lucide icons
- **Build Tool**: Vite

## Project Setup Guide

### Prerequisites

- Node.js (v16+)
- npm, yarn, or pnpm
- Supabase account (for backend functionality)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/find-and-bask.git
cd find-and-bask
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Variables**

Create a `.env` file in the root directory and add your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

4. **Start the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Supabase Setup

1. **Create a new Supabase project** from the [Supabase Dashboard](https://supabase.com/dashboard)

2. **Run migrations** to set up the database schema
   - Navigate to the SQL Editor in your Supabase Dashboard
   - Copy and run the SQL migration files from `supabase/migrations/` one by one

3. **Set up storage buckets**
   - Create a `found-item-images` bucket in your Supabase project
   - Enable public access if you want images to be viewable without authentication

4. **Configure authentication providers**
   - Navigate to Authentication > Providers in your Supabase Dashboard
   - Configure Email/Password authentication
   - Optional: Enable additional providers like Google, Facebook, etc.

5. **Update Supabase credentials**
   - Get your Supabase URL and anon key from your project settings
   - Update them in the `.env` file

## Deployment Guide

### Deploying to Vercel

1. **Create a Vercel account** if you don't have one

2. **Install Vercel CLI** (optional)

```bash
npm install -g vercel
```

3. **Deploy your application**

```bash
# Using Vercel CLI
vercel

# Or connect your GitHub repository from the Vercel dashboard
```

4. **Set environment variables in Vercel**
   - Navigate to your project settings in Vercel
   - Add the Supabase URL and anon key as environment variables

### Deploying to Netlify

1. **Create a Netlify account** if you don't have one

2. **Deploy your application**
   - Connect your GitHub repository
   - Select the repository containing your project
   - Configure build settings: 
     - Build command: `npm run build` or `yarn build`
     - Publish directory: `dist`

3. **Set environment variables in Netlify**
   - Navigate to your site settings in Netlify
   - Go to Build & deploy > Environment
   - Add the Supabase URL and anon key as environment variables

## Admin Panel Access

To access the admin panel, navigate to `/admin/login` and use the following credentials:

- **Username**: admin
- **Password**: FindBask@2023

The admin panel provides:

- **Dashboard**: Overview of system statistics
- **Database Management**: View and modify all tables
- **User Management**: Manage user accounts
- **Item Claims**: Review and approve item claims
- **Found Items**: Manage reported found items

## Data Reset Instructions

To reset user data without affecting the database schema:

1. **Access the Admin Panel** (`/admin/login`)
2. **Navigate to Database Management**
3. **Select the "Manage Database" tab**
4. **Use the "Clear All User Data" button**

Alternatively, you can execute these SQL commands in the Supabase SQL Editor:

```sql
-- Truncate user-related tables (preserves structure but removes data)
TRUNCATE TABLE public.item_messages CASCADE;
TRUNCATE TABLE public.item_claims CASCADE;
TRUNCATE TABLE public.found_items CASCADE;
TRUNCATE TABLE public.lost_item_queries CASCADE;
TRUNCATE TABLE public.success_stories CASCADE;
-- Keep the profiles table if you want to preserve user accounts
```

## Troubleshooting

### Common Issues

1. **Storage Bucket Access Issues**
   - Ensure your storage bucket has the correct permissions
   - Check if you've enabled public access for found-item-images

2. **Authentication Problems**
   - Verify your Supabase URL and anon key are correct
   - Check your browser console for auth-related errors

3. **Database Connection Issues**
   - Ensure your IP is allowed in Supabase settings
   - Check if your database is paused (free tier limitation)

4. **Upload Issues**
   - Check file size limits (max 5MB per file)
   - Verify the storage bucket exists

### Support

For additional support, please create an issue in the project repository or contact the project maintainers.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
