
/*
 * A slightest finger move when tapping a button (on mobile) will fire touchstart, not click.
 * That is somewhat annoying. Working this around by hooking click and touchend together.
 */
export function superclick (node, callback) {
    node.addEventListener('click', callback);
    node.addEventListener('touchend', callback);
    
    return () => {
        node.removeEventListener('touchend', callback);
        node.removeEventListener('click', callback);
    };
}