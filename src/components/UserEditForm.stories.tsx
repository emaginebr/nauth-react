import type { Meta, StoryObj } from '@storybook/react';
import { UserEditForm } from './UserEditForm';
import { NAuthProvider } from '../contexts/NAuthContext';

const meta = {
  title: 'User Management/UserEditForm',
  component: UserEditForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NAuthProvider
        config={{
          apiUrl: 'https://api.example.com',
          storageKey: 'nauth_token_storybook',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <Story />
        </div>
      </NAuthProvider>
    ),
  ],
} satisfies Meta<typeof UserEditForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Create Mode - Default state for creating a new user.
 * The form starts empty and requires a password.
 */
export const CreateMode: Story = {
  args: {
    onSuccess: (user) => {
      console.log('User created:', user);
      alert(`User created successfully: ${user.name}`);
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      alert(`Error: ${error.message}`);
    },
    onCancel: () => {
      console.log('Create cancelled');
      alert('Create cancelled');
    },
  },
};

/**
 * Edit Mode - Form is populated with existing user data.
 * Password field is hidden in edit mode (use separate change password flow).
 */
export const EditMode: Story = {
  args: {
    userId: 1,
    onSuccess: (user) => {
      console.log('User updated:', user);
      alert(`User updated successfully: ${user.name}`);
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      alert(`Error: ${error.message}`);
    },
    onCancel: () => {
      console.log('Edit cancelled');
      alert('Edit cancelled');
    },
  },
};

/**
 * Create Mode with Pre-filled Data - For demonstration purposes.
 * Shows how the form looks with data entered.
 */
export const CreateWithData: Story = {
  args: {
    onSuccess: (user) => {
      console.log('User created:', user);
    },
  },
};

/**
 * Create Mode without Cancel Button - Use when the form is the main page content.
 */
export const CreateWithoutCancel: Story = {
  args: {
    onSuccess: (user) => {
      console.log('User created:', user);
      alert(`User created: ${user.name}`);
    },
    onError: (error) => {
      console.error('Error:', error);
    },
  },
};

/**
 * Edit Mode with Custom Styling - Shows the className prop in action.
 */
export const EditWithCustomStyling: Story = {
  args: {
    userId: 1,
    className: 'bg-slate-50 p-6 rounded-xl shadow-lg',
    onSuccess: (user) => {
      console.log('User updated:', user);
    },
    onError: (error) => {
      console.error('Error:', error);
    },
    onCancel: () => {
      console.log('Cancelled');
    },
  },
};

/**
 * Loading State - Demonstrates the form's loading appearance.
 * This would normally happen when fetching user data for edit mode.
 */
export const LoadingState: Story = {
  args: {
    userId: 999, // Non-existent user to trigger loading
    onSuccess: (user) => {
      console.log('User updated:', user);
    },
    onError: (error) => {
      console.error('Error:', error);
    },
  },
};
