import React, { useState } from 'react';
import { X, FileUp } from 'lucide-react';
import { Subject, DocumentItem } from '@/types/database.types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onUpload: (data: {
    file?: File;
    subjectId?: string;
    title: string;
    category: DocumentItem['category'];
  }) => Promise<any>;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onUpload,
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [category, setCategory] = useState<DocumentItem['category']>('syllabus');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onUpload({
        file: file || undefined,
        subjectId: subjectId || undefined,
        title: title.trim(),
        category,
      });

      onClose();
      setTitle('');
      setFile(null);
    } catch (err) {
      console.error('Failed to upload document:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Upload Course Document
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save syllabi, lecture slides, or cheat sheets to your account
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-400 dark:border-slate-700">
            <FileUp className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {file ? file.name : 'Choose a PDF, document, or slide deck'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, DOCX, PPTX up to 25MB'}
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Document Display Title *
            </label>
            <input
              type="text"
              required
              placeholder={`e.g. CS101_Syllabus_${new Date().getFullYear()}.pdf`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Associated Course
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">None (Independent)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Document Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentItem['category'])}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="syllabus">Course Syllabus</option>
                <option value="slides">Lecture Slides</option>
                <option value="notes">Study Notes</option>
                <option value="project">Project Specification</option>
                <option value="cheatsheet">Exam Cheatsheet</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {isSubmitting ? 'Uploading...' : 'Save to Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
