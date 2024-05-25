<script>
    import { bus } from '$lib/bus.js';
    import { fly } from 'svelte/transition';
    import { LEVELS, level, settings, haptic, game } from '$lib/settings.svelte.js';
    import Modal from './Modal.svelte';
    
    let active = $state(false);
    
    bus.addEventListener('settings-show', () => {active = true;});

    async function close () {
        if (game.level !== level.label) {
            // await modal.info('Change to game difficulty level will be applied to the next game');
        }
        active = false;
    }

    let modal;
</script>
{#if active}
<Modal bind:this={modal} />
<div class="flex flex-col w-screen h-screen bg-gray-200 absolute left-0 top-0" transition:fly={{duration: 500, opacity: 1, x: '-100%'}}>
    <div class="flex flex-row justify-right">
        <div class="grow"></div>
        <button class="flex-none" onclick={() => haptic(close())}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 block m-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        </button>
    </div>
    <div class="my-8 ml-4">
        <label for="#difficulty">Difficulty:</label>
        <select id="difficulty" bind:value={level.index} >
            {#each LEVELS as l}
            <option value={l.index} selected={l.index==level.index}>{l.label}</option>
            {/each}
        </select>
    </div>
    <div class="my-8 ml-4">
        <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" bind:checked={settings.vibrate} class="sr-only peer">
            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-none dark:peer-focus:ring-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
            <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-700">Vibrate</span>
        </label>
    </div>
</div>
{/if}
