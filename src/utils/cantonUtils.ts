// Utility functions for canton determination based on BFS codes
export interface AdministrativeUnit {
  HistoricalCode: string;
  BfsCode: string;
  ValidFrom: string;
  ValidTo: string;
  Level: string;
  Parent: string;
  Name: string;
  ShortName: string;
  Inscription: string;
  Radiation: string;
  Rec_Type_fr: string;
  Rec_Type_de: string;
}

// Parse CSV data into objects
export function parseAdministrativeUnits(csvText: string): AdministrativeUnit[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const unit: any = {};
    
    headers.forEach((header, index) => {
      unit[header] = values[index] || '';
    });
    
    return unit as AdministrativeUnit;
  });
}

// Function to get canton by BFS code
export function getKantonByBfs(bfsCode: number, administrativeUnits: AdministrativeUnit[]): string {
  // Find municipality with BFS code
  const municipality = administrativeUnits.find(unit => 
    Number(unit.BfsCode) === bfsCode
  );
  
  if (!municipality) {
    return `Keine Gemeinde mit BFS-Code ${bfsCode} gefunden.`;
  }

  // Follow parent chain until Level == 1 (Canton)
  let parentCode = municipality.Parent;
  
  while (parentCode) {
    const parentUnit = administrativeUnits.find(unit => 
      unit.HistoricalCode === parentCode.toString()
    );
    
    if (!parentUnit) {
      return "Fehler: Parent nicht gefunden.";
    }

    if (Number(parentUnit.Level) === 1) {
      return parentUnit.Name; // Canton found
    }

    parentCode = parentUnit.Parent;
  }

  return "Kein Kanton gefunden.";
}

// Load and parse the CSV data
let administrativeUnitsCache: AdministrativeUnit[] | null = null;

export async function loadAdministrativeUnits(): Promise<AdministrativeUnit[]> {
  if (administrativeUnitsCache) {
    return administrativeUnitsCache;
  }

  try {
    const response = await fetch('/swiss-administrative-units.csv');
    const csvText = await response.text();
    administrativeUnitsCache = parseAdministrativeUnits(csvText);
    return administrativeUnitsCache;
  } catch (error) {
    console.error('Failed to load administrative units:', error);
    return [];
  }
}

// Main function to determine canton from BFS code
export async function determineCantonFromBfs(bfsCode: number): Promise<string> {
  try {
    const units = await loadAdministrativeUnits();
    return getKantonByBfs(bfsCode, units);
  } catch (error) {
    console.error('Error determining canton:', error);
    return "Fehler beim Ermitteln des Kantons.";
  }
}