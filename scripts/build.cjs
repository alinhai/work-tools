const fs = require('fs');
const path = process.cwd();

const toPromise = (fn, ...args) => new Promise((resolve, reject) => {
    fn(...args, (err, data) => {
        if (err) {
            reject(err)
        } else {
            resolve(data)
        }
    })
})

const run = async () => {
    const options = { encoding: 'utf8' };
    const dirname = `${path}/dist/assets`;
    const files = await toPromise(fs.readdir, dirname);
    const assets = files[0].includes('.js') ? files : [files[1], files[0]];
    const data = await Promise.all(assets.sort().map((name) => toPromise(fs.readFile, `${dirname}/${name}`, options)));
   
    const htmlPath = `${path}/dist/index.html`;
    const html = await toPromise(fs.readFile, htmlPath, options);
    const inlineHtml = html
        .replace(/<script(.*\n?){1,3}/g, `<style>${data[1]}</style></head>`)
        .replace(/<\/body>/g, '') + `<script>${data[0]}</script></body>`;
    
    await toPromise(fs.writeFile, `${path}/workTools.html`, inlineHtml, options);
    await toPromise(fs.rmdir, `${path}/dist`, { recursive: true, force: true });
};

run();