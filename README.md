# Portfolio and blog site

This is the code for **[https://makuharistudio.github.io](https://makuharistudio.github.io)**, designed by me using HTML, CSS, Markdown, and JavaScript with React.js and GitHub Pages. 

It has gone through at least 5 revisions.

The current revision uses vite instead of create-react-app which is no longer supported.

Here's how to create a GitHub Pages React.js site using vite:

## Step 00. Requirements
- Install Node.js (https://nodejs.org/en/download/prebuilt-installer/current)
- Code editor (https://code.visualstudio.com)
- GitHub account (https://github.com)

## Step 01. Create public repository on GitHub and clone it locally
- From the Repository's Settings, find GitHub Pages and publish the site to https://[youraccount].github.io/.

- Link it to an empty folder on your machine as a local copy via GitHub Desktop. 
  e.g. Your repository and empty local folder should be named like this "[youraccount].github.io".

## Step 02. Install and test Vite
- Open that folder's parent folder from VS Code and open a new cmd Terminal window.
- Install Vite
  ```
  npm create vite@latest
  ```
  - Follow the prompts and name your project e.g. "[youraccount].github.io"
  - Select React
  - Select JavaScript
  - change to project directory
- change directory to the project and install Node Package Manager
  ```
  cd [youraccount].github.io
  npm install
  ```
- Close the parent folder from VS Code, then open the project folder from VS Code.
- Open a new cmd Terminal window and test the site.
  ```
  npm run dev
  ```

If you get this error:

```
AppData\Roaming\npm\create-react-app.ps1 cannot be loaded because running 
scripts is disabled on this system. For more information, see about_Execution_Policies at
https:/go.microsoft.com/fwlink/?LinkID=135170.
At line:1 char:1
+ create-react-app makuharistudio.github.io
+ ~~~~~~~~~~~~~~~~
    + CategoryInfo          : SecurityError: (:) [], PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess
```

Try running this from VS Code's PowerShell terminal as an admin:

```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then try again.

## Step 03. Set up page re-routing
- Install router (Reminder: do it from the project folder)
  ```
  npm install react-router-dom@latest
  ```
- Add the following import to App.jsx
  ```
  import { createBrowserRouter, RouterProvider } from 'react-router-dom'
  ```
- Add an array inside App.jsx to define the pages to display for each path you need. For example:
  ```
  const routes = [{ 
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {path: '/', element: <Home />},
      {path: '/about', element: <About />},
      {path: '/articles', element: <Articles />},
      {path: '/articles/:name', element: <Article />}
    ]
  }]

  const router = createBrowserRouter(routes);

  function App() {
    return (
        <RouterProvider router={router} />
    )
  }
  ```

## Step 04. Set up markdown parsing for the blog component
- Install markdown
  ```
  npm install react-markdown@latest
  ```
- Create a script that will parse your markdown files into a JSON file.
  In my case, I named mine src/scripts/parser.js
- Make a reference to that script from package.json so you can easily run it.
  ```
  "scripts": {
    "server": "node src/scripts/main.js"
  },
  ```

## Step 05. Create a React component to parse the JSON file
- For example, src/pages/Article.jsx
  ```
  import { useParams } from 'react-router-dom'
  import articles from '../article-content'

  export default function Article() {
      const { name } = useParams();

      const article = articles.find(a => a.name === name);
    
      return (
        <>
          <h1>{article.name}</h1>
          {article.content.map(p => <p key={p}>{p}</p>)}
        </>
      );
  }
  ```

## Step 06. Install GitHub Pages
- From VS Code's terminal again, install GitHub Pages.
  ```
  npm install gh-pages --save-dev
  ```
- Add your account's homepage, and the build scripts to the package.json file.
  ```
  {
    "homepage": "http://makuharistudio.github.io/"
  },
    "scripts": {
      "predeploy": "npm run build",
      "deploy": "gh-pages -d dist",
    },
  }
  ```

## Step 07. Create markdown files for processing
- Create markdown files e.g. under src\markdown\posts
- Install marked then run the parser to combine them into a single file data\posts.json
  ```
  npm install marked
  npm run parser
  ```

- These are other dependencies I've used for this site:
  ```
  npm install three
  npm install react-router-hash-link
  ```

## Step 08. Build the project for deployment
- Run the GitHub Pages deploy command
  ```
  npm run deploy
  ```
  Wait until the last line of code "Published" appears.

**Note:** Let the process fully complete, otherwise errors may occur requiring rebuilding from scratch.

## Step 09. Deploy the project
- From GitHub, change the GitHub Pages setting to deploy from branch gh-pages.
- From GitHub Desktop, push the changes (the Current branch selected should still be main by default, **do NOT change this**, otherwise you're in for trouble).

**Note:** You will only see the changes applied to source files in GitHub Desktop for the push, not the compiled file changes that will end up deployed to gh-pages branch. This is normal.

**Be extremely careful!** Avoid accidentally switching Current branch from main to gh-pages in GitHub Destop.
If you accidentally do it, you will find 10s of 1000s of non-commited files.
If you get into this bad situation, terminate GitHub pages whilst it is still processing the outstanding non-commits.

Then run the following in Command Prompt to store those outstanding commits.

```
git stash
```

Wait until your prompt becomes available.

```
rd /s /q node_modules
del package-lock.json
npm install
```

Reinstall all the other dependenceies. Then try npm start again to ensure it's working.

**End of Note**

## Step 10. After the first initial push, update GitHub setting
- From the GitHub repository's Settings, change Source branch from main to gh-pages.

**Remember:** From GitHub Desktop, main should still remain selected as the branch for pushes. It is only in your GitHub account that this change is made.

Navigate to [yourlogin].github.io and your page should be available.

## Subsequent changes

Spend time to build out the look and feel of the site.
Once that is finished, all you would need to do moving forward is to follow the simple process of:
- Creating markdown files for blog new posts
- Run the parser to add the blog post to JSON
  ```
  npm run parser
  ```
- Rebuild for gh-pages
  ```
  npm run deploy
  ```
- From GitHub Desktop, push the changes (again, it should be defaulting to the main branch)

**Note:** If you make a change and push it via GitHub Desktop without deploying first, no changes will reflect on the gh-pages branch.
So if you do that accidentally, then adjust some other file, deploy, and push again.

**Note:** If you get an error whilst performing the push, it may be relating to number/size of files being sent.
In which case from GitHub Desktop, try repushing, otherwise click the History tab and undo or reverse the pending commits, and resend in smaller amounts.

## Add site preview image in head tag

Some sites like LinkedIn can display preview images (including gifs) just by providing them your site's URL. 
They retrieve the image information from the head tag of your site. In my case, I defined this from the index.html file.

index.html
```
<head>
  <meta content="1264" property="og:image:width"/>
  <meta content="https://raw.githubusercontent.com/makuharistudio/makuharistudio.github.io/main/src/assets/portfolio/img-2022-12-portfolio-website-react-v3-fast.gif" property="og:image"/>
  <meta content="799" property="og:image:height"/>
  <meta content="https://makuharistudio.github.io/#/" property="og:url"/>
</head>
```

Then from LinkedIn, go to your Featured section > + button > Add a link > and provide your site URL without adding a Preview image. 
The image you embedded in index.html will be rendered upon saving.

## What to do after formatting computer
- Use GitHub Desktp to clone the repository locally.
- Change directory to the repository folder in Visual Studio Code's Command Prompt terminal `npm install`.





# LINUX

1. Install Toolbox
   `sudo dnf install toolbox`

2. Create a dedicated Toolbox Container to isolate the project from the host system
   These are hidden: ~/.local/share/containers/storage/
   The actual files you modify will appear in ~/home/
   ```
   toolbox create toolbox-env-react-site
   toolbox enter toolbox-env-react-site
   ```

3. Clone the repository
   ```
   mkdir -p ~/GitHub
   cd ~/GitHub
   git clone https://github.com/makuharistudio/makuharistudio.github.io.git
   cd makuharistudio.github.io
   ```
   
4. Install Node.js nd npm inside the Toolbox
   ```
   sudo dnf update
   sudo dnf install nodejs npm
   ```
   
5. Install project dependencies
   `npm ci`

6. Preview the site
   - `npm run dev`
   - Check http://localhost:5173 on browser

7. Inside Toolbox, generate an SSH key (email is a dummy string, ed25519 is the SSH key tyoe)
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

8. Inside Toolbox, configure your identity
   ```
   git config --global user.name "makuharistudio"
   git config --global user.email "makuhari_studio@users.noreply.github.com"
   ```
   
9. Configure `package.json` to force it to use SSH
   ```
   "deploy": "gh-pages -d dist -r git@github.com:makuharistudio/makuharistudio.github.io.git"
   ```

10. Make your desired update to the site and stage for deployment
   ```
   npm run parser
   npm run deploy
   ```
       
11. Commit and push source changes
   ```
   git remote set-url origin git@github.com:makuharistudio/makuharistudio.github.io.git
   git remote -v
   git status
   git add .
   git commit -m "Update: your description here"
   git push origin main
   ```

## Workflow after initial setup
```
toolbox enter toolbox-env-react-site
cd ~/GitHub/makuharistudio.github.io
// (make edits inside or outside terminal)
npm run parser
npm run deploy
git add . && git commit -m "..." && git push origin main
exit
```

## Setting up delta updates for main branch

**Important!** Pushing from Terminal updates all files and ignores delta checks, which is unlike Windows GitHub Desktop which only pushes delta changes. To amend this, use GitHub Actions.

1. From within Toolbox, uninstall gh-pages:
   - `npm uninstall gh-pages`
   - Remove or comment out the "deploy" script and "predeploy" in package.json.

2. Create `.github/workflows/deploy.yml` in your project folder and add the code below

```
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build   # Make sure this matches your build script

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. Push that GitHub Action file to main
   ```
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```
4. Go to your site's repo > Settings > Pages and set Source to "GitHub Actions".

5. Make site edits, then push this way to both main and gh-pages.
   ```
   git add .
   git commit -m "Update: your description of the design changes"
   git push origin main
   ```

## Remove entire Toolbox environment
`toolbox rm toolbox-env-react-site`





# CREDITS

* Create a React site with blog article URL path management code **[- LinkedIn Learning course by Shaun Wassell](https://www.linkedin.com/learning/react-creating-and-hosting-a-full-stack-site-24928483/defining-environment-variables)**

* JavaScript code to render blog post data from markdown to "separate" web pages **[- YouTube tutorial by Will Ward](https://www.youtube.com/watch?v=gT1v33oA1gI&list=PLASldBPN_pkBfRXOkBOaeCJYzCnISw5-Z)**

* Background animation is a modified version of "Create the Earth with THREE.js" **[- YouTube tutorial by Robot Bobby](https://www.youtube.com/watch?v=FntV9iEJ0tU)**

* https://avatar.wawasensei.dev





# USEFUL WEB DEVELOPMENT TOOLS

CSS clip-path polygon creation tool by Bennett Feely
 * [BennettFeely.com/clippy](https://bennettfeely.com/clippy)

CSS glowing of div elements taken from this Stackoverflow post
 * [https://stackoverflow.com/questions/34821217/easily-create-an-animated-glow](https://stackoverflow.com/questions/34821217/easily-create-an-animated-glow)

Animated gif creation by recording screen
 * [ScreenToGif.com](https://www.screentogif.com)

Font to SVG path creation tool by Dan Marshall
 * [DanMarshall.github.io/google-font-to-svg-path](https://danmarshall.github.io/google-font-to-svg-path)

Software logos and other art were used from:
 * [Flaticon.com](https://www.flaticon.com/uicons)
 * [Icons8.com](https://icons8.com)
 * [IconsScout.com](https://iconscout.com)
 * [StorySet.com](https://storyset.com/data)
 * [Wikimedia.org](https://upload.wikimedia.org)
 * [WorldVectorLogo.com](https://worldvectorlogo.com)
 * [FreeSVG.org/full-moon](https://freesvg.org/full-moon)

Screen resolution emulator to test website design
 * [Screen Emulator by Elizabeth Mitchell](https://emitche.github.io/screenemulator/index.html#basic)

SVG creation tools:
 * [https://boxy-svg.com](https://boxy-svg.com/app)
 * [https://yqnn.github.io/svg-path-editor](https://yqnn.github.io/svg-path-editor)

Text to PNG:
 * [https://www.coolgenerator.com/png-text-generator](https://www.coolgenerator.com/png-text-generator)
