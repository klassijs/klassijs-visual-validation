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

    /**
     * hideElemements hide elements
     * @param selectors
     */
    hideElements: async (selectors) => {
        // if arg is no array make it one
        selectors = typeof selectors === 'string' ? [selectors] : selectors;
        for (let i = 0; i < selectors.length; i++) {
            const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '0')`;
            await browser.execute(script);
        }
    },

    /**
     * showElemements show elements
     * @param selectors
     */
    showElements: async (selectors) => {
        // if arg is no array make it one
        selectors = typeof selectors === 'string' ? [selectors] : selectors;
        for (let i = 0; i < selectors.length; i++) {
            const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '1')`;
            await browser.execute(script);
        }
    },
}
