import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressAutocomplete } from '../native-address-search';
import { searchAddresses } from '@/services/addressAPI';

// Mock the address API
vi.mock('@/services/addressAPI', () => ({
  searchAddresses: vi.fn(),
}));

const mockSearchAddresses = vi.mocked(searchAddresses);

const mockAddressHit = {
  place: {
    identifier: 'test-id',
    postalAddress: {
      streetAddress: 'Bahnhofstrasse 1',
      postalCode: '8001',
      addressLocality: 'Zürich',
      addressRegion: 'ZH',
    },
    additionalProperty: {
      municipalityCode: '261',
    },
  },
};

describe('AddressAutocomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with basic props', () => {
    render(
      <AddressAutocomplete
        id="test-address"
        value=""
        onValueChange={vi.fn()}
        placeholder="Enter address..."
        aria-label="Address input"
      />
    );

    const input = screen.getByRole('textbox', { name: 'Address input' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter address...');
  });

  it('provides screen reader instructions', () => {
    render(
      <AddressAutocomplete
        id="test-address"
        value=""
        onValueChange={vi.fn()}
      />
    );

    const instructions = screen.getByText(/Beginnen Sie mit der Eingabe/);
    expect(instructions).toBeInTheDocument();
    expect(instructions).toHaveClass('sr-only');
  });

  it('shows loading state during search', async () => {
    mockSearchAddresses.mockImplementation(() => new Promise(() => {})); // Never resolves

    const user = userEvent.setup();
    render(
      <AddressAutocomplete
        id="test-address"
        value=""
        onValueChange={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'Bahnhofstrasse 1');

    await waitFor(() => {
      const loadingIndicator = screen.getByRole('status');
      expect(loadingIndicator).toHaveTextContent('Adresssuche läuft...');
    });
  });

  it('displays search results when addresses are found', async () => {
    mockSearchAddresses.mockResolvedValue({
      hits: [mockAddressHit],
    });

    const user = userEvent.setup();
    render(
      <AddressAutocomplete
        id="test-address"
        value=""
        onValueChange={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'Bahnhofstrasse 1');

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });

    const option = screen.getByRole('option');
    expect(option).toHaveTextContent('Bahnhofstrasse 1, 8001 Zürich');
  });

  it('calls onAddressSelect and onValueChange when address is selected', async () => {
    mockSearchAddresses.mockResolvedValue({
      hits: [mockAddressHit],
    });

    const onValueChange = vi.fn();
    const onAddressSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <AddressAutocomplete
        id="test-address"
        value=""
        onValueChange={onValueChange}
        onAddressSelect={onAddressSelect}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'Bahnhofstrasse 1');

    await waitFor(() => {
      const option = screen.getByRole('option');
      expect(option).toBeInTheDocument();
    });

    const option = screen.getByRole('option');
    await user.click(option);

    expect(onValueChange).toHaveBeenCalledWith('Bahnhofstrasse 1');
    expect(onAddressSelect).toHaveBeenCalledWith(mockAddressHit);
  });

  it('supports keyboard navigation', async () => {
    mockSearchAddresses.mockResolvedValue({
      hits: [mockAddressHit],
    });

    const onAddressSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <AddressAutocomplete
        id="test-address"
        value=""
        onValueChange={vi.fn()}
        onAddressSelect={onAddressSelect}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'Bahnhofstrasse 1');

    await waitFor(() => {
      const option = screen.getByRole('option');
      expect(option).toBeInTheDocument();
    });

    // Navigate down to option and select with Enter
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onAddressSelect).toHaveBeenCalledWith(mockAddressHit);
  });

  it('does not search for queries shorter than 5 characters', async () => {
    const user = userEvent.setup();
    render(
      <AddressAutocomplete
        id="test-address"
        value=""
        onValueChange={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'Bahn');

    // Wait a bit to ensure debounce would have fired
    await new Promise(resolve => setTimeout(resolve, 400));

    expect(mockSearchAddresses).not.toHaveBeenCalled();
  });

  it('handles search errors gracefully', async () => {
    mockSearchAddresses.mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    render(
      <AddressAutocomplete
        id="test-address"
        value=""
        onValueChange={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'Bahnhofstrasse 1');

    await waitFor(() => {
      const status = screen.getByRole('status');
      expect(status).toHaveTextContent('Keine Adressen gefunden');
    });
  });

  it('can be disabled', () => {
    render(
      <AddressAutocomplete
        id="test-address"
        value=""
        onValueChange={vi.fn()}
        disabled={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});