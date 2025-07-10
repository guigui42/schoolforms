# French School Forms Generator - Project Requirements & Guidelines

## Project Overview

A React-based web application that allows French parents to fill out school enrollment forms digitally and generate exact PDF replicas of official forms, eliminating manual duplication and ensuring accuracy.

**Key Problem Solved**: French school forms contain repetitive information (child details, parent information, addresses, etc.). This app allows parents to enter data once and automatically populates all forms, eliminating redundant data entry.

Expected PDFs output are located in the `/public/templates/` directory, which contains original PDF templates for PERISCOLAIRE, EDPP, and other school forms.

## Technology Stack

### Frontend Framework
- **React 19+** with TypeScript
- **Mantine 8+** for UI components and theming
- **Vite** for build tooling and development server

### State Management & Forms
- **Zustand** for global state management
- **React Hook Form** for form handling
- **Zod** for schema validation and TypeScript inference

### PDF Generation
- **PDF-lib** for PDF manipulation and generation
- **React-PDF** for PDF preview (optional)

### Routing & Navigation
- **React Router DOM** for client-side routing

### Styling & Icons
- **Mantine** built-in styling system
- **Tabler Icons** (included with Mantine)
- **CSS Modules** for custom styling when needed

### Development Tools
- **ESLint** + **Prettier** for code quality
- **Husky** for git hooks
- **Vitest** for unit testing
- **Playwright** for E2E testing

## Core Features

### 1. Smart Data Reuse System
- **Single Data Entry**: Enter child and family information once
- **Automatic Population**: All forms automatically populate with existing data
- **Family Profiles**: Manage multiple children with shared parent/guardian information
- **Data Inheritance**: Common fields (address, parent details) shared across all forms
- **Override Capability**: Allow form-specific modifications when needed
- **Data Validation**: Ensure consistency across all forms

### 2. Form Management System
- **Multi-form support**: Handle PERISCOLAIRE, EDPP, and other school forms
- **Data persistence**: Save progress across browser sessions
- **Family management**: Support multiple children per family
- **Form validation**: Real-time validation with French error messages
- **Progressive filling**: Step-by-step form completion

### 3. PDF Generation Engine
- **Template-based generation**: Use original PDFs as templates
- **Exact positioning**: Maintain original layout and formatting
- **French character support**: Proper encoding for accented characters
- **Multiple output formats**: Download and print-ready PDFs
- **Preview system**: Show generated PDF before download

### 4. User Experience
- **Responsive design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Offline capability**: PWA features for offline use
- **French localization**: All UI text in French
- **Help system**: Contextual help and tooltips

## Project Structure

```
/
├── public/
│   ├── templates/          # Original PDF templates
│   ├── icons/             # App icons for PWA
│   └── locales/           # Translation files
├── src/
│   ├── components/
│   │   ├── forms/         # Form-specific components
│   │   ├── ui/            # Reusable UI components
│   │   ├── pdf/           # PDF generation components
│   │   └── layout/        # Layout components
│   ├── pages/
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   ├── FormFiller.tsx # Form filling interface
│   │   ├── PDFPreview.tsx # PDF preview page
│   │   └── Settings.tsx   # App settings
│   ├── stores/
│   │   ├── formStore.ts   # Form data store
│   │   ├── userStore.ts   # User preferences
│   │   └── pdfStore.ts    # PDF generation state
│   ├── schemas/
│   │   ├── student.ts     # Student data schema
│   │   ├── parent.ts      # Parent/guardian schema
│   │   ├── periscolaire.ts # PERISCOLAIRE form schema
│   │   └── edpp.ts        # EDPP form schema
│   ├── types/
│   │   ├── forms.ts       # Form type definitions
│   │   ├── pdf.ts         # PDF-related types
│   │   └── common.ts      # Common type definitions
│   ├── utils/
│   │   ├── pdf/           # PDF generation utilities
│   │   ├── validation/    # Validation utilities
│   │   ├── storage/       # Local storage utilities
│   │   └── constants.ts   # App constants
│   ├── hooks/
│   │   ├── useForm.ts     # Custom form hooks
│   │   ├── usePDF.ts      # PDF generation hooks
│   │   └── useStorage.ts  # Storage hooks
│   └── assets/
│       ├── fonts/         # Custom fonts
│       └── images/        # Images and graphics
├── tests/
│   ├── components/        # Component tests
│   ├── utils/            # Utility tests
│   ├── e2e/              # End-to-end tests
│   └── fixtures/         # Test fixtures
├── docs/
│   ├── api/              # API documentation
│   ├── components/       # Component documentation
│   └── deployment/       # Deployment guides
└── scripts/
    ├── build.js          # Build scripts
    └── deploy.js         # Deployment scripts
```

## Development Guidelines

