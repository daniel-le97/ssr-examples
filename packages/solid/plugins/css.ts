import { BunPlugin } from "bun";

export const postcssPlugin: BunPlugin = {
    name: 'css',
    setup(build) {
         // css loader
        build.onLoad( { filter: /\.css$/ }, async( args ) => {
            const fileContents = await Bun.file(args.path).text()
            const cssCode = `
                let head = document.head;
                let style = document.createElement("style");
                head.appendChild(style);
                style.type = "text/css";
                style.appendChild(document.createTextNode(\`${ fileContents }\`));`;

                return{
                    contents: cssCode,
                    loader: 'js'
                }
        } );
    },
}