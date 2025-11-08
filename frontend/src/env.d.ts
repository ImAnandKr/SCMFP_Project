/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string; // 👈 Add all your VITE_ variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
