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
     * @param elementSnapshot {null}
     * @param elementsToHide {string}
     * @returns {Promise<void>}
     */
    takeImage: async (fileName, elementSnapshot, elementsToHide = '') => {
        await verify.takePageImage(fileName, elementSnapshot, elementsToHide);
        await browser.pause(DELAY_500ms);
    },

    /**
     * This take an image of a page or an element on a page and Compare said image against baseline
     * fileName only = a whole page image
     * fileName + elementSnapshot = take an image of an element on the page
     * @param fileName
     * @param elementSnapshot
     * @param elementsToHide
     * @returns {Promise<void>}
     */
    visualValidation: async (fileName='', elementSnapshot= null, elementsToHide = "") => {
        await verify.takePageImage(fileName, elementSnapshot, elementsToHide).then(async () => {
            await browser.pause(DELAY_100ms);
            await verify.assertion(fileName);
            await verify.value();
            await verify.pass();
        })
    },
}
