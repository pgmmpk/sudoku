<script>
    import { fade } from 'svelte/transition';

    let id = 3;

    let items = $state([
        0, 1, 2
    ])

    function flip() {
        items.push(id);
        id += 1;
        items.splice(0, 1)
    }

</script>

<button onclick={flip}>flip</button>
<div class="flex justify-center items-center">
    {#each items as item (item)}
        <div transition:fade={{duration:200}} class="m-2 border w-8 h-8 trans">{item}</div>        
    {/each}
</div>

<style>
    .trans {
        transition: opacity 2s;
    }
</style>