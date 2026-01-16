/**
 * klassijs
 * Copyright © 2016 - Larry Goddard
 */
require('dotenv').config();
const resemble = require('klassijs-resembleJs');
const fs = require('fs-extra');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

let diffFile;
// Safely get browserName from various sources
let browserName = 'unknown';
try {
  if (typeof BROWSER_NAME !== 'undefined' && BROWSER_NAME) {
    browserName = BROWSER_NAME;
  } else if (global.browserName) {
    browserName = global.browserName;
  }
} catch (e) {
  // BROWSER_NAME might not be defined, use default
  browserName = global.browserName || 'unknown';
}

const DELAY_100ms = 100;
const DELAY_500ms = 500;
const MAX_RESULT_WAIT_TIME = 30000; // 30 seconds max wait for comparison result
const MAX_CONSOLE_OUTPUT_SIZE = 10000; // Limit console output accumulation

// Default resemble configuration
const DEFAULT_RESEMBLE_CONFIG = {
  errorColor: {
    red: 225,
    green: 0,
    blue: 225,
  },
  errorType: 'movement',
  transparency: 0.1,
  largeImageThreshold: 1200,
};

// Allow framework to override resemble config
let resembleConfig = { ...DEFAULT_RESEMBLE_CONFIG };
if (global.visualValidationConfig && global.visualValidationConfig.resemble) {
  resembleConfig = { ...DEFAULT_RESEMBLE_CONFIG, ...global.visualValidationConfig.resemble };
}

const errors = [];
let consoleOutput = '';
let consoleOutputLineCount = 0;
const MAX_CONSOLE_OUTPUT_LINES = 100; // Limit number of lines to prevent memory issues

const originalConsoleError = console.error;
console.error = function (message) {
  // Limit console output accumulation to prevent memory issues
  // Use line count instead of character count for better control
  if (consoleOutputLineCount < MAX_CONSOLE_OUTPUT_LINES) {
    consoleOutput += message + '\n';
    consoleOutputLineCount++;
  } else if (consoleOutputLineCount === MAX_CONSOLE_OUTPUT_LINES) {
    // Add a warning that output is truncated
    consoleOutput += '\n[Visual Validation: Console output truncated to prevent memory issues]\n';
    consoleOutputLineCount++;
  }
  originalConsoleError.apply(console, arguments);
};

/**
 * Extract error message from various error object structures
 * @param {*} err - Error object, string, number, or unknown type
 * @returns {string} - Formatted error message
 */
function extractErrorMessage(err) {
  if (!err) return 'Unknown error occurred';
  
  if (typeof err === 'string') return err;
  if (typeof err === 'number') return `Error code: ${err}`;
  if (typeof err === 'object') {
    if (err.message) return err.message;
    if (err.error) {
      if (typeof err.error === 'string') return err.error;
      if (err.error && typeof err.error === 'object' && err.error.message) {
        return err.error.message;
      }
    }
  }
  return 'Unknown error occurred';
}

/**
 * Validate framework globals are available
 * @throws {Error} If required framework globals are missing
 */
function validateFrameworkGlobals() {
  if (typeof browser === 'undefined') {
    throw new Error('Visual Validation: "browser" object is not available. Ensure WebdriverIO is properly initialized.');
  }
  if (typeof env === 'undefined' || !env.envName) {
    throw new Error('Visual Validation: "env.envName" is not available. Ensure your test framework environment is properly configured.');
  }
}

/**
 * Get directory paths for visual regression artifacts
 * @param {string} envName - Environment name
 * @returns {Object} - Object containing all directory paths
 */
function getDirectoryPaths(envName) {
  const normalizedEnvName = envName.toLowerCase();
  return {
    baselineDir: `./visual-regression-baseline/${browserName}/${normalizedEnvName}/`,
    resultDir: `./artifacts/visual-regression/original/${browserName}/${normalizedEnvName}/`,
    diffDir: `./artifacts/visual-regression/diffs/${browserName}/${normalizedEnvName}/`,
  };
}

/**
 * Validate that a file exists and is readable
 * @param {string} filePath - Path to the file to validate
 * @param {string} context - Context for error message (e.g., "baseline", "screenshot")
 * @throws {Error} If file doesn't exist or is not readable
 */
