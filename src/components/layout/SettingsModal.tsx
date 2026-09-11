import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Palette,
  User,
  Keyboard,
  Trash2,
  Check,
  AlertTriangle,
  Upload,
  Camera,
  RotateCcw,
  Link as LinkIcon,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { AcademicYear } from '@/types/database.types';
import { cn } from '@/lib/utils';

export type SettingsTabKey = 'appearance' | 'account' | 'shortcuts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTabKey;
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

const AVATAR_PRESETS = [
  { label: 'Alex (Default)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { label: 'Marcus', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
  { label: 'Jordan', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { label: 'Sarah', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { label: 'Taylor', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
  { label: 'David', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'appearance',
}) => {
  const { user, profile, updateProfile, deleteAccount, resetPassword, updatePassword } = useAuth();
  const { mode, setMode, accent, setAccent } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTabKey>(initialTab);
  const [fullName, setFullName] = useState(profile?.full_name || 'Alex River');
  const [program, setProgram] = useState(profile?.program || 'BS Computer Science');
  const [year, setYear] = useState<AcademicYear>(profile?.year || 'Sophomore');
  const [targetHours, setTargetHours] = useState(profile?.target_study_hours_week || 25);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || DEFAULT_AVATAR);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'success' | 'error' | null>(null);
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      if (profile) {
        setFullName(profile.full_name || 'Alex River');
        setProgram(profile.program || 'BS Computer Science');
        setYear(profile.year || 'Sophomore');
        setTargetHours(profile.target_study_hours_week || 25);
        setAvatarUrl(profile.avatar_url || DEFAULT_AVATAR);
      }
    }
  }, [isOpen, initialTab, profile]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Selected photo must be smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      full_name: fullName,
      program,
      year,
      target_study_hours_week: targetHours,
      avatar_url: avatarUrl,
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    onClose();
  };

  const handleDirectResetPassword = async () => {
    setPasswordMessage('');
    setPasswordStatus(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus('error');
      setPasswordMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordMessage('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setPasswordStatus('error');
        setPasswordMessage(error.message || 'Failed to update password.');
      } else {
        setPasswordStatus('success');
        setPasswordMessage('Password updated successfully! Your new password is now active.');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordStatus('error');
      setPasswordMessage(err.message || 'An unexpected error occurred while updating your password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    setPasswordMessage('');
    setPasswordStatus(null);
    const targetEmail = user?.email;

    if (!targetEmail) {
      setPasswordStatus('error');
      setPasswordMessage('No email address found for your account.');
      return;
    }

    setIsSendingResetEmail(true);
    try {
      const { error } = await resetPassword(targetEmail);
      if (error) {
        setPasswordStatus('error');
        setPasswordMessage(error.message || 'Failed to send reset link.');
      } else {
        setPasswordStatus('success');
        setPasswordMessage(`Password reset link sent to ${targetEmail}! Please check your inbox.`);
      }
    } catch (err: any) {
      setPasswordStatus('error');
      setPasswordMessage(err.message || 'An unexpected error occurred while sending reset email.');
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const years: AcademicYear[] = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
  const accents: { id: 'blue' | 'indigo' | 'violet' | 'emerald' | 'rose'; name: string; bg: string }[] = [
    { id: 'blue', name: 'Multi-Tasking Blue', bg: 'bg-blue-600' },
    { id: 'indigo', name: 'Deep Indigo', bg: 'bg-indigo-600' },
    { id: 'violet', name: 'Royal Violet', bg: 'bg-purple-600' },
    { id: 'emerald', name: 'Focus Emerald', bg: 'bg-emerald-600' },
    { id: 'rose', name: 'Warm Rose', bg: 'bg-rose-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="relative flex h-[620px] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Settings & Preferences</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure your study workspace and student profile</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r border-slate-100 p-3 space-y-1 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <button
              onClick={() => setActiveTab('appearance')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition',
                activeTab === 'appearance'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <Palette className="h-4 w-4" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition',
                activeTab === 'account'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <User className="h-4 w-4" />
              <span>Student Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('shortcuts')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition',
                activeTab === 'shortcuts'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <Keyboard className="h-4 w-4" />
              <span>Shortcuts</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Interface Theme</h3>
                  <p className="text-xs text-slate-500 mb-3">Choose the visual mode for the application</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setMode('light')}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-medium transition',
                        mode === 'light'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      <div className="h-8 w-12 rounded border border-slate-300 bg-[#F8FAFC] shadow-sm mb-2" />
                      <span>Light (Multi-Tasking)</span>
                    </button>

                    <button
                      onClick={() => setMode('dark')}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-medium transition',
                        mode === 'dark'
                          ? 'border-blue-600 bg-blue-950/40 text-blue-400 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      <div className="h-8 w-12 rounded border border-slate-700 bg-[#0F172A] shadow-sm mb-2" />
                      <span>Deep Slate Dark</span>
                    </button>

                    <button
                      onClick={() => setMode('system')}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-medium transition',
                        mode === 'system'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      <div className="h-8 w-12 rounded border border-slate-400 bg-gradient-to-r from-white to-slate-900 shadow-sm mb-2" />
                      <span>System Match</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Accent Palette</h3>
                  <p className="text-xs text-slate-500 mb-3">Primary brand highlight throughout the interface</p>
                  <div className="flex flex-wrap gap-2">
                    {accents.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setAccent(acc.id)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition',
                          accent === acc.id
                            ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                        )}
                      >
                        <span className={cn('h-3 w-3 rounded-full', acc.bg)} />
                        <span>{acc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative group flex-shrink-0">
                      <img
                        src={avatarUrl}
                        alt="Profile Preview"
                        onError={() => setAvatarUrl(DEFAULT_AVATAR)}
                        className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-md dark:ring-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        title="Upload new photo"
                      >
                        <Camera className="h-5 w-5" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Profile Photo</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Personalize your avatar with an uploaded picture, URL, or preset
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
                        >
                          <Upload className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Upload Photo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowUrlInput((prev) => !prev)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
                        >
                          <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
                          <span>{showUrlInput ? 'Hide URL' : 'Image URL'}</span>
                        </button>

                        {avatarUrl !== DEFAULT_AVATAR && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl(DEFAULT_AVATAR)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            title="Reset to default avatar"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {showUrlInput && (
                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <input
                        type="url"
                        placeholder="Paste image URL (https://...)"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customUrlInput.trim()) {
                            setAvatarUrl(customUrlInput.trim());
                            setCustomUrlInput('');
                            setShowUrlInput(false);
                          }
                        }}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-2">
                      Or select from presets:
                    </span>
                    <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(preset.url)}
                          title={preset.label}
                          className={cn(
                            'relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden transition ring-2',
                            avatarUrl === preset.url
                              ? 'ring-blue-600 ring-offset-2 dark:ring-offset-slate-900'
                              : 'ring-transparent hover:ring-slate-300 dark:hover:ring-slate-600 opacity-75 hover:opacity-100'
                          )}
                        >
                          <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Degree Program / Major
                    </label>
                    <input
                      type="text"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      placeholder="e.g. BS Computer Science"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Academic Standing
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value as AcademicYear)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Target Study Hours / Wk
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={80}
                        value={targetHours}
                        onChange={(e) => setTargetHours(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Saved Successfully</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>

                {/* Reset Password & Security Section */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70 dark:border-slate-800/70">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reset Password & Security</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Change your login password or request an email reset link
                        </p>
                      </div>
                    </div>
                    {user?.email && (
                      <span className="self-start sm:self-auto rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 shadow-2xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                        {user.email}
                      </span>
                    )}
                  </div>

                  {passwordMessage && (
                    <div
                      className={cn(
                        'flex items-start gap-2.5 rounded-xl p-3 text-xs transition-all',
                        passwordStatus === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                          : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                      )}
                    >
                      {passwordStatus === 'success' ? (
                        <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="font-medium">{passwordMessage}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="At least 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-9 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-9 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                      <button
                        type="button"
                        disabled={isUpdatingPassword || !newPassword}
                        onClick={handleDirectResetPassword}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-40"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSendingResetEmail}
                        onClick={handleSendResetEmail}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
                      >
                        <Mail className="h-3.5 w-3.5 text-blue-500" />
                        <span>{isSendingResetEmail ? 'Sending Link...' : 'Send Reset Link via Email'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
                  <h4 className="text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Danger Zone: Delete Account</span>
                  </h4>
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    Permanently delete your student profile, enrolled subjects, assignments, and calendar events. This action is irreversible.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="mt-3 flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 shadow-sm hover:bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete my account & data</span>
                    </button>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm"
                      >
                        Yes, permanently delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Keyboard Navigation</h3>
                  <p className="text-xs text-slate-500 mb-3">Power-user shortcuts for frictionless navigation</p>
                </div>

                <div className="space-y-2">
                  {[
                    { key: '⌘1 / Ctrl+K', desc: 'Open global quick-search palette' },
                    { key: 'C', desc: 'Quick-create new calendar event or study session' },
                    { key: 'T', desc: 'Add new assignment / task' },
                    { key: 'Esc', desc: 'Close any active modal or drawer' },
                    { key: 'W', desc: 'Jump to current week on calendar' },
                  ].map((sc) => (
                    <div
                      key={sc.key}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-850"
                    >
                      <span className="text-slate-700 dark:text-slate-300">{sc.desc}</span>
                      <kbd className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
