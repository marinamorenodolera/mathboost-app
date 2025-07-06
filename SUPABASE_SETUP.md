# MathBoost Supabase Integration Setup

This guide will help you set up Supabase authentication and data persistence for MathBoost, including the new public leaderboard system.

## Prerequisites

- A Supabase account (free tier works fine)
- Node.js and npm installed
- The MathBoost app already set up

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `mathboost-app`
   - Database Password: Choose a strong password
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - Project URL
   - Anon public key

## Step 3: Update Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Update `lib/supabase.js` to use environment variables:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- `user_profiles` table for storing user data
- `game_sessions` table for tracking game sessions
- **Public leaderboard functionality** with RLS policies
- **Private data access** for detailed user stats
- Row Level Security (RLS) policies
- Necessary indexes and triggers
- `get_leaderboard()` function for ranking users

## Step 5: Configure Authentication

1. In Supabase dashboard, go to Authentication → Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add any additional redirect URLs if needed
4. Under "Email Templates", you can customize the email templates if desired

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your app in the browser
3. You should now see the **public leaderboard** as the first screen
4. Test the authentication flow by clicking "Crear Cuenta" or "Iniciar Sesión"
5. After authentication, test creating profiles and playing games
6. Verify that the leaderboard updates with new user data

## Step 7: Verify Data Persistence

1. In your Supabase dashboard, go to Table Editor
2. Check the `user_profiles` table to see if user data is being saved
3. Check the `game_sessions` table to see if game sessions are being tracked
4. Test the leaderboard by creating multiple user profiles

## New Features: Public Leaderboard & Private Data Access

### Public Leaderboard System
- **Public Access**: Anyone can view the leaderboard without authentication
- **User Rankings**: Shows username, avatar, current level, total problems solved
- **Sorting**: Users ranked by level (highest first), then by problems solved
- **Real-time Updates**: Leaderboard refreshes every 5 minutes
- **Visual Hierarchy**: Top 3 users get special styling and emojis

### Private Data Access
- **Authentication Required**: Only logged-in users can access personal dashboard
- **Detailed Stats**: Weekly evolution, errors, streaks, heatmaps, etc.
- **Profile Management**: Create and switch between multiple profiles
- **Session Tracking**: Individual game sessions stored for analytics

### UI Flow
1. **Public Leaderboard Screen** - Shows all users ranked by level
2. **Login/Auth** - Required to access personal data
3. **Personal Dashboard** - Full stats only for authenticated user

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Make sure you're using the anon key, not the service role key
   - Verify the environment variables are loaded correctly

2. **"Table doesn't exist" error**
   - Make sure you ran the SQL schema in the correct order
   - Check that the table names match exactly

3. **Authentication not working**
   - Verify your site URL is configured correctly in Supabase
   - Check that the redirect URLs are set up properly

4. **RLS policies blocking access**
   - Make sure the user is authenticated before trying to access data
   - Check that the RLS policies are correctly configured

5. **Leaderboard not loading**
   - Verify the `get_leaderboard()` function was created successfully
   - Check that the RLS policy allows public read access to user_profiles

### Debug Mode

To enable debug logging, add this to your component:

```javascript
// Add this near the top of your component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
    });
  }
}, []);
```

## Security Considerations

1. **Never expose your service role key** - only use the anon key in the frontend
2. **RLS is enabled** - users can only access their own detailed data
3. **Public leaderboard** - basic user info is publicly viewable for rankings
4. **Private data protection** - detailed stats require authentication
5. **Environment variables** - keep your `.env.local` file out of version control
6. **Input validation** - the app includes basic validation, but consider adding more

## Production Deployment

1. Update your environment variables with production Supabase credentials
2. Configure your production domain in Supabase Authentication settings
3. Set up proper redirect URLs for your production domain
4. Consider setting up email verification if needed
5. Test the leaderboard functionality in production

## Database Schema Details

### user_profiles Table
- Stores all user profile data including game statistics
- Uses JSONB for complex data like heatmaps and achievements
- Includes timestamps for tracking creation and updates
- **Public read access** for leaderboard functionality

### game_sessions Table
- Tracks individual game sessions for analytics
- Stores session metadata and performance metrics
- Can be used for detailed progress analysis
- **Private access only** - requires authentication

### Row Level Security
- **Public leaderboard**: Basic user info viewable by everyone
- **Private data**: Users can only access their own detailed stats
- All operations (SELECT, INSERT, UPDATE, DELETE) are protected
- Policies are automatically applied based on the authenticated user

### get_leaderboard() Function
- Returns ranked list of all users
- Sorts by level (descending), then by problems solved (descending)
- Includes global ranking calculation
- **Public access** - no authentication required

## Next Steps

After setup, you can:
1. Add email verification
2. Implement password reset functionality
3. Add social authentication (Google, GitHub, etc.)
4. Set up real-time subscriptions for live leaderboard updates
5. Add more detailed analytics and reporting
6. Implement user achievements and badges
7. Add leaderboard filters (by level, time period, etc.) 