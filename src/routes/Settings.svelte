<script>
    import { fly } from 'svelte/transition';
    import { LEVELS, level, settings, haptic, stopwatch } from '$lib/settings.svelte.js';
    
    let active = $state(false);
    
    export function show () {
        active = true;
        stopwatch.stop();
    }

    export function hide () {
        active = false;
        stopwatch.start();
    }

    export function isShowing () {
        return active;
    }
</script>
{#if active}
<div class="flex flex-col w-screen h-screen bg-gray-200 absolute left-0 top-0 z-20 font-medium text-gray-700" transition:fly={{duration: 500, opacity: 1, x: '-100%'}}>
    <div class="flex flex-row justify-right">
        <div class="grow"></div>
        <button class="flex-none" onpointerdown={() => haptic(hide())}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 block m-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        </button>
    </div>
    <div class="my-8 ml-4 flex justify-center">
        <label class="mr-4 p-2" for="#difficulty">Difficulty:</label>
        <select class="p-2 rounded px-4 border border-gray-700 outline-none" id="difficulty" bind:value={level.index} >
            {#each LEVELS as l}
            <option value={l.index} selected={l.index==level.index}>{l.label}</option>
            {/each}
        </select>
    </div>
    <div class="my-8 ml-4 flex justify-center">
        <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" bind:checked={settings.vibrate} class="sr-only peer">
            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-none dark:peer-focus:ring-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
            <span class="ms-4 font-medium text-gray-900 dark:text-gray-700">Vibrate</span>
        </label>
    </div>
    <div class="grow"></div>
    <div class="text-sm text-center text-gray-500 mb-2">build #{import.meta.env.BUILD_NUMBER ?? 'dev'}</div>
</div>
{/if}
