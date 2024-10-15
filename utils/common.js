const { takePageImage, imageAssertion, hideElements, showElements } = require('../src/imageCompare');


// module.exports = {
/**
 * Visual comparison function
 * @param fileName
 * @returns {Promise<void>}
 */
async function compareImage(fileName){
    await imageAssertion(fileName);
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
    await browser.pause(DELAY_500ms);
}
// }
module.exports = { compareImage, takeImage };