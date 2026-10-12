jest.mock('../src/imageCompare', () => ({
  takePageImage: jest.fn().mockResolvedValue(undefined),
  ImageAssertion: jest.fn().mockImplementation(() => ({
    run: jest.fn().mockResolvedValue(undefined),
  })),
  clearErrors: jest.fn(),
  startNewTestRun: jest.fn(),
  shouldStartNewTestRun: jest.fn(),
}));

const imageCompare = require('../src/imageCompare');
const { compareImage, takeImage } = require('../utils/common');

describe('compareImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('compares a page image with the default tolerance', async () => {
    await compareImage('home.png');

    expect(imageCompare.ImageAssertion).toHaveBeenCalledWith('home.png', 0.2, null, null);
    const assertion = imageCompare.ImageAssertion.mock.results[0].value;
    expect(assertion.run).toHaveBeenCalledTimes(1);
  });
});

describe('takeImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.browser = { pause: jest.fn().mockResolvedValue(undefined) };
    imageCompare.shouldStartNewTestRun.mockReturnValue(false);
  });

  test('starts a fresh run when no comparison errors are stored', async () => {
    imageCompare.shouldStartNewTestRun.mockReturnValue(true);

    await takeImage('home.png', null, '', false, false, 0.2, 0);

    expect(imageCompare.startNewTestRun).toHaveBeenCalledTimes(1);
    expect(imageCompare.takePageImage).toHaveBeenCalledWith('home.png', null, '', false);
    expect(imageCompare.ImageAssertion).not.toHaveBeenCalled();
    expect(global.browser.pause).not.toHaveBeenCalled();
  });

  test('waits, captures, then compares using the given tolerance', async () => {
    await takeImage('card.png', '#card', '.cookie', true, true, 1.5, 250);

    expect(global.browser.pause).toHaveBeenCalledWith(250);
    expect(imageCompare.takePageImage).toHaveBeenCalledWith('card.png', '#card', '.cookie', true);
    expect(imageCompare.ImageAssertion).toHaveBeenCalledWith('card.png', 1.5, null, null);
    const assertion = imageCompare.ImageAssertion.mock.results[0].value;
    expect(assertion.run).toHaveBeenCalledTimes(1);
  });
});
