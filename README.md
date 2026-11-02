# Flashcard Anything – installable app

Flashcard Anything makes flashcards and multiple-choice quizzes from word lists, Word, Excel, PDF or text files. This folder is the **installable version (PWA)**. Once it is on the internet, people can install it on a computer, Android phone or iPhone/iPad. It opens in its own window with its own icon, and studying works offline.

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The app itself |
| `manifest.webmanifest` | App details: name, colours, icons and shortcuts |
| `sw.js` | Offline helper. Saves the app on the device so it opens without internet |
| `icons/` | App icons for phones, computers and app stores |
| `SUPABASE_SETUP.md` | Optional: set up accounts and cloud storage |
| `README.md` | This guide |

> The app **must be opened from a web address (https)** to be installable. Opening `index.html` by double-clicking still works as a normal web page, but it cannot be installed that way.

## 1. Put it online with GitHub Pages (free)

1. Sign in at **github.com** and click **New repository**. Give it a name, for example `flashcard-anything`, set it to **Public** and click **Create repository**.
2. On the new repository page, click **uploading an existing file**. Drag in **everything in this folder**, including the `icons` folder, and click **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, then branch **main** and folder **/ (root)**, and click **Save**.
4. After 1–2 minutes your app is live at:
   `https://<your-github-name>.github.io/flashcard-anything/`

**Using accounts (Supabase)?** Open `index.html` in a text editor and fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY`. In Supabase, set **Authentication → URL Configuration → Site URL** (and **Redirect URLs**) to the address above. All steps are in `SUPABASE_SETUP.md`.

## 2. Install the app

| Device | How to install |
|---|---|
| **Windows / Mac – Edge or Chrome** | Open the address. Click **⬇ Install app** at the top of the app, or the install icon (⊕) in the address bar |
| **Android – Chrome** | Open the address → menu **⋮** → **Install app** (or **Add to Home screen**) |
| **iPhone / iPad – Safari** | Open the address → **Share** button → **Add to Home Screen** → **Add** |

After installing, **Flashcard Anything** appears with its own icon in the Start menu, dock or home screen. On computers and Android, right-clicking or long-pressing the icon shows shortcuts: *Study*, *Add flashcards*, *Quiz from study notes*, *My files*.

## 3. Publishing updates

1. Upload the new `index.html` to the repository, replacing the old one.
2. Open `sw.js` and change `const VERSION = 'v1';` to `'v2'` (then `'v3'`, and so on). Upload it as well.
3. Installed apps pick up the new version the next time they are opened with internet (sometimes it takes one extra restart of the app).

## What works offline

| Works offline | Needs internet |
|---|---|
| Opening the app, studying, all quiz modes | Logging in and saving to an account |
| Uploading Word, Excel, text and most PDFs | The extra PDF reader for unusual PDFs (it is saved after the first use) |
| Your decks, quizzes and progress on that device | Using an AI chat to write quizzes |

## Good to know

- **Data on each device:** without an account, cards and files are stored in that browser or app only. Use **My files → Download backup**, or log in, to keep them safe and use them on other devices.
- **iPhone/iPad:** Apple may clear data of web apps that are not used for a few weeks. Logged-in users are not affected, because their files are in their account. "Choose a whole folder" is not available on iPhone/iPad, but uploading files one by one works.

## Optional: app-store versions

When the app is online, **PWABuilder** (https://www.pwabuilder.com) can turn the same address into packages for the Microsoft Store, Google Play and the Apple App Store. Each store needs its own developer account (Google Play and Apple charge a fee) and reviews the app before publishing.
