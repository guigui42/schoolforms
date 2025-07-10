import { createTheme } from '@mantine/core';

export const theme = createTheme({
  /** Put your mantine theme override here */
  primaryColor: 'blue',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  },
  colors: {
    // French school colors - you can customize these
    primary: [
      '#e6f3ff',
      '#bee1ff',
      '#91cbff',
      '#64b5ff',
      '#3a9eff',
      '#1a88ff',
      '#0672e6',
      '#055bb3',
      '#034580',
      '#022e4d'
    ],
    secondary: [
      '#f0f9ff',
      '#e6f4ff',
      '#ccebff',
      '#99d6ff',
      '#66c2ff',
      '#3dadff',
      '#1a98ff',
      '#0066cc',
      '#004d99',
      '#003366'
    ]
  },
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'md',
      },
    },
    Select: {
      defaultProps: {
        size: 'md',
      },
    },
    DateInput: {
      defaultProps: {
        size: 'md',
      },
    },
  },
});
