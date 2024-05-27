<script>
    import { fly } from 'svelte/transition';
    import { stopwatch } from '$lib/settings.svelte.js';

    let active = $state(false);

    export function show () {
        active = true;
        stopwatch.stop();
    }

    export function hide () {
        active = false;
        stopwatch.start();
    }
</script>
{#if active}
<div class="flex flex-col w-screen h-screen bg-gray-200 absolute left-0 top-0 items-center justify-center z-20" transition:fly={{duration: 500, opacity: 1, x: '100%'}}>
    <button onclick={hide}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-48 h-48 block">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
        </svg>
    </button>
</div>
{/if}
