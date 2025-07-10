# French School Forms Generator

A React-based web application that allows French parents to digitally fill out school enrollment forms and generate exact PDF replicas of official forms, eliminating manual duplication and ensuring accuracy.

## Features

- **Smart Data Reuse**: Enter child and family information once, automatically populate all forms
- **Exact PDF Generation**: Generate pixel-perfect replicas of official school forms
- **Multi-form Support**: Handle PERISCOLAIRE, EDPP, and other school forms
- **Family Management**: Support multiple children with shared parent/guardian information
- **Offline Capability**: Work offline with local data storage
- **French Localization**: Complete French language support

## Technology Stack

- **React 19** with TypeScript
- **Mantine 8** for UI components
- **Zustand** for state management
- **React Hook Form** + **Zod** for form handling and validation
- **PDF-lib** for PDF generation
- **React Router DOM** for navigation
- **Vite** for build tooling

## Project Structure

```
src/
├── components/
│   ├── forms/           # Form-specific components
│   ├── ui/              # Reusable UI components
│   ├── pdf/             # PDF generation components
│   └── layout/          # Layout components
├── pages/
│   ├── Dashboard.tsx    # Main dashboard
│   ├── FormFiller.tsx   # Form filling interface
│   ├── PDFPreview.tsx   # PDF preview page
│   └── Settings.tsx     # App settings
├── stores/
│   └── formStore.ts     # Zustand store for form data
├── types/
│   ├── common.ts        # Common type definitions
│   └── forms.ts         # Form-specific types
├── utils/
│   ├── constants.ts     # App constants
│   ├── pdf/             # PDF generation utilities
│   ├── validation/      # Validation utilities
│   └── storage/         # Local storage utilities
└── hooks/               # Custom React hooks
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Check TypeScript types
- `npm run test` - Run tests
- `npm run format` - Format code with Prettier

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use Mantine components for consistent UI
- Implement proper error handling and validation
- Write tests for critical functionality

### Form Data Flow

1. **Data Entry**: Parents enter information once in the family management section
2. **Auto-Population**: Form fields automatically populate with existing data
3. **Validation**: Real-time validation with French error messages
4. **PDF Generation**: Generate exact replicas of official forms
5. **Storage**: Data persists locally across browser sessions

### PDF Generation

The app uses original PDF templates stored in `/public/templates/` and overlays form data at precise coordinates to maintain the original layout and formatting.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and type checking
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please open an issue on the GitHub repository.
