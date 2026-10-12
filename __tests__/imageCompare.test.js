const fs = require('fs-extra');

jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('fs-extra', () => ({
  ensureDirSync: jest.fn(),
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(() => Buffer.from('png')),
  createWriteStream: jest.fn(() => ({ on: jest.fn() })),
  removeSync: jest.fn(),
  copySync: jest.fn(),
  copy: jest.fn(),
}));
jest.mock('klassijs-resembleJs', () => {
  const diffImage = { pack: () => ({ pipe: jest.fn() }) };
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
      './artifacts/visual-regression/original/chrome/test/positive/home.png',
      { fullPage: true }
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
    fs.existsSync.mockReturnValue(true);
  });

  test('copies the captured image when no baseline exists and the match passes', async () => {
    fs.existsSync.mockReturnValue(false);
    resemble.result = {
      misMatchPercentage: '0.10',
      getDiffImage: () => ({ pack: () => ({ pipe: jest.fn() }) }),
    };
    const assertion = new ImageAssertion('home.png', 0.2, null, null);

    await assertion.run();
    await resemble.pending;

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './visual-regression-baseline/chrome/test/home.png',
      Buffer.from('png')
    );
    expect(shouldStartNewTestRun()).toBe(true);
    expect(() => ImageAssertion.finalizeTest()).not.toThrow();
  });

  test('records a mismatch and finalizeTest throws the collected message', async () => {
    resemble.result = {
      misMatchPercentage: '1.50',
      getDiffImage: () => ({ pack: () => ({ pipe: jest.fn() }) }),
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
