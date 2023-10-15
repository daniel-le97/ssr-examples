const home: Component = () =>{
    const [count, setCount] = createSignal(0)
    return (
      <div>
        <Counter start={6}/>
        <h1>this is todos page</h1>
        <Show when={count() > 20} fallback={
          <>
            <p>Count: {count()}</p>
            <button onClick={() => setCount(count() + 1)}>Increment</button>
          </>
        }>
          <div>Count limit reached</div>
        </Show>
      </div>
    )
};

export default home



