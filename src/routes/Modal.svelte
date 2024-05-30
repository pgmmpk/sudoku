<script>
    import { scale } from 'svelte/transition';
    import { createPromiser } from '$lib/settings.svelte.js';
    import { superclick } from '$lib/actions.js';

    let showing = $state(false);
    let mess = $state('');
    let butt = $state([]);

    const promiser = createPromiser();
    export function show (message, buttons) {
        mess = message;
        butt = buttons;
        showing = true;
        return promiser.wait();
    }

    export function hide (what) {
        mess = '';
        showing = false;
        promiser.resolve(what);
    }
</script>

{#if showing}
<div class="z-10 flex flex-col w-screen h-screen bg-gray-800 bg-opacity-90 absolute left-0 top-0 items-center justify-center" transition:scale={{duration: 300}}>
    <div class="w-2/3 bg-white border-1 border-gray-500 rounded text-center m-4 my-8">
        <div class="my-4">{mess}</div>
        {#each butt as text}
        <button class="m-2 p-2 border rounded touch-none" use:superclick={() => hide(text)}>{text}</button>
        {/each}
    </div>
</div>
{/if}
