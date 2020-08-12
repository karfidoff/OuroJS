declare module '*.html' {
}

declare module '*.css';

declare module JSX {
  type Element = string;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}