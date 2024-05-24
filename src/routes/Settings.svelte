<script>
    import { bus } from '$lib/bus.js';
    import { fly } from 'svelte/transition';
    import { LEVELS, level, settings } from '$lib/settings.svelte.js';

    let active = $state(false);
    
    bus.addEventListener('settings-show', () => {active = true;})

</script>
{#if active}
<div class="flex flex-col w-screen h-screen bg-gray-200 absolute left-0 top-0" transition:fly={{duration: 500, opacity: 1, x: '-100%'}}>
    <div class="flex flex-row">
        <button onclick={() => {active = false;}}>Close</button>
        <select bind:value={level.index} >
            {#each LEVELS as l}
            <option value={l.index} selected={l.index==level.index}>{l.label}</option>
            {/each}
        </select>
    </div>
    <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" value="" bind:checked={settings.vibrate} class="sr-only peer">
        <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-none dark:peer-focus:ring-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-700">Vibrate</span>
    </label>
</div>
{/if}
