import { File } from "../models/testcases";

export function getLanguageFromSuffix(ext: string): string {
  const map: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    html: "html",
    css: "css",
    json: "json",
    sh: "shell",
    go: "go",
    php: "php",
    rb: "ruby",
    rs: "rust",
    kt: "kotlin",
    swift: "swift",
    sql: "sql",
  };
  return map[ext.toLowerCase()] || "plaintext";
}

export function fileName(file: File) {
  return `${file.name}.${file.suffix}`;
}
export function parseFileName(fileName: string) {
  const parts = fileName.split(".");
  const extension = parts.pop();
  const baseName = parts.join(".");
  return {
    name: baseName!,
    suffix: extension!
  }
}