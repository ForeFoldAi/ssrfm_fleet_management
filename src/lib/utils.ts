import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate Purchase ID in format: SSRFM/UNIT1/R-YYMMDD/SQ
export function generatePurchaseId(location: string, sequence: number = 1): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // YY
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
  const day = now.getDate().toString().padStart(2, '0'); // DD
  const seq = sequence.toString().padStart(2, '0'); // SQ (2 digits)
  
  // Convert location to numeric format
  // e.g., "Unit I" -> "UNIT1", "Unit II" -> "UNIT2"
  let locationCode = location.toUpperCase();
  const romanToNumeric: Record<string, string> = {
    'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5',
    'VI': '6', 'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10'
  };
  
  // Replace Roman numerals with numbers
  Object.entries(romanToNumeric).forEach(([roman, num]) => {
    locationCode = locationCode.replace(new RegExp(`UNIT[-\\s]*${roman}$`, 'i'), `UNIT${num}`);
  });
  
  // Remove any remaining hyphens or spaces
  locationCode = locationCode.replace(/[-\s]/g, '');
  
  return `SSRFM/${locationCode}/R-${year}${month}${day}/${seq}`;
}

// Generate Issue ID in format: SSRFM/UNIT1/I-YYMMDD/SQ
export function generateIssueId(location: string, sequence: number = 1): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // YY
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
  const day = now.getDate().toString().padStart(2, '0'); // DD
  const seq = sequence.toString().padStart(2, '0'); // SQ (2 digits)
  
  // Convert location to numeric format
  // e.g., "Unit I" -> "UNIT1", "Unit II" -> "UNIT2"
  let locationCode = location.toUpperCase();
  const romanToNumeric: Record<string, string> = {
    'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5',
    'VI': '6', 'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10'
  };
  
  // Replace Roman numerals with numbers
  Object.entries(romanToNumeric).forEach(([roman, num]) => {
    locationCode = locationCode.replace(new RegExp(`UNIT[-\\s]*${roman}$`, 'i'), `UNIT${num}`);
  });
  
  // Remove any remaining hyphens or spaces
  locationCode = locationCode.replace(/[-\s]/g, '');
  
  return `SSRFM/${locationCode}/I-${year}${month}${day}/${seq}`;
}

// Generate SR.NO. in same format for individual items
export function generateSrNo(location: string, sequence: number = 1): string {
  return generatePurchaseId(location, sequence);
}

// Parse location from existing ID format
export function parseLocationFromId(id: string): string {
  // Handle old format: REQ-2024-301 -> Unit I (default)
  if (id.startsWith('REQ-')) {
    return 'Unit I';
  }
  
  // Handle old format: SSRFM/UNITI/R-250826001 -> Unit I
  const oldMatch = id.match(/SSRFM\/([^/]+)\/(R-|I-)/);
  if (oldMatch) {
    const locationCode = oldMatch[1];
    
    // Handle numeric format: UNIT1 -> Unit 1
    const numericMatch = locationCode.match(/UNIT(\d+)/);
    if (numericMatch) {
      const num = numericMatch[1];
      const numToRoman: Record<string, string> = {
        '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
        '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X'
      };
      return `Unit ${numToRoman[num] || num}`;
    }
    
    // Handle old Roman format
    switch (locationCode) {
      case 'UNITI': return 'Unit I';
      case 'UNITII': return 'Unit II';
      case 'UNITIII': return 'Unit III';
      case 'UNITIV': return 'Unit IV';
      case 'UNIT-I': return 'Unit I';
      case 'UNIT-II': return 'Unit II';
      case 'UNIT-III': return 'Unit III';
      case 'UNIT-IV': return 'Unit IV';
      default: return 'Unit I';
    }
  }
  
  return 'Unit I'; // Default fallback
}

// Format date to dd-mm-yyyy format
export function formatDateToDDMMYYYY(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
}
