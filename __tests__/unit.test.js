
require('dotenv').config();
const fs = require('fs-extra');
const resemble = require('klassijs-resembleJs');
const { ASB } = require('klassijs-getsetter');
const { ImageAssertion, takePageImage } = require('../src/imageCompare');

jest.mock('fs-extra');
jest.mock('klassijs-resembleJs');
jest.mock('klassijs-getsetter');

// describe('ImageAssertion', () => {
//   let imageAssertion;
//
//   beforeEach(() => {
//     imageAssertion = new ImageAssertion('test.png', 0.1, null, 0);
//     process.env.ENV_NAME = 'test_env';
//     process.env.envName = 'test_env';
//     ASB.get = jest.fn().mockReturnValue('test_browser');
//
//     valueMethodSpy = jest.spyOn(imageAssertion, 'valueMethod').mockImplementation(() => {
//       console.log('valueMethod called');
//     });
//     passMethodSpy = jest.spyOn(imageAssertion, 'passMethod').mockImplementation(() => {
//       console.log('passMethod called');
//     });
//   });
//
//   test('should create baseline image if it does not exist', async () => {
//     fs.existsSync.mockReturnValue(false);
//     fs.readFileSync.mockReturnValue('image data');
//     fs.writeFileSync.mockImplementation(() => {});
//
//     await imageAssertion.run();
//
//     expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('baseline'), 'image data');
//   });

  // test('should compare images and call valueMethod and passMethod', async () => {
  //   fs.existsSync.mockReturnValue(true);
  //   resemble.mockReturnValue({
  //     compareTo: jest.fn().mockReturnThis(),
  //     ignoreAntialiasing: jest.fn().mockReturnThis(),
  //     ignoreColors: jest.fn().mockReturnThis(),
  //     onComplete: jest.fn().mockImplementation((callback) => {
  //       callback({ misMatchPercentage: '0.05' }); // Ensure this value triggers passMethod
  //     }),
  //   });
  //
  //   await imageAssertion.run();
  //
  //   // Ensure the onComplete callback is called
  //   expect(resemble().compareTo().ignoreAntialiasing().ignoreColors().onComplete).toHaveBeenCalled();
  //
  //   expect(valueMethodSpy).toHaveBeenCalled();
  //   expect(passMethodSpy).toHaveBeenCalled();
  // });
// });

describe('takePageImage', () => {
  beforeEach(() => {
    process.env.ENV_NAME = 'test_env';
    process.env.envName = 'test_env';
    ASB.get = jest.fn().mockReturnValue('test_browser');
  });

  test('should save screenshot of the page', async () => {
    const browser = {
      saveScreenshot: jest.fn().mockImplementation((path, callback) => callback(null)),
    };
    global.browser = browser;

    await takePageImage('test.png');

    expect(browser.saveScreenshot).toHaveBeenCalledWith(expect.stringContaining('test.png'), expect.any(Function));
  });

  // test('should save screenshot of an element', async () => {
  //   const element = {
  //     saveScreenshot: jest.fn().mockImplementation((path, callback) => callback(null)),
  //   };
  //   const browser = {
  //     $: jest.fn().mockResolvedValue(element),
  //   };
  //   global.browser = browser;
  //
  //   await takePageImage('test.png', '#element');
  //
  //   expect(browser.$).toHaveBeenCalledWith('#element');
  //   expect(element.saveScreenshot).toHaveBeenCalledWith(expect.stringContaining('test.png'), expect.any(Function));
  // });
});

// require('dotenv').config();
// const fs = require('fs-extra');
// const resemble = require('klassijs-resembleJs');
// const { ASB } = require('klassijs-getsetter');
// const { ImageAssertion, takePageImage } = require('../src/imageCompare');
//
// jest.mock('fs-extra');
// jest.mock('klassijs-resembleJs');
// jest.mock('klassijs-getsetter');
//
// describe('ImageAssertion', () => {
//   let imageAssertion;
//   let valueMethodSpy;
//   let passMethodSpy;
//
//   beforeEach(() => {
//     imageAssertion = new ImageAssertion('test.png', 0.1, null, 0);
//     process.env.ENV_NAME = 'test_env';
//     process.env.envName = 'test_env';
//     ASB.get = jest.fn().mockReturnValue('test_browser');
//
//     valueMethodSpy = jest.spyOn(imageAssertion, 'valueMethod').mockImplementation(() => {
//       console.log('valueMethod spy called');
//     });
//     passMethodSpy = jest.spyOn(imageAssertion, 'passMethod').mockImplementation(() => {
//       console.log('passMethod spy called');
//     });
//   });
//
  // test('should compare images and call valueMethod and passMethod', async () => {
  //   fs.existsSync.mockReturnValue(true);
  //   resemble.mockReturnValue({
  //     compareTo: jest.fn().mockReturnThis(),
  //     ignoreAntialiasing: jest.fn().mockReturnThis(),
  //     ignoreColors: jest.fn().mockReturnThis(),
  //     onComplete: jest.fn().mockImplementation((callback) => {
  //       console.log('onComplete mock called');
  //       callback({
  //         misMatchPercentage: '0.05',
  //         getDiffImage: jest.fn().mockReturnValue('diffImage')
  //       }); // Ensure this value triggers passMethod
  //     }),
  //   });
  //
  //   await imageAssertion.run();
  //
  //   // Ensure the onComplete callback is called
  //   expect(resemble().compareTo().ignoreAntialiasing().ignoreColors().onComplete).toHaveBeenCalled();
  //
  //   expect(valueMethodSpy).toHaveBeenCalled();
  //   expect(passMethodSpy).toHaveBeenCalled();
  // });
// });
