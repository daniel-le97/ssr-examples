# bun-svelte-ssr

This project is a work in progress and may not be fully complete. Please use it at your own discretion.

read:
[getting started](./docs/1.starting.md) as a high level overview of why and how this works under the hood!

# Notes

To install dependencies:

```bash
bun create daniel-le97/bun-svelte-ssr
```

To run:

```bash
bun run dev
```

for deploying: 
```bash
# // all needed files get built to the /build directory
bun run build

bun run start # or bun ./build/index.js
```

A dockerfile is located at ./.dockerfile for ease of deployments



# Caveats and Todos
- using Bun's bundler has been my first time dealing with transpilers/bundlers/caching, if theres alot that i am missing please let me know!
- the dev command has makeshift hmr functionality by only rebuilding the files that have changes, still needs work to exclude some files from registering changes
- mdsvex or .svx extensions mostly work, but we will need to add it as a real svelte preprocess step instead of a compiling step

check out the solid-js version at [bun-solid-ssr](https://github.com/daniel-le97/bun-solid-ssr)

