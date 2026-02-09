import type { Meta, StoryObj } from '@storybook/react';
import { RegisterForm } from '../components/RegisterForm';
import { NAuthProvider } from '../contexts/NAuthContext';

const meta: Meta<typeof RegisterForm> = {
  title: 'Authentication/RegisterForm',
  component: RegisterForm,
  decorators: [
    (Story) => (
      <NAuthProvider config={{ apiUrl: 'http://localhost:8080' }}>
        <div className="max-w-md mx-auto">
          <Story />
        </div>
      </NAuthProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'success' },
    onError: { action: 'error' },
    showTermsCheckbox: {
      control: 'boolean',
      description: 'Show terms and conditions checkbox',
    },
    termsUrl: {
      control: 'text',
      description: 'Terms and conditions URL',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RegisterForm>;

export const Default: Story = {
  args: {},
};

export const WithoutTerms: Story = {
  args: {
    showTermsCheckbox: false,
  },
};

export const WithCustomTermsUrl: Story = {
  args: {
    showTermsCheckbox: true,
    termsUrl: 'https://example.com/terms',
  },
};
