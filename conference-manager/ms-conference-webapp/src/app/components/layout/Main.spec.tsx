import { render, screen } from '@testing-library/react';

import Main from './Main';

describe('Main component', () => {
    it('renders Next.js logo', () => {
        render(<Main />);
        const logo = screen.getByAltText('Next.js logo');
        expect(logo).toBeInTheDocument();
    });

    it('has correct class names', () => {
        render(<Main />);
        const mainElement = screen.getByRole('main');
        expect(mainElement).toHaveClass('flex flex-col gap-[32px] row-start-2 items-center sm:items-start');
    });

    it('renders Image component with correct props', () => {
        render(<Main />);
        const image = screen.getByAltText('Next.js logo');
        expect(image).toHaveAttribute('src', '/next.svg');
        expect(image).toHaveAttribute('width', '180');
        expect(image).toHaveAttribute('height', '38');
    });
});