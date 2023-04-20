/**
 * Returns if the given object is a integer
 * @param {*} object 
 * @returns is integer? as boolean
 */
function isInt(object) {
    // If object is typeof number and the floor matches the object, it is a int
    // If it is float, floor would be by definition different
    return typeof object === "number" && Math.floor(object) === object;
}

const encryptionMapLookup = [3, 4, 1, 2]; // Look up map for encryption

/**
 * A version of the modulo operator that returns positive numbers for negative numbers
 * The positive numbers are the distance from base to 0 that a is from 0 to -base on the number line
 * @param {number} a 
 * @param {number} base
 */
function negativeCompleteModulo(a, base) {
    if (a >= 0) return a % base; // for positive numbers
    return base - (Math.abs(a) % base)
}

/**
 * Encrypts a string or number
 * @param {string | number} object what to encrypt
 * @returns {string}
 */
function encrypt(object) {
    if (typeof object === "string") object = parseInt(object); // Handle strings
    if (!isInt(object)) return; // Guard clause for is int at all
    if (object > 9999) return; // Guard clause for small large ints
    object = object.toString(); // Make string a object, b/c we are doing string manip. on in
    object = object.padStart(4, "0"); // Pad 0s, incase the number was <999 or <<999. (I love built ins :))
    let collection = new Array(4); // Make array with 4 mem slots
    object.split('').forEach((char, i) => {
        // Map the chars to the collection using the LUT
        // Add 7 and then mod 10, convert to string
        collection[encryptionMapLookup[i]] = ((parseInt(char) + 7) % 10).toString();
    });
    return collection.join(''); // Join array as string
}

/**
 * Decrypts encrypted string or number to string
 * O(n), but n is stuck at 4. Other constants play a big factor to time complexity
 * Memory complexity is much more important too
 * @param {string | number} object encrypted object to decrypt 
 * @returns decrypted string
 */
function decrypt(object) {
    if (isNaN(object)) return; // return if nan
    object = object.toString(); // convert to string
    object = object.padStart(4, "0"); // pad using same trick as earlier
    let collection = new Array(4); // make pre-sized array to avoid dynamic sizing
    object.split('').forEach((char, i) => { // run through each, using same map, and using the
        // *negative* modulo
        collection[encryptionMapLookup[i]] = negativeCompleteModulo(parseInt(char) - 7, 10);
    });
    return collection.join('');
}

// uncomment to showcase
// console.log("Integer 1234 is encrypted to 0189: ", encrypt(1234));
// console.log("Integer 0189 is decrypted to 1234: ", decrypt(189));
// console.log("Integer 9562 is encrypted to 3962: ", encrypt("9562"));
// console.log("Integer 3962 is decrypted to 9562: ", decrypt("3962"));

// uncomment to use as module
// module.exports = { encrypt, decrypt };

// uncomment to use as cli

const path = require('path');
const { argv, exit } = require('process');
const { readFileSync, writeFileSync } = require('fs');

const opt = argv[2];
const workingFile = argv[3];
const toProcess = argv.slice(4);

const isEncrypting = opt == "-e" || opt == "-encrypt";

// Do help already
if (opt === "-h") {
    console.log(`
-e | -encrypt <saveFile> [...numbers]
        Encrypt from numbers from stdin, save to file
-d | -decrypt [loadFile?] [...numbers?]
        Decrypt from a file or from stdin.
        Writes result to stdout.
-h
        Write this message to console.
        `);
    exit(0);
}

// if (opt !== "-decrypt" && opt !== "-d" && !isEncrypting) // invalid opt
//     exit(1);

if (!isNaN(parseInt(workingFile))) {
    toProcess.push(workingFile);
    workingFile = null;
    if (isEncrypting) exit(1);
}

if (isEncrypting) {
    let collection = new Array(toProcess.length);
    toProcess.forEach((num, i) => {
        let result = encrypt(num);
        collection[i] = result;
    });
    writeFileSync(path.join(process.cwd(), workingFile), collection.join('\n'));
} else {
    if (workingFile !== null) {
        let raw = readFileSync(path.join(process.cwd(), workingFile)).toString('utf-8');
        toProcess.push(...raw.split('\n'));
    }
    let collection = new Array(toProcess.length);
    toProcess.forEach((num, i) => {
        collection[i] = decrypt(num);
    });
    writeFileSync(path.join(process.cwd(), workingFile), collection.join('\n'));
}