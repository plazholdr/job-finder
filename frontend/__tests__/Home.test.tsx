import { render, screen } from '@testing-library/react';
import Home from '../src/app/page';

jest.mock('antd', () => {
  const originalModule = jest.requireActual('antd');
  return {
    ...originalModule,
    Button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    Typography: {
      Title: ({ children, ...props }: any) => (
        <h1 {...props}>{children}</h1>
      ),
    },
  };
});

describe('Home', () => {
  it('renders the home page', () => {
    render(<Home />);
    
    expect(screen.getByText('Job Finder')).toBeInTheDocument();
    expect(screen.getByText('Find your dream job with Job Finder')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });
});
