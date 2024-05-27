<script>
    import { scale } from 'svelte/transition';
    import { createPromiser } from '$lib/settings.svelte.js';

    let show = $state(false);
    let mess = $state('');
    let butt = $state([]);

    const promiser = createPromiser();

    export function open (message, buttons) {
        mess = message;
        butt = buttons;
        show = true;
        return promiser.wait();
    }

    function done(what) {
        mess = '';
        show = false;
        promiser.resolve(what);
    }
</script>

{#if show}
<div class="z-10 flex flex-col w-screen h-screen bg-gray-800 bg-opacity-90 absolute left-0 top-0 items-center justify-center" transition:scale={{duration: 300}}>
    <div class="w-2/3 bg-white border-1 border-gray-500 rounded text-center m-4 my-8">
        <div class="my-4">{mess}</div>
        {#each butt as text}
        <button class="m-2 p-2 border rounded" onclick={() => done(text)}>{text}</button>
        {/each}
    </div>
</div>
{/if}
