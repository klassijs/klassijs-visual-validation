const { Readable, Writable } = require('stream');
const fs = require('fs-extra');

const pngBytes = Buffer.from('89504e470d0a1a0a', 'hex');

jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('fs-extra', () => {
  const { Writable } = require('stream');
  return {
    ensureDirSync: jest.fn(),
    existsSync: jest.fn(() => true),
    writeFileSync: jest.fn(),
    readFileSync: jest.fn(() => Buffer.from('89504e470d0a1a0a', 'hex')),
    statSync: jest.fn(() => ({ isFile: () => true, size: 8 })),
    createWriteStream: jest.fn(() => new Writable({
      write(chunk, encoding, callback) {
        callback();
      },
    })),
    removeSync: jest.fn(),
    copySync: jest.fn(),
    copy: jest.fn(),
  };
});
jest.mock('klassijs-resembleJs', () => {
  const { Readable } = require('stream');
  const diffImage = { pack: () => Readable.from([Buffer.from('diff')]) };
  const resemble = jest.fn(() => ({
    compareTo() { return this; },
    ignoreAntialiasing() { return this; },
    ignoreColors() { return this; },
    onComplete(callback) {
      resemble.pending = Promise.resolve(callback(resemble.result));
      return resemble.pending;
    },
  }));
  resemble.outputSettings = jest.fn();
  resemble.result = {
    misMatchPercentage: '0',
    getDiffImage: () => diffImage,
  };
  return resemble;
});

global.BROWSER_NAME = 'chrome';
global.cucumberThis = null;
global.env = { envName: 'Test' };

const resemble = require('klassijs-resembleJs');
const {
  takePageImage,
  ImageAssertion,
  clearErrors,
  startNewTestRun,
  shouldStartNewTestRun,
} = require('../src/imageCompare');

describe('error run state', () => {
  beforeEach(() => {
    clearErrors();
  });

  test('starts empty and resets after a new run', () => {
    expect(shouldStartNewTestRun()).toBe(true);
    startNewTestRun();
    expect(shouldStartNewTestRun()).toBe(true);
  });
});

describe('takePageImage', () => {
  const saveScreenshot = jest.fn().mockResolvedValue(undefined);
  const elementScreenshot = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    global.browser = {
      pause: jest.fn().mockResolvedValue(undefined),
      saveScreenshot,
      execute: jest.fn().mockResolvedValue(undefined),
      $: jest.fn().mockResolvedValue({ saveScreenshot: elementScreenshot }),
    };
  });

  test('hides selectors, saves a page screenshot, then shows them again', async () => {
    await takePageImage('home.png', null, ['.banner', '.ads'], true);

    expect(global.browser.execute).toHaveBeenNthCalledWith(
      1,
      "document.querySelectorAll('.banner').forEach(element => element.style.opacity = '0')"
    );
    expect(global.browser.execute).toHaveBeenNthCalledWith(
      2,
      "document.querySelectorAll('.ads').forEach(element => element.style.opacity = '0')"
    );
    expect(saveScreenshot).toHaveBeenCalledWith(
      './artifacts/visual-regression/original/chrome/test/positive/home.png'
    );
    expect(global.browser.execute).toHaveBeenLastCalledWith(
      "document.querySelectorAll('.ads').forEach(element => element.style.opacity = '1')"
    );
  });

  test('saves an element screenshot when a selector is given', async () => {
    await takePageImage('card.png', '#card');

    expect(global.browser.$).toHaveBeenCalledWith('#card');
    expect(elementScreenshot).toHaveBeenCalledWith(
      './artifacts/visual-regression/original/chrome/test/positive/card.png'
    );
  });

  test('wraps screenshot failures', async () => {
    saveScreenshot.mockRejectedValueOnce(new Error('driver down'));

    await expect(takePageImage('home.png')).rejects.toThrow('Unable to take screenshot: driver down');
  });
});

describe('ImageAssertion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearErrors();
    global.baselineImageUpdate = false;
    global.browser = { pause: jest.fn().mockResolvedValue(undefined) };
    fs.existsSync.mockImplementation(() => true);
  });

  test('copies the captured image when no baseline exists and the match passes', async () => {
    let baselineSeen = false;
    fs.existsSync.mockImplementation((filePath) => {
      if (String(filePath).includes('visual-regression-baseline')) {
        const exists = baselineSeen;
        baselineSeen = true;
        return exists;
      }
      return true;
    });
    resemble.result = {
      misMatchPercentage: '0.10',
      getDiffImage: () => ({ pack: () => Readable.from([Buffer.from('diff')]) }),
    };
    const assertion = new ImageAssertion('home.png', 0.2, null, null);

    await assertion.run();
    await resemble.pending;

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './visual-regression-baseline/chrome/test/home.png',
      pngBytes
    );
    expect(shouldStartNewTestRun()).toBe(true);
    expect(() => ImageAssertion.finalizeTest()).not.toThrow();
  });

  test('records a mismatch and finalizeTest throws the collected message', async () => {
    resemble.result = {
      misMatchPercentage: '1.50',
      getDiffImage: () => ({ pack: () => Readable.from([Buffer.from('diff')]) }),
    };
    const assertion = new ImageAssertion('home.png', 0.2, null, null);

    await assertion.run();
    await resemble.pending;

    expect(fs.copySync).toHaveBeenCalledWith(
      './artifacts/visual-regression/original/chrome/test/positive/home.png',
      './artifacts/visual-regression/original/chrome/test/negative/home.png',
      false
    );
    expect(shouldStartNewTestRun()).toBe(false);
    expect(() => ImageAssertion.finalizeTest()).toThrow(
      /image Match Failed for home\.png with a tolerance difference of 1\.3/
    );
    expect(shouldStartNewTestRun()).toBe(true);
  });
});
