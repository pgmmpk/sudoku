<script>
    const { id, selected, activeDigit, frozen, error, digit, solution, notes, reveal, onclick } = $props();

    const isSelected = $derived(id == selected);
    const row = $derived(id % 9);
    const col = $derived(Math.floor(id / 9));
    const selectedRow = $derived(selected % 9);
    const selectedCol = $derived(Math.floor(selected / 9));
    const isActive = $derived(activeDigit && digit === activeDigit && !isSelected);
    const isSelectedRow = $derived(row == selectedRow && !isSelected && !isActive);
    const isSelectedCol = $derived(col == selectedCol && !isSelected && !isActive);
    const isSelectedBlock = $derived( Math.floor(row / 3) == Math.floor(selectedRow / 3) && Math.floor(col / 3) == Math.floor(selectedCol / 3) && !isSelected);
    const notesString = $derived([1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => notes.indexOf(i) >= 0 ? '' + i : ' ').join(''));

    function spiral(node, options = {}) {
        const size = 25;
        const { times = 20 } = options;
        const phase = Math.random() * 2 * Math.PI;
        const direction = Math.random() > 0.5 ? -1 : 1;
        return {
            ...options,
            css(t) {
                // return `transform: translate(${t*(1-t)*percent*Math.sin(t * Math.PI * 2 * times * direction + phase)}%, ${t*(1-t)*percent*Math.cos(t*Math.PI*2*times* direction + phase)}%); color: red;`;
                const radius = t * (1 - t) * size;
                const angle = phase + t * Math.PI * direction * 2 * times;
                return `top: ${50 - radius * Math.sin(angle)}%; left: ${50 - radius * Math.cos(angle)}%`;
            }
        };
	}

</script>

{#snippet digitSnippet(solution)}
    <div in:spiral={{duration: 4000, delay: 200}} class="w-0 h-0 absolute cell font-light text-green-700 opacity-60 flex justify-center items-center">{solution}</div>
{/snippet}

<div class="border border-gray-400 text-gray-700 font-light items-center justify-center flex relative touch-none"
    class:bg-blue-300={isSelected} class:bg-blue-50={isSelectedCol || isSelectedRow || isSelectedBlock} class:bg-blue-200={isActive}
    onclick={() => onclick && onclick(id)} role="presentation"
>
{#if digit}
{#if reveal && solution != digit}
    {@render digitSnippet(solution)}
{/if}
<div class="font-light aspect-square">
    <div class="cell font-light flex items-center justify-center w-0 h-0" class:text-red-700={(!reveal && error) || (reveal && digit != solution)} class:text-blue-700={!frozen && !error}>{digit}</div>
</div>
{:else}    
<div class="font-light aspect-square"></div>
{#if reveal}
    {@render digitSnippet(solution)}
{/if}
<div class="grid grid-cols-3 aspect-square h-full items-center justify-center">
    {#each notesString as note,i (i)}
    <div class="flex items-center justify-center aspect-square" class:font-bold={note==activeDigit}>
        <div class="celltext italic w-0 h-0 flex items-center justify-center">{note}</div>
    </div>
    {/each}
</div>
{/if}
</div>
<style>
    .celltext {
        font-size: calc(var(--size) * 0.03);
    }
    .cell {
        font-size: calc(var(--size) * 0.085);
    }
</style>
