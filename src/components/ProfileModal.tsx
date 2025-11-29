import { useState } from 'react';
import { XIcon, UserIcon, TrashIcon, SaveIcon } from './Icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUpdateName: (name: string) => void;
  onResetData: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  userName, 
  onUpdateName, 
  onResetData 
}) => {
  const [nameInput, setNameInput] = useState(userName);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => { setConfirmDelete(false); onClose(); }}></div>
      
      <div className="relative w-full max-w-sm bg-surface border border-white/10 rounded-2xl shadow-2xl p-6 animate-[fadeIn_0.2s_ease-out]">
        <button 
          onClick={() => { setConfirmDelete(false); onClose(); }}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Profile Settings</h2>
        </div>

        {!confirmDelete ? (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Name Edit */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Display Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              <SaveIcon className="w-4 h-4" />
              Save Changes
            </button>

            <hr className="border-white/5 my-4" />

            {/* Danger Zone */}
            <div>
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Danger Zone</h3>
              <p className="text-xs text-slate-500 mb-3">
                Clear all local data and reset the application to its initial state.
              </p>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-medium py-3 rounded-xl transition-all active:scale-[0.98]"
              >
                <TrashIcon className="w-4 h-4" />
                Reset All Data
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <h3 className="text-rose-400 font-bold mb-1">Are you sure?</h3>
              <p className="text-slate-300 text-sm">This action cannot be undone. All your transactions and goals will be permanently deleted.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={onResetData}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-500 shadow-lg shadow-rose-500/20 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