### Code Standards

#### TypeScript
- Use strict TypeScript configuration
- Prefer type inference over explicit typing when obvious
- Use discriminated unions for form types
- Implement proper error handling with Result types

```typescript
// Good
interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  grade: Grade;
}

// Better with validation
const StudentSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  birthDate: z.date().max(new Date(), "Date invalide"),
  grade: GradeSchema
});
```

#### React Components
- Use functional components with hooks
- Implement proper prop validation with TypeScript
- Use React.memo for performance optimization when needed
- Follow single responsibility principle

```typescript
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  isRequired?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

const FormSection: React.FC<FormSectionProps> = React.memo(({ 
  title, 
  children, 
  isRequired = false,
  onValidationChange 
}) => {
  // Component implementation
});
```

#### Mantine Integration
- Use Mantine's theming system for consistent styling
- Leverage Mantine's form components and validation
- Implement responsive design with Mantine's breakpoints
- Use Mantine's notification system for user feedback

```typescript
import { useForm } from '@mantine/form';
import { TextInput, Select, Button, Paper } from '@mantine/core';

const StudentForm = () => {
  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      grade: ''
    },
    validate: {
      firstName: (value) => value.length < 2 ? 'Prénom trop court' : null,
      lastName: (value) => value.length < 2 ? 'Nom trop court' : null,
    }
  });

  return (
    <Paper p="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Prénom"
          required
          {...form.getInputProps('firstName')}
        />
        {/* More fields */}
      </form>
    </Paper>
  );
};
```

### State Management Patterns

#### Zustand Store Structure
```typescript
interface FormStore {
  // Family & Student Data
  families: Family[];
  currentFamily: Family | null;
  
  // Form Management
  currentForm: FormType | null;
  formData: Record<string, any>;
  completedForms: Record<string, boolean>;
  
  // Actions
  setCurrentForm: (form: FormType) => void;
  updateFormData: (path: string, value: any) => void;
  addFamily: (family: Family) => void;
  updateStudent: (studentId: string, data: Partial<Student>) => void;
  updateParent: (parentId: string, data: Partial<Parent>) => void;
  
  // Data Reuse Logic
  getSharedData: (formType: FormType) => SharedFormData;
  populateFormWithSharedData: (formType: FormType) => void;
  
  // Computed
  isFormComplete: (formType: FormType) => boolean;
  getFormErrors: (formType: FormType) => ValidationError[];
  getDataReusageMap: () => DataReusageMap;
}

// Core data structures for reuse
interface Family {
  id: string;
  students: Student[];
  parents: Parent[];
  address: Address;
  emergencyContacts: EmergencyContact[];
  preferences: FamilyPreferences;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  grade: Grade;
  school: string;
  medicalInfo?: MedicalInfo;
  activities?: Activity[];
}

interface Parent {
  id: string;
  type: 'mother' | 'father' | 'guardian';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profession?: string;
  workAddress?: Address;
  workPhone?: string;
}

interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Data mapping for form field reuse
interface DataReusageMap {
  [formType: string]: {
    [fieldName: string]: {
      sourceField: string;
      sourceTable: 'students' | 'parents' | 'family';
      transformation?: (value: any) => any;
      required: boolean;
    };
  };
}
```

#### Data Persistence
- Use localStorage for form data persistence
- Implement data migration for schema changes
- Handle storage quotas and cleanup
- Encrypt sensitive data if needed

### Smart Data Reuse Implementation

#### Field Mapping Strategy
```typescript
// Example data reuse mapping
const FORM_FIELD_MAPPINGS: DataReusageMap = {
  'periscolaire': {
    'student_firstName': {
      sourceField: 'firstName',
      sourceTable: 'students',
      required: true
    },
    'student_lastName': {
      sourceField: 'lastName',
      sourceTable: 'students',
      required: true
    },
    'parent1_firstName': {
      sourceField: 'firstName',
      sourceTable: 'parents',
      required: true
    },
    'parent1_email': {
      sourceField: 'email',
      sourceTable: 'parents',
      required: true
    },
    'family_address': {
      sourceField: 'address',
      sourceTable: 'family',
      transformation: (addr: Address) => `${addr.street}, ${addr.city}`,
      required: true
    }
  },
  'edpp': {
    // Same mappings for EDPP form
    'child_name': {
      sourceField: 'firstName',
      sourceTable: 'students',
      transformation: (firstName: string, student: Student) => 
        `${firstName} ${student.lastName}`,
      required: true
    }
    // ... more mappings
  }
};
```

