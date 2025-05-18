
export class UnitConverter {
  // Constants for conversion
  private static readonly INCH_TO_MM = 25.4;
  private static readonly CM_TO_MM = 10;
  
  // Convert inches to millimeters
  public static inchesToMm(inches: number): number {
    return inches * this.INCH_TO_MM;
  }
  
  // Convert millimeters to inches
  public static mmToInches(mm: number): number {
    return mm / this.INCH_TO_MM;
  }
  
  // Convert centimeters to millimeters
  public static cmToMm(cm: number): number {
    return cm * this.CM_TO_MM;
  }
  
  // Convert millimeters to centimeters
  public static mmToCm(mm: number): number {
    return mm / this.CM_TO_MM;
  }
  
  // Parse a dimension string with unit (like "2.5in", "10cm", "25mm")
  public static parseDimensionString(input: string): { value: number; unit: 'mm' | 'cm' | 'in' } {
    // Normalize the input: trim spaces and convert to lowercase
    const normalized = input.trim().toLowerCase();
    
    // Try to match patterns like "2.5in", "10cm", "25mm"
    const regexWithUnit = /^([\d.]+)\s*(in|cm|mm|"|″|inches|centimeters|millimeters)$/;
    const matchWithUnit = normalized.match(regexWithUnit);
    
    if (matchWithUnit) {
      const value = parseFloat(matchWithUnit[1]);
      let unit: 'mm' | 'cm' | 'in' = 'mm';
      
      // Determine the unit
      const unitStr = matchWithUnit[2];
      if (unitStr === 'in' || unitStr === '"' || unitStr === '″' || unitStr === 'inches') {
        unit = 'in';
      } else if (unitStr === 'cm' || unitStr === 'centimeters') {
        unit = 'cm';
      }
      
      return { value, unit };
    }
    
    // If no unit is specified, assume millimeters
    const regexWithoutUnit = /^([\d.]+)$/;
    const matchWithoutUnit = normalized.match(regexWithoutUnit);
    
    if (matchWithoutUnit) {
      return {
        value: parseFloat(matchWithoutUnit[1]),
        unit: 'mm'
      };
    }
    
    // If nothing matches, return a default value
    return {
      value: 0,
      unit: 'mm'
    };
  }
  
  // Convert any dimension to millimeters
  public static convertToMm(value: number, unit: 'mm' | 'cm' | 'in'): number {
    if (unit === 'in') {
      return this.inchesToMm(value);
    } else if (unit === 'cm') {
      return this.cmToMm(value);
    }
    return value; // Already in mm
  }
  
  // Format a dimension in the desired unit
  public static formatDimension(value: number, targetUnit: 'mm' | 'cm' | 'in', decimals: number = 2): string {
    let convertedValue: number;
    let unitSymbol: string;
    
    if (targetUnit === 'in') {
      convertedValue = this.mmToInches(value);
      unitSymbol = '"';
    } else if (targetUnit === 'cm') {
      convertedValue = this.mmToCm(value);
      unitSymbol = 'cm';
    } else {
      convertedValue = value;
      unitSymbol = 'mm';
    }
    
    return `${convertedValue.toFixed(decimals)}${unitSymbol}`;
  }
}
