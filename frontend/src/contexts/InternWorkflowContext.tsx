'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
interface InternProfile {
  id?: string;
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    address: string;
  };
  education?: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    graduationDate: Date;
    gpa?: number;
  }[];
  experience?: {
    title: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }[];
  skills?: string[];
  interests?: string[];
  certifications?: {
    name: string;
    issuer: string;
    dateIssued: Date;
    expiryDate?: Date;
  }[];
  isComplete: boolean;
}

interface Application {
  id: string;
  jobId: string;
  status: 'applied' | 'reviewed' | 'interview_scheduled' | 'interview_completed' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: Date;
  lastUpdated: Date;
  documents?: string[];
  notes?: string;
}

interface SavedItem {
  id: string;
  type: 'job' | 'company';
  itemId: string;
  savedAt: Date;
}

interface WorkflowState {
  profile: InternProfile;
  applications: Application[];
  savedItems: SavedItem[];
  currentStep: string;
  completedSteps: string[];
  isLoading: boolean;
  error: string | null;
}

// Actions
type WorkflowAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_PROFILE'; payload: Partial<InternProfile> }
  | { type: 'ADD_APPLICATION'; payload: Application }
  | { type: 'UPDATE_APPLICATION'; payload: { id: string; updates: Partial<Application> } }
  | { type: 'ADD_SAVED_ITEM'; payload: SavedItem }
  | { type: 'REMOVE_SAVED_ITEM'; payload: string }
  | { type: 'SET_CURRENT_STEP'; payload: string }
  | { type: 'COMPLETE_STEP'; payload: string }
  | { type: 'LOAD_WORKFLOW_DATA'; payload: Partial<WorkflowState> };

// Initial state
const initialState: WorkflowState = {
  profile: {
    isComplete: false
  },
  applications: [],
  savedItems: [],
  currentStep: 'profile-setup',
  completedSteps: [],
  isLoading: false,
  error: null
};

// Reducer
function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'UPDATE_PROFILE':
      const updatedProfile = { ...state.profile, ...action.payload };
      return { 
        ...state, 
        profile: updatedProfile,
        completedSteps: updatedProfile.isComplete 
          ? [...new Set([...state.completedSteps, 'profile-setup'])]
          : state.completedSteps.filter(step => step !== 'profile-setup')
      };
    
    case 'ADD_APPLICATION':
      return { 
        ...state, 
        applications: [...state.applications, action.payload],
        completedSteps: [...new Set([...state.completedSteps, 'apply-jobs'])]
      };
    
    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.id 
            ? { ...app, ...action.payload.updates, lastUpdated: new Date() }
            : app
        )
      };
    
    case 'ADD_SAVED_ITEM':
      return { 
        ...state, 
        savedItems: [...state.savedItems, action.payload],
        completedSteps: [...new Set([...state.completedSteps, 'save-favorites'])]
      };
    
    case 'REMOVE_SAVED_ITEM':
      return {
        ...state,
        savedItems: state.savedItems.filter(item => item.id !== action.payload)
      };
    
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: [...new Set([...state.completedSteps, action.payload])]
      };
    
    case 'LOAD_WORKFLOW_DATA':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

// Context
const InternWorkflowContext = createContext<{
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
  actions: {
    updateProfile: (profile: Partial<InternProfile>) => void;
    addApplication: (application: Application) => void;
    updateApplication: (id: string, updates: Partial<Application>) => void;
    saveItem: (type: 'job' | 'company', itemId: string) => void;
    unsaveItem: (id: string) => void;
    completeStep: (step: string) => void;
    setCurrentStep: (step: string) => void;
    loadWorkflowData: () => Promise<void>;
    saveWorkflowData: () => Promise<void>;
  };
} | null>(null);

