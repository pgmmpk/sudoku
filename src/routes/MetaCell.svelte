<script>
    import Cell from './Cell.svelte';

    function spin(node, options = {}) {
		const {times = 1} = options;
		return {
			...options,
			// The value of t passed to the css method
			// varies between zero and one during an "in" transition
			// and between one and zero during an "out" transition.
			css(t) {
				// Svelte takes care of applying the easing function.
				const degrees = 360 * times; // through which to spin
				return `transform: scale(${t}) rotate(${t * degrees}deg);`;
			}
		};
	}

    const { digits, onclick, selected, activeDigit, solved, onhidden } = $props();
</script>

{#if !solved}
<div transition:spin={{duration:1000, tiles: 1}} onoutroend={onhidden} class="grid grid-cols-3 border-2 border-gray-800">
    {#each digits as cell}
        <Cell {...cell} {onclick} {selected} {activeDigit} />
    {/each}
</div>
{/if}
