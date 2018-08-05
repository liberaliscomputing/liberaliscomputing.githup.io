/**
 * @access public
 * random() returns a random elements given an array
 * @param {Object[]} arr 
 * @returns {primitive}
 */
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}