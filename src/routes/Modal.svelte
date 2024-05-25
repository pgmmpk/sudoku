<script>
    import { scale } from 'svelte/transition';
    import { createPromiser } from '$lib/settings.svelte.js';

    let show = $state(false);
    let mess = $state('');

    const infoPromiser = createPromiser();

    export function info (message) {
        mess = message;
        show = true;

        return infoPromiser.init();
    }

    function done() {
        mess = '';
        show = false;
        infoPromiser.resolve();
    }
</script>

{#if show}
<div class="z-10 flex flex-col w-screen h-screen bg-gray-800 bg-opacity-90 absolute left-0 top-0 items-center justify-center" transition:scale={{duration: 300}}>
    <div class="w-2/3 bg-white border-1 border-gray-500 rounded text-center m-8">
        <div>{mess}</div>
        <button onclick={done}>OK</button>
    </div>
</div>
{/if}
