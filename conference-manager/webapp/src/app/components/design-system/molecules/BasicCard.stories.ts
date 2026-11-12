import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BasicCard from './BasicCard';

const meta = {
  title: 'Molecule/BasicCard',
  component: BasicCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: 'Card Title',
    className: { control: 'text' },
  },
  args: { onClick: () => {} },
} satisfies Meta<typeof BasicCard>;

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
