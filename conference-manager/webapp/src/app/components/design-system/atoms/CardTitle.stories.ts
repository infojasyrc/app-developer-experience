import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CardTitle from './CardTitle';

const meta = {
  title: 'Atom/CardTitle',
  component: CardTitle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: 'Card Title',
    className: { control: 'text' },
  },
  args: { onClick: () => {} },
} satisfies Meta<typeof CardTitle>;

export default meta;
type Story = StoryObj<typeof meta>;


export const Primary: Story = {
  args: {
    title: 'Primary Card Title',
    className: 'primary-class',
  },
};

export const Secondary: Story = {
  args: {
    title: 'Secondary Card Title',
    className: 'secondary-class',
  },
};
