<script>
    import MetaCell from './MetaCell.svelte';

    const { board, onselected, selected, activeDigit, reveal } = $props();

    const blocks = [
        [0, 1, 2, 9, 10, 11, 18, 19, 20],
        [3, 4, 5, 12, 13, 14, 21, 22, 23],
        [6, 7, 8, 15, 16, 17, 24, 25, 26],
        [27, 28, 29, 36, 37, 38, 45, 46, 47],
        [30, 31, 32, 39, 40, 41, 48, 49, 50],
        [33, 34, 35, 42, 43, 44, 51, 52, 53],
        [54, 55, 56, 63, 64, 65, 72, 73, 74],
        [57, 58, 59, 66, 67, 68, 75, 76, 77],
        [60, 61, 62, 69, 70, 71, 78, 79, 80],
    ];

    const metaCells = {};

    export function hide(opts) {
        return Promise.all(Object.values(metaCells).map(m => m.hide(opts)));
    }

    export function show() {
        return Promise.all(Object.values(metaCells).map(m => m.show()));
    }
</script>

<div class="grid grid-cols-3 border-2 border-gray-800 sizedSquare">
    {#each blocks as block, blockId (blockId)}
        <MetaCell bind:this={metaCells[blockId]} digits={block.map(i => board.cells[i])} {onselected} {selected} {activeDigit} {reveal} />
    {/each}
</div>

<style>
    .sizedSquare {
        width: var(--size);
        height: var(--size);
    }
</style>