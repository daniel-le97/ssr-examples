

// @ts-ignore
const App = (await import(globalThis.PATH_TO_PAGE))
new App.default({ target:  document.getElementById('root'), hydrate: true })

if (process.env.NODE_ENV !== 'production') {
    const ws = new WebSocket('ws://localhost:8127/ws');
    ws.addEventListener('message', async(data) => {
        const message = data.data
        if (message === 'reload' || message === window.location.pathname) {
            window.location.reload()
        }
    })
    ws.addEventListener('open', () => {
        // Send current pathname to server
        ws.send(window.location.pathname);
    });
}


