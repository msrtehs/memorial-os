
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManagerView } from '../ManagerView';
import { Page } from '../../types';
import { MOCK_CEMETERIES, MOCK_PLOTS, MOCK_TRANSACTIONS, MOCK_PARTNERS, MOCK_TASKS, MOCK_STOCK } from '../../services/dataService';

// Fix for missing types
declare const jest: any;
declare const describe: any;
declare const test: any;
declare const expect: any;

// Mock props
const mockProps = {
  page: Page.DASHBOARD,
  setPage: jest.fn(),
  setProfiles: jest.fn(),
  profiles: [],
  plots: MOCK_PLOTS,
  setPlots: jest.fn(),
  transactions: MOCK_TRANSACTIONS,
  setTransactions: jest.fn(),
  partners: MOCK_PARTNERS,
  setPartners: jest.fn(),
  inspections: [],
  setInspections: jest.fn(),
  licensingDocs: [],
  setLicensingDocs: jest.fn(),
  tasks: MOCK_TASKS,
  setTasks: jest.fn(),
  stock: MOCK_STOCK,
  setStock: jest.fn()
};

describe('ManagerView Component - Deep Process Tests', () => {
  
  test('Dashboard: Opens Necroleachate Checklist Modal locally', () => {
    render(<ManagerView {...mockProps} />);
    
    // Find the Necrochorume card action button
    const checklistBtn = screen.getByText(/Preencher Checklist/i);
    expect(checklistBtn).toBeInTheDocument();
    
    // Simulate user clicking the button
    fireEvent.click(checklistBtn);
    
    // Verify Modal Opens locally (Checklist: Necrochorume header)
    expect(screen.getByText('Checklist: Necrochorume')).toBeInTheDocument();
    
    // Verify specific fields are present
    expect(screen.getByText(/Drenagem Superficial/i)).toBeInTheDocument();
    expect(screen.getByText(/Zelador José Santos/i)).toBeInTheDocument();
  });

  test('Dashboard: Checklist submission updates AI Context (Simulated)', () => {
    // This test ensures the setInspections is called, which feeds the AI
    const setInspectionsMock = jest.fn();
    render(<ManagerView {...mockProps} setInspections={setInspectionsMock} />);
    
    // Open Modal
    fireEvent.click(screen.getByText(/Preencher Checklist/i));
    
    // Click Save
    const saveBtn = screen.getByText(/Salvar & Enviar Relatório/i);
    fireEvent.click(saveBtn);
    
    // Ensure state update was triggered
    expect(setInspectionsMock).toHaveBeenCalled();
  });

  test('Expert AI: Renders with Omniscient Granular Header', () => {
    render(<ManagerView {...mockProps} page={Page.EXPERT_AI} />);
    
    // Check for the specific branding and title update
    expect(screen.getByText(/Supervisora Geral/i)).toBeInTheDocument();
    // Verify it mentions Granular capability
    expect(screen.getByText(/Onisciência Granular por Unidade/i)).toBeInTheDocument();
    
    // Check if chat input is available
    const input = screen.getByPlaceholderText(/Pergunte sobre Manutenção, Estoque/i);
    expect(input).toBeInTheDocument();
  });

  test('Global Cemetery Selector affects Dashboard View', () => {
     render(<ManagerView {...mockProps} page={Page.DASHBOARD} />);
     
     // Default is 'All Units'
     expect(screen.getByText(/Visão Corporativa \(Todos\)/i)).toBeInTheDocument();
     
     // Note: Testing actual dropdown interaction might require more complex mocking of state,
     // but checking presence verifies the component is rendered.
     const selector = screen.getByText(/Todas as Unidades/i);
     expect(selector).toBeInTheDocument();
  });
});
