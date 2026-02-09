import type { Meta, StoryObj } from '@storybook/react';
import { LoginForm } from '../components/LoginForm';
import { NAuthProvider } from '../contexts/NAuthContext';

const meta: Meta<typeof LoginForm> = {
  title: 'Authentication/LoginForm',
  component: LoginForm,
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
    showRememberMe: {
      control: 'boolean',
      description: 'Show remember me checkbox',
    },
    showForgotPassword: {
      control: 'boolean',
      description: 'Show forgot password link',
    },
    showRegisterLink: {
      control: 'boolean',
      description: 'Show register link',
    },
    customSubmitText: {
      control: 'text',
      description: 'Custom submit button text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  args: {},
};

export const WithRememberMe: Story = {
  args: {
    showRememberMe: true,
  },
};

export const WithAllOptions: Story = {
  args: {
    showRememberMe: true,
    showForgotPassword: true,
    showRegisterLink: true,
  },
};

export const CustomSubmitText: Story = {
  args: {
    customSubmitText: 'Log In Now',
    showRememberMe: true,
    showForgotPassword: true,
    showRegisterLink: true,
  },
};

export const Minimal: Story = {
  args: {
    showRememberMe: false,
    showForgotPassword: false,
    showRegisterLink: false,
  },
};
