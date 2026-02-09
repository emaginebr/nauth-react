import type { Meta, StoryObj } from '@storybook/react';
import { RoleList } from './RoleList';
import { NAuthProvider } from '../contexts/NAuthContext';

const meta = {
  title: 'Components/RoleList',
  component: RoleList,
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
        <Story />
      </NAuthProvider>
    ),
  ],
} satisfies Meta<typeof RoleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showCreateButton: true,
    initialPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
};

export const WithoutCreateButton: Story = {
  args: {
    showCreateButton: false,
    initialPageSize: 10,
  },
};

export const CustomPageSize: Story = {
  args: {
    showCreateButton: true,
    initialPageSize: 25,
    pageSizeOptions: [5, 10, 25, 50],
  },
};

export const WithCallbacks: Story = {
  args: {
    showCreateButton: true,
    onRoleClick: (role) => console.log('Role clicked:', role),
    onEdit: (role) => console.log('Edit role:', role),
    onDelete: (role) => console.log('Delete role:', role),
    onSuccess: () => console.log('Operation successful'),
    onError: (error) => console.error('Error:', error),
  },
};
