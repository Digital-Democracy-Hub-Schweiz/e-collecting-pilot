# Native Select Component

## Overview

The `NativeSelect` component is a new dropdown variant that uses the native HTML `<select>` element for better accessibility and user experience. It's designed to replace the custom `CustomSelect` component in step 1 of the e-collecting form.

## Features

### Accessibility
- **Native keyboard navigation**: Arrow keys, Enter, Escape work out of the box
- **Screen reader support**: Proper ARIA attributes and semantic HTML
- **Focus management**: Handled by the browser, no custom JavaScript required
- **Mobile-friendly**: Native touch interactions on mobile devices
- **Consistent behavior**: Works the same across all browsers and platforms

### Design
- **Figma-compliant styling**: Matches the design system specifications
- **Custom chevron icon**: Positioned over the native select for visual consistency
- **Focus states**: Proper focus indicators with red border
- **Disabled states**: Clear visual feedback when disabled

## Usage

```tsx
import { NativeSelect } from "@/components/ui/native-select";

const options = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
];

<NativeSelect
  id="my-select"
  options={options}
  value={selectedValue}
  onValueChange={setSelectedValue}
  placeholder="Choose an option..."
  aria-label="Select an option"
  disabled={false}
  className="w-full"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Option[]` | - | Array of options to display |
| `value` | `string` | - | Currently selected value |
| `onValueChange` | `(value: string) => void` | - | Callback when selection changes |
| `placeholder` | `string` | `"Auswählen..."` | Placeholder text |
| `disabled` | `boolean` | `false` | Whether the select is disabled |
| `className` | `string` | - | Additional CSS classes |
| `aria-label` | `string` | - | Accessibility label |
| `id` | `string` | - | HTML id attribute |

## Option Interface

```tsx
interface Option {
  value: string;
  label: string;
  displayLabel?: string; // Optional shorter label for display
}
```

## Implementation Details

The component uses a native `<select>` element with custom styling applied via CSS classes. The chevron icon is positioned absolutely over the select element to maintain the visual design while preserving native functionality.

### Key Implementation Points:
1. **appearance: none** - Removes default browser styling
2. **Custom positioning** - Chevron icon positioned over the select
3. **Focus management** - Uses native focus events
4. **Accessibility** - Proper labeling and ARIA attributes

## Migration from CustomSelect

To migrate from `CustomSelect` to `NativeSelect`:

1. Import the new component:
   ```tsx
   import { NativeSelect } from "@/components/ui/native-select";
   ```

2. Replace the component usage:
   ```tsx
   // Before
   <CustomSelect options={options} value={value} onValueChange={setValue} />
   
   // After
   <NativeSelect options={options} value={value} onValueChange={setValue} />
   ```

3. The props interface is identical, so no other changes are needed.

## Testing

The component has been tested for:
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Mobile touch interactions
- ✅ Focus management
- ✅ Visual design consistency
- ✅ Error state handling
- ✅ Disabled state handling

## Browser Support

The native select element is supported in all modern browsers. The custom styling uses CSS properties that are well-supported:
- `appearance: none` - Supported in all modern browsers
- CSS Grid and Flexbox - Used for layout
- CSS Custom Properties - Used for theming
