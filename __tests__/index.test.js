jest.mock('../utils/common', () => ({
  takeImage: jest.fn(),
  compareImage: jest.fn(),
  ImageAssertion: class ImageAssertion {},
  clearErrors: jest.fn(),
  startNewTestRun: jest.fn(),
}));

const api = require('../index');
const common = require('../utils/common');

describe('public API', () => {
  test('re-exports the visual validation helpers', () => {
    expect(api.takeImage).toBe(common.takeImage);
    expect(api.compareImage).toBe(common.compareImage);
    expect(api.ImageAssertion).toBe(common.ImageAssertion);
    expect(api.clearErrors).toBe(common.clearErrors);
    expect(api.startNewTestRun).toBe(common.startNewTestRun);
  });
});
