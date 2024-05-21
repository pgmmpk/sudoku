<script>
    import { fly } from 'svelte/transition';
    import { LEVELS, level } from './level.svelte.js';

    let { active = $bindable(false) } = $props();

</script>
{#if active}
<div class="w-screen h-screen bg-gray-200 absolute left-0 top-0" transition:fly={{duration: 500, opacity: 1, x: '-100%'}}>
    <button onclick={() => {active = false;}}>Close</button>
    <select bind:value={level.index} >
        {#each LEVELS as l (l)}
            <option value={l.index} selected={l.index === level.index}>{l.label}</option>
        {/each}
    </select>
</div>
{/if}
