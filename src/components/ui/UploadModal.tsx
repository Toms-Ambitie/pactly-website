import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import type { Contract } from '../../types';
import { ContractForm } from '../contracts/ContractForm';
import { fileSave } from '../../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface UploadModalProps {
  onAdd: (data: Omit<Contract, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

type Stage = 'idle' | 'uploading' | 'analyzing' | 'form';

export function UploadModal({ onAdd, onClose }: UploadModalProps) {
  const [stage, setStage]     = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [file, setFile]         = useState<File | null>(null);
  const [drag, setDrag]         = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setStage('uploading');
    setProgress(0);
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(p + 14, 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(t);
        setStage('analyzing');
        setTimeout(() => setStage('form'), 1600);
      }
    }, 90);
  };

  const handleSave = async (formData: Omit<Contract, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (file) {
      const fileId = 'file_' + uuidv4();
      await fileSave(fileId, file);
      formData = {
        ...formData,
        docs: [`${file.name}||${fileId}`, ...(formData.docs ?? [])],
      };
    }
    onAdd(formData);
    onClose();
  };

  if (stage === 'form' && file) {
    return (
      <Modal title="Contract toevoegen" onClose={onClose} size="lg">
        <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-violet-light rounded-xl">
          <FileText size={15} className="text-violet" />
          <span className="text-sm font-semibold text-violet">{file.name}</span>
        </div>
        <ContractForm
          initial={{ name: file.name.replace(/\.[^.]+$/, ''), type: 'contract' }}
          onSubmit={handleSave}
          onCancel={onClose}
          submitLabel="Contract toevoegen"
        />
      </Modal>
    );
  }

  return (
    <Modal title="Contract uploaden" onClose={onClose}>
      {stage === 'idle' && (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${drag ? 'border-violet bg-violet-light' : 'border-gray-200 hover:border-violet/50 hover:bg-violet-light/50'}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => {
            const i = document.createElement('input');
            i.type = 'file'; i.accept = '.pdf,.doc,.docx';
            i.onchange = () => { if (i.files?.[0]) handleFile(i.files[0]); };
            i.click();
          }}
        >
          <div className="text-4xl mb-3">📂</div>
          <div className="font-bold text-dark mb-1">Sleep uw contract hierheen</div>
          <div className="text-sm text-mid mb-4">of klik om een bestand te selecteren</div>
          <div className="flex justify-center gap-2">
            {['PDF', 'DOCX', 'DOC'].map(t => (
              <span key={t} className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-mono text-mid">{t}</span>
            ))}
          </div>
        </div>
      )}

      {(stage === 'uploading' || stage === 'analyzing') && (
        <div className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={20} className="text-violet" />
            <span className="font-semibold text-sm flex-1">{file?.name}</span>
            {stage === 'analyzing' && (
              <div className="w-5 h-5 border-2 border-violet/30 border-t-violet rounded-full animate-spin" />
            )}
          </div>
          {stage === 'uploading' ? (
            <>
              <div className="flex justify-between text-xs text-mid mb-1.5">
                <span>Uploaden...</span><span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-pactly-gradient rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <div className="bg-violet-light border border-violet/20 rounded-xl p-4">
              <div className="flex items-center gap-2 font-semibold text-sm text-violet mb-2">
                <Sparkles size={15} /> AI analyseert uw document...
              </div>
              <div className="text-xs text-mid">Sleutelgegevens extraheren · Einddatums detecteren · Opzegtermijnen vaststellen</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
