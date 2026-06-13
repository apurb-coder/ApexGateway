import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function renderInline(text) {
  if (!text) return '';

  const parts = [];
  let index = 0;
  
  // Matches:
  // 1. Inline code: `code`
  // 2. Bold: **text**
  // 3. Italics: *text*
  // 4. Links: [text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let match;
  let keyIndex = 0;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > index) {
      parts.push(text.substring(index, match.index));
    }
    
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      const code = token.slice(1, -1);
      parts.push(
        <code key={keyIndex++} className="bg-bg-dark border border-border-dark px-1.5 py-0.5 rounded text-[11px] font-mono text-primary-400 font-medium select-all" translate="no">
          {code}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      parts.push(
        <strong key={keyIndex++} className="font-semibold text-white">
          {boldText}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const italicText = token.slice(1, -1);
      parts.push(
        <em key={keyIndex++} className="italic text-gray-300">
          {italicText}
        </em>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];
        parts.push(
          <a 
            key={keyIndex++} 
            href={linkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary-400 hover:text-primary-300 underline font-semibold transition-colors focus-visible:ring-1 focus-visible:ring-primary-500 rounded outline-none"
          >
            {linkText}
          </a>
        );
      } else {
        parts.push(token);
      }
    }
    
    index = regex.lastIndex;
  }
  
  if (index < text.length) {
    parts.push(text.substring(index));
  }
  
  return parts.length > 0 ? parts : text;
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="my-5 border border-border-dark rounded-xl bg-bg-dark/85 overflow-hidden font-mono text-xs shadow-inner relative group">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-dark bg-bg-dark/50 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
        <span translate="no">{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded px-1"
          aria-label="Copy code block"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 lowercase font-sans font-semibold">copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="lowercase font-sans font-semibold">copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-primary-300 leading-relaxed max-h-[400px] scrollbar-thin select-all" translate="no">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TableBlock({ rows }) {
  if (rows.length === 0) return null;
  
  const parsedRows = rows.map(row => {
    const cells = row.split('|').map(c => c.trim());
    if (row.startsWith('|')) cells.shift();
    if (row.endsWith('|')) cells.pop();
    return cells;
  });
  
  const headers = parsedRows[0];
  const bodyRows = parsedRows.slice(1);
  
  return (
    <div className="overflow-x-auto my-6 border border-border-dark rounded-xl scrollbar-thin">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-bg-dark border-b border-border-dark">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-semibold text-white font-display uppercase tracking-wider">
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-dark/50 bg-card-dark/20">
          {bodyRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-bg-dark/40 transition-colors">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-gray-300 leading-relaxed font-sans">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentBlock = null; // 'code' | 'list' | 'table' | 'paragraph' | 'blockquote'
  let blockLines = [];
  let codeLang = '';
  let listType = ''; // 'bullet' | 'number'
  
  const flush = (index) => {
    if (!currentBlock) return;
    
    if (currentBlock === 'code') {
      elements.push(
        <CodeBlock 
          key={`code-${index}`} 
          code={blockLines.join('\n')} 
          lang={codeLang} 
        />
      );
    } else if (currentBlock === 'list') {
      const Tag = listType === 'number' ? 'ol' : 'ul';
      const listClass = listType === 'number' 
        ? 'list-decimal pl-5 space-y-2 mb-4 text-gray-300 text-sm font-sans' 
        : 'list-disc pl-5 space-y-2 mb-4 text-gray-300 text-sm font-sans';
      elements.push(
        <Tag key={`list-${index}`} className={listClass}>
          {blockLines.map((item, itemIdx) => (
            <li key={itemIdx} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </Tag>
      );
    } else if (currentBlock === 'table') {
      elements.push(
        <TableBlock 
          key={`table-${index}`} 
          rows={blockLines} 
        />
      );
    } else if (currentBlock === 'blockquote') {
      elements.push(
        <blockquote key={`quote-${index}`} className="border-l-4 border-primary-500/60 bg-primary-500/5 px-4 py-3 rounded-r-lg my-4 text-gray-400 italic text-sm font-sans">
          {blockLines.map((line, idx) => (
            <p key={idx} className="leading-relaxed">{renderInline(line)}</p>
          ))}
        </blockquote>
      );
    } else if (currentBlock === 'paragraph') {
      const pText = blockLines.join(' ').trim();
      if (pText) {
        elements.push(
          <p key={`p-${index}`} className="text-gray-300 text-sm leading-relaxed mb-4 font-sans">
            {renderInline(pText)}
          </p>
        );
      }
    }
    
    blockLines = [];
    currentBlock = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (currentBlock === 'code') {
        flush(i);
      } else {
        flush(i);
        currentBlock = 'code';
        codeLang = trimmed.substring(3).trim();
      }
      continue;
    }

    if (currentBlock === 'code') {
      blockLines.push(line);
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('>')) {
      if (currentBlock !== 'blockquote') {
        flush(i);
        currentBlock = 'blockquote';
      }
      blockLines.push(trimmed.substring(1).trim());
      continue;
    }

    // Tables
    if (trimmed.startsWith('|')) {
      if (currentBlock !== 'table') {
        flush(i);
        currentBlock = 'table';
      }
      // Skip separator lines like |---|---|
      if (!trimmed.match(/^\|?\s*:?-+:?\s*\|/)) {
        blockLines.push(line);
      }
      continue;
    }

    // Headings
    if (trimmed.startsWith('#')) {
      flush(i);
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const headingStyles = {
          1: 'text-2xl font-extrabold text-white mb-5 mt-6 border-b border-border-dark pb-2 font-display',
          2: 'text-xl font-bold text-white mb-4 mt-6 border-b border-border-dark pb-1.5 font-display',
          3: 'text-lg font-semibold text-white mb-3 mt-5 font-display',
          4: 'text-base font-semibold text-gray-200 mb-2 mt-4 font-display',
          5: 'text-sm font-semibold text-gray-300 mb-2 mt-4 font-display',
          6: 'text-xs font-semibold text-gray-400 mb-2 mt-4 font-display',
        };
        const Tag = `h${level}`;
        elements.push(
          <Tag key={`h-${i}`} className={headingStyles[level] || headingStyles[2]}>
            {renderInline(text)}
          </Tag>
        );
        continue;
      }
    }

    // Lists
    const listMatch = trimmed.match(/^([-*]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const isNum = /^\d+/.test(listMatch[1]);
      const type = isNum ? 'number' : 'bullet';
      if (currentBlock !== 'list' || listType !== type) {
        flush(i);
        currentBlock = 'list';
        listType = type;
      }
      blockLines.push(listMatch[2]);
      continue;
    }

    // Blank lines
    if (trimmed === '') {
      flush(i);
      continue;
    }

    // Normal text paragraph
    if (currentBlock !== 'paragraph') {
      flush(i);
      currentBlock = 'paragraph';
    }
    blockLines.push(trimmed);
  }
  
  flush(lines.length);

  return (
    <div className="prose prose-invert max-w-none text-left select-text">
      {elements}
    </div>
  );
}
