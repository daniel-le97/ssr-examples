import { BunPlugin } from "bun";
import preprocess from 'svelte-preprocess';
import { AutoPreprocessOptions } from "svelte-preprocess/dist/types/index";
import { transpileTS } from "./utils/transpile.ts";
import { MdsvexCompileOptions } from "mdsvex";
import { buildCache, buildServerCache } from "./utils/cache.ts";

type Options = {
    preprocessOptions?: AutoPreprocessOptions;
    /**
     * @default false
     */
    ssr?: boolean;

    svx?: MdsvexCompileOptions

};

export const sveltePlugin = ( options: Options = {
    'ssr': false,
    preprocessOptions: {
        'markupTagName': 'svx',
        
        typescript ( { content } ) {
            const code = transpileTS( content );
            return { code };
        }
    }
} ): BunPlugin => {
    return {
        name: 'svelte loader',
        async setup ( build ) {
            const target = build.config?.target === 'browser' ? 'dom' : 'ssr';
            build.onLoad( { filter: /\.(svelte|svx)$/ }, async ( { path } ) => {
                const cache = target === 'dom' ? buildCache : buildServerCache
                const has = cache.get(path)
                if (has) {
                   return {contents: has, loader: 'js'}
                }
                const svelte = await import( "svelte/compiler" );
                let content = await Bun.file( path ).text();
                if (path.includes('.svx')) {   
                    content = (await (await import('mdsvex')).compile(content, options.svx))?.code ?? ''
                }
                
                const processed = await svelte.preprocess( content, preprocess( options.preprocessOptions )  );
                const compiled = svelte.compile( processed.code, {
                    filename: path,
                    generate: target,
                    hydratable: options.ssr,
                    'css': 'external'
                } );

                cache.set(path, compiled.js.code)
                return { contents: compiled.js.code, loader: 'js' };
            } );
        },
    };
}

