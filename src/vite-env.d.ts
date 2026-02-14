///<reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_MOBILE_CLIENT_FORM_VARIANT?: 'dialog' | 'bottomsheet';
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
