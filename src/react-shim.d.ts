declare module 'react' {
  export type ReactNode = any
  export type ReactElement = any

  export function lazy(loader: () => Promise<{ default: any }>): any
  export function Suspense(props: { fallback?: any; children?: any }): any
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void

  const React: any
  export default React
}

declare module 'react/jsx-runtime' {
  export const Fragment: any
  export function jsx(type: any, props: any, key?: any): any
  export function jsxs(type: any, props: any, key?: any): any
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: any
  }
}
