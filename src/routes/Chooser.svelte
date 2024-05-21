<script>
    import { spring } from 'svelte/motion';
    let { choices = ["easy", "medium", "hard"], value = $bindable('medium') } = $props();

    let index = $state(0);

    const springIndex = $state(spring(0));


    function decrease () {
        if (index > 0) {
            index -= 1;
            springIndex.set(index);
        }
    }

    function increase () {
        if (index < choices.length - 1) {
            index += 1;
            springIndex.set(index);
        }
    }

    $inspect({springIndex, index})

</script>
<div class="flex items-center bg-gray-200 rounded-full shadow-lg border-t border-b border-gray-500">
    <button onclick={decrease} disabled={index === 0} class="bg-gray-300 hover:bg-gray-500 w-12 h-12 rounded-full border border-gray-500 disabled:cursor-default disabled:bg-gray-300">-</button>
    <div class="pill-content w-24 h-12 flex flex-rows items-bottom justify-center relative text-xl overflow-hidden">
        <div style="transform: translate(0, -{100*$springIndex}%)">
            {#each choices as c,i (i)}
            <div class="h-12 flex items-center justify-center">{c}</div>
            {/each}
        </div>
    </div>
    <button onclick={increase} disabled={index === choices.length - 1} class="bg-gray-300 hover:bg-gray-500 w-12 h-12 rounded-full border border-gray-500 disabled:cursor-default disabled:bg-gray-300">+</button>
</div>
{index} {choices[index]} {$springIndex}

