export type PropertyType = "Apartment" | "Villa" | "Office" | "Shop";
export type ListingType = "Sale" | "Rent";
export type VolatilityStatus = "Stable" | "Unstable" | "Dropping" | "Recovering";

export interface MarketRecoveryRecord {
  id: string;
  city: string;
  district: string;
  propertyType: PropertyType;
  listingType: ListingType;
  area: number;
  price: number;
  pricePerSqm: number;
  rooms: number;
  bathrooms: number;
  floor: number;
  furnished: boolean;
  source: string;
  status: VolatilityStatus;
  notes: string;
  dateAdded: string;
}

export interface MarketRecoveryFiltersState {
  query: string;
  city: string;
  district: string;
  propertyType: "" | PropertyType;
  listingType: "" | ListingType;
  status: "" | VolatilityStatus;
  startDate: string;
  endDate: string;
}

export interface MarketRecoveryFormValues {
  city: string;
  district: string;
  propertyType: PropertyType;
  listingType: ListingType;
  area: string;
  price: string;
  rooms: string;
  bathrooms: string;
  floor: string;
  furnished: boolean;
  source: string;
  status: VolatilityStatus;
  entryDate: string;
  notes: string;
}
