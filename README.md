
# Find & Bask - Lost & Found Web Application

Find & Bask is a comprehensive lost and found web application that allows users to report found items, search for lost items, and connect with item owners through a secure messaging system.

## Features

- **User Authentication**: Secure login/signup with email
- **Found Item Reporting**: Upload images and details of found items
- **Lost Item Search**: Search for lost items with filtering options
- **Claims System**: Create and manage claims on found items
- **Messaging System**: Real-time messaging between item finders and owners
- **Admin Panel**: Complete database management and oversight
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Dark Mode Support**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: React Query, Context API
- **Forms**: React Hook Form, Zod validation
- **Routing**: React Router
- **UI Components**: Lucide icons, Framer Motion animations
- **Notifications**: Sonner toast notifications
- **Deployment**: Vercel, Netlify, or custom hosting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun
- Git
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/find-and-bask.git
   cd find-and-bask
   ```

2. Install dependencies:
   ```bash
   npm install
   # or if using bun
   bun install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL migrations from the `supabase/migrations/` folder
   - Set up storage buckets for item images

5. Start the development server:
   ```bash
   npm run dev
   # or if using bun
   bun run dev
   ```

6. The application should now be running at `http://localhost:5173/`

### Supabase Setup

1. Create a new Supabase project
2. Run the migration files in the `supabase/migrations/` directory
3. Set up the required tables:
   - profiles
   - found_items
   - item_claims
   - item_messages
   - lost_item_queries
   - success_stories

4. Enable the Supabase Authentication service (Email/Password)
5. Create storage buckets for images

## Deployment

### Deploying to Vercel

1. Create a Vercel account and connect your GitHub repository
2. Set up the environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
3. Deploy the application

### Deploying to Netlify

1. Create a Netlify account and connect your GitHub repository
2. Set up the environment variables
3. Deploy the application

### Custom Server Deployment

1. Build the application:
   ```bash
   npm run build
   # or if using bun
   bun run build
   ```

2. Deploy the generated `dist` folder to your web server

## Admin Panel

The admin panel provides complete control over the application's data and functionality.

### Admin Login

- URL: `/admin/login`
- Default credentials:
  - Username: `admin`
  - Password: `FindBask@2023`

### Admin Features

- **Dashboard**: View statistics and system health
- **User Management**: View, edit, and manage user accounts
- **Items Management**: Manage found items
- **Claims Management**: Review and respond to item claims
- **Database Management**: Direct access to database tables
- **System Settings**: Configure application settings

### Database Management

The admin panel includes comprehensive database management tools:

1. **View and Edit Data**: Browse, search, and modify records
2. **Add New Records**: Create new entries in any table
3. **Delete Records**: Remove unwanted data
4. **Export Data**: Download table data as CSV
5. **Data Reset Tools**: Clear tables or reset all user data

### Resetting User Data

To reset all user data without affecting the database schema:

1. Log in to the admin panel
2. Navigate to Database Management
3. Click on the "Manage" tab
4. Use the "Reset User Data" button to clear all user-related data

Alternatively, you can use the database function directly:

```sql
SELECT admin_reset_profiles();
```

## Project Structure

```
find-and-bask/
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # UI components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── integrations/   # External integrations
│   ├── lib/            # Utilities and helpers
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin panel pages
│   │   └── ...         # Public pages
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Application entry point
├── supabase/           # Supabase configuration
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
└── ...                 # Configuration files
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact us at support@findandbask.com or open an issue on GitHub.
