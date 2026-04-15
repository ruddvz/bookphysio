// Single source of truth for Indian states and major cities.
// Used in doctor signup, provider availability, hero search, and search filters.

export interface IndiaCity {
  city: string
  state: string
  slug: string
}

// ─── States & Union Territories (36 total) ───────────────────────────────────

export const INDIA_STATES: string[] = [
  // States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
]

// ─── Major Cities (150+) ─────────────────────────────────────────────────────

export const INDIA_CITIES: IndiaCity[] = [
  // Maharashtra
  { city: 'Mumbai', state: 'Maharashtra', slug: 'mumbai' },
  { city: 'Pune', state: 'Maharashtra', slug: 'pune' },
  { city: 'Nagpur', state: 'Maharashtra', slug: 'nagpur' },
  { city: 'Nashik', state: 'Maharashtra', slug: 'nashik' },
  { city: 'Thane', state: 'Maharashtra', slug: 'thane' },
  { city: 'Aurangabad', state: 'Maharashtra', slug: 'aurangabad' },
  { city: 'Solapur', state: 'Maharashtra', slug: 'solapur' },
  { city: 'Navi Mumbai', state: 'Maharashtra', slug: 'navi-mumbai' },
  { city: 'Kolhapur', state: 'Maharashtra', slug: 'kolhapur' },
  { city: 'Amravati', state: 'Maharashtra', slug: 'amravati' },
  // Delhi NCR
  { city: 'New Delhi', state: 'Delhi', slug: 'new-delhi' },
  { city: 'Delhi', state: 'Delhi', slug: 'delhi' },
  { city: 'Gurgaon', state: 'Haryana', slug: 'gurgaon' },
  { city: 'Noida', state: 'Uttar Pradesh', slug: 'noida' },
  { city: 'Faridabad', state: 'Haryana', slug: 'faridabad' },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', slug: 'ghaziabad' },
  { city: 'Greater Noida', state: 'Uttar Pradesh', slug: 'greater-noida' },
  // Karnataka
  { city: 'Bengaluru', state: 'Karnataka', slug: 'bengaluru' },
  { city: 'Bangalore', state: 'Karnataka', slug: 'bangalore' },
  { city: 'Mysuru', state: 'Karnataka', slug: 'mysuru' },
  { city: 'Hubli', state: 'Karnataka', slug: 'hubli' },
  { city: 'Mangaluru', state: 'Karnataka', slug: 'mangaluru' },
  { city: 'Belagavi', state: 'Karnataka', slug: 'belagavi' },
  { city: 'Tumkur', state: 'Karnataka', slug: 'tumkur' },
  // Tamil Nadu
  { city: 'Chennai', state: 'Tamil Nadu', slug: 'chennai' },
  { city: 'Coimbatore', state: 'Tamil Nadu', slug: 'coimbatore' },
  { city: 'Madurai', state: 'Tamil Nadu', slug: 'madurai' },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu', slug: 'tiruchirappalli' },
  { city: 'Salem', state: 'Tamil Nadu', slug: 'salem' },
  { city: 'Tirunelveli', state: 'Tamil Nadu', slug: 'tirunelveli' },
  { city: 'Vellore', state: 'Tamil Nadu', slug: 'vellore' },
  { city: 'Erode', state: 'Tamil Nadu', slug: 'erode' },
  // Telangana
  { city: 'Hyderabad', state: 'Telangana', slug: 'hyderabad' },
  { city: 'Warangal', state: 'Telangana', slug: 'warangal' },
  { city: 'Nizamabad', state: 'Telangana', slug: 'nizamabad' },
  { city: 'Karimnagar', state: 'Telangana', slug: 'karimnagar' },
  // Andhra Pradesh
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', slug: 'visakhapatnam' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', slug: 'vijayawada' },
  { city: 'Guntur', state: 'Andhra Pradesh', slug: 'guntur' },
  { city: 'Tirupati', state: 'Andhra Pradesh', slug: 'tirupati' },
  { city: 'Nellore', state: 'Andhra Pradesh', slug: 'nellore' },
  // Gujarat
  { city: 'Ahmedabad', state: 'Gujarat', slug: 'ahmedabad' },
  { city: 'Surat', state: 'Gujarat', slug: 'surat' },
  { city: 'Vadodara', state: 'Gujarat', slug: 'vadodara' },
  { city: 'Rajkot', state: 'Gujarat', slug: 'rajkot' },
  { city: 'Bhavnagar', state: 'Gujarat', slug: 'bhavnagar' },
  { city: 'Jamnagar', state: 'Gujarat', slug: 'jamnagar' },
  { city: 'Gandhinagar', state: 'Gujarat', slug: 'gandhinagar' },
  { city: 'Junagadh', state: 'Gujarat', slug: 'junagadh' },
  { city: 'Anand', state: 'Gujarat', slug: 'anand' },
  // Rajasthan
  { city: 'Jaipur', state: 'Rajasthan', slug: 'jaipur' },
  { city: 'Jodhpur', state: 'Rajasthan', slug: 'jodhpur' },
  { city: 'Udaipur', state: 'Rajasthan', slug: 'udaipur' },
  { city: 'Kota', state: 'Rajasthan', slug: 'kota' },
  { city: 'Ajmer', state: 'Rajasthan', slug: 'ajmer' },
  { city: 'Bikaner', state: 'Rajasthan', slug: 'bikaner' },
  { city: 'Alwar', state: 'Rajasthan', slug: 'alwar' },
  // Uttar Pradesh
  { city: 'Lucknow', state: 'Uttar Pradesh', slug: 'lucknow' },
  { city: 'Kanpur', state: 'Uttar Pradesh', slug: 'kanpur' },
  { city: 'Agra', state: 'Uttar Pradesh', slug: 'agra' },
  { city: 'Varanasi', state: 'Uttar Pradesh', slug: 'varanasi' },
  { city: 'Prayagraj', state: 'Uttar Pradesh', slug: 'prayagraj' },
  { city: 'Meerut', state: 'Uttar Pradesh', slug: 'meerut' },
  { city: 'Bareilly', state: 'Uttar Pradesh', slug: 'bareilly' },
  { city: 'Aligarh', state: 'Uttar Pradesh', slug: 'aligarh' },
  { city: 'Gorakhpur', state: 'Uttar Pradesh', slug: 'gorakhpur' },
  { city: 'Mathura', state: 'Uttar Pradesh', slug: 'mathura' },
  // West Bengal
  { city: 'Kolkata', state: 'West Bengal', slug: 'kolkata' },
  { city: 'Howrah', state: 'West Bengal', slug: 'howrah' },
  { city: 'Durgapur', state: 'West Bengal', slug: 'durgapur' },
  { city: 'Asansol', state: 'West Bengal', slug: 'asansol' },
  { city: 'Siliguri', state: 'West Bengal', slug: 'siliguri' },
  // Punjab
  { city: 'Ludhiana', state: 'Punjab', slug: 'ludhiana' },
  { city: 'Amritsar', state: 'Punjab', slug: 'amritsar' },
  { city: 'Jalandhar', state: 'Punjab', slug: 'jalandhar' },
  { city: 'Patiala', state: 'Punjab', slug: 'patiala' },
  { city: 'Bathinda', state: 'Punjab', slug: 'bathinda' },
  // Haryana
  { city: 'Chandigarh', state: 'Chandigarh', slug: 'chandigarh' },
  { city: 'Ambala', state: 'Haryana', slug: 'ambala' },
  { city: 'Hisar', state: 'Haryana', slug: 'hisar' },
  { city: 'Rohtak', state: 'Haryana', slug: 'rohtak' },
  { city: 'Karnal', state: 'Haryana', slug: 'karnal' },
  // Madhya Pradesh
  { city: 'Bhopal', state: 'Madhya Pradesh', slug: 'bhopal' },
  { city: 'Indore', state: 'Madhya Pradesh', slug: 'indore' },
  { city: 'Gwalior', state: 'Madhya Pradesh', slug: 'gwalior' },
  { city: 'Jabalpur', state: 'Madhya Pradesh', slug: 'jabalpur' },
  { city: 'Ujjain', state: 'Madhya Pradesh', slug: 'ujjain' },
  // Chhattisgarh
  { city: 'Raipur', state: 'Chhattisgarh', slug: 'raipur' },
  { city: 'Bhilai', state: 'Chhattisgarh', slug: 'bhilai' },
  { city: 'Bilaspur', state: 'Chhattisgarh', slug: 'bilaspur' },
  // Kerala
  { city: 'Kochi', state: 'Kerala', slug: 'kochi' },
  { city: 'Thiruvananthapuram', state: 'Kerala', slug: 'thiruvananthapuram' },
  { city: 'Kozhikode', state: 'Kerala', slug: 'kozhikode' },
  { city: 'Thrissur', state: 'Kerala', slug: 'thrissur' },
  { city: 'Kollam', state: 'Kerala', slug: 'kollam' },
  { city: 'Kannur', state: 'Kerala', slug: 'kannur' },
  // Bihar
  { city: 'Patna', state: 'Bihar', slug: 'patna' },
  { city: 'Gaya', state: 'Bihar', slug: 'gaya' },
  { city: 'Muzaffarpur', state: 'Bihar', slug: 'muzaffarpur' },
  { city: 'Bhagalpur', state: 'Bihar', slug: 'bhagalpur' },
  // Odisha
  { city: 'Bhubaneswar', state: 'Odisha', slug: 'bhubaneswar' },
  { city: 'Cuttack', state: 'Odisha', slug: 'cuttack' },
  { city: 'Rourkela', state: 'Odisha', slug: 'rourkela' },
  // Assam
  { city: 'Guwahati', state: 'Assam', slug: 'guwahati' },
  { city: 'Silchar', state: 'Assam', slug: 'silchar' },
  { city: 'Dibrugarh', state: 'Assam', slug: 'dibrugarh' },
  // Jharkhand
  { city: 'Ranchi', state: 'Jharkhand', slug: 'ranchi' },
  { city: 'Jamshedpur', state: 'Jharkhand', slug: 'jamshedpur' },
  { city: 'Dhanbad', state: 'Jharkhand', slug: 'dhanbad' },
  // Uttarakhand
  { city: 'Dehradun', state: 'Uttarakhand', slug: 'dehradun' },
  { city: 'Haridwar', state: 'Uttarakhand', slug: 'haridwar' },
  { city: 'Roorkee', state: 'Uttarakhand', slug: 'roorkee' },
  // Himachal Pradesh
  { city: 'Shimla', state: 'Himachal Pradesh', slug: 'shimla' },
  { city: 'Dharamshala', state: 'Himachal Pradesh', slug: 'dharamshala' },
  { city: 'Manali', state: 'Himachal Pradesh', slug: 'manali' },
  // Jammu & Kashmir
  { city: 'Srinagar', state: 'Jammu and Kashmir', slug: 'srinagar' },
  { city: 'Jammu', state: 'Jammu and Kashmir', slug: 'jammu' },
  // Goa
  { city: 'Panaji', state: 'Goa', slug: 'panaji' },
  { city: 'Margao', state: 'Goa', slug: 'margao' },
  { city: 'Vasco da Gama', state: 'Goa', slug: 'vasco-da-gama' },
  // Puducherry
  { city: 'Puducherry', state: 'Puducherry', slug: 'puducherry' },
  // Tripura
  { city: 'Agartala', state: 'Tripura', slug: 'agartala' },
  // Manipur
  { city: 'Imphal', state: 'Manipur', slug: 'imphal' },
  // Meghalaya
  { city: 'Shillong', state: 'Meghalaya', slug: 'shillong' },
  // Arunachal Pradesh
  { city: 'Itanagar', state: 'Arunachal Pradesh', slug: 'itanagar' },
  // Nagaland
  { city: 'Kohima', state: 'Nagaland', slug: 'kohima' },
  // Mizoram
  { city: 'Aizawl', state: 'Mizoram', slug: 'aizawl' },
  // Sikkim
  { city: 'Gangtok', state: 'Sikkim', slug: 'gangtok' },
]

/** Returns "City, State" display label */
export function formatCityLabel(entry: IndiaCity): string {
  return `${entry.city}, ${entry.state}`
}

/** Find city entry by slug */
export function findCityBySlug(slug: string): IndiaCity | undefined {
  return INDIA_CITIES.find((c) => c.slug === slug)
}

/** Find city entry by city name (case-insensitive) */
export function findCityByName(name: string): IndiaCity | undefined {
  const lower = name.toLowerCase()
  return INDIA_CITIES.find((c) => c.city.toLowerCase() === lower)
}

/** Filter cities by search query (matches city or state) */
export function searchCities(query: string): IndiaCity[] {
  const lower = query.toLowerCase().trim()
  if (!lower) return INDIA_CITIES
  return INDIA_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(lower) ||
      c.state.toLowerCase().includes(lower),
  )
}
