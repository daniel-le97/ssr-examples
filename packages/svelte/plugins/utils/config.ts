// ESM
import { BunPlugin } from "bun";
import { loadConfig, watchConfig } from "c12";
import * as path from 'path'


const cwd = process.cwd()
export const getDir = (dir:string) => path.resolve( cwd, dir );

export type Options = {
    router: {
        directory: string,
        fileExtentensions: string[]
    }
    serverMainEntry?: string,
    clientMainEntry: string
    plugins?: BunPlugin[],
    outDir: string,
    port?: number | string,
    ssr: boolean,
    directories: string[]
}

const defaults: Options = {
    router: { directory: './pages', fileExtentensions: ['.svelte', '.svx', '.vue']},
    outDir: getDir('build'),
    clientMainEntry: getDir('/entry/entry-client.ts'),
    port: parseInt(process.env.PORT ?? "3213"),
    ssr: true,
    directories: ['assets', 'public'].map(dir => getDir(dir))
}

// const c12 = (await loadConfig<Options>({defaults})).config!;

// console.log(c12);

// export default c12

    class Banh implements Options{
        clientMainEntry: string;
        router: { directory: string; fileExtentensions: string[]; };
        serverMainEntry?: string | undefined;
        plugins?: BunPlugin[] | undefined;
        outDir: string;
        port?: string | number | undefined;
        ssr: boolean;
        directories: string[];
        
        constructor(opts: Options){
            this.clientMainEntry = opts.clientMainEntry
            this.router = opts.router
            this.outDir = opts.outDir
            this.ssr = opts.ssr
            this.directories = opts.directories
        }
    }

    const config = new Banh((await loadConfig<Options>({defaults})).config!)

    export default config
