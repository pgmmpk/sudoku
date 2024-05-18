<script>
    import { fly } from 'svelte/transition';
    let { level = $bindable(64), active = $bindable(false) } = $props();

    $inspect({active, fly});
</script>
{#if active}
<div class="w-screen h-screen bg-green-400 absolute left-0 top-0" transition:fly={{duration: 500, opacity: 1, x: '-100%'}}>
    <button onclick={() => {active = false;}}>
Close
</button>
<input type="number" bind:value={level} >
</div>
{/if}
