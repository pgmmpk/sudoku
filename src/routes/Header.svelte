<script>
    import { game, stopwatch, mistakes, stats, haptic } from '$lib/settings.svelte.js';

    async function share () {
        const self = {
            title: 'Sudoku',
            url: 'https://sudoku.kroutikov.net',
        };
        if (navigator.canShare && navigator.canShare(self)) {
            await navigator.share(self);
        }
    }

</script>

<div class="flex flex-row w-full mt-4 mb-4 text-gray-500 sized">
    <div class="flex-1 flex flex-col text-lg">
        <label for="#mistakes">Mistakes</label>
        <div id="mistakes" class="font-mono">{mistakes.count}/{mistakes.limit}</div>
    </div>
    <div class="flex-1 flex flex-col text-lg">
        <label for="#stats">Stats</label>
        <div id="stats" class="font-mono">{stats.wonCount}/{stats.lostCount}</div>
    </div>
    <div class="flex-1 flex flex-col text-lg text-center">
        <label for="#difficulty">Difficulty</label>
        <div id="difficulty" class="font-mono">{game.level}</div>
    </div>
    <div class="flex-1 flex flex-col text-lg text-right">
        <label for="#timer">Elapsed</label>
        <div id="timer" class="font-mono">
            {#if stopwatch.hours > 0}{stopwatch.hours}:{/if}{stopwatch.minutes.toString().padStart(2, '0')}:{stopwatch.seconds.toString().padStart(2, '0')}
        </div>
    </div>
    <button class="text-right flex-1" onpointerdown={() => haptic(share())} aria-label="share">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 inline-block">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
        </svg>
    </button>
</div>

<style>
    .sized {
        width: var(--size);
    }
</style>