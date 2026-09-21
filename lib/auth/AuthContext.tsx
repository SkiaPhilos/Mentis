'use client';

import React, { createContext, useContext, useState, useEffect, useSyncExternalStore } from 'react';
import { UserProfile, ApprovalStatus, ManagedScholar } from '@/types/mentis';
import { MentisRepository } from '@/lib/storage/repository';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface SignUpData {
  email: string;
  password?: string;
  fullName: string;
  institution: string;
  program: string;
  educationType: 'school' | 'college' | 'university' | 'graduate' | 'custom';
  currentPeriod?: string;
  avatarId?: string;
}

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateApprovalStatus: (status: ApprovalStatus) => void;
  switchDemoAccount: (role: 'admin' | 'pending' | 'rejected') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Subscribe to MentisRepository profile changes
  const activeProfile = useSyncExternalStore(
    MentisRepository.subscribe,
    MentisRepository.getActiveAuthUserSnapshot,
    MentisRepository.getDefaultProfile
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const user = activeProfile;

  // Sync with Supabase Auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    if (!supabase) return;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const existing = MentisRepository.getProfile();
        if (existing.email === session.user.email) {
          MentisRepository.setActiveAuthUser(existing);
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const email = session.user.email || 'scholar@mentis.academic';
        const scholars = MentisRepository.getScholars();
        const matched = scholars.find((s) => s.email.toLowerCase() === email.toLowerCase());

        const profileToSet: UserProfile = {
          id: session.user.id,
          email,
          fullName: (session.user.user_metadata?.full_name as string) || matched?.fullName || 'Scholar of Mentis',
          avatarId: matched?.avatarId || 'scholar_m1',
          institution: matched?.institution || 'Academic Sanctuary',
          educationType: matched?.educationType || 'university',
          program: matched?.program || 'Liberal Arts & Sciences',
          currentPeriod: matched?.currentPeriod || 'Semester 1',
          targetGrade: '3.80 GPA',
          approvalStatus: matched?.status || 'approved',
          role: matched?.role || 'user',
          createdAt: session.user.created_at,
        };

        MentisRepository.setActiveAuthUser(profileToSet);
      } else if (event === 'SIGNED_OUT') {
        MentisRepository.clearActiveAuthUser();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // 1. If Supabase configured, attempt remote authentication
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        if (supabase && password) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            setIsLoading(false);
            return { success: false, error: error.message };
          }
        }
      }

      // 2. Local/Repository authentication fallback
      const scholars = MentisRepository.getScholars();
      const matched = scholars.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());

      if (!matched && email.trim() !== 'scholar@mentis.academic') {
        // If not in demo list, create a pending candidate
        const newPendingScholar: ManagedScholar = {
          id: `sch_${Date.now()}`,
          fullName: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          email: email.trim(),
          avatarId: 'scholar_m1',
          institution: 'Institutional Registry',
          program: 'Independent Scholarship',
          educationType: 'university',
          currentPeriod: 'Year 1',
          status: 'pending',
          role: 'user',
          appliedAt: 'Just now',
        };
        MentisRepository.addScholarApplication(newPendingScholar);

        const newProfile: UserProfile = {
          id: newPendingScholar.id,
          email: newPendingScholar.email,
          fullName: newPendingScholar.fullName,
          avatarId: newPendingScholar.avatarId,
          institution: newPendingScholar.institution,
          educationType: newPendingScholar.educationType || 'university',
          program: newPendingScholar.program,
          currentPeriod: newPendingScholar.currentPeriod || 'Year 1',
          targetGrade: '3.80 GPA',
          approvalStatus: 'pending',
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        MentisRepository.setActiveAuthUser(newProfile);
        setIsLoading(false);
        return { success: true };
      }

      const scholarRecord = matched || {
        id: 'scholar_usr_01',
        fullName: 'Abdullah Saeed',
        email: 'scholar@mentis.academic',
        avatarId: 'scholar_m1',
        institution: 'COMSATS University',
        program: 'Computer Science & Mathematics',
        educationType: 'university' as const,
        currentPeriod: 'Semester 4',
        status: 'approved' as ApprovalStatus,
        role: 'admin' as const,
        appliedAt: '2 weeks ago',
      };

      const updatedProfile: UserProfile = {
        id: scholarRecord.id,
        email: scholarRecord.email,
        fullName: scholarRecord.fullName,
        avatarId: scholarRecord.avatarId,
        institution: scholarRecord.institution,
        educationType: scholarRecord.educationType || 'university',
        program: scholarRecord.program,
        currentPeriod: scholarRecord.currentPeriod || 'Semester 4',
        targetGrade: '3.90 GPA',
        approvalStatus: scholarRecord.status,
        role: scholarRecord.role,
        createdAt: new Date().toISOString(),
      };

      MentisRepository.setActiveAuthUser(updatedProfile);
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Authentication petition could not be verified.',
      };
    }
  };

  const signup = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured() && data.password) {
        const supabase = createClient();
        if (supabase) {
          const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName,
                institution: data.institution,
                program: data.program,
              },
            },
          });
          if (error) {
            setIsLoading(false);
            return { success: false, error: error.message };
          }
        }
      }

      // Record scholar petition in local repository as 'pending'
      const scholarId = `sch_petition_${Date.now()}`;
      const newScholar: ManagedScholar = {
        id: scholarId,
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        avatarId: data.avatarId || 'scholar_m2',
        institution: data.institution.trim() || 'Academy of Knowledge',
        program: data.program.trim() || 'Liberal Arts & Natural Philosophy',
        educationType: data.educationType,
        currentPeriod: data.currentPeriod || 'Semester 1',
        status: 'pending',
        role: 'user',
        appliedAt: 'Just now',
      };

      MentisRepository.addScholarApplication(newScholar);

      const pendingProfile: UserProfile = {
        id: scholarId,
        email: data.email.trim(),
        fullName: data.fullName.trim(),
        avatarId: data.avatarId || 'scholar_m2',
        institution: data.institution.trim() || 'Academy of Knowledge',
        educationType: data.educationType,
        program: data.program.trim() || 'Liberal Arts & Natural Philosophy',
        currentPeriod: data.currentPeriod || 'Semester 1',
        targetGrade: '3.80 GPA',
        approvalStatus: 'pending',
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      MentisRepository.setActiveAuthUser(pendingProfile);

      // Asynchronously trigger server-side Google SMTP notification to the owner
      fetch('/api/auth/notify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: scholarId,
          fullName: newScholar.fullName,
          email: newScholar.email,
          institution: newScholar.institution,
          program: newScholar.program,
          educationType: newScholar.educationType,
        }),
      }).catch((e) => {
        console.warn('Google SMTP notification relay notice:', e);
      });

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Registration petition could not be submitted.',
      };
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    MentisRepository.clearActiveAuthUser();
    setIsLoading(false);
  };

  const updateApprovalStatus = (status: ApprovalStatus) => {
    const updated: UserProfile = {
      ...user,
      approvalStatus: status,
    };
    MentisRepository.setActiveAuthUser(updated);
    MentisRepository.updateScholarStatus(user.id, status);

    // Synchronize to server database and trigger notification email if SMTP configured
    fetch('/api/admin/scholars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_status',
        scholarId: user.id,
        scholarEmail: user.email,
        scholarName: user.fullName,
        status,
      }),
    }).catch(() => {});
  };

  const switchDemoAccount = (role: 'admin' | 'pending' | 'rejected') => {
    if (role === 'admin') {
      login('scholar@mentis.academic');
    } else if (role === 'pending') {
      login('h.farooq@comsats.edu.pk');
    } else if (role === 'rejected') {
      login('a.siddiqui@alumni.ox.ac.uk');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        logout,
        updateApprovalStatus,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
