import { BunPlugin } from "bun";
import { transpileTS } from "./utils/transpile.ts";


export const html: BunPlugin = {
    name: 'html',
    async setup ( build ) {
        build.onLoad( { filter: /\.html$/ }, async ( args ) => { 
            const fileContents = await Bun.file(args.path).text()
            const contents = `const html = ${JSON.stringify(fileContents)}\nexport default html`
            return {
                'contents': transpileTS(contents),
                loader: 'js'
            }
         } );
    }
};
