<script>
    import Mousetrap from 'mousetrap';
    import { haptic, filled } from '$lib/settings.svelte.js';

    const { onFill, onToggleNote, onClear, onReset, onUndo, onPause, onShowSettings } = $props();

    let fill = $state(true);

    function onclick (digit) {
        if (fill == true) {
            onFill(digit);
        } else {
            onTogleNote(+digit);
        }
    }

    Mousetrap.bind ('1', () => onFill(1));
    Mousetrap.bind ('2', () => onFill(2));
    Mousetrap.bind ('3', () => onFill(3));
    Mousetrap.bind ('4', () => onFill(4));
    Mousetrap.bind ('5', () => onFill(5));
    Mousetrap.bind ('6', () => onFill(6));
    Mousetrap.bind ('7', () => onFill(7));
    Mousetrap.bind ('8', () => onFill(8));
    Mousetrap.bind ('9', () => onFill(9));

    Mousetrap.bind ('ctrl+1', () => onToggleNote(1));
    Mousetrap.bind ('ctrl+2', () => onToggleNote(2));
    Mousetrap.bind ('ctrl+3', () => onToggleNote(3));
    Mousetrap.bind ('ctrl+4', () => onToggleNote(4));
    Mousetrap.bind ('ctrl+5', () => onToggleNote(5));
    Mousetrap.bind ('ctrl+6', () => onToggleNote(6));
    Mousetrap.bind ('ctrl+7', () => onToggleNote(7));
    Mousetrap.bind ('ctrl+8', () => onToggleNote(8));
    Mousetrap.bind ('ctrl+9', () => onToggleNote(9));
    
    Mousetrap.bind ('del', () => onClear());

</script>
<div class="mt-4 flex flex-col items-center justify-center">
    <div class="mt-4 grid grid-cols-5 items-center justify-center sized">
        <button onclick={() => haptic(onReset())} aria-label="reset">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 inline-block">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
        </button>
        <button onclick={() => haptic(onUndo())} aria-label="undo">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 inline-block">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
        </button>
        <button onclick={() => haptic((fill = !fill))} class:bg-gray-300={!fill} aria-label="mode">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 inline">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
        </button>
        <button onclick={() => haptic(onPause())} aria-label="pause">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 inline">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
        </button>
        <button onclick={() => haptic(onShowSettings())} aria-label="settings">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 inline">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        </button>
    </div>
    <div class="mt-4 grid grid-cols-9 items-center justify-center sized">
        {#each '123456789' as digit}
        <button disabled={filled.value[digit] >= 9} class="control hover:bg-gray-200 disabled:text-gray-400" class:font-thin={!fill} class:italic={!fill} onclick={() => haptic(onclick(+digit))}>{digit}</button>
        {/each}
    </div>
</div>

<style>
    .control {
        font-size: calc(var(--size) * 0.085);
    }
    .sized {
        width: var(--size);
    }
</style>