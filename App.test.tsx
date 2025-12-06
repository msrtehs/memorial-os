import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Fix for missing types
declare const jest: any;
declare const describe: any;
declare const test: any;
declare const expect: any;

// Mock GoogleGenAI to avoid API calls during tests
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    chats: {
      create: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({ text: 'AI Response Mock' })
      })
    }
  }))
}));

describe('MemorialOS System Tests', () => {
  
  test('renders initial User View (Memorials)', () => {
    render(<App />);
    // Check for brand name
    expect(screen.getByText(/MemorialOS/i)).toBeInTheDocument();
    // Check for default user page header
    expect(screen.getByText(/Jardim de Memórias/i)).toBeInTheDocument();
  });

  test('requires Login to access Manager View', () => {
    render(<App />);
    
    // Find and click the Manager toggle button
    const managerButton = screen.getByText('Gestor');
    fireEvent.click(managerButton);

    // Should see Login Modal, NOT Dashboard directly
    expect(screen.getByText(/Acesso Restrito/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  test('successfully logs in with correct password', () => {
    render(<App />);
    
    // 1. Try to access Manager
    fireEvent.click(screen.getByText('Gestor'));
    
    // 2. Enter Password
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    fireEvent.change(passwordInput, { target: { value: '1234' } });
    
    // 3. Click Enter
    fireEvent.click(screen.getByText('Entrar'));

    // 4. Verify Dashboard access
    expect(screen.getByText(/Dashboard Executivo/i)).toBeInTheDocument();
    expect(screen.getByText(/Taxa de Ocupação/i)).toBeInTheDocument();
  });

  test('shows error with incorrect password', () => {
    render(<App />);
    
    fireEvent.click(screen.getByText('Gestor'));
    
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    
    fireEvent.click(screen.getByText('Entrar'));

    // Should see error message
    expect(screen.getByText(/Senha incorreta/i)).toBeInTheDocument();
  });

  test('Sidebar navigation works in User Mode', () => {
    render(<App />);
    // Default is User
    
    // Click on Services
    const servicesButton = screen.getByText('Loja & Serviços');
    fireEvent.click(servicesButton);

    // Verify Services Page loaded
    expect(screen.getByText(/Serviços & Homenagens/i)).toBeInTheDocument();
  });
});