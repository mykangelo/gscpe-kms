# Windows Installation Guide

This guide is for team members developing the **GSCPE Knowledge Management System** on Windows 10 or Windows 11. The repository is developed on Linux, so the steps below include the Windows-specific details that differ.

> **TL;DR**
>
> ```powershell
> winget install --id Git.Git -e
> winget install --id CoreyButler.NVMforWindows -e
> # restart the terminal
> nvm install 26.13.0
> nvm use 26.13.0
> corepack enable
> corepack prepare pnpm@12.18.0 --activate
> git clone https://github.com/mykangelo/gscpe-kms.git
> cd gscpe-kms
> pnpm install
> pnpm dev
> ```
>
> Open **http://localhost:3000**.

---

## 1. Recommended terminal

Use one of these:

- **PowerShell 7** (recommended), or
- **Git Bash**, or
- **Windows Terminal** with the PowerShell 7 profile.

Windows PowerShell 5.1 (the old blue console) does **not** support the `&&` operator. If you use it, run commands on separate lines. Install PowerShell 7 with:

```powershell
winget install --id Microsoft.PowerShell -e
```

---

## 2. Install prerequisites

### 2.1 Git for Windows

```powershell
winget install --id Git.Git -e
```

Close and reopen the terminal after installing so `git` is on `PATH`. Verify:

```powershell
git --version
```

### 2.2 Node.js 26.13.0 (via nvm-windows)

The repo pins Node **26.13.0** in `.node-version`. Using `nvm-windows` lets you switch versions per project.

```powershell
winget install --id CoreyButler.NVMforWindows -e
```

Close and reopen the terminal, then:

```powershell
nvm install 26.13.0
nvm use 26.13.0
node -v
```

`node -v` must print `v26.13.0`.

> If `nvm use` fails with an access-denied error, open a terminal **as Administrator** and run `nvm use 26.13.0` once. You can return to a normal terminal afterwards.

### 2.3 pnpm 12.18.0

The repo pins pnpm **12.18.0** through `packageManager`. Enable Corepack (bundled with Node):

```powershell
corepack enable
corepack prepare pnpm@12.18.0 --activate
pnpm -v
```

`pnpm -v` must print `12.18.0`.

If Corepack is blocked by the PowerShell execution policy, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

As a fallback, install pnpm directly:

```powershell
npm install -g pnpm@12.18.0
```

### 2.4 Docker Desktop (only for local Supabase)

Docker is **not** required to run the web UI. It is required for the local Supabase stack (database, auth, storage).

```powershell
winget install --id Docker.DockerDesktop -e
```

After installation:

1. Start **Docker Desktop**.
2. Open **Settings → General** and enable **Use the WSL 2 based engine**.
3. Wait until Docker Desktop reports that the engine is running.

Verify from a terminal:

```powershell
docker --version
```

---

## 3. Clone the repository

Do **not** clone into a OneDrive-synced folder. `node_modules` contains many small files and OneDrive can cause slow installs and file locks.

Recommended location:

```powershell
mkdir $HOME\projects -Force
cd $HOME\projects
git clone https://github.com/mykangelo/gscpe-kms.git
cd gscpe-kms
```

Enable long-path support once (helps some Node tooling on Windows):

```powershell
git config --global core.longpaths true
```

---

## 4. Install dependencies

From the **repository root** (`gscpe-kms`):

```powershell
pnpm install
```

---

## 5. Run the app

### Development

```powershell
pnpm dev
```

Open **http://localhost:3000**.

> Use `localhost`, not `127.0.0.1`, when opening the app in your browser.

### Production build

```powershell
pnpm build
pnpm start
```

`pnpm start` serves the build from step 1 on **http://localhost:3000**.

Press `Ctrl+C` in the terminal to stop either server.

---

## 6. Optional: local Supabase

Start Docker Desktop first, then from the repository root:

```powershell
pnpm exec supabase start
pnpm exec supabase status
```

