<script setup lang="ts">

    import HelloWorld from "../components/HelloWorld.vue";

    let routes = ['/no-setup', '/only-script', '/only-template', '/script-setup']
    const count = ref(0);
    const increment = () => {
        count.value += 1
    };

    const countValue = computed( () => count.value)
</script>

<template>
    <div>
        <button @click="increment" class="  text-black bg-blue-300">Increment</button>
        <h3>{{ countValue }}</h3>
        <li v-for="route in routes">
            <a :href="route">{{ route }}</a>
        </li>
        <hello-world/>
        <footer class="bg-dark text-light">
             Made with 💖 by daniel 
        </footer>
    </div>
</template>
<style lang="scss">

body {
    margin: 0;
    padding: 0;
    justify-content: center;
    display: flex;
}

* {
    font-family: 'IBM Plex Sans';
}

</style>
