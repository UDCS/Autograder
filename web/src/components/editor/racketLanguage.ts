import type { Monaco } from "@monaco-editor/react";

// Monaco ships a `scheme` language but no `racket`. This registers a Racket
// language (Monarch tokenizer + bracket config) so editors can highlight it.
// Safe to call on every editor mount — it only registers once.
export const RACKET_LANG_ID = "racket";

let registered = false;

export function registerRacket(monaco: Monaco) {
    if (registered) return;
    if (monaco.languages.getLanguages().some((l: { id: string }) => l.id === RACKET_LANG_ID)) {
        registered = true;
        return;
    }

    monaco.languages.register({ id: RACKET_LANG_ID });

    monaco.languages.setLanguageConfiguration(RACKET_LANG_ID, {
        comments: {
            lineComment: ";",
            blockComment: ["#|", "|#"],
        },
        brackets: [
            ["(", ")"],
            ["[", "]"],
            ["{", "}"],
        ],
        autoClosingPairs: [
            { open: "(", close: ")" },
            { open: "[", close: "]" },
            { open: "{", close: "}" },
            { open: '"', close: '"' },
        ],
        surroundingPairs: [
            { open: "(", close: ")" },
            { open: "[", close: "]" },
            { open: "{", close: "}" },
            { open: '"', close: '"' },
        ],
    });

    const keywords = [
        "define", "define-values", "define-syntax", "define-struct", "struct",
        "lambda", "λ", "let", "let*", "letrec", "let-values", "let*-values",
        "if", "cond", "case", "when", "unless", "and", "or", "not", "else",
        "begin", "begin0", "set!", "quote", "quasiquote", "unquote",
        "for", "for*", "for/list", "for/fold", "for/sum", "for/and", "for/or",
        "do", "delay", "force", "require", "provide", "module", "module+",
        "parameterize", "with-handlers", "match", "match-lambda", "match-let",
        "values", "call-with-values", "call/cc", "dynamic-wind", "error",
    ];

    monaco.languages.setMonarchTokensProvider(RACKET_LANG_ID, {
        defaultToken: "",
        keywords,
        brackets: [
            { open: "(", close: ")", token: "delimiter.parenthesis" },
            { open: "[", close: "]", token: "delimiter.square" },
            { open: "{", close: "}", token: "delimiter.curly" },
        ],
        tokenizer: {
            root: [
                // #lang line
                [/^#lang\s+[\w/.-]+/, "keyword.directive"],
                // block comment
                [/#\|/, "comment", "@blockComment"],
                // datum comment
                [/#;/, "comment"],
                // line comment
                [/;.*$/, "comment"],
                // strings
                [/"/, "string", "@string"],
                // characters: #\a #\newline #\space
                [/#\\(?:[a-zA-Z]+|.)/, "string.escape"],
                // booleans
                [/#[tf]\b/, "constant.language.boolean"],
                [/#true\b|#false\b/, "constant.language.boolean"],
                // numbers (ints, rationals, floats, scientific)
                [/[+-]?\d+\/\d+/, "number"],
                [/[+-]?\d+\.\d*(?:[eE][+-]?\d+)?/, "number.float"],
                [/[+-]?\.\d+(?:[eE][+-]?\d+)?/, "number.float"],
                [/[+-]?\d+(?:[eE][+-]?\d+)?/, "number"],
                // brackets
                [/[()\[\]{}]/, "@brackets"],
                // quote sugar
                [/['`,]/, "operator"],
                // identifiers / keywords
                [/[a-zA-Z_!$%&*+\-./:<=>?@^~][\w!$%&*+\-./:<=>?@^~]*/, {
                    cases: {
                        "@keywords": "keyword",
                        "@default": "identifier",
                    },
                }],
            ],
            blockComment: [
                [/[^#|]+/, "comment"],
                [/#\|/, "comment", "@push"],
                [/\|#/, "comment", "@pop"],
                [/[#|]/, "comment"],
            ],
            string: [
                [/[^\\"]+/, "string"],
                [/\\./, "string.escape"],
                [/"/, "string", "@pop"],
            ],
        },
    });

    registered = true;
}
