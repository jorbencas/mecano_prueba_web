const React = require('react');

const motion = {
  div: React.forwardRef(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )),
  span: React.forwardRef(({ children, ...props }, ref) => (
    <span ref={ref} {...props}>
      {children}
    </span>
  )),
  button: React.forwardRef(({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  )),
  p: React.forwardRef(({ children, ...props }, ref) => (
    <p ref={ref} {...props}>
      {children}
    </p>
  )),
  h1: React.forwardRef(({ children, ...props }, ref) => (
    <h1 ref={ref} {...props}>
      {children}
    </h1>
  )),
  h2: React.forwardRef(({ children, ...props }, ref) => (
    <h2 ref={ref} {...props}>
      {children}
    </h2>
  )),
  // Add other elements as needed
};

const AnimatePresence = ({ children }) => <>{children}</>;

const useAnimation = () => ({
  start: jest.fn(),
  set: jest.fn(),
  stop: jest.fn(),
});

module.exports = {
  motion,
  AnimatePresence,
  useAnimation,
};
