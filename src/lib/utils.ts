import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate Purchase ID in format: SSRFM/UNIT-I/I-YYMMDDSQ
export function generatePurchaseId(location: string, sequence: number = 1): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // YY
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
  const day = now.getDate().toString().padStart(2, '0'); // DD
  const seq = sequence.toString().padStart(3, '0'); // SQ (3 digits)
  
  // Convert location to proper format with uppercase Roman numerals
  // e.g., "Unit I" -> "UNIT-I", "Unit II" -> "UNIT-II"
  const locationCode = location.replace(/\s+/g, '-').toUpperCase();
  
  return `SSRFM/${locationCode}/I-${year}${month}${day}${seq}`;
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
  const oldMatch = id.match(/SSRFM\/([^\/]+)\/R-/);
  if (oldMatch) {
    const locationCode = oldMatch[1];
    switch (locationCode) {
      case 'UNITI': return 'Unit I';
      case 'UNITII': return 'Unit II';
      case 'UNITIII': return 'Unit III';
      case 'UNITIV': return 'Unit IV';
      default: return 'Unit I';
    }
  }
  
  // Handle new format: SSRFM/unit-IV/I-250115001 -> Unit IV
  const newMatch = id.match(/SSRFM\/([^\/]+)\/I-/);
  if (newMatch) {
    const locationCode = newMatch[1];
    switch (locationCode) {
      case 'unit-i': return 'Unit-I';
      case 'unit-ii': return 'Unit-II';
      case 'unit-iii': return 'Unit-III';
      case 'unit-iv': return 'Unit-IV';
      default: return 'Unit-I'; // Default fallback
    }
  }
  
  return 'Unit-I'; // Default fallback
}
