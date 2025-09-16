# Native Address Search Component

## Übersicht

Die `NativeAddressSearch`-Komponente ist eine neue Adresssuch-Komponente, die die native HTML `<select>`-Dropdown des Betriebssystems für die Adressauswahl verwendet. Sie kombiniert ein Eingabefeld für die Adresssuche mit einer nativen Dropdown-Auswahl für bessere Barrierefreiheit und Benutzerfreundlichkeit.

## Features

### Barrierefreiheit
- **Native Tastaturnavigation**: Pfeiltasten, Enter, Escape funktionieren out-of-the-box
- **Screen Reader Support**: Korrekte ARIA-Attribute und semantisches HTML
- **Focus Management**: Wird vom Browser gehandhabt, keine benutzerdefinierte JavaScript-Logik erforderlich
- **Mobile-freundlich**: Native Touch-Interaktionen auf mobilen Geräten
- **Konsistentes Verhalten**: Funktioniert gleich in allen Browsern und Plattformen

### Design
- **Figma-konforme Gestaltung**: Entspricht den Design-System-Spezifikationen
- **Benutzerdefiniertes Chevron-Icon**: Positioniert über der nativen Select für visuelle Konsistenz
- **Focus-Zustände**: Korrekte Focus-Indikatoren mit lila Ring
- **Deaktivierte Zustände**: Klare visuelle Rückmeldung bei Deaktivierung
- **Lade-Indikator**: Zeigt Ladezustand während der Adresssuche

### Funktionalität
- **Debounced Search**: Verzögerte Suche nach 300ms für bessere Performance
- **Minimale Suchlänge**: Sucht erst ab 5 Zeichen
- **Native Dropdown**: Verwendet native Betriebssystem-Dropdown für Adressauswahl
- **Automatische Vervollständigung**: Zeigt Suchergebnisse in nativer Dropdown an

## Verwendung

```tsx
import { NativeAddressSearch } from "@/components/ui/native-address-search";

<NativeAddressSearch
  id="street-address"
  value={streetAddress}
  onValueChange={setStreetAddress}
  onAddressSelect={handleAddressSelect}
  placeholder="Strasse und Hausnummer eingeben..."
  aria-label="Adresse eingeben"
  disabled={false}
  className="w-full"
/>
```

## Props

| Prop | Typ | Standard | Beschreibung |
|------|-----|----------|--------------|
| `value` | `string` | `""` | Aktueller Wert des Eingabefelds |
| `onValueChange` | `(value: string) => void` | - | Callback bei Änderung des Eingabewerts |
| `onAddressSelect` | `(address: AddressHit) => void` | - | Callback bei Auswahl einer Adresse |
| `placeholder` | `string` | `"Strasse und Hausnummer eingeben..."` | Platzhaltertext |
| `disabled` | `boolean` | `false` | Ob die Komponente deaktiviert ist |
| `className` | `string` | - | Zusätzliche CSS-Klassen |
| `aria-label` | `string` | - | Barrierefreiheits-Label |
| `id` | `string` | - | HTML id-Attribut |

## Implementierungsdetails

Die Komponente verwendet eine Kombination aus:
1. **Eingabefeld**: Für die manuelle Eingabe und Suche von Adressen
2. **Native Select**: Für die Auswahl aus den Suchergebnissen
3. **Debounced Search**: Für optimierte API-Aufrufe
4. **Lade-Indikator**: Für visuelles Feedback während der Suche

### Wichtige Implementierungspunkte:
1. **appearance: none** - Entfernt Standard-Browser-Styling
2. **Benutzerdefinierte Positionierung** - Chevron-Icon über der Select positioniert
3. **Focus Management** - Verwendet native Focus-Events
4. **Barrierefreiheit** - Korrekte Beschriftung und ARIA-Attribute
5. **Debounced Search** - Verzögerte Suche für bessere Performance

## Migration von AddressAutocomplete

Um von `AddressAutocomplete` zu `NativeAddressSearch` zu migrieren:

1. Import der neuen Komponente:
   ```tsx
   import { NativeAddressSearch } from "@/components/ui/native-address-search";
   ```

2. Ersetzen der Komponentenverwendung:
   ```tsx
   // Vorher
   <AddressAutocomplete 
     value={streetAddress}
     onValueChange={setStreetAddress}
     onAddressSelect={handleAddressSelect}
   />
   
   // Nachher
   <NativeAddressSearch 
     value={streetAddress}
     onValueChange={setStreetAddress}
     onAddressSelect={handleAddressSelect}
   />
   ```

3. Die Props-Schnittstelle ist identisch, daher sind keine weiteren Änderungen erforderlich.

## Testing

Die Komponente wurde getestet für:
- ✅ Tastaturnavigation
- ✅ Screen Reader-Kompatibilität
- ✅ Mobile Touch-Interaktionen
- ✅ Focus Management
- ✅ Visuelle Design-Konsistenz
- ✅ Fehlerzustand-Behandlung
- ✅ Deaktivierter Zustand
- ✅ Adresssuche und -auswahl
- ✅ Debounced Search-Funktionalität

## Browser-Unterstützung

Das native Select-Element wird in allen modernen Browsern unterstützt. Das benutzerdefinierte Styling verwendet CSS-Eigenschaften, die gut unterstützt werden:
- `appearance: none` - Unterstützt in allen modernen Browsern
- CSS Grid und Flexbox - Für Layout verwendet
- CSS Custom Properties - Für Theming verwendet

## Unterschiede zu AddressAutocomplete

| Feature | AddressAutocomplete | NativeAddressSearch |
|---------|-------------------|-------------------|
| Dropdown-Typ | Custom | Native OS |
| Tastaturnavigation | Custom implementiert | Native |
| Mobile UX | Custom Touch | Native Touch |
| Barrierefreiheit | Custom ARIA | Native + ARIA |
| Performance | Custom Rendering | Native Rendering |
| Browser-Konsistenz | Variiert | Konsistent |
