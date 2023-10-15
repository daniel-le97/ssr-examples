// import { BunPlugin } from "bun";
// import * as sass from 'sass';
// // import { cssCache } from "./vue.js";

// const cache = new Map<string, string>();




// export const scssPlugin: BunPlugin = {
//     name: 'sass',
//     setup ( build ) {
//         build.onLoad( { filter: /\.(scss|sass)$/ }, ( args ) => {
//             const file = Bun.file(args.path)
//             const text = file.text().then(css => css)
//             const compiled = sass.compile( args.path, { style: 'compressed' } );
//             let content = sass.compileString(cssCache.join().replaceAll(',', ''), {style: 'compressed'})
//             let compiling = `export const mainCss = \`${compiled.css + content.css}\`;\nexport default mainCss;`
//             return {
//                 contents: scssTranspiler(compiling),
//                 loader: 'js'
//             };
//         } );
//     },
// };


// export const scssTranspiler = ( code: string ) => {
//     const transpiler = new Bun.Transpiler();
//     // const imports = transpiler.scan(code)
//     // console.log(imports);
//     const compiled = transpiler.transformSync(code)
//     // console.log(compiled);
    
//     return compiled
    


// };