const { takePageImage, ImageAssertion, clearErrors, startNewTestRun } = require('../src/imageCompare');

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
 * This take an image of a page or an element on a page and optionally compares it with baseline
 * fileName only = a whole page image
 * fileName + elementSnapshot = take an image of an element on the page
 * @param fileName {string}
 * @param elementSnapshot {any}
 * @param elementsToHide {string}
 * @param shouldCompare {boolean} - whether to perform comparison after taking image (default: true)
 * @param expectedTolerance {number} - tolerance for comparison (default: 0.2)
 * @param waitBeforeCapture
 * @returns {Promise<void>}
 */
async function takeImage(fileName, elementSnapshot, elementsToHide = '', shouldCompare = true, expectedTolerance = 0.2, waitBeforeCapture = 100) {
    // Automatically start a new test run for each image capture
    startNewTestRun();
    
    if (waitBeforeCapture > 0) {
        await browser.pause(waitBeforeCapture);
    }
    await takePageImage(fileName, elementSnapshot, elementsToHide);
    
    // Perform comparison if requested
    if (shouldCompare) {
        const result = null;
        const value = null;
        const imageAssertion = new ImageAssertion(fileName, expectedTolerance, result, value);
        await imageAssertion.run();
    }
}

module.exports = { compareImage, takeImage, ImageAssertion, clearErrors };
