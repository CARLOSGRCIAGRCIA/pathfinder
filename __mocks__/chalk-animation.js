const mockAnimation = () => ({
  start: jest.fn(),
  stop: jest.fn(),
  pulse: jest.fn(),
  rainbow: jest.fn(() => mockAnimation()),
});

export default {
  rainbow: mockAnimation,
  pulse: mockAnimation,
  glitch: mockAnimation,
  radar: mockAnimation,
  Karam: mockAnimation,
  neon: mockAnimation,
};