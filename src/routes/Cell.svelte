<script>
    import { untrack } from 'svelte';
    const { id, selected, activeDigit, frozen, error, digit, notes, onclick } = $props();

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
</script>

<div class="border border-gray-400 text-gray-700" class:bg-blue-300={isSelected} class:bg-blue-50={isSelectedCol || isSelectedRow || isSelectedBlock} class:bg-blue-200={isActive}>
{#if digit}
<div class="flex items-center justify-center font-light text-7xl aspect-square" class:text-red-700={error} class:text-blue-700={!frozen && !error} onclick={() => onclick && onclick(id)} role="presentation">
    <div class="cell">{digit}</div>
</div>
{:else if notes}    
<div class="grid grid-cols-3" onclick={() => onclick && onclick(id)} role="presentation">
    {#each notesString as note,i (i)}
    <div class="flex items-center justify-center font-extralightx aspect-square" class:font-bold={note===activeDigit}>
        <div class="celltext italic">{note}</div>
    </div>
    {/each}
</div>
{/if}
</div>
<style>
    .celltext {
        margin: calc(var(--size) * -0.03);
        font-size: calc(var(--size) * 0.03);
    }
    .cell {
        margin: calc(var(--size) * -0.085);
        font-size: calc(var(--size) * 0.085);
    }
</style>
