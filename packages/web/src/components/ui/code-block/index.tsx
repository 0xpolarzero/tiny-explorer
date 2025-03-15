"use client";

import type React from "react";
import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronUp, File, FileDiff, TerminalSquare } from "lucide-react";
import { Highlight } from "prism-react-renderer";
import Prism from "prismjs";
import { twMerge } from "tailwind-merge";

import { Button } from "@/components/ui/button";

import CodeBlockActions from "./actions";
import CodeBlockLanguageLogo from "./language-logo";
import {
  codeBlockContainerVariants,
  codeBlockHeaderFileNameContainerStyles,
  codeBlockHeaderFileNameIconStyles,
  codeBlockHeaderFileNameStyles,
  codeBlockHeaderStyles,
  codeBlockLineHighlightedStyles,
  codeBlockLineNumberStyles,
  codeBlockLineVariants,
  codeBlockPreVariants,
  codeBlockStyles,
  collapseButtonStyles,
} from "./styles";
import { theme } from "./theme";
import type { CodeBlockProps } from "./types";

// // Add support for additional languages.
// (typeof global === "undefined" ? window : global).Prism = Prism;
// require("prismjs/components/prism-javascript");
// require("prismjs/components/prism-typescript");
// require("prismjs/components/prism-jsx");
// require("prismjs/components/prism-tsx");
// require("prismjs/components/prism-solidity");
// require("prismjs/components/prism-python");
// require("prismjs/components/prism-bash");
// require("prismjs/components/prism-diff");

const CodeBlock: React.FC<CodeBlockProps> = ({
  className,
  fileName,
  language = "none",
  logo,
  switcher,
  highlightLines = [],
  breakLines = false,
  showLineNumbers = true,
  collapsible = false,
  defaultCollapsed = false,
  roundedTop = true,
  containerized = true,
  containerProps,
  children,
  ...rest
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsible && defaultCollapsed);
  const hasHeader = fileName !== undefined;

  const Icon = logo
    ? logo
    : language === "javascript" || language === "js"
      ? CodeBlockLanguageLogo.JavaScript
      : language === "typescript" || language === "ts"
        ? CodeBlockLanguageLogo.TypeScript
        : language === "jsx"
          ? CodeBlockLanguageLogo.React
          : language === "tsx"
            ? CodeBlockLanguageLogo.React
            : language === "solidity" || language === "sol"
              ? CodeBlockLanguageLogo.Solidity
              : language === "python" || language === "py"
                ? CodeBlockLanguageLogo.Python
                : language === "bash" || language === "sh"
                  ? TerminalSquare
                  : language === "diff"
                    ? FileDiff
                    : File;

  const { ref: containerRef, ...containerRest } = containerProps ?? {};

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const CollapseButton = () => (
    <Button
      onClick={toggleCollapse}
      className={collapseButtonStyles}
      variant="ghost"
      size="icon"
      aria-label={isCollapsed ? "Expand code" : "Collapse code"}
      title={isCollapsed ? "Expand code" : "Collapse code"}
    >
      {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
    </Button>
  );

  return (
    <div
      className={twMerge(clsx(codeBlockContainerVariants({ roundedTop, containerized }), className))}
      code-block-container=""
      tabIndex={-1}
      ref={containerRef}
      {...containerRest}
    >
      {hasHeader ? (
        <div
          className={clsx(codeBlockHeaderStyles, collapsible && "hover:bg-muted/20 cursor-pointer transition-colors")}
          code-block-header=""
          onClick={toggleCollapse}
        >
          <div className={codeBlockHeaderFileNameContainerStyles}>
            <Icon className={codeBlockHeaderFileNameIconStyles} />
            <div className={codeBlockHeaderFileNameStyles}>{fileName}</div>
          </div>
          <div className="flex items-center gap-2">
            {!collapsible || (collapsible && !isCollapsed) ? (
              <CodeBlockActions code={children} switcher={switcher} inHeader />
            ) : null}
            {collapsible && <CollapseButton />}
          </div>
        </div>
      ) : collapsible ? (
        <div className="flex justify-end p-2">
          <CollapseButton />
        </div>
      ) : null}

      <div
        className={clsx(
          "transition-all",
          isCollapsed ? "max-h-0 opacity-0 duration-200 ease-out" : "max-h-[5000px] opacity-100 duration-300 ease-in",
        )}
      >
        <Highlight prism={Prism} theme={theme} code={children} language={language}>
          {({ tokens, getLineProps, getTokenProps }) => (
            // crop blank space
            <div className="relative -mb-4">
              <pre
                className={codeBlockPreVariants({ hasHeader: hasHeader || !roundedTop || collapsible, breakLines })}
                {...rest}
                code-block-pre=""
              >
                <code className={clsx(codeBlockStyles)}>
                  {tokens.map((line, i) => {
                    const { className, ...restLineProps } = getLineProps({ line });

                    return (
                      <div
                        key={i}
                        className={clsx(
                          codeBlockLineVariants({ breakLines }),
                          highlightLines.includes(i + 1) ? codeBlockLineHighlightedStyles : "",
                          className,
                        )}
                        {...restLineProps}
                        code-block-line=""
                      >
                        {showLineNumbers ? (
                          <div className={codeBlockLineNumberStyles} code-block-line-number="">
                            {i + 1}
                          </div>
                        ) : null}
                        <span className="grow">
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} code-block-token="" />
                          ))}
                        </span>
                      </div>
                    );
                  })}
                  {!hasHeader && !collapsible ? <CodeBlockActions code={children} switcher={switcher} /> : null}
                </code>
              </pre>
            </div>
          )}
        </Highlight>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

CodeBlock.displayName = "CodeBlock";

export default CodeBlock;