#### Auto-Population Hook
```typescript
const useAutoPopulate = (formType: FormType) => {
  const { getSharedData, families, currentFamily } = useFormStore();
  
  const populateForm = useCallback((form: any) => {
    if (!currentFamily) return;
    
    const mappings = FORM_FIELD_MAPPINGS[formType];
    const populatedData: Record<string, any> = {};
    
    Object.entries(mappings).forEach(([fieldName, mapping]) => {
      const value = extractFieldValue(currentFamily, mapping);
      if (value !== undefined) {
        populatedData[fieldName] = value;
      }
    });
    
    form.setValues(populatedData);
  }, [formType, currentFamily]);
  
  return { populateForm };
};
```

### PDF Generation Guidelines

#### Template Management
- Store original PDFs in `/public/templates/`
- Use consistent naming convention: `{form-type}-{version}.pdf`
- Implement version control for template updates
- Create field mapping configurations

#### Field Positioning
```typescript
interface FieldMapping {
  formType: string;
  version: string;
  fields: {
    [fieldName: string]: {
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
      fontFamily: string;
      alignment: 'left' | 'center' | 'right';
    };
  };
}
```

#### PDF Generation Process
1. Load original PDF template
2. Create new PDF document from template
3. Map form data to PDF fields
4. Apply formatting and positioning
5. Generate downloadable blob
6. Provide preview before download

### Testing Requirements

#### Unit Testing
- Test all form validation logic
- Test PDF generation utilities
- Test state management actions
- Test data reuse logic
- Achieve 80%+ code coverage

#### Integration Testing
- Test form data flow
- Test PDF generation pipeline
- Test data persistence
- Test error handling
- Test cross-form data consistency

#### E2E Testing
- Test complete form filling workflow
- Test PDF generation and download
- Test responsive design
- Test accessibility features
- Test data reuse across multiple forms

### Performance Requirements

#### Loading Performance
- Initial bundle size < 500KB (gzipped)
- First Contentful Paint < 2s
- Time to Interactive < 4s
- Use code splitting for different form types

#### Runtime Performance
- Form interactions < 16ms (60fps)
- PDF generation < 5s for typical forms
- Memory usage < 50MB during normal operation
- Support for offline usage

### Accessibility Requirements

#### WCAG 2.1 AA Compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators
- Alternative text for images
- Semantic HTML structure

#### French Language Support
- Right-to-left text handling where needed
- Proper French typography
- Localized date/time formats
- French keyboard layout support

### Security & Privacy

#### Data Protection
- No sensitive data transmission to external servers
- Local storage encryption for sensitive information
- Secure PDF generation (no data leakage)
- GDPR compliance for student data

#### Input Validation
- Sanitize all user inputs
- Validate file uploads
- Prevent XSS attacks
- Implement rate limiting for form submissions

### Deployment & DevOps

#### Build Process
```bash
# Development
npm run dev          # Start development server
npm run test         # Run tests
npm run lint         # Run linting
npm run type-check   # TypeScript checking

# Production
npm run build        # Build for production
npm run preview      # Preview production build
npm run deploy       # Deploy to hosting
```

#### Environment Configuration
- Development, staging, and production environments
- Environment-specific configurations
- Feature flags for gradual rollouts
- Analytics and error tracking

#### Hosting Requirements
- Static site hosting (Vercel, Netlify, etc.)
- CDN for assets
- SSL/TLS encryption
- Custom domain support

### Documentation Requirements

#### Technical Documentation
- API documentation for all utilities
- Component documentation with examples
- Setup and deployment guides
- Architecture decision records

#### User Documentation
- User guide in French
- Video tutorials for complex workflows
- FAQ section
- Troubleshooting guide

### Future Enhancements

#### Phase 2 Features
- Multiple language support
- Advanced PDF editing capabilities
- Integration with school management systems
- Batch processing for multiple children

#### Phase 3 Features
- Mobile app (React Native)
- Cloud synchronization
- Advanced analytics
- Custom form builder

## Success Criteria

### Technical Success
- ✅ All forms generate pixel-perfect PDFs
- ✅ 100% TypeScript coverage
- ✅ 80%+ test coverage
- ✅ Accessibility compliance
- ✅ Performance benchmarks met

### User Success
- ✅ Parents can complete forms in < 10 minutes
- ✅ 95%+ data accuracy compared to manual forms
- ✅ Positive user feedback (4.5/5 stars)
- ✅ Reduced administrative burden on schools

### Business Success
- ✅ 50%+ reduction in form processing time
- ✅ 90%+ parent adoption rate
- ✅ Scalable to other school districts
- ✅ Cost-effective solution

## Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment**: Copy `.env.example` to `.env`
4. **Start development**: `npm run dev`
5. **Run tests**: `npm run test`
6. **Build for production**: `npm run build`

## Contributing Guidelines

- Follow the established code style
- Write comprehensive tests
- Update documentation
- Use conventional commits
- Submit pull requests for review

---

*This document is a living specification and will be updated as the project evolves.*