function validateFileExists(filePath, context = 'file') {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Visual Validation: ${context} file does not exist: ${filePath}`);
  }
  
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      throw new Error(`Visual Validation: ${context} path is not a file: ${filePath}`);
    }
    if (stats.size === 0) {
      throw new Error(`Visual Validation: ${context} file is empty: ${filePath}`);
    }
  } catch (err) {
    if (err.message.startsWith('Visual Validation:')) {
      throw err;
    }
    throw new Error(`Visual Validation: Cannot access ${context} file: ${filePath}. ${extractErrorMessage(err)}`);
  }
}

/**
 * Validate that an image file is valid (basic check)
 * @param {string} filePath - Path to the image file
 * @returns {boolean} - True if file appears to be a valid image
 */
function isValidImageFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    // Check for common image file signatures
    const pngSignature = buffer.toString('hex', 0, 8) === '89504e470d0a1a0a';
    const jpegSignature = buffer.toString('hex', 0, 4) === 'ffd8ffe0' || buffer.toString('hex', 0, 4) === 'ffd8ffe1';
    
    return pngSignature || jpegSignature;
  } catch (err) {
    return false;
  }
}

/**
 * This ensures a clean errors array for the entire test run
 */
function startNewTestRun() {
  clearErrors();
}

/**
 * Check if we should start a new test run (when there are no existing errors)
 * @returns {boolean}
 */
function shouldStartNewTestRun() {
  return errors.length === 0;
}

/**
 * This ensures test isolation and prevents errors from carrying over
 * Clears both the errors array and console output buffer
 */
function clearErrors() {
  errors.length = 0;
  consoleOutput = '';
  consoleOutputLineCount = 0;
}

/**
 * Take screenshot using W3C mode only
 * @param {string} resultPathPositive - Path to save the screenshot
 * @param {string|null} elementSelector - CSS selector for element screenshot (optional)
 * @returns {Promise<void>}
 * @throws {Error} If screenshot fails or file is not created
 */
async function takeScreenshotImage(resultPathPositive, elementSelector = null) {
  validateFrameworkGlobals();
  
  try {
    if (elementSelector) {
      // Element screenshot using W3C mode
      // Use direct Promise-based approach for WebdriverIO v9+
      const elem = await browser.$(elementSelector);
      await elem.saveScreenshot(resultPathPositive);
    } else {
      // Page screenshot using W3C mode
      // Use direct Promise-based approach for WebdriverIO v9+
      await browser.saveScreenshot(resultPathPositive);
    }
    
    // Validate that screenshot was actually created
    await browser.pause(100); // Small delay to ensure file system write completes
    validateFileExists(resultPathPositive, 'screenshot');
    
    // Basic validation that it's a valid image file
    if (!isValidImageFile(resultPathPositive)) {
      console.warn(`Warning: Screenshot file may be corrupted or invalid: ${resultPathPositive}`);
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    console.error(`Screenshot failed: ${errorMessage}`);
    throw new Error(`Unable to take screenshot: ${errorMessage}`);
  }
}

/**
 * Throw all collected errors with context information
 * Formats errors for display in test reports (e.g., Cucumber)
 * @throws {Error} Always throws if there are collected errors
 */
function throwCollectedErrors() {
  if (errors.length > 0) {
    const formattedErrorMessages = errors.map((errObj, index) => {
      let message = '';
      if (errObj && typeof errObj === 'object' && errObj.message) {
        message = errObj.message;
      } else {
        message = extractErrorMessage(errObj);
      }
      // Add error number for better tracking
      return `[${index + 1}/${errors.length}] ${message}`;
    }).join('\n');

    // Only include the essential error messages
    const errorCount = errors.length;
    const summary = `Visual Validation: ${errorCount} image comparison ${errorCount === 1 ? 'failure' : 'failures'} detected:\n\n${formattedErrorMessages}`;
    const consoleMessage = `<div style="color:red;">${summary}</div>`;
    
    if (typeof cucumberThis !== 'undefined' && cucumberThis && cucumberThis.attach) {
      cucumberThis.attach(`Attachment (text/plain): ${consoleMessage}`);
    }
    
    // Clear errors before throwing to prevent double-reporting
    const errorToThrow = new Error(summary);
    errors.length = 0;
    throw errorToThrow;
  }
}

/**
 * ImageAssertion class for visual regression testing
 * Handles image comparison, diff generation, and baseline management
 * 
 * @class ImageAssertion
 * @example
 * const assertion = new ImageAssertion('homepage.png', 0.2, null, null);
 * await assertion.run();
 */
class ImageAssertion {
  /**
   * Creates an instance of ImageAssertion
   * @param {string} filename - Name of the image file to compare
   * @param {number} expected - Expected tolerance threshold (0-100)
   * @param {Object|null} result - Comparison result object (initially null)
   * @param {number|null} value - Mismatch percentage value (initially null)
   */
  constructor(filename, expected, result, value) {
    this.filename = filename;
    this.expected = expected;
    this.result = result;
    this.value = value;

    // Bind methods to the instance
    this.run = this.run.bind(this);
    this.valueMethod = this.valueMethod.bind(this);
    this.passMethod = this.passMethod.bind(this);
  }

  /**
   * Run the image comparison process
   * @returns {Promise<void>}
   * @throws {Error} If comparison fails or files are invalid
   */
  async run() {
    validateFrameworkGlobals();
    
    const envName = env.envName.toLowerCase();
    const paths = getDirectoryPaths(envName);
    const baselineDir = paths.baselineDir;
    const resultDir = paths.resultDir;
    const diffDir = paths.diffDir;
    
    const resultDirPositive = `${resultDir}positive/`;
    const resultDirNegative = `${resultDir}negative/`;
    const diffDirPositive = `${diffDir}positive/`;
    const diffDirNegative = `${diffDir}negative/`;

    const baselinePath = `${baselineDir}${this.filename}`;
    const resultPathPositive = `${resultDirPositive}${this.filename}`;
    
    // Ensure directories exist
    fs.ensureDirSync(baselineDir);
    fs.ensureDirSync(diffDirPositive);
    fs.ensureDirSync(resultDirPositive);

    // Validate that the screenshot file exists before comparison
    validateFileExists(resultPathPositive, 'screenshot result');
    
    // Validate it's a valid image file
    if (!isValidImageFile(resultPathPositive)) {
      throw new Error(`Visual Validation: Screenshot file appears to be corrupted or invalid: ${resultPathPositive}`);
    }

    // Create baseline if it doesn't exist
    if (!fs.existsSync(baselinePath)) {
      // Only log to console, don't clutter Cucumber report
      console.info(`Baseline image created: ${baselinePath}`);
      try {
        const screenshotData = fs.readFileSync(resultPathPositive);
        fs.writeFileSync(baselinePath, screenshotData);
        // Validate baseline was created successfully
        validateFileExists(baselinePath, 'baseline');
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        throw new Error(`Visual Validation: Failed to create baseline image: ${errorMessage}`);
      }
    } else {
      // Validate existing baseline file
      validateFileExists(baselinePath, 'baseline');
      if (!isValidImageFile(baselinePath)) {
        throw new Error(`Visual Validation: Baseline image appears to be corrupted: ${baselinePath}`);
      }
    }

    resemble.outputSettings(resembleConfig);

    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Image comparison timed out after ${MAX_RESULT_WAIT_TIME}ms for ${this.filename}`));
        }, MAX_RESULT_WAIT_TIME);

        resemble(baselinePath)
          .compareTo(resultPathPositive)
          .ignoreAntialiasing()
          .ignoreColors()
          .onComplete(async (res) => {
            clearTimeout(timeout);
            try {
              this.result = await res;
              await this.valueMethod(this.result, this.filename, resultDirNegative, resultDirPositive, diffDirNegative, diffDirPositive);
              await this.passMethod(this.result, this.filename, baselineDir, resultDirNegative, diffFile, this.value);
              resolve();
            } catch (err) {
              const errorMessage = extractErrorMessage(err);
              // log to console, don't clutter report
              console.error('Image comparison failure:', errorMessage);
              errors.push({ error: err, message: errorMessage });
              reject(err);
            }
          });
      });
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      console.error(`Error initiating image comparison: ${errorMessage}`);
      errors.push({ error: err, message: errorMessage });
    }
  }

  /**
   * Process comparison result and generate diff images
   * @param {Object} result - Comparison result from resemble
   * @param {string} filename - Image filename
   * @param {string} resultDirNegative - Directory for negative results
   * @param {string} resultDirPositive - Directory for positive results
   * @param {string} diffDirNegative - Directory for negative diff images
   * @param {string} diffDirPositive - Directory for positive diff images
   * @returns {Promise<void>}
   * @throws {Error} If result processing fails
   */
  async valueMethod(result, filename, resultDirNegative, resultDirPositive, diffDirNegative, diffDirPositive) {
    const resultPathNegative = `${resultDirNegative}${filename}`;
    const resultPathPositive = `${resultDirPositive}${filename}`;
    
    // Wait for result with timeout to prevent infinite loops
    let waitTime = 0;
    while (typeof result === 'undefined' && waitTime < MAX_RESULT_WAIT_TIME) {
      await browser.pause(DELAY_100ms);
      waitTime += DELAY_100ms;
    }
    
    if (typeof result === 'undefined') {
      throw new Error(`Visual Validation: Result was undefined after waiting ${MAX_RESULT_WAIT_TIME}ms for ${filename}`);
    }
    
    // Validate result object structure
    if (!result || typeof result.misMatchPercentage === 'undefined') {
      throw new Error(`Visual Validation: Invalid comparison result for ${filename}`);
    }
    
    const error = parseFloat(result.misMatchPercentage);
    if (isNaN(error)) {
      throw new Error(`Visual Validation: Invalid mismatch percentage for ${filename}`);
    }
    
    fs.ensureDirSync(diffDirNegative);

    if (error > this.expected) {
      diffFile = `${diffDirNegative}${filename}`;
      try {
        const writeStream = fs.createWriteStream(diffFile);
        await pipeline(result.getDiffImage().pack(), writeStream);
        
        // Validate diff file was created
        validateFileExists(diffFile, 'diff');
        
        fs.ensureDirSync(resultDirNegative);
        if (fs.existsSync(resultPathNegative)) {
          fs.removeSync(resultPathNegative);
        }
        fs.copySync(resultPathPositive, resultPathNegative, false);
        // Validate copy was successful
        validateFileExists(resultPathNegative, 'negative result');
        
        // Only log to console, don't clutter Cucumber report
        console.info(`Diff image created: ${diffFile}`);
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        console.error(`WriteStream error for ${diffFile}: ${errorMessage}`);
        throw new Error(`Visual Validation: Failed to write diff image: ${errorMessage}`);
      }
    } else {
      diffFile = `${diffDirPositive}${filename}`;
      try {
        const writeStream = fs.createWriteStream(diffFile);
        await pipeline(result.getDiffImage().pack(), writeStream);
        // Validate diff file was created (optional for positive diffs)
        if (fs.existsSync(diffFile)) {
          validateFileExists(diffFile, 'positive diff');
        }
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        console.error(`WriteStream error for ${diffFile}: ${errorMessage}`);
        // Don't throw for positive diffs, just log
      }
    }
  }

  /**
   * Evaluate comparison result and handle pass/fail logic
   * @param {Object} result - Comparison result from resemble
   * @param {string} filename - Image filename
   * @param {string} baselineDir - Baseline directory path
   * @param {string} resultDirNegative - Directory for negative results
   * @param {string} diffFile - Path to diff image file
   * @param {number} value - Mismatch percentage value
   * @returns {Promise<void>}
   */
  async passMethod(result, filename, baselineDir, resultDirNegative, diffFile, value) {
    value = parseFloat(result.misMatchPercentage);
    this.message = `image Match Failed for ${filename} with a tolerance difference of ${value - this.expected} - expected: ${this.expected} but got: ${value}`;
    const baselinePath = `${baselineDir}${filename}`;
    const resultPathNegative = `${resultDirNegative}${filename}`;
    const pass = value <= this.expected;

    if (pass) {
      console.info(`Image match passed: ${filename} with ${value}% difference`);
    } else {
      console.error(`Image match failed: ${this.message}`);
    }

    const baselineImageUpdate = global.baselineImageUpdate;
    if (!pass && baselineImageUpdate === true) {
      console.info(
        `${this.message}   images at:\n` +
        `   Baseline: ${baselinePath}\n` +
        `   Result: ${resultPathNegative}\n` +
        `    cp ${resultPathNegative} ${baselinePath}`
      );
      try {
        // Validate source file exists before copying
        validateFileExists(resultPathNegative, 'result');
        fs.copySync(resultPathNegative, baselinePath);
        // Validate copy was successful
        validateFileExists(baselinePath, 'updated baseline');
        console.info(`Baseline images updated from: ${resultPathNegative}`);
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        console.error(`Baseline images update failed: ${errorMessage}`);
        errors.push({ error: err, message: errorMessage });
      }
    } else if (!pass) {
      console.info(`Test failed: ${this.message}`);
      console.info(`Baseline: ${baselinePath}`);
      console.info(`Result: ${resultPathNegative}`);
      console.info(`Diff: ${diffFile}`);
      errors.push({ error: 'Image comparison failed', message: this.message });
    }
  }

  /**
   * Finalize test run and throw collected errors if any
   * Should be called at the end of each test to report all failures
   * @static
   * @returns {void}
   * @throws {Error} If there are collected errors
   */
  static finalizeTest() {
    if (errors.length > 0) {
      throwCollectedErrors();
      console.error('Test run completed with failures');
    } else {
      console.log('Test run completed successfully');
    }
  }
}

