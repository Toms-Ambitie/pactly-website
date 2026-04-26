import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel = 'Bevestigen', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <div className="flex gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={20} className="text-coral" />
        </div>
        <p className="text-sm text-mid leading-relaxed pt-1">{message}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="danger" fullWidth onClick={onConfirm}>{confirmLabel}</Button>
        <Button variant="ghost" fullWidth onClick={onCancel}>Annuleren</Button>
      </div>
    </Modal>
  );
}
