declare module "react" {
  export type ReactNode = unknown;

  export function useState<T>(
    initialState: T,
  ): [T, (value: T | ((current: T) => T)) => void];

  const React: {
    StrictMode: (props: { children?: unknown }) => unknown;
  };

  export default React;
}

declare module "react-dom/client" {
  export function createRoot(element: Element): {
    render(node: unknown): void;
  };
}

declare module "react/jsx-runtime" {
  export function jsx(type: unknown, props: unknown, key?: unknown): unknown;
  export function jsxs(type: unknown, props: unknown, key?: unknown): unknown;
}

declare module "*.css";

declare namespace JSX {
  type Element = unknown;

  interface IntrinsicElements {
    [elementName: string]: unknown;
  }
}
