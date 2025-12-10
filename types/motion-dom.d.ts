// Temporary local stub for motion-dom to avoid broken upstream declarations
// Keeps TypeScript from parsing the damaged `node_modules/motion-dom/dist/index.d.ts`.
declare module 'motion-dom' {
  const anyExport: any;
  export default anyExport;
  export * from 'any';
}
