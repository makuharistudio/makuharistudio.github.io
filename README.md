# Portfolio and blog site

Grok Build vibe-coded framework-free rewrite of my website using HTML + CSS + TypeScript. Purged React.js from previous version. This is a single static site with hash routing, built to `/dist/`.

I purged React based on my own experience **[moving from React Native to Kotlin](https://makuharistudio.github.io/#/blog/vibe-coding-an-android-app-with-on-device-inference-ai-model)**, and shared similar sentiments with DHH and others **[on 𝕏 about the futility of scaffolding languages](https://x.com/dhh/status/2106866002126414256)** now that AI can handle that low level programming for us.

## Initial setup

1. Install toolbox
   `sudo dnf install toolbox`

2. Create and enter isolated toolbox container
   ```
   toolbox create toolbox-makuharistudio-site
   toolbox enter toolbox-makuharistudio-site
   ```

3. Install dependencies
   `sudo dnf install -y typescript`

4. Clone repository, build then preview site
   ```
   cd ~/GitHub
   git clone https://github.com/makuharistudio/makuharistudio.github.io.git
   cd makuharistudio.github.io
   chmod +x build.sh
   ./build.sh
   python3 -m http.server 8000 --directory dist
   ```
   - Open **[http://localhost:8000](http://localhost:8000)** in your browser

5. Still inside toolbox, generate an SSH key (email is a dummy string, ed25519 is the SSH key type). If done previously, no need to again
   - `ssh-keygen -t ed25519 -C "makuhari_studio@users.noreply.github.com"`
   - Press Enter to save to default location ~/.ssh/id_ed25519
   - Type a passphrase to protect the passkey on disk
   - View the public key `cat ~/.ssh/id_ed25519.pub`
   - Copy the entire contents of that public key to GitHub > Settings > SSH and GPG keys > New SSH key
   - Test it by running `ssh -T git@github.com`. 
     - If it is the first time your computer hs connected to GitHub via SSH, it will prompt:
      `Are you sure you want to continue connecting (yes/no/[fingerprint])?`
       To verify the server's identity.
       Check if the fingerprint received exactly matches one of these official GitHub fingerprints
       SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU ← (Ed25519) — most common now
       SHA256:uNiVztksCsDhcc0u9e8BujQXVUpKZIDTMczCvj3tD2s ← (RSA)
       SHA256:p2QAMXNIC1TJYWeIOttrVc98/R1BUFWu3/LiyKgUfQM ← (ECDSA)
       - If it matches, type yes and press Enter. SSH will add GitHub to your known_hosts file and you won't see this again.
       - It will reply "You've successfully authenticated"

6. Still inside toolbox, configure your identity based on the masking email in GitHub > Settings > Email
   ```
   git config --global user.name "makuharistudio"
   git config --global user.email "48945612+makuharistudio@users.noreply.github.com"
   ```

7. Set up for delta updates
   **Important!** Pushing from Terminal updates all files, whereas GitHub Desktop for Windows only pushes deltas. Use GitHub Actions to push deltas from a Linux OS.
   - Create a workflow file
     `mkdir -p .github/workflows`
   - Create `.github/workflows/deploy.yml`
```
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install TypeScript
        run: sudo apt-get update && sudo apt-get install -y typescript

      - name: Build
        run: |
          chmod +x build.sh
          ./build.sh

      - name: Deploy to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          force_orphan: true   # optional: keeps gh-pages history clean
```
   - Commit and push the source code
     ```
     git add .
     git commit -m "Framework-free site + GitHub Actions deployment"
     git push origin main
     ```

8. Go to your site's repo > Settings > Pages and set Source to "Deploy from  branch"
   - Choose branch `gh-pages` and folder `/ (root)`



## Daily workflow

1. Enter the toolbox and the project
   ```
   toolbox enter toolbox-makuharistudio-site
   cd ~/GitHub/makuharistudio.github.io
   ```

2. Add or edit content
   - Blog posts → `source/markdown/posts/`
   - Projects → `source/markdown/projects/`
   - Readings → `source/markdown/recordings/`
   - Games → `source/games/` (as `.ts` or `.tsx` files with metadata)

3. Build and test locally
   ```
   ./build.sh
   python3 -m http.server 8000 --directory dist
   ```
   - Open **[http://localhost:8000](http://localhost:8000)** in your browser

4. Deploy to GitHub
   ```
   git add .
   git commit -m "Your change description"
   git push origin main
   ```

**Notes**
- Always run `./build.sh` after adding or changing files
- No separate parser step
- The final site in `dist/` has **zero runtime dependencies**
- Host has been cleaned of partial Node.js/npm installations

See `memory-bank.md` for architecture, decisions, and current feature status.



## Migration from React.js site

The previous React.js iteration pushed built files from `dist` onto the `gh-pages` branch, source files to `main` branch, and GitHub Pages was configured to serve from the `gh-pages` branch.

The new site only needs a push to `main`, with a GitHub Actions workflow managing the build and deployment of `dist` folder.

Remove the old toolbox, which includes the React dependencies.
`toolbox rm toolbox-env-react-site`

If SSH Key was previously set up, no need to set it up again as it exists on the host, outside the container.

You do not neet to delete the `gh-pages` branch, as the workflow above will override its contents.

Last updated: 2026-10-10.
