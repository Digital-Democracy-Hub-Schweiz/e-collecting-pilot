# Native Address Search Component

## Übersicht

Die `NativeAddressSearch`-Komponente ist eine Adresssuch-Komponente mit verbesserter Barrierefreiheit. Sie kombiniert ein Eingabefeld für die Adresssuche mit einem benutzerdefinierten Dropdown für die Adressauswahl, das ARIA-Standards und semantisches HTML für bessere Barrierefreiheit verwendet.

## Features

### Barrierefreiheit
- **Tastaturnavigation**: Pfeiltasten, Enter, Escape für Navigation durch Optionen
- **Screen Reader Support**: ARIA-Attribute und semantisches HTML (listbox, option roles)
- **Focus Management**: Programmtisch verwalteter Focus für bessere Benutzerführung
- **Mobile-freundlich**: Touch-freundliche Interaktionen
- **ARIA-Unterstützung**: aria-expanded, aria-activedescendant, und Live-Regionen

### Design
- **Figma-konforme Gestaltung**: Entspricht den Design-System-Spezifikationen
- **Benutzerdefinieres Dropdown**: Konsistentes Styling für alle Browser
- **Focus-Zustände**: Korrekte Focus-Indikatoren mit lila Ring
- **Deaktivierte Zustände**: Klare visuelle Rückmeldung bei Deaktivierung
- **Lade-Indikator**: Zeigt Ladezustand während der Adresssuche

### Funktionalität
- **Debounced Search**: Verzögerte Suche nach 300ms für bessere Performance
- **Minimale Suchlänge**: Sucht erst ab 5 Zeichen
- **Benutzerdefiniertes Dropdown**: Verwendet ul/li-basierte Dropdown-Liste für Adressauswahl
- **Automatische Vervollständigung**: Zeigt Suchergebnisse in zugänglichem Dropdown an

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
2. **Benutzerdefiniertes Dropdown**: ul/li-basierte Liste für die Auswahl aus den Suchergebnissen
3. **Debounced Search**: Für optimierte API-Aufrufe
4. **Lade-Indikator**: Für visuelles Feedback während der Suche

### Wichtige Implementierungspunkte:
1. **ARIA-Rollen** - listbox/option Rollen für Screen Reader-Unterstützung
2. **Tastaturnavigation** - Pfeiltasten für Navigation, Enter für Auswahl
3. **Focus Management** - Programmtische Focus-Verwaltung
4. **Barrierefreiheit** - ARIA-Attribute und Live-Regionen
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
| Dropdown-Typ | Custom | Custom (verbessert) |
| Tastaturnavigation | Custom implementiert | Verbessertes Custom |
| Mobile UX | Custom Touch | Optimierte Touch-Interaktionen |
| Barrierefreiheit | Custom ARIA | Verbesserte ARIA-Unterstützung |
| Performance | Custom Rendering | Optimiertes Custom Rendering |
| Screen Reader | Basis-Unterstützung | Erweiterte Live-Regionen |
