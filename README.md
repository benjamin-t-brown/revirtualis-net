Main website for [revirtualis.net](https://revirtualis.net).

Requires node >= 22.

Install deps with 'npm install'.

Build dist folder with 'npm run build:vanilla'.

This is a static site generator.  The resulting dist folder will contain a contained website with all required html, images, fonts, styles, and images.

The only external dependency is [https://highlightjs.org/](https://highlightjs.org/) which is used to highlight code snippets.  The site still works without it, but it will look like "pre" fields with no highlighting.

Deployment:

ssh admin@3.84.126.152
cd revirtualis-net
git pull

# if necessary
cd dist
forever start --uid "revirtualis-net" --minUptime 1000 --spinSleepTime 1000 --append -c "http-server -p 5273 -g -i true -d false" ./
