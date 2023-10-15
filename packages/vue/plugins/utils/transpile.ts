export const transpileTS = ( code: string, loader: 'ts' | 'js' = 'ts' ) => {
    const transpiler = new Bun.Transpiler( { loader } );
    const content = transpiler.transformSync( code );
    return content;
};


