import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContactPage from './page';

// Mock the ContactForm component
vi.mock('@/app/00_global/components/ContactForm', () => ({
  __esModule: true,
  default: () => <div data-testid="contact-form">Contact Form Component</div>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Mail: () => <div data-testid="mail-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
}));

describe('ContactPage', () => {
  it('should render the contact page with title and description', () => {
    render(<ContactPage />);

    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
  });

  it('should render the contact form', () => {
    render(<ContactPage />);

    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  });

  it('should render contact information section', () => {
    render(<ContactPage />);

    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('info@samuido.com')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('+81 (0) 123-456-789')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument();
  });

  it('should render business hours section', () => {
    render(<ContactPage />);

    expect(screen.getByText('Business Hours')).toBeInTheDocument();
    expect(screen.getByText('Monday - Friday: 9:00 AM - 6:00 PM JST')).toBeInTheDocument();
    expect(screen.getByText('Saturday - Sunday: Closed')).toBeInTheDocument();
  });

  it('should render FAQ section', () => {
    render(<ContactPage />);

    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('What services do you offer?')).toBeInTheDocument();
    expect(screen.getByText('How quickly will I receive a response?')).toBeInTheDocument();
    expect(screen.getByText('Do you work with international clients?')).toBeInTheDocument();
    expect(
      screen.getByText('What information should I include in my inquiry?')
    ).toBeInTheDocument();
  });
});
