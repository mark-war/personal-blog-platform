// src/components/blog/MarkdownEditor.tsx
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Code } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your post content here...',
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 bg-gray-50">
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition ${
            activeTab === 'write'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Code className="w-4 h-4" />
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition ${
            activeTab === 'preview'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Content */}
      <div className="bg-white">
        {activeTab === 'write' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[500px] p-4 focus:outline-none resize-none font-mono text-sm"
          />
        ) : (
          <div className="min-h-[500px] p-4 prose prose-sm max-w-none">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Nothing to preview yet...</p>
            )}
          </div>
        )}
      </div>

      {/* Markdown Tips */}
      {activeTab === 'write' && (
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t border-gray-300">
          <span className="font-semibold">Markdown tips:</span>{' '}
          # Heading | **bold** | *italic* | [link](url) | ![image](url) | `code` | ```code block```
        </div>
      )}
    </div>
  );
}