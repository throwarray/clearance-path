// Handle methods that may change
const { min, max, floor, log2, random: mathRand } = Math;
const hasOwn = Object.prototype.hasOwnProperty;
const TWO_PI = Math.PI * 2;

function bitsNeeded (value) {
    return !value ? 1 : floor(log2(value)) + 1;
}

function bitRange (value, startBit, length) {
    let endBit = startBit + length;
    let toLeft = 32 - endBit;
    let toRight = toLeft + startBit;
    return (value << toLeft) >>> toRight;
}

function toXY (index, cols, output = {}) {
    let y = floor(index / cols) || 0;
    let x = index - (y * cols);
    output.x = x;
    output.y = y;
    return output;
}

function toIndex (x, y, cols)  {
    return (y * cols) + x;
}

function satisfyMask (num, numMask) {
    return num === void 0 ? false : (num & numMask) === numMask;
}

function combineMasks () {
    let v = arguments[0];
    for (let i = 1; i < arguments.length; i++) v |= arguments[i];
    return v;
}

function hasOwnProperty (obj, prop) {
    return hasOwn.call(obj, prop);
}

function lerp (start, end, t) {
    return (1 - t) * start + t * end;
}

function clamp (val, low, high) {
    return max(min(val, high), low);
}

function random (min, max) {
    return floor(mathRand() * (max - min + 1)) + min;
}

function randomF(min, max) {
    return (mathRand() * (max - min)) + min;
}

function isVector (item) {
    return Boolean(item && hasOwn.call(item, 'x') && hasOwn.call(item, 'y'));
}

function toAng (rad) {
  return (180 * rad / Math.PI) % 360;
}

function toRad (ang) {
  return (ang / 180 * Math.PI) % TWO_PI;
}

module.exports = {
    random,
    randomF,
    clamp,
    lerp,
    hasOwnProperty,
    satisfyMask,
    combineMasks,
    bitsNeeded,
    bitRange,
    toXY,
    toAng,
    toRad,
    toIndex,
    isVector,
    TWO_PI
};