// Provider
export function InternWorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  // Load data on mount
  useEffect(() => {
    loadWorkflowData();
  }, []);

  // Save data when state changes
  useEffect(() => {
    if (!state.isLoading) {
      saveWorkflowData();
    }
  }, [state.profile, state.applications, state.savedItems, state.completedSteps]);

  const actions = {
    updateProfile: (profile: Partial<InternProfile>) => {
      dispatch({ type: 'UPDATE_PROFILE', payload: profile });
    },

    addApplication: (application: Application) => {
      dispatch({ type: 'ADD_APPLICATION', payload: application });
    },

    updateApplication: (id: string, updates: Partial<Application>) => {
      dispatch({ type: 'UPDATE_APPLICATION', payload: { id, updates } });
    },

    saveItem: (type: 'job' | 'company', itemId: string) => {
      const savedItem: SavedItem = {
        id: `${type}-${itemId}-${Date.now()}`,
        type,
        itemId,
        savedAt: new Date()
      };
      dispatch({ type: 'ADD_SAVED_ITEM', payload: savedItem });
    },

    unsaveItem: (id: string) => {
      dispatch({ type: 'REMOVE_SAVED_ITEM', payload: id });
    },

    completeStep: (step: string) => {
      dispatch({ type: 'COMPLETE_STEP', payload: step });
    },

    setCurrentStep: (step: string) => {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    },

    loadWorkflowData: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load from localStorage (in a real app, this would be API calls)
        const savedData = localStorage.getItem('intern-workflow-data');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          // Convert date strings back to Date objects
          if (parsedData.applications) {
            parsedData.applications = parsedData.applications.map((app: any) => ({
              ...app,
              submittedAt: new Date(app.submittedAt),
              lastUpdated: new Date(app.lastUpdated)
            }));
          }
          
          if (parsedData.savedItems) {
            parsedData.savedItems = parsedData.savedItems.map((item: any) => ({
              ...item,
              savedAt: new Date(item.savedAt)
            }));
          }
          
          dispatch({ type: 'LOAD_WORKFLOW_DATA', payload: parsedData });
        }
      } catch (error) {
        console.error('Error loading workflow data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load workflow data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    saveWorkflowData: async () => {
      try {
        // Save to localStorage (in a real app, this would be API calls)
        const dataToSave = {
          profile: state.profile,
          applications: state.applications,
          savedItems: state.savedItems,
          currentStep: state.currentStep,
          completedSteps: state.completedSteps
        };
        
        localStorage.setItem('intern-workflow-data', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving workflow data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save workflow data' });
      }
    }
  };

  return (
    <InternWorkflowContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </InternWorkflowContext.Provider>
  );
}

// Hook
export function useInternWorkflow() {
  const context = useContext(InternWorkflowContext);
  if (!context) {
    throw new Error('useInternWorkflow must be used within an InternWorkflowProvider');
  }
  return context;
}

// Selectors
export const workflowSelectors = {
  getProfileCompletion: (state: WorkflowState): number => {
    const profile = state.profile;
    let completionScore = 0;
    let totalFields = 6;

    if (profile.personalInfo) completionScore += 1;
    if (profile.education && profile.education.length > 0) completionScore += 1;
    if (profile.skills && profile.skills.length > 0) completionScore += 1;
    if (profile.interests && profile.interests.length > 0) completionScore += 1;
    if (profile.experience && profile.experience.length > 0) completionScore += 1;
    if (profile.certifications && profile.certifications.length > 0) completionScore += 1;

    return Math.round((completionScore / totalFields) * 100);
  },

  getActiveApplications: (state: WorkflowState): Application[] => {
    return state.applications.filter(app => 
      !['accepted', 'rejected', 'withdrawn'].includes(app.status)
    );
  },

  getApplicationsByStatus: (state: WorkflowState, status: Application['status']): Application[] => {
    return state.applications.filter(app => app.status === status);
  },

  getSavedItemsByType: (state: WorkflowState, type: 'job' | 'company'): SavedItem[] => {
    return state.savedItems.filter(item => item.type === type);
  },

  getOverallProgress: (state: WorkflowState): number => {
    const totalSteps = 9; // Total workflow steps
    const completedSteps = state.completedSteps.length;
    return Math.round((completedSteps / totalSteps) * 100);
  }
};
