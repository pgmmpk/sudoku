
/*
 * A slightest finger move when tapping a button (on mobile) will fire touchstart, not click.
 * That is somewhat annoying. Working this around by hooking click and touchend together.
 */
export function superclick (node, callback) {

    let touched = null;

    function ontouchend(e) {
        touched = e.timestamp;
        callback();
    }

    function onclick (e) {
        if (!e.timestamp == touched) {
            callback();
        }
    }

    node.addEventListener('click', onclick);
    node.addEventListener('touchend', ontouchend);
    
    return () => {
        node.removeEventListener('touchend', ontouchend);
        node.removeEventListener('click', onclick);
    };
}