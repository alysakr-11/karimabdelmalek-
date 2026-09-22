/**
 * Ambient declarations for non-TypeScript imports.
 *
 * TypeScript 6 checks side-effect imports against a module declaration, and
 * Next's generated `next-env.d.ts` does not supply one for stylesheets, so the
 * global stylesheet import in `app/layout.tsx` needs this.
 */
declare module '*.css';
declare module '*.svg' {
  const content: string;
  export default content;
}
