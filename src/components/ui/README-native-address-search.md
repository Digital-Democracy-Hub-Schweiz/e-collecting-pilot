# Address Autocomplete Component

## Übersicht

Die `AddressAutocomplete`-Komponente ist eine Adresssuch-Komponente, die ein Eingabefeld mit automatischer Vervollständigung für die Adresssuche verwendet. Sie kombiniert ein Eingabefeld für die Adresssuche mit einer benutzerdefinierten Dropdown-Liste für bessere Benutzerfreundlichkeit und flexible Gestaltung.

## Features

### Barrierefreiheit
- **Tastaturnavigation**: Pfeiltasten, Enter, Escape funktionieren korrekt
- **Screen Reader Support**: Umfassende ARIA-Attribute und semantisches HTML
- **Focus Management**: Professionelle Focus-Verwaltung mit JavaScript
- **Status-Ankündigungen**: Live-Ankündigungen für Suchergebnisse und Ladezustände
- **Anweisungen**: Versteckte Anweisungen für Bildschirmleser

### Design
- **Figma-konforme Gestaltung**: Entspricht den Design-System-Spezifikationen
- **Benutzerdefinierte Dropdown**: Vollständig anpassbare Darstellung der Suchergebnisse
- **Focus-Zustände**: Korrekte Focus-Indikatoren mit lila Ring
- **Deaktivierte Zustände**: Klare visuelle Rückmeldung bei Deaktivierung
- **Lade-Indikator**: Zeigt Ladezustand während der Adresssuche

### Funktionalität
- **Debounced Search**: Verzögerte Suche nach 300ms für bessere Performance
- **Minimale Suchlänge**: Sucht erst ab 5 Zeichen
- **Benutzerdefinierte Dropdown**: Verwendet ul/li-Elemente für maximale Flexibilität
- **Automatische Vervollständigung**: Zeigt Suchergebnisse in anpassbarer Dropdown an

## Verwendung

```tsx
import { AddressAutocomplete } from "@/components/ui/native-address-search";

<AddressAutocomplete
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
2. **Benutzerdefinierte Dropdown**: Für die Auswahl aus den Suchergebnissen (ul/li-Elemente)
3. **Debounced Search**: Für optimierte API-Aufrufe
4. **Lade-Indikator**: Für visuelles Feedback während der Suche

### Wichtige Implementierungspunkte:
1. **Custom Dropdown** - Verwendet ul/li-Elemente für maximale Flexibilität
2. **ARIA-Unterstützung** - Umfassende Barrierefreiheit mit listbox/option Pattern
3. **Focus Management** - Professionelle Keyboard-Navigation
4. **Status-Ankündigungen** - Live-Updates für Bildschirmleser
5. **Debounced Search** - Verzögerte Suche für bessere Performance

## Migration von AddressAutocomplete (alte Version)

Um von der alten `AddressAutocomplete` zur verbesserten Version zu migrieren:

1. Import der Komponente:
   ```tsx
   import { AddressAutocomplete } from "@/components/ui/native-address-search";
   ```

2. Ersetzen der Komponentenverwendung:
   ```tsx
   // Vorher (alte Version)
   <AddressAutocomplete 
     value={streetAddress}
     onValueChange={setStreetAddress}
     onAddressSelect={handleAddressSelect}
   />
   
   // Nachher (neue Version)
   <AddressAutocomplete 
     value={streetAddress}
     onValueChange={setStreetAddress}
     onAddressSelect={handleAddressSelect}
   />
   ```

3. Die Props-Schnittstelle ist kompatibel, verbesserte Barrierefreiheit ist automatisch verfügbar.

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

## Unterschiede zur ursprünglichen AddressAutocomplete

| Feature | Ursprüngliche Version | Neue Version |
|---------|-------------------|-------------------|
| Dropdown-Typ | Custom ul/li | Custom ul/li (verbessert) |
| Tastaturnavigation | Basic implementiert | Verbessert implementiert |
| Barrierefreiheit | Basic ARIA | Umfassende ARIA-Unterstützung |
| Status-Ankündigungen | Begrenzt | Live-Updates für alle Zustände |
| State Management | Inkonsistent | Korrekte Synchronisation |
| Error Handling | Basic | Robuste Fehlerbehandlung |
