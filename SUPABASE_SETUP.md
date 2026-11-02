# Flashcards app – account & cloud setup (Supabase)

This guide connects the Flashcards app to a free Supabase project, so people can create an account, log in on any device and find their uploaded files, decks, quizzes and progress again.

Time needed: about 15 minutes. No coding is required, only copy and paste.

---

## 1. Create a Supabase project

1. Go to **https://supabase.com** and sign up for a free account.
2. Click **New project**.
3. Give it a name (for example `flashcards`), choose a strong database password, and pick a region close to your users (for example *Central EU (Frankfurt)*).
4. Wait about 2 minutes while the project is created.

## 2. Create the storage (copy, paste, run)

1. In your project, open **SQL Editor** → **New query**.
2. Paste everything below and click **Run**. It should say *Success*.

```sql
-- Decks, quizzes and progress: one row per deck, private to each user
create table if not exists public.decks (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id         text not null,
  name       text,
  kind       text default 'vocab',
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.decks enable row level security;

create policy "decks: read own"   on public.decks for select to authenticated using (auth.uid() = user_id);
create policy "decks: insert own" on public.decks for insert to authenticated with check (auth.uid() = user_id);
create policy "decks: update own" on public.decks for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "decks: delete own" on public.decks for delete to authenticated using (auth.uid() = user_id);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists decks_touch on public.decks;
create trigger decks_touch before update on public.decks
  for each row execute function public.touch_updated_at();

-- Uploaded files (Word, PDF, Excel, text): a private bucket, one folder per user
insert into storage.buckets (id, name, public)
values ('flashcard-files', 'flashcard-files', false)
on conflict (id) do nothing;

create policy "files: read own" on storage.objects for select to authenticated
  using (bucket_id = 'flashcard-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "files: upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'flashcard-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "files: update own" on storage.objects for update to authenticated
  using (bucket_id = 'flashcard-files' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'flashcard-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "files: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'flashcard-files' and (storage.foldername(name))[1] = auth.uid()::text);
```

**What this does:** each user can only see, change or delete their **own** decks and files. This is enforced by Supabase on the server (Row Level Security), not by the app.

## 3. Turn on email login

1. Open **Authentication** → **Sign In / Providers** → make sure **Email** is enabled.
2. **Confirm email:**
   - *On* (recommended): new users must click a link in an email before they can log in.
   - *Off*: users are logged in immediately after creating an account. This is handy for testing.
3. Open **Authentication** → **URL Configuration**:
   - **Site URL:** the web address where the app is published, for example `https://<your-github-name>.github.io/<repo-name>/`
   - **Redirect URLs:** add the same address. Also add any test address you use, for example `http://localhost:8000/`.

   The confirmation and password-reset emails send people back to this address.

> **Note:** Supabase's built-in email service only sends a few emails per hour and is meant for testing. For real users, set up your own email sender under **Authentication → Emails → SMTP settings** (for example Brevo, Resend or SendGrid; all have free plans).

## 4. Copy your project keys

Open **Project Settings** → **API** (called **API Keys / Data API** in newer dashboards) and copy:

| What | Looks like |
|---|---|
| **Project URL** | `https://abcdefghijk.supabase.co` |
| **anon public key** (or **publishable key**) | `eyJhbGciOi…` or `sb_publishable_…` |

> ⚠️ **Never** use the **service_role** or **secret** key in the app. It bypasses all security rules. The app refuses it if you paste it in by mistake.

## 5. Connect the app

### For testing (on your own computer)

Open the app, click **👤 Log in** (top right) → **Supabase settings**. Paste the Project URL and the anon/publishable key, then click **Connect**. This is saved only in that browser.

### For publishing (everyone uses your project)

Open `flashcards.html` in a text editor (for example Notepad or VS Code), search for `SUPABASE_URL` near the top of the script, and fill in your values:

```js
var SUPABASE_URL='https://abcdefghijk.supabase.co';
var SUPABASE_ANON_KEY='eyJhbGciOi...';   // anon / publishable key only!
var REQUIRE_LOGIN=false;                 // true = people must log in before using the app
```

The anon/publishable key is designed to be public, so it is safe in a public GitHub repository. Your users' data is protected by the security rules from step 2.

## 6. Publish on GitHub Pages

1. Create a repository on GitHub and upload `flashcards.html`. Rename it to **`index.html`** so it opens at the main address.
2. In the repository, open **Settings** → **Pages** → *Deploy from a branch* → `main` / root → **Save**.
3. After about a minute the app is live at `https://<your-github-name>.github.io/<repo-name>/`.
4. Put that exact address into Supabase **Site URL** and **Redirect URLs** (step 3).

## How it works for users

- **Create account / Log in:** the 👤 button at the top right. "Forgot password?" sends a reset link by email.
- **Saving:** everything a logged-in user uploads or changes is saved to their account automatically: original files, flashcard decks, study-notes quizzes and progress. A ✓ next to their name means all changes are saved. ⟳ means saving is in progress, and ! means the app will retry (for example when offline).
- **Finding files again:** log in on any device, then open **My files** to view, download, rename, delete or study every uploaded file.
- **Files from before logging in:** after logging in, the app offers to add decks that were made without an account on that device to the account.
- **Log out:** the account's copy is removed from that device. Everything stays safe in the account.
- **Without an account:** the app still works as before, but files are saved only in that browser (unless `REQUIRE_LOGIN` is `true`).

## Free plan limits (Supabase, at time of writing)

- 500 MB database and 1 GB file storage. This is plenty for text, Word and PDF study files.
- 50,000 monthly active users.
- Free projects are **paused after about 1 week without any activity**. Restore them with one click in the dashboard, or use the app regularly.

## Privacy reminder

Files uploaded by logged-in users are stored in **your** Supabase project. Do not upload confidential company documents (for example internal reports or study notes about internal processes) unless your company has approved this service.
