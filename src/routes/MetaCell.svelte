<script>
    import { createPromiser } from '$lib/settings.svelte.js';
    import Cell from './Cell.svelte';

    let lost = false;

    function spin(node, options = {}) {
		const {times = 1} = options;

        if (lost) {
            const x = Math.random() * 50 * (Math.random() > 0.5 ? 1. : -1.);
            const y = Math.random() * 50 * (Math.random() > 0.5 ? 1. : -1.);
            lost = false;
            return {
                ...options,
                css(t) {
                    const degrees = 360 * times; // through which to spin
                    return `transform: translate(${x*(1.-t)}%, ${y*(1-t)}%) scale(${t});`;
                }
            };
        } else {
            return {
                ...options,
                css(t) {
                    const degrees = 360 * times; // through which to spin
                    return `transform: scale(${t}) rotate(${t * degrees}deg);`;
                }
            };
        }
	}

    const promiser = createPromiser();

    let showing = $state(true);

    export const hide = async ({fail = false} = {}) => {
        if (!showing) return;
        lost = fail;
        showing = false;
        await promiser.wait();
    };

    export const show = () => {
        if (showing) return;
        showing = true;
        return promiser.wait();
    };

    const { digits, onclick, selected, activeDigit, blockId } = $props();
</script>

{#if showing}
<div transition:spin={{duration:1000, tiles: 1}} onoutroend={() => promiser.resolve()} onintroend={() => promiser.resolve()} class="grid grid-cols-3 border-2 border-gray-800">
    {#each digits as cell}
        <Cell {...cell} {onclick} {selected} {activeDigit} />
    {/each}
</div>
{/if}
