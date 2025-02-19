import React from 'react';
import Knowledgebase from '../components/Knowledgebase.tsx';
import { LibraryBig } from 'lucide-react';
import  GraphRAGingest  from '../components/GraphRagPDFingestion.tsx';
const RAGKnowledgebase: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <LibraryBig className="w-8 h-8" />
        <h1 className="text-2xl font-bold">Knowledgebase</h1>
      </div>
      <Knowledgebase />
      <GraphRAGingest />
    </div>
  );
};

export default RAGKnowledgebase;