import postcss from  'postcss'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
// @ts-ignore
import tailwindcssNested from  'tailwindcss/nesting';
// @ts-ignore
import postcss_import from 'postcss-import'

// for postcss and tailwind support without needing to use the cli
export const postcssAPI = async(path: string, out: string) => {
    const contents = await Bun.file(path).text()
    const results = await postcss([postcss_import,autoprefixer, tailwindcssNested, tailwindcss]).process(contents, {from: path, to: out})
    await Bun.write(out, results.css)
}