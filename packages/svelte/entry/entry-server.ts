// import { renderToString } from 'solid-js/web'


export async function render(path:string) {
    const App = (await import(path))
    const html = App.default.render()
  return { html }
}
