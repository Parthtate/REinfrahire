# ReinFraHire - Job Portal Platform

A full-stack job portal application built with Next.js 14, TypeScript, TailwindCSS, and Supabase. This platform connects employers with candidates through job postings, application management, and professional profiles.

## Features

**For Employers/Admins**
- Job management with rich text descriptions
- Application tracking and candidate database
- Role-based access control
- Excel data export

**For Candidates**
- Job search and filtering
- Resume upload and applications
- Profile management
- Application status tracking

**Technical**
- Supabase authentication (email/password, OTP)
- React Hook Form + Zod validation
- Radix UI components for accessibility
- Full TypeScript support

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm
- Supabase account ([Sign up here](https://app.supabase.com))

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   Get these values from: Supabase Dashboard → Your Project → Settings → API

3. **Set up database**

   Run these SQL commands in your Supabase SQL Editor:

   ```sql
   -- Users table
   create table users (
     id uuid references auth.users primary key,
     email text unique not null,
     full_name text,
     role text not null default 'candidate',
     created_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now()
   );

   alter table users enable row level security;

   create policy "Users can view their own data"
     on users for select using (auth.uid() = id);

   create policy "Users can update their own data"
     on users for update using (auth.uid() = id);

   -- Jobs table
   create table jobs (
     id uuid default uuid_generate_v4() primary key,
     title text not null,
     description text,
     company_name text,
     location text,
     job_type text,
     salary_range text,
     requirements text[],
     responsibilities text[],
     status text default 'active',
     created_by uuid references users(id),
     created_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now()
   );

   alter table jobs enable row level security;

   create policy "Anyone can view active jobs"
     on jobs for select using (status = 'active');

   create policy "Admins can manage jobs"
     on jobs for all using (
       exists (
         select 1 from users
         where users.id = auth.uid()
         and users.role = 'admin'
       )
     );

   -- Applications table
   create table applications (
     id uuid default uuid_generate_v4() primary key,
     job_id uuid references jobs(id) on delete cascade,
     user_id uuid references users(id) on delete cascade,
     resume_url text,
     cover_letter text,
     status text default 'pending',
     applied_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now(),
     unique(job_id, user_id)
   );

   alter table applications enable row level security;

   create policy "Users can view their own applications"
     on applications for select using (auth.uid() = user_id);

   create policy "Users can create applications"
     on applications for insert with check (auth.uid() = user_id);

   create policy "Admins can view all applications"
     on applications for select using (
       exists (
         select 1 from users
         where users.id = auth.uid()
         and users.role = 'admin'
       )
     );
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Tech Stack

**Core**
- Next.js 14 (App Router)
- React 18
- TypeScript 5

**Styling & UI**
- TailwindCSS 3.4
- Radix UI components
- Lucide React icons

**Backend**
- Supabase (Authentication + PostgreSQL)

**Forms & Validation**
- React Hook Form
- Zod schema validation

**Additional Libraries**
- React Quill (rich text editor)
- DOMPurify (HTML sanitization)
- xlsx (Excel handling)
- date-fns (date utilities)
- Nodemailer (email service)

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── api/               # API routes
│   └── page.tsx           # Homepage
├── components/            # React components
├── contexts/              # Context providers
├── lib/                   # Utilities & Supabase clients
└── types/                 # TypeScript definitions

middleware.ts              # Route protection
```

---

## Route Protection

The application uses Next.js middleware to protect routes:
- `/admin/*` requires authentication and admin role
- Unauthenticated users redirect to `/auth/login`
- Non-admin users redirect to `/dashboard`

---

## Security Notes

**Known Vulnerabilities**
- xlsx library has prototype pollution and ReDoS vulnerabilities (no fix available)
- quill has XSS vulnerability (mitigated with DOMPurify)

**Mitigations**
- DOMPurify sanitizes all rich text output
- Row-level security on Supabase tables
- Middleware protection for admin routes
- Server-side only xlsx usage

Run `npm audit` for detailed security report.

---

## License

ISC License