Local endpoints:

| Service | URL |
|---|---|
| Supabase Studio | http://127.0.0.1:54323 |
| Supabase API | http://127.0.0.1:54321 |
| Postgres | `127.0.0.1:54322` |

Stop the stack when you are done:

```powershell
pnpm exec supabase stop
```

> The database schema and migrations are not committed yet, so the local database starts empty. The web UI does not use Supabase at this stage.

---

## 7. Windows-specific notes

| Topic | What to do |
|---|---|
| **Line endings** | The repo uses a `.gitattributes` file to keep LF endings. Do not convert files to CRLF. |
| **pnpm symlinks / `EPERM`** | Enable **Developer Mode**: Settings → System → For developers → Developer Mode. Then reopen the terminal. |
| **OneDrive** | Keep the repo outside OneDrive-synced folders. |
| **Firewall prompt** | Allow Node.js when Windows Defender Firewall asks. |
| **Port already in use** | Run `cd apps/web; pnpm exec next dev -p 3001` and open http://localhost:3001. |
| **Terminal doesn't see a new command** | Close and reopen the terminal (PATH changes are not picked up by existing shells). |
| **`&&` not recognized** | Use PowerShell 7 or run the commands separately. |
| **Docker errors from Supabase** | Make sure Docker Desktop is running and using the WSL 2 backend. |

---

## 8. Troubleshooting

### `pnpm` is not recognized

```powershell
corepack enable
corepack prepare pnpm@12.18.0 --activate
```

Close and reopen the terminal, then check `pnpm -v`.

### `Command "build" not found` / `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`

This happened before the root workspace scripts were added. Make sure you have the latest `main`:

```powershell
git pull
pnpm install
pnpm build
```

Also confirm you are in the **repository root** (`gscpe-kms`), not inside `apps/web`.

### Wrong Node.js version

```powershell
nvm use 26.13.0
node -v
```

### `next dev` starts but the page is not interactive

- Open `http://localhost:3000`, not `http://127.0.0.1:3000`.
- Hard-refresh the page (`Ctrl+Shift+R`).
- Restart the dev server after changing `next.config.ts`.

### Installation is slow or files are locked

- Move the repo out of OneDrive.
- Temporarily pause real-time antivirus scanning for the project folder.
- Delete `node_modules` and run `pnpm install` again.

### Supabase fails to start

- Start Docker Desktop and wait for the engine.
- Run `docker ps` to confirm Docker is responsive.
- Try `pnpm exec supabase stop --no-backup` and then `pnpm exec supabase start`.

---

## 9. Verification checklist

Run these from the repository root:

```powershell
node -v                 # v26.13.0
pnpm -v                 # 12.18.0
pnpm install            # completes without errors
pnpm lint               # no errors
pnpm typecheck          # no errors
pnpm build              # production build succeeds
pnpm dev                # http://localhost:3000 loads
```

If all of the above pass, your Windows environment matches the Linux setup closely enough to develop the app.

---

## Alternative: use WSL 2 (closest to the Linux setup)

If you want an environment almost identical to the Linux development machine, use WSL 2:

```powershell
wsl --install -d Ubuntu
```

Then, inside the Ubuntu shell:

```bash
sudo apt update && sudo apt install -y git curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# reopen the shell or source ~/.bashrc
nvm install 26.13.0
corepack enable
corepack prepare pnpm@12.18.0 --activate
mkdir -p ~/projects && cd ~/projects
git clone https://github.com/mykangelo/gscpe-kms.git
cd gscpe-kms
pnpm install
pnpm dev
```

Tips:

- Keep the repository inside the WSL filesystem (`~/projects/...`), not under `/mnt/c/...`, for much faster installs.
- Install the **WSL** extension in VS Code and use **Reconnect in WSL**.
- Docker Desktop can expose its engine to WSL 2, so `pnpm exec supabase start` works there too.
