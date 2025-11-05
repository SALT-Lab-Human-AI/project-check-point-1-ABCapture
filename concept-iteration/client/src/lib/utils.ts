import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Import all profile icons
import icon1 from "@assets/profile icons/1.png";
import icon2 from "@assets/profile icons/2.png";
import icon3 from "@assets/profile icons/3.png";
import icon4 from "@assets/profile icons/4.png";
import icon5 from "@assets/profile icons/5.png";
import icon6 from "@assets/profile icons/6.png";
import icon7 from "@assets/profile icons/7.png";
import icon8 from "@assets/profile icons/8.png";
import icon9 from "@assets/profile icons/9.png";
import icon10 from "@assets/profile icons/10.png";
import icon11 from "@assets/profile icons/11.png";
import icon12 from "@assets/profile icons/12.png";

const profileIcons = [
  icon1,
  icon2,
  icon3,
  icon4,
  icon5,
  icon6,
  icon7,
  icon8,
  icon9,
  icon10,
  icon11,
  icon12,
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get a consistent random avatar icon for a student based on their ID or name
 * @param identifier - Student ID (number or string) or name
 * @returns Path to the avatar icon
 */
export function getStudentAvatar(identifier: string | number): string {
  // Convert identifier to a number for consistent hashing
  let hash = 0;
  const str = String(identifier);
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Get positive index
  const index = Math.abs(hash) % profileIcons.length;
  return profileIcons[index];
}
