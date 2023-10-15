import postcss from  'postcss'
import autoprefixer from 'autoprefixer'

import tailwindcss from 'tailwindcss'
// @ts-ignore
import tailwindcssNested from  'tailwindcss/nesting';

import postcss_scss from 'postcss-scss';
import postcss_import from 'postcss-import'




export const postcssAPI = async(path: string, out: string) => {
    const contents = await Bun.file(path).text()
    const results = await postcss([
        postcss_import,
        autoprefixer,
        tailwindcssNested,
        tailwindcss
    ]).process(contents,{
        from: path,
        to: out,
        syntax: postcss_scss
        
    })
    return await Bun.write(out, results.css)
}

