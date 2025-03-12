
# Find & Bask - Lost and Found Application

Find & Bask is a comprehensive lost and found application that helps connect people who have lost items with those who have found them.

## Project Overview

This application allows users to:

- Post found items with details and images
- Search for lost items using various criteria
- Claim items they've lost
- Message item finders directly
- Track the status of their claims
- View success stories of items returned to their owners

## Features

- User authentication and profiles
- Item posting with image upload
- Advanced search functionality
- Secure messaging between users
- Claim verification process
- Admin panel for complete management
- Responsive design for all devices

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Query
- **Backend**: Supabase (Authentication, Database, Storage, Edge Functions)
- **Routing**: React Router

## Admin Panel

The application includes a comprehensive admin panel that allows administrators to:

- View dashboard statistics
- Manage users
- Review and moderate items
- Process item claims
- Manage database tables directly
- Configure application settings

### Admin Access

To access the admin panel:
- URL: `/admin/login`
- Username: `admin`
- Password: `FindBask@2023`

## Project Setup

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd find-and-bask
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Deployment

### Deploying to Vercel

1. Create a Vercel account if you don't have one
2. Connect your GitHub repository to Vercel
3. Configure the environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
4. Deploy the application

### Deploying to Netlify

1. Create a Netlify account if you don't have one
2. Connect your GitHub repository to Netlify
3. Set the build command to `npm run build` or `yarn build`
4. Set the publish directory to `dist`
5. Configure the environment variables
6. Deploy the application

## Local Development

1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up environment variables:
   - Create a `.env` file in the project root
   - Add your Supabase URL and key as described above
4. Run `npm run dev` to start the development server
5. Access the app at `http://localhost:5173`

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Database Schema

The application uses Supabase with the following main tables:

- **profiles**: User profile information
- **found_items**: Details of items that have been found
- **item_claims**: Claims made by users for found items
- **item_messages**: Communication between item finders and claimers
- **lost_item_queries**: Records of searches for lost items
- **success_stories**: Documented cases of returned items

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

If you have any questions or feedback, please reach out to the project maintainers.

---

Happy finding and returning lost items!
