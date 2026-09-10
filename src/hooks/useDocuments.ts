import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { DocumentItem, Subject } from '@/types/database.types';

const LOCAL_STORAGE_KEY = 'quicksuite_demo_documents';

function getStoredDocuments(): DocumentItem[] {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return [];
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  return [];
}

function saveStoredDocuments(documents: DocumentItem[]): void {
  const unhydrated = documents.map(({ subject: _subject, ...rest }) => rest as DocumentItem);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unhydrated));
}

export function useDocuments(subjects: Subject[] = []) {
  const { user, isDemo, isConfigured } = useAuth();
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['documents', user?.id, isDemo, subjects],
    queryFn: async (): Promise<DocumentItem[]> => {
      if (isDemo || !isConfigured || !user) {
        const items = getStoredDocuments();
        return items.map((doc) => ({
          ...doc,
          subject: subjects.find((s) => s.id === doc.subject_id),
        }));
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*, subject:subjects(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as DocumentItem[];
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({
      file,
      subjectId,
      title,
      category,
    }: {
      file?: File;
      subjectId?: string;
      title: string;
      category: DocumentItem['category'];
    }) => {
      if (isDemo || !isConfigured || !user) {
        const item: DocumentItem = {
          id: `doc-${Date.now()}`,
          user_id: user?.id || 'demo-student-uuid',
          subject_id: subjectId,
          title,
          file_path: file ? `uploads/${file.name}` : `docs/${title}`,
          file_size: file ? file.size : 1240000,
          file_type: file ? file.type : 'application/pdf',
          category,
          created_at: new Date().toISOString(),
          subject: subjects.find((s) => s.id === subjectId),
        };
        const current = getStoredDocuments();
        saveStoredDocuments([item, ...current]);
        return item;
      }

      let filePath = `docs/${title}`;
      let fileSize = 0;
      let fileType = 'application/pdf';

      if (file) {
        fileSize = file.size;
        fileType = file.type;
        filePath = `${user.id}/${Date.now()}-${file.name}`;

        const { error: storageError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (storageError) throw storageError;
      }

      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            user_id: user.id,
            subject_id: subjectId,
            title,
            file_path: filePath,
            file_size: fileSize,
            file_type: fileType,
            category,
          },
        ])
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as DocumentItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (doc: DocumentItem) => {
      if (isDemo || !isConfigured || !user) {
        const current = getStoredDocuments();
        const updated = current.filter((d) => d.id !== doc.id);
        saveStoredDocuments(updated);
        return doc.id;
      }

      if (doc.file_path) {
        await supabase.storage.from('documents').remove([doc.file_path]);
      }

      const { error } = await supabase.from('documents').delete().eq('id', doc.id);
      if (error) throw error;
      return doc.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
  };
}
