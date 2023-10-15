import { FileSystemRouter } from "bun";

export const srcRouter = new FileSystemRouter( {
    style: 'nextjs',
    dir: './pages'
} );

export const clientRouter = new FileSystemRouter( {
    style: 'nextjs',
    dir: './build/client/pages'
} );
export const serverRouter = new FileSystemRouter( {
    style: 'nextjs',
    dir: './build/ssr/pages'
} );
