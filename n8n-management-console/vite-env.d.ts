/// <reference types="vite/client" />

// .env でビルド時に埋め込む環境変数の型定義
interface ImportMetaEnv {
  readonly VITE_COGNITO_ENDPOINT: "inherit" | string;
}
