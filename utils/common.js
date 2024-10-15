const { takePageImage, imageAssertion } = require('../src/imageCompare');

/**
 * Visual comparison function
 * @param fileName
 * @returns {Promise<void>}
 */
async function compareImage(fileName){
    await imageAssertion(fileName, null, null, null);
}

/**
 * This take an image of a page or an element on a page
 * fileName only = a whole page image
 * fileName + elementSnapshot = take an image of an element on the page
 * @param fileName {string}
 * @param elementSnapshot {any}
 * @param elementsToHide {string}
 * @returns {Promise<void>}
 */
async function takeImage(fileName, elementSnapshot, elementsToHide = ''){
    await takePageImage(fileName, elementSnapshot, elementsToHide);
}

module.exports = { compareImage, takeImage };