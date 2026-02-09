import type { Meta, StoryObj } from '@storybook/react';
import { RoleForm } from './RoleForm';
import { NAuthProvider } from '../contexts/NAuthContext';

const meta = {
  title: 'Components/RoleForm',
  component: RoleForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NAuthProvider
        config={{
          apiUrl: 'http://localhost:5000',
          storageKey: 'nauth_token',
        }}
      >
        <div className="max-w-2xl">
          <Story />
        </div>
      </NAuthProvider>
    ),
  ],
} satisfies Meta<typeof RoleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
  args: {
    onSuccess: (role) => console.log('Role created:', role),
    onError: (error) => console.error('Error:', error),
    onCancel: () => console.log('Cancelled'),
  },
};

export const EditMode: Story = {
  args: {
    roleId: 1,
    onSuccess: (role) => console.log('Role updated:', role),
    onError: (error) => console.error('Error:', error),
    onCancel: () => console.log('Cancelled'),
  },
};

export const WithoutCancel: Story = {
  args: {
    onSuccess: (role) => console.log('Role created:', role),
    onError: (error) => console.error('Error:', error),
  },
};
