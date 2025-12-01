# Trade X Setup Instructions

This guide covers the necessary steps to set up the Supabase backend and environment variables for Trade X.

## 1. Environment Variables

Create a `.env` file in the root directory of your project. You can copy `.env.example` if it exists.

Add the following keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_KEY=your_google_gemini_api_key
```

*   **Supabase Keys**: Found in your Supabase Dashboard under Project Settings > API.
*   **Gemini API Key**: Get yours from [Google AI Studio](https://aistudio.google.com/).

## 2. Supabase Database Setup

To make the app functional (Auth, Profiles, Tokens, History), you must set up the database schema.

1.  Go to your **Supabase Dashboard**.
2.  Navigate to the **SQL Editor** (icon on the left sidebar).
3.  Click **New Query**.
4.  Open the file `supabase_schema.sql` located in the root of this project.
5.  Copy the **entire content** of `supabase_schema.sql`.
6.  Paste it into the SQL Editor in Supabase.
7.  Click **Run**.

> **Note:** If you see an error about the `payment_proofs` bucket already existing, you can ignore it.

### Storage Setup
The SQL script attempts to create a public storage bucket named `payment_proofs`.
1.  Go to **Storage** in the Supabase Dashboard.
2.  Verify that a bucket named `payment_proofs` exists.
3.  If not, create a new **Public** bucket named `payment_proofs`.
4.  (Optional) Add a policy to allow authenticated users to upload files. The SQL script does not strictly enforce storage RLS for uploads, relying on the client, but for production, ensure you add a policy:
    *   SELECT: Enable for "All" (Public).
    *   INSERT: Enable for "Authenticated" users.

## 3. Edge Functions Deployment

Trade X uses Supabase Edge Functions for secure backend logic (admin approvals, token logic).

1.  Ensure you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and logged in.
2.  Run the following command to deploy the functions:

```bash
supabase functions deploy approve-withdrawal --no-verify-jwt
supabase functions deploy get-pending-purchases --no-verify-jwt
supabase functions deploy get-pending-referral-withdrawals --no-verify-jwt
supabase functions deploy get-pending-withdrawals --no-verify-jwt
supabase functions deploy handle-purchase-approval --no-verify-jwt
supabase functions deploy reject-purchase --no-verify-jwt
supabase functions deploy reject-withdrawal --no-verify-jwt
supabase functions deploy update-referral-withdrawal --no-verify-jwt
supabase functions deploy use-token --no-verify-jwt
```

*Note: The `--no-verify-jwt` flag is used here if you are calling functions from the client using `supabase.functions.invoke` which handles auth headers automatically, but standard CLI deployment might require it depending on your local config.*

## 4. Set Admin User

To access the Admin Dashboard (`/admin` route), you must set the `is_admin` flag for your user.

1.  Sign up in the app.
2.  Go to Supabase Dashboard > **Table Editor** > `profiles` table.
3.  Find your user row.
4.  Change the `is_admin` column to `TRUE`.
5.  Click **Save**.

You can now access the Admin Dashboard in the app.

## 5. Deployment to Netlify

To deploy this application to Netlify:

1.  **Push to Git:** Ensure your project is pushed to a GitHub, GitLab, or Bitbucket repository.
2.  **Create Site:** Log in to Netlify, click "Add new site," and select "Import an existing project".
3.  **Connect Repo:** Select your Git repository.
4.  **Build Settings:**
    *   **Build Command:** `npm run build`
    *   **Publish Directory:** `dist`
5.  **Environment Variables:** Click "Show advanced" or go to Site Settings > Environment Variables after creation. Add the exact keys and values from your local `.env` file:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `VITE_API_KEY`
6.  **Deploy:** Click "Deploy Site".

**Note:** A `public/_redirects` file has been added to the project to ensure routing works correctly (preventing 404 errors on page refresh).