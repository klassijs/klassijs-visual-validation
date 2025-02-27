const { takePageImage, ImageAssertion } = require('../src/imageCompare');

/**
 * Visual comparison function
 * @param fileName
 * @returns {Promise<void>}
 */
async function compareImage(fileName){
    const expected = 0.2;
    const result = null;
    const value = null;
    const imageAssertion = new ImageAssertion(fileName, expected, result, value);
    await imageAssertion.run();
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

module.exports = { compareImage, takeImage, ImageAssertion };
