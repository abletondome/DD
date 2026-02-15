import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-invert prose-slate max-w-none">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return isInline ? (
              <code className="bg-slate-800 rounded px-1.5 py-0.5 text-sm font-mono text-blue-300" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto border border-slate-700 my-4 shadow-inner">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-6 border-b border-slate-700 pb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-semibold text-blue-400 mt-8 mb-4">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">{children}</h3>,
          p: ({ children }) => <p className="text-slate-300 leading-relaxed mb-4">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-outside ml-6 space-y-2 mb-4 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside ml-6 space-y-2 mb-4 text-slate-300">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ href, children }) => <a href={href} className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">{children}</a>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-4 bg-slate-800/50 rounded-r italic text-slate-400">{children}</blockquote>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};