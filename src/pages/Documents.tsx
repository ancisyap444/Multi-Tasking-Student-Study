import React, { useState } from 'react';
import { DocumentsView } from '@/components/documents/DocumentsView';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { useDocuments } from '@/hooks/useDocuments';
import { Subject } from '@/types/database.types';

interface DocumentsPageProps {
  subjects: Subject[];
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ subjects }) => {
  const { documents, uploadDocument, deleteDocument } = useDocuments(subjects);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F19]">
      <DocumentsView
        documents={documents}
        subjects={subjects}
        onDeleteDocument={deleteDocument}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        subjects={subjects}
        onUpload={uploadDocument}
      />
    </div>
  );
};
