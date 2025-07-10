import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Family, Student, Parent, FormType, FormData, SharedFormData, DataReusageMap } from '../types/forms';
import type { ValidationError } from '../types/common';

interface FormStore {
  // Family & Student Data
  families: Family[];
  currentFamily: Family | null;
  
  // Form Management
  currentForm: FormType | null;
  formData: Record<string, FormData>;
  completedForms: Record<string, boolean>;
  
  // Actions
  setCurrentForm: (form: FormType) => void;
  setCurrentFamily: (family: Family) => void;
  addFamily: (family: Family) => void;
  updateFamily: (familyId: string, updates: Partial<Family>) => void;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  updateParent: (parentId: string, updates: Partial<Parent>) => void;
  updateFormData: (formType: FormType, data: Partial<FormData>) => void;
  
  // Data Reuse Logic
  getSharedData: (formType: FormType) => SharedFormData;
  populateFormWithSharedData: (formType: FormType) => void;
  
  // Computed
  isFormComplete: (formType: FormType) => boolean;
  getFormErrors: (formType: FormType) => ValidationError[];
  getDataReusageMap: () => DataReusageMap;
  
  // Utility
  reset: () => void;
  exportData: () => string;
  importData: (data: string) => void;
}

const initialState = {
  families: [],
  currentFamily: null,
  currentForm: null,
  formData: {},
  completedForms: {},
};

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentForm: (form) => set({ currentForm: form }),
      
      setCurrentFamily: (family) => set({ currentFamily: family }),
      
      addFamily: (family) => 
        set((state) => ({
          families: [...state.families, family],
          currentFamily: family,
        })),
      
      updateFamily: (familyId, updates) =>
        set((state) => ({
          families: state.families.map(f => 
            f.id === familyId ? { ...f, ...updates, updatedAt: new Date() } : f
          ),
          currentFamily: state.currentFamily?.id === familyId 
            ? { ...state.currentFamily, ...updates, updatedAt: new Date() }
            : state.currentFamily,
        })),
      
      updateStudent: (studentId, updates) =>
        set((state) => ({
          families: state.families.map(family => ({
            ...family,
            students: family.students.map(student =>
              student.id === studentId ? { ...student, ...updates } : student
            ),
            updatedAt: new Date(),
          })),
          currentFamily: state.currentFamily ? {
            ...state.currentFamily,
            students: state.currentFamily.students.map(student =>
              student.id === studentId ? { ...student, ...updates } : student
            ),
            updatedAt: new Date(),
          } : null,
        })),
      
      updateParent: (parentId, updates) =>
        set((state) => ({
          families: state.families.map(family => ({
            ...family,
            parents: family.parents.map(parent =>
              parent.id === parentId ? { ...parent, ...updates } : parent
            ),
            updatedAt: new Date(),
          })),
          currentFamily: state.currentFamily ? {
            ...state.currentFamily,
            parents: state.currentFamily.parents.map(parent =>
              parent.id === parentId ? { ...parent, ...updates } : parent
            ),
            updatedAt: new Date(),
          } : null,
        })),
      
      updateFormData: (formType, data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            [formType]: {
              ...state.formData[formType],
              ...data,
              lastSaved: new Date(),
            },
          },
        })),
      
      getSharedData: (_formType) => {
        const { currentFamily } = get();
        if (!currentFamily) {
          return {
            student: {},
            parents: [],
            family: {},
          };
        }
        
        return {
          student: currentFamily.students[0] || {},
          parents: currentFamily.parents || [],
          family: {
            address: currentFamily.address,
            emergencyContacts: currentFamily.emergencyContacts,
            preferences: currentFamily.preferences,
          },
        };
      },
      
      populateFormWithSharedData: (formType) => {
        const sharedData = get().getSharedData(formType);
        const mappings = get().getDataReusageMap();
        
        if (mappings[formType]) {
          // Implementation for auto-populating form fields
          // This would be expanded based on specific form requirements
          console.log('Auto-populating form:', formType, sharedData);
        }
      },
      
      isFormComplete: (formType) => {
        const { formData } = get();
        const form = formData[formType];
        return form ? form.completed : false;
      },
      
      getFormErrors: (_formType) => {
        // Implementation for form validation
        // This would return validation errors for the specified form
        return [];
      },
      
      getDataReusageMap: () => {
        // Basic mapping - this would be expanded for each form type
        return {
          periscolaire: {
            student_firstName: {
              sourceField: 'firstName',
              sourceTable: 'students',
              required: true,
            },
            student_lastName: {
              sourceField: 'lastName',
              sourceTable: 'students',
              required: true,
            },
            parent1_firstName: {
              sourceField: 'firstName',
              sourceTable: 'parents',
              required: true,
            },
            parent1_email: {
              sourceField: 'email',
              sourceTable: 'parents',
              required: true,
            },
            family_address: {
              sourceField: 'address',
              sourceTable: 'family',
              transformation: (addr: unknown) => {
                if (typeof addr === 'object' && addr !== null) {
                  const address = addr as { street: string; city: string };
                  return `${address.street}, ${address.city}`;
                }
                return '';
              },
              required: true,
            },
          },
          edpp: {
            // Similar mappings for EDPP form
            child_name: {
              sourceField: 'firstName',
              sourceTable: 'students',
              transformation: (firstName: unknown, context: unknown) => {
                if (typeof firstName === 'string' && context && typeof context === 'object') {
                  const student = context as { lastName: string };
                  return `${firstName} ${student.lastName}`;
                }
                return firstName as string;
              },
              required: true,
            },
          },
        };
      },
      
      reset: () => set(initialState),
      
      exportData: () => {
        const { families, formData } = get();
        return JSON.stringify({ families, formData });
      },
      
      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          set({
            families: parsed.families || [],
            formData: parsed.formData || {},
          });
        } catch (error) {
          console.error('Error importing data:', error);
        }
      },
    }),
    {
      name: 'school-forms-storage',
      version: 1,
    }
  )
);
