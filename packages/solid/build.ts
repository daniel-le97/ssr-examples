import { BunPlugin, FileSystemRouter, Target } from "bun";
import { generateTypes, solidPlugin } from "./plugins/solid.ts";
import * as path from 'path';
import { existsSync, rmSync } from "fs";
import { html } from "./plugins/html.ts";
import { postcssAPI } from "./plugins/postcss.ts";
import consola from "consola";
// import { BUILD_DIR} from './lib.ts'

const isProd = process.env.NODE_ENV === 'production';
const PROJECT_ROOT = process.cwd();
const BUILD_DIR = path.resolve( PROJECT_ROOT, "build" );

export const build = async (prod = false) => {
    try {
        
        consola.info('starting build')

        const router = new FileSystemRouter( {
            style: 'nextjs',
            dir: './pages'
        } );
        
        if ( existsSync( BUILD_DIR ) )
        {
            rmSync( BUILD_DIR + '/client', { recursive: true, force: true } );
            rmSync( BUILD_DIR + '/ssr', { recursive: true, force: true } );
        }
        
        
        const clientBuild = await Bun.build( {
            entrypoints: [ PROJECT_ROOT + '/entry/entry-client.tsx', ...Object.values( router.routes ) ],
            splitting: true,
            target: 'browser',
            outdir: `${BUILD_DIR}/client`,
            minify: prod,
            plugins: [ solidPlugin ],
        } );
        
        const serverBuild = await Bun.build( {
            entrypoints: [PROJECT_ROOT + '/entry/entry-server.tsx',...Object.values( router.routes ),],
            splitting: true,
            target: 'bun',
            minify: prod,
            outdir: `${BUILD_DIR}/ssr`,
            plugins: [ solidPlugin ],
        } );
        
        if (isProd || prod) {
            const prodBuild = await Bun.build( {
                'entrypoints': ['./index.ts'],
                'splitting': false,
                target: 'bun',
                minify: false,
                outdir: `${BUILD_DIR}`,
                plugins: [html]
            } );
        }
        
        const declarations = `
        /// <reference lib='dom'/>
        /// <reference lib='dom.iterable'/>\n
        declare module '*.html' {
            const content: string;
            export default content;
        }\n
        declare module '*.svg' {
            const content: string;
            export default content;
        }`
        const cssBuild = await postcssAPI(
            PROJECT_ROOT + '/assets/app.css',
            PROJECT_ROOT + '/assets/output.css' )
            await Bun.write('./build/imports.d.ts', generateTypes)
            await Bun.write('./build/lib.d.ts', declarations)

        consola.success('build finished')
            // await Bun.write('./build/ssr/main.css.js', `export default ${JSON.stringify(generateCSS)}`)
        } catch (error) {
            console.log(error);
            
        }
        };
        // Note: we are invoking this here so it can be imported and ran directly at the beginning of the file
        // or we can call it from package.json
        await build(true);
        
        
        // maybe start a build tool here
        // interface Options {
            //     pagesDir: string,
//     clientEntry: string,
//     serverEntry: string
//     indexHtml: string
//     outDir: string,
//     plugins: BunPlugin[]
// }
// class Banh {
//     /**
//      *
//      */
//    private routes: Record<string,string>
//     constructor(options: Options = {
//         pagesDir: './pages',
//         clientEntry: './entry/entry-client.tsx',
//         serverEntry: './entry/entry-server.tsx',
//         indexHtml: './index.html',
//         outDir: './build',
//         plugins: [solidPlugin]
//     }) {
//         this.routes = new FileSystemRouter({
//             style: 'nextjs',
//             dir: options.pagesDir
//         }).routes


        
        
       
        
//     }
// }