/**
 * Take a screenshot of the page or element
 * @param {string} filename - Name of the screenshot file
 * @param {string|null} elementSnapshot - CSS selector for element screenshot (optional)
 * @param {string|null} elementsToHide - CSS selectors of elements to hide (optional)
 * @returns {Promise<void>}
 * @throws {Error} If screenshot fails or validation fails
 */
async function takePageImage(filename, elementSnapshot = null, elementsToHide = null) {
  validateFrameworkGlobals();
  
  // Input validation
  if (!filename || typeof filename !== 'string' || filename.trim() === '') {
    throw new Error('Visual Validation: filename is required and must be a non-empty string');
  }
  
  const envName = env.envName.toLowerCase();
  const paths = getDirectoryPaths(envName);
  const resultDir = paths.resultDir;
  const resultDirPositive = `${resultDir}positive/`;

  if (elementsToHide) {
    await hideElements(elementsToHide);
  }

  fs.ensureDirSync(resultDirPositive);
  const resultPathPositive = `${resultDirPositive}${filename}`;

  try {
    // Use the new mode-aware screenshot function
    await takeScreenshotImage(resultPathPositive, elementSnapshot);
    
    // Final validation that screenshot was created and is valid
    validateFileExists(resultPathPositive, 'screenshot');
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    console.error(`Failed to take screenshot: ${errorMessage}`);
    throw error;
  }

  if (elementsToHide) {
    await showElements(elementsToHide);
  }
  console.info(`Screenshot saved: ${resultPathPositive}`);
}

