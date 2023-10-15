<script lang="ts">
    import Counter from '../components/counter.svelte'
  </script>
  
  <main>
    <div>
      <a href="https://bun.sh" target="_blank" rel="noreferrer"> 
        <img src="./bunlogo.svg" class="logo" alt="Bun Logo" />
      </a>
      <a href="https://svelte.dev" target="_blank" rel="noreferrer"> 
        <img src='./svelte.svg' class="logo svelte" alt="Svelte Logo" />
      </a>
    </div>
    <h1>test page</h1>
    this is the counter component
    <div class="card">
        <Counter />
    </div>
  
    <p class="read-the-docs">
      Click on the bun and Svelte logos to learn more
    </p>
  </main>
  
  <style>
    .logo {
      height: 6em;
      padding: 1.5em;
      will-change: filter;
    }
    .logo:hover {
      filter: drop-shadow(0 0 2em #646cffaa);
    }
    .logo.svelte:hover {
      filter: drop-shadow(0 0 2em #ff3e00aa);
    }
    .read-the-docs {
      color: #888;
    }
  </style>