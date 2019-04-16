# Contribute

Thanks for wanting to help improve this documentation :)

## How

The content of this documentation lives in the `/docs` directory in [Vocdoni's `docs` repository](https://github.com/vocdoni/docs)

Any edit on `origin/master` will be reflected on [vocdoni.io/docs](https://vocdoni.io/docs/#/)

## Docsify

We are using [Docsify](https://docsify.js.org/#/).  It is a simple static site generator that parses the markdown files on runtime. This means that there is no need to compile anything.

## Edit

> Before editing!
> Take a look at the documentation [guidelines](/doumentation/guidelines.md).

[Docsify's documentation](https://docsify.js.org/#/more-pages) explains the following with more detail. But for the lazy ones, here is a summary:

### Edit a page

Simple edits can be done on the browser (via Github) by clicking the pencil icon on the top-righ part of each page.

### Create a page

You can simply create a `.md` file anywhere under the `/docs` directory.

A file in `/docs/whitepaper.md` is accessible via [/#/whitepaper](https://vocdoni.io/docs/#/whitepaper).

A file in `/docs/documentation/contribute.md` is accessible via [/#/documentation/contribute.md](https://vocdoni.io/docs/#/documentation/contribute).

### Sidebar menu

The sidebar is also a markdown file located at [`_sidebar.md`](https://github.com/vocdoni/docs/blob/master/docs/_sidebar.md).

It is **not** dynamically generated.

If you add/edit a filename, remember to update `_siderbar.md` as well.

### Directory's page

Files named `README.md` are accessible at its parent directory URL. Think about them like  `index.html`.

So `/docs/directoryName/README.md` it is accesible via `/#/directoryName`

### Make diagrams

[There is support for Mermaid diagrams](/documentation/mermaid.md)

## Preview locally

### Local server

To test locally you can run the http server of you choice at the `/docs` directory.

If you want to [install docsify npm package](https://docsify.js.org/#/quickstart?id=quick-start) globally, there is a [convinent script](https://docsify.js.org/#/quickstart?id=preview-your-site) to run a server with hot-reload. Otherwise there is no need to install docsify.

Alternatively [npm http-server](https://www.npmjs.com/package/http-server) or
Python's [SimpleHTTPServer](https://docs.python.org/2/library/simplehttpserver.html) are convinient options.

### VS Code

If you're using VS Code consider using preview extensions such as [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) and [Mermaid Preview](https://marketplace.visualstudio.com/items?itemName=vstirbu.vscode-mermaid-preview)