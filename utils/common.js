const { takePageImage, ImageAssertion, clearErrors, startNewTestRun, shouldStartNewTestRun } = require('../src/imageCompare');

/**
 * Validate input parameters for takeImage function
 * @param {string} fileName - Screenshot filename
 * @param {any} elementSnapshot - Element selector (optional)
 * @param {string} elementsToHide - Elements to hide (optional)
 * @param {boolean} shouldCompare - Whether to compare (optional)
 * @param {number} expectedTolerance - Tolerance value (optional)
 * @param {number} waitBeforeCapture - Wait time in ms (optional)
 * @throws {Error} If validation fails
 */
function validateTakeImageParams(fileName, elementSnapshot, elementsToHide, shouldCompare, expectedTolerance, waitBeforeCapture) {
    if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
        throw new Error('Visual Validation: fileName is required and must be a non-empty string');
    }
    
    if (elementSnapshot !== null && elementSnapshot !== undefined && typeof elementSnapshot !== 'string') {
        throw new Error('Visual Validation: elementSnapshot must be a string, null, or undefined');
    }
    
    if (elementsToHide !== null && elementsToHide !== undefined && typeof elementsToHide !== 'string') {
        throw new Error('Visual Validation: elementsToHide must be a string, null, or undefined');
    }
    
    if (shouldCompare !== null && shouldCompare !== undefined && typeof shouldCompare !== 'boolean') {
        throw new Error('Visual Validation: shouldCompare must be a boolean');
    }
    
    if (expectedTolerance !== null && expectedTolerance !== undefined) {
        if (typeof expectedTolerance !== 'number' || isNaN(expectedTolerance) || expectedTolerance < 0 || expectedTolerance > 100) {
            throw new Error('Visual Validation: expectedTolerance must be a number between 0 and 100');
        }
    }
    
    if (waitBeforeCapture !== null && waitBeforeCapture !== undefined) {
        if (typeof waitBeforeCapture !== 'number' || isNaN(waitBeforeCapture) || waitBeforeCapture < 0) {
            throw new Error('Visual Validation: waitBeforeCapture must be a non-negative number');
        }
    }
}

/**
 * Visual comparison function
 * Compares an image with its baseline using default tolerance (0.2)
 * 
 * @param {string} fileName - Filename of the image to compare (must exist in result directory)
 * @returns {Promise<void>}
 * @throws {Error} If fileName is invalid or comparison fails
 * @example
 * await compareImage('homepage.png');
 */
async function compareImage(fileName) {
    if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
        throw new Error('Visual Validation: fileName is required and must be a non-empty string');
    }
    
    const expected = 0.2;
    const result = null;
    const value = null;
    const imageAssertion = new ImageAssertion(fileName, expected, result, value);
    await imageAssertion.run();
}

/**
 * Take an image of a page or an element and optionally compare it with baseline
 * This is the main function for visual regression testing. It automatically starts
 * a new test run if needed and collects errors across multiple calls.
 * 
 * @param {string} fileName - Name of the screenshot file (required)
 * @param {string|null} elementSnapshot - CSS selector for element screenshot (optional)
 *   - If provided, only the specified element will be captured
 *   - If null/undefined, the entire page will be captured
 * @param {string} elementsToHide - CSS selectors of elements to hide during capture (optional, default: '')
 *   - Useful for hiding dynamic content like timestamps, user info, notifications
 *   - Can be comma-separated string: '.timestamp, .user-info'
 * @param {boolean} shouldCompare - Whether to perform comparison after taking image (default: true)
 *   - Set to false if you only want to capture without comparison
 * @param {number} expectedTolerance - Tolerance for comparison (default: 0.2, range: 0-100)
 *   - Lower values = stricter comparison (0.1 = very strict, 0.5 = more lenient)
 *   - Represents the percentage of difference allowed before test fails
 * @param {number} waitBeforeCapture - Wait time in milliseconds before capture (default: 100)
 *   - Useful for waiting for animations or dynamic content to stabilize
 * 
 * @returns {Promise<void>}
 * @throws {Error} If validation fails, screenshot fails, or comparison fails
 * 
 * @example
 * // Capture entire page and compare
 * await takeImage('homepage.png');
 * 
 * @example
 * // Capture specific element
 * await takeImage('button.png', '.submit-button');
 * 
 * @example
 * // Hide dynamic content
 * await takeImage('dashboard.png', null, '.timestamp, .user-info');
 * 
 * @example
 * // Capture without comparison
 * await takeImage('screenshot.png', null, '', false);
 * 
 * @example
 * // Custom tolerance
 * await takeImage('text.png', null, '', true, 0.1);
 */
async function takeImage(fileName, elementSnapshot, elementsToHide = '', shouldCompare = true, expectedTolerance = 0.2, waitBeforeCapture = 100) {
    // Validate input parameters
    validateTakeImageParams(fileName, elementSnapshot, elementsToHide, shouldCompare, expectedTolerance, waitBeforeCapture);
    
    // Automatically start a new test run if there are no existing errors
    // This means we're starting fresh and should clear the state
    if (shouldStartNewTestRun()) {
        startNewTestRun();
    }

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
