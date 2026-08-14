// src/components/MarkdownRenderer.jsx

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles
          h1: ({ children }) => (
            <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h4 className="text-md font-semibold text-gray-800 mt-3 mb-1">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 className="text-sm font-semibold text-gray-800 mt-2 mb-1">
              {children}
            </h5>
          ),
          // Customize paragraph styles
          p: ({ children }) => (
            <p className="text-sm text-gray-700 mb-2 leading-relaxed">
              {children}
            </p>
          ),
          // Customize list styles
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-gray-700">{children}</li>
          ),
          // Customize bold text
          strong: ({ children }) => (
            <strong className="font-semibold" style={{ color: "#056db3" }}>
              {children}
            </strong>
          ),
          // Customize blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#056db3] pl-4 py-1 my-2 bg-blue-50/50 rounded-r">
              {children}
            </blockquote>
          ),
          // Customize code
          code: ({ children }) => (
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">
              {children}
            </code>
          ),
          // Customize horizontal rules
          hr: () => <hr className="my-4 border-gray-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
