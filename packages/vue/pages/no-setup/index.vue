<template>
    <div class="foo">{{ msg }}</div>
    <HelloWorld class="foo"/>
</template>

<script lang="ts">

import HelloWorld from '../../components/HelloWorld.vue';
export default {

    setup() {
        return {
            msg: 'Hello world!'
        };
    },
    components: { HelloWorld }
}
</script>

<style scoped>
.foo {
    color: red;
}
</style>
