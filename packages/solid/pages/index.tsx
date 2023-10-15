import { createSignal } from 'solid-js';
import solidLogo from '../assets/logo.svg';

function App () {
  const [ count, setCount ] = createSignal( 0 );
          return (
            <div class="App">
              {/* <div>one</div> */}
              <div class=' flex border border-x-rose-200'>
                <a href="https://bun.sh" target="_blank">
                  <img src="./bunlogo.svg" class="logo" alt="Bun logo" />
                </a>
                <a href="https://www.solidjs.com" target="_blank">
                  <img src={ solidLogo } class="logo solid w-72" alt="Solid logo" />
                </a>
              </div>
              <h1 class=' text-blue-400'>Bun + Solid</h1>
              <div class="card">
                <button onClick={ () => setCount( ( count ) => count + 1 ) }>
                  count is { count() }
                </button>
                <p>
                  Edit <code>pages/index.tsx</code>
                </p>
              </div>
              <p class="read-the-docs">
                Click on the Bun and Solid logos to learn more
              </p>
            </div>
          );
}

export default App;