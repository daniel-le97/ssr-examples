// @ts-ignore
import { transformAsync, TransformOptions } from '@babel/core';
// @ts-ignore
import ts from '@babel/preset-typescript';
// @ts-ignore
import solid from 'babel-preset-solid';
import type { BunPlugin } from 'bun';
import { UnimportOptions } from "unimport";
// @ts-ignore
// @ts-ignore
import { buildCache, buildServerCache } from './utils/cache.ts';

export let generateTypes: string;


export const solidPlugin: BunPlugin = {
    name: 'solid loader',
    async setup ( build ) {

        const { createUnimport } = await import( "unimport" );
        const { injectImports, generateTypeDeclarations, scanImportsFromDir,} = createUnimport( {
            'presets': [ 'solid-js' ],
            // you can add additional import statements youd like to auto import here
            imports: [ { name: 'Component', from: 'solid-js', 'type': true } ]
        } as UnimportOptions );

        // register the components|utils directory for auto importing
        await scanImportsFromDir( [ './components/**' ], {
            'filePatterns': [ '*.{tsx,jsx,ts,js,mjs,cjs,mts,cts}' ]
        } );

        // we dont want to write here because this plugin gets registered twice
        // assign the output to a global variable and write to disk after build step has finished
        generateTypes = await generateTypeDeclarations();

        // this is the only magic that makes it differ from a browser plugin to a bun plugin
        const target = build.config.target === 'browser' ? 'dom' : 'ssr';

        const babel_opt: TransformOptions = {
            babelrc: false,
            configFile: false,
            root: process.cwd(),
            presets: [
                [ ts, {} ],
                [ solid, { generate: target, hydratable: true } ],
            ],
        };
        // tsx loader
        build.onLoad( { filter: /\.tsx$/ }, async ( { path } ) => {
            const cache = target === 'dom' ? buildCache : buildServerCache
                const has = cache.get(path)
                if (has) {
                   return {contents: has, loader: 'js'}
                }
            let data = await Bun.file( path ).text();
            let res = await transformAsync( data, { ...babel_opt, filename: path } );
            const transformedFileContent = (await injectImports( res.code )).code;
            cache.set(path, transformedFileContent)
            return { contents: transformedFileContent, loader: 'js' };
        } );
    },
};


