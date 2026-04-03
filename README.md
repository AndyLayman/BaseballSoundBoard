# Baseball SoundBoard

A web-based soundboard and walk-up music manager for baseball teams. Upload sound effects, manage player rosters with walk-up songs, and play audio live during games — all from your phone or laptop.

**Live site:** [andylayman.github.io/BaseballSoundBoard](https://andylayman.github.io/BaseballSoundBoard)

## Features

### Soundboard
- Upload MP3 sound effects via drag-and-drop
- Tap buttons to play sounds instantly
- Edit button labels inline
- Drag to reorder sounds

### Roster Management
- Add players with name and jersey number
- Upload per-player media:
  - **Photo** (auto-compressed for fast loading)
  - **Intro** announcement audio
  - **Walk-up song**
  - **Combined** intro + song audio
- Bench/activate players to control who shows in the lineup
- Drag to reorder the lineup
- Upload progress bars with success/failure indicators

### Playback
- Now-playing bar with play/pause, stop, skip controls
- Track progress with elapsed/total time display
- Fade-out effects on stop
- Queue-based playback for intro + song combos

### UI
- Dark and light mode (Padres-themed color palette)
- Fully responsive — works on phones, tablets, and desktops
- Installable as a PWA on iOS/Android

## Tech Stack

- **Frontend:** Single-file vanilla HTML/CSS/JS
- **Backend:** [Supabase](https://supabase.com) (PostgreSQL database + object storage)
- **Icons:** [Lucide](https://lucide.dev)
- **Production hosting:** GitHub Pages
- **Staging previews:** Netlify (branch deploys)

## Project Structure

```
index.html          # Entire app (HTML, CSS, JS)
netlify.toml        # Netlify staging config
padres-logo.svg     # Team logo
apple-touch-icon.png # iOS home screen icon
.github/workflows/  # GitHub Pages deploy action
```

## Setup

### Supabase

The app requires a Supabase project with:

**Database tables:**

`sounds`
| Column | Type |
|---|---|
| id | text (primary key) |
| file_name | text |
| label | text |
| sort_order | integer |

`players`
| Column | Type |
|---|---|
| id | text (primary key) |
| name | text |
| number | text |
| sort_order | integer |
| active | boolean |
| photo_file | text |
| intro_file | text |
| song_file | text |
| combo_file | text |

**Storage:**
- Create a public bucket named `media`
- Files are stored as `sfx-{id}`, `player-{id}-photo`, `player-{id}-intro`, `player-{id}-song`, `player-{id}-combo`

### Environment Configuration

Supabase credentials are configured in `index.html`:

- **Production** — used by default on the live site
- **Staging** — used on localhost/127.0.0.1 for local development

### Deployment

**Production:** Pushes to `main` auto-deploy to GitHub Pages via GitHub Actions.

**Staging:** All branches auto-deploy to Netlify for preview. Branch preview URLs follow the format:
```
https://<branch-name>--baseballsoundboard.netlify.app
```

## Local Development

1. Clone the repo
2. Open `index.html` in a browser (or use a local server)
3. The app will automatically connect to the staging Supabase instance
