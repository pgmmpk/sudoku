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
<label class="inline-flex items-center cursor-pointer">
    <input type="checkbox" value="" class="sr-only peer">
    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Toggle me</span>
</label>
{/if}
