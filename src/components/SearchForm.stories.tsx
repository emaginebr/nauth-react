import type { Meta, StoryObj } from '@storybook/react';
import { SearchForm } from './SearchForm';
import { NAuthProvider } from '../contexts/NAuthContext';

const meta = {
  title: 'Components/SearchForm',
  component: SearchForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NAuthProvider
        config={{
          apiUrl: 'http://localhost:5000',
          enableFingerprinting: false,
        }}
      >
        <div className="max-w-6xl mx-auto p-6">
          <Story />
        </div>
      </NAuthProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SearchForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    showUserAvatar: true,
    onSuccess: (result) => {
      console.log('Search successful:', result);
    },
    onError: (error) => {
      console.error('Search error:', error);
    },
    onUserClick: (user) => {
      console.log('User clicked:', user);
    },
  },
};

export const WithoutAvatars: Story = {
  args: {
    ...Default.args,
    showUserAvatar: false,
  },
};

export const LargePageSize: Story = {
  args: {
    ...Default.args,
    initialPageSize: 50,
  },
};

export const CustomPageSizes: Story = {
  args: {
    ...Default.args,
    pageSizeOptions: [5, 15, 30, 60],
    initialPageSize: 15,
  },
};

export const WithCustomStyles: Story = {
  args: {
    ...Default.args,
    styles: {
      container: 'bg-gray-50 dark:bg-gray-900 p-6 rounded-lg',
      searchBar: 'mb-6',
      table: 'shadow-xl',
      pagination: 'bg-white dark:bg-gray-800 p-4 rounded-md',
    },
  },
};
