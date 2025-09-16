import * as React from "react";
import { CustomSelect } from "./custom-select";
import { NativeSelect } from "./native-select";

interface Option {
  value: string;
  label: string;
  displayLabel?: string;
}

const sampleOptions: Option[] = [
  { value: "1", label: "Initiative für eine nachhaltige Energiepolitik", displayLabel: "Energiepolitik Initiative" },
  { value: "2", label: "Referendum gegen das neue Steuergesetz", displayLabel: "Steuergesetz Referendum" },
  { value: "3", label: "Initiative für bessere Bildungschancen", displayLabel: "Bildungschancen Initiative" },
  { value: "4", label: "Referendum für den Schutz der Umwelt", displayLabel: "Umweltschutz Referendum" },
];

export function SelectComparison() {
  const [customValue, setCustomValue] = React.useState("");
  const [nativeValue, setNativeValue] = React.useState("");

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dropdown Comparison</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Custom Select (Current)</h3>
          <div className="space-y-2">
            <label htmlFor="custom-select" className="text-sm font-medium text-gray-600">
              Select an option:
            </label>
            <CustomSelect
              id="custom-select"
              options={sampleOptions}
              value={customValue}
              onValueChange={setCustomValue}
              placeholder="Choose an option..."
              aria-label="Select an option using custom dropdown"
            />
            <p className="text-sm text-gray-500">
              Selected: {customValue || "None"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Native Select (New)</h3>
          <div className="space-y-2">
            <label htmlFor="native-select" className="text-sm font-medium text-gray-600">
              Select an option:
            </label>
            <NativeSelect
              id="native-select"
              options={sampleOptions}
              value={nativeValue}
              onValueChange={setNativeValue}
              placeholder="Choose an option..."
              aria-label="Select an option using native HTML select"
            />
            <p className="text-sm text-gray-500">
              Selected: {nativeValue || "None"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Accessibility Features of Native Select:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Native keyboard navigation (Arrow keys, Enter, Escape)</li>
          <li>• Screen reader support with proper ARIA attributes</li>
          <li>• Focus management handled by browser</li>
          <li>• Mobile-friendly touch interactions</li>
          <li>• Consistent behavior across all browsers</li>
          <li>• No JavaScript required for basic functionality</li>
        </ul>
      </div>
    </div>
  );
}


