const verify = require('../src/imageCompare');

module.exports = {
    /**
     * Visual comparison function
     * @param fileName
     * @returns {Promise<void>}
     */
    compareImage: async (fileName) => {
        await verify.assertion(fileName);
        await verify.value();
        await verify.pass();
    },

    /**
     * This take an image of a page or an element on a page
     * fileName only = a whole page image
     * fileName + elementSnapshot = take an image of an element on the page
     * @param fileName {string}
     * @param elementSnapshot {any}
     * @param elementsToHide {string}
     * @returns {Promise<void>}
     */
    takeImage: async (fileName, elementSnapshot, elementsToHide = '') => {
        await verify.takePageImage(fileName, elementSnapshot, elementsToHide);
        await browser.pause(DELAY_500ms);
    },
}