async function timeoutErrormsg(err) {
  validateFrameworkGlobals();
  await browser.pause(DELAY_500ms);
  if (err) {
    const errorMessage = extractErrorMessage(err);
    console.error(errorMessage);
  }
}

/**
 * Hide elements on the page by setting opacity to 0
 * Useful for hiding dynamic content like timestamps, user info, etc.
 * @param {string|string[]} selectors - CSS selectors to hide (can be string or array)
 * @returns {Promise<void>}
 * @throws {Error} If framework globals are not available
 * @example
 * await hideElements('.timestamp, .user-info');
 * await hideElements(['.header', '.footer']);
 */
async function hideElements(selectors) {
  validateFrameworkGlobals();
  
  if (!selectors) return;
  
  // if arg is not an array make it one
  const selectorArray = typeof selectors === 'string' ? [selectors] : selectors;
  
  if (!Array.isArray(selectorArray)) {
    throw new Error('Visual Validation: selectors must be a string or array of strings');
  }
  
  for (let i = 0; i < selectorArray.length; i++) {
    if (typeof selectorArray[i] !== 'string') {
      console.warn(`Visual Validation: Skipping invalid selector at index ${i}: ${selectorArray[i]}`);
      continue;
    }
    
    // Basic sanitization - escape single quotes to prevent injection
    const sanitizedSelector = selectorArray[i].replace(/'/g, "\\'");
    const script = `document.querySelectorAll('${sanitizedSelector}').forEach(element => element.style.opacity = '0')`;
    await browser.execute(script);
  }
}

/**
 * Show elements on the page by setting opacity to 1
 * Restores elements that were previously hidden
 * @param {string|string[]} selectors - CSS selectors to show (can be string or array)
 * @returns {Promise<void>}
 * @throws {Error} If framework globals are not available
 * @example
 * await showElements('.timestamp, .user-info');
 * await showElements(['.header', '.footer']);
 */
async function showElements(selectors) {
  validateFrameworkGlobals();
  
  if (!selectors) return;
  
  // if arg is not an array make it one
  const selectorArray = typeof selectors === 'string' ? [selectors] : selectors;
  
  if (!Array.isArray(selectorArray)) {
    throw new Error('Visual Validation: selectors must be a string or array of strings');
  }
  
  for (let i = 0; i < selectorArray.length; i++) {
    if (typeof selectorArray[i] !== 'string') {
      console.warn(`Visual Validation: Skipping invalid selector at index ${i}: ${selectorArray[i]}`);
      continue;
    }
    
    // Basic sanitization - escape single quotes to prevent injection
    const sanitizedSelector = selectorArray[i].replace(/'/g, "\\'");
    const script = `document.querySelectorAll('${sanitizedSelector}').forEach(element => element.style.opacity = '1')`;
    await browser.execute(script);
  }
}

module.exports = {
  takePageImage,
  ImageAssertion,
  clearErrors,
  startNewTestRun,
  shouldStartNewTestRun
};
