import { BunPlugin, FileSystemRouter, Target } from "bun";
import * as path from 'path';
import { existsSync, rmSync } from "fs";
import {default as logger} from 'consola'
import { html } from "./plugins/html.ts";
import { vue } from "./plugins/vue.ts";
import { compile, compileAsync } from "sass";
import { postcssAPI } from "./plugins/postcss.ts";
import importer from "./plugins/autoImport.ts";


const isProd = process.env.NODE_ENV === 'production';
const PROJECT_ROOT = process.cwd();
const BUILD_DIR = path.resolve( PROJECT_ROOT, ".build" );

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
        }\n
        declare module "*.vue" {
            import { defineComponent }from 'vue';
            export default defineComponent
          }`


export const build = async (prod = false) => {
    try
    {
        logger.info('rebuilding bundle..');

        const router = new FileSystemRouter( {
            style: 'nextjs',
            dir: './pages',
            fileExtensions: ['.svelte', '.svx', '.vue']
        } );

        if ( existsSync( BUILD_DIR ) )
        {
            // clear the necessary directories for our rebuild that follows
            rmSync( BUILD_DIR + '/client', { recursive: true, force: true } );
            rmSync( BUILD_DIR + '/ssr', { recursive: true, force: true } );
        }
        
        // our postcss/tailwind build step
        const cssBuild = await postcssAPI(
            PROJECT_ROOT + '/assets/app.css',
            PROJECT_ROOT + '/assets/output.css' )
        // const path = PROJECT_ROOT + '/assets/scss/main.scss'
        // console.log(path);
        
        // const css = await compileAsync(path)
        // console.log(css.css);
        
            
            // builds the files our client will be fetching
            const clientBuild = await Bun.build( {
                entrypoints: [ import.meta.dir + '/entry/entry-client.ts', ...Object.values( router.routes ) ],
                splitting: true,
                target: 'browser',
                outdir: `${ BUILD_DIR }/client`,
                minify: isProd,
                plugins: [ vue( { target: 'browser'} ) ],
            } );
            
            // builds the files our server will be using
            const serverBuild = await Bun.build( {
                entrypoints: [import.meta.dir + '/entry/index.ts',...Object.values( router.routes ),],
                splitting: true,
                target: 'bun',
                minify: isProd,
                outdir: `${ BUILD_DIR }/ssr`,
                plugins: [ vue( { target: 'bun' } ) ],
            } );

            // console.log({clientBuild, serverBuild});
            

            
            // build these files only once
            if (isProd || prod) {
                const prodBuild = await Bun.build( {
                    'entrypoints': [PROJECT_ROOT + '/index.ts'],
                    'splitting': false,
                    target: 'bun',
                    minify: prod,
                    outdir: `${ BUILD_DIR }`,
                    plugins: [html]
                } );
                await Bun.write(`${BUILD_DIR}/lib.d.ts`, declarations) 
                await Bun.write(`${BUILD_DIR}/imports.d.ts`, await importer.generate())
            }
            
            if (!isProd) {
                const rebuilt = clientBuild.success && serverBuild.success
                const status = (type : 'successfull' | 'unsuccessfull') =>  `rebuild ${type}: ${rebuilt}`
                rebuilt ? logger.success(status('successfull')) : logger.error(status('unsuccessfull'))
                
            }
            return {clientBuild, serverBuild}
            
        } catch (error) {
            logger.error(error)
            // error handling needs to be done here
        }
};
        
        // Note: we are invoking this here so it can be imported and ran directly at the beginning of the file
        // or we can call it from package.json
        ( await build( true ) );
        