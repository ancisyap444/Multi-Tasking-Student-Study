import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Search,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { DocumentItem, Subject } from '@/types/database.types';

interface DocumentsViewProps {
  documents: DocumentItem[];
  subjects?: Subject[];
  onDeleteDocument: (doc: DocumentItem) => Promise<any>;
  onOpenUpload: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onDeleteDocument,
  onOpenUpload,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredDocs = documents.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDocDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Academic Document Vault
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Syllabi, lecture slides, past exams, and study guides scoped to your private storage
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-[#0F172A] dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {['all', 'syllabus', 'slides', 'notes', 'project', 'cheatsheet'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`capitalize rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:shadow-card dark:border-slate-800 dark:bg-[#0F172A]"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="capitalize rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {doc.category}
                  </span>
                  <button
                    onClick={() => onDeleteDocument(doc)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-rose-500"
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="mt-3 font-semibold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug">
                {doc.title}
              </h4>

              {doc.subject && (
                <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  {doc.subject.code} · {doc.subject.name}
                </p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-850">
              <span>{formatFileSize(doc.file_size)}</span>
              <span>{formatDocDate(doc.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
