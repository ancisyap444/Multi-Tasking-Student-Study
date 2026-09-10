import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, CheckSquare, FileText, Calendar, ArrowRight, X } from 'lucide-react';
import { Subject, TaskItem, DocumentItem } from '@/types/database.types';
import { NavTab } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  tasks: TaskItem[];
  documents: DocumentItem[];
  onNavigate: (tab: NavTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  subjects,
  tasks,
  documents,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === '1')) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.notes?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm pt-20 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center border-b border-slate-100 px-4 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a subject, assignment title, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 w-full bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {!query && (
            <div className="p-2">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Quick Navigation
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { tab: 'dashboard' as NavTab, label: 'Dashboard', icon: Calendar },
                  { tab: 'calendar' as NavTab, label: 'Weekly Calendar', icon: Calendar },
                  { tab: 'tasks' as NavTab, label: 'Assignments & Kanban', icon: CheckSquare },
                  { tab: 'documents' as NavTab, label: 'Course Documents', icon: FileText },
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      onNavigate(item.tab);
                      onClose();
                    }}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-xs font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/30"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-slate-400" />
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredSubjects.length > 0 && (
            <div>
              <span className="px-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Enrolled Subjects ({filteredSubjects.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredSubjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onNavigate('calendar');
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {sub.code}:
                      </span>
                      <span>{sub.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{sub.location}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div>
              <span className="px-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Tasks & Assignments ({filteredTasks.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onNavigate('tasks');
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium text-slate-900 dark:text-white">{t.title}</span>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {t.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredDocs.length > 0 && (
            <div>
              <span className="px-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Documents & Notes ({filteredDocs.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredDocs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onNavigate('documents');
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span className="text-slate-900 dark:text-white">{d.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{d.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query &&
            filteredSubjects.length === 0 &&
            filteredTasks.length === 0 &&
            filteredDocs.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching subjects, assignments, or documents found for "{query}".
              </div>
            )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
          <span>Multi-Tasking Global Search</span>
          <div className="flex items-center gap-1">
            <span>Press</span>
            <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
              esc
            </kbd>
            <span>to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
