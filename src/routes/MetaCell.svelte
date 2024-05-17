<script>
    import Cell from './Cell.svelte';
    import { fly } from 'svelte/transition';

    const { digits, onclick, selected, activeDigit } = $props();
    $inspect({digits})
</script>

<div class="grid grid-cols-3 border-2 border-gray-800">
    {#each digits as cell}
        <Cell {...cell} {onclick} {selected} {activeDigit} />
    {/each}
</div>
