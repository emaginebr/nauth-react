import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light">
        <div className="p-8">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
