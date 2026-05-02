export type Vibe = 'chill' | 'chaos' | 'zen' | 'luxury';
export type Category = 'Cafe' | 'Nature' | 'Cultural' | 'Historic' | 'Scenic' | 'Cozy' | 'Foodie' | 'Hidden Gem';

export interface Place {
  id: string;
  name: string;
  category: Category;
  tags: string[];
  vibes: Vibe[];
  image: string;
  cost: number;
  durationMin: number;
  distanceKm: number;
  lat: number;
  lng: number;
  rating: number;
  description: string;
}

export const PLACES: Place[] = [
  {
    id: 'p1',
    name: 'Campuhan Ridge Walk',
    category: 'Nature',
    tags: ['Scenic', 'Sunrise'],
    vibes: ['zen', 'chill'],
    image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=800&q=80',
    cost: 25000,
    durationMin: 90,
    distanceKm: 1.2,
    lat: -8.5042,
    lng: 115.2562,
    rating: 4.8,
    description: 'Lush green ridge with panoramic Ubud views — perfect at sunrise.',
  },
  {
    id: 'p2',
    name: 'Tirta Empul Temple',
    category: 'Cultural',
    tags: ['Historic', 'Ritual'],
    vibes: ['zen', 'chill'],
    image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=800&q=80',
    cost: 50000,
    durationMin: 75,
    distanceKm: 3.4,
    lat: -8.4156,
    lng: 115.3147,
    rating: 4.9,
    description: 'Sacred Balinese water temple known for its purification ritual.',
  },
  {
    id: 'p3',
    name: 'Seniman Coffee Studio',
    category: 'Cafe',
    tags: ['Cozy', 'Specialty'],
    vibes: ['chill', 'luxury'],
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
    cost: 40000,
    durationMin: 60,
    distanceKm: 0.6,
    lat: -8.5063,
    lng: 115.2625,
    rating: 4.7,
    description: 'Award-winning roaster with single-origin Indonesian beans.',
  },
  {
    id: 'p4',
    name: 'Ubud Palace',
    category: 'Historic',
    tags: ['Cultural', 'Architecture'],
    vibes: ['zen', 'chill', 'luxury'],
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
    cost: 25000,
    durationMin: 60,
    distanceKm: 1.0,
    lat: -8.5070,
    lng: 115.2624,
    rating: 4.6,
    description: 'Royal palace with traditional Balinese carvings and dance shows.',
  },
  {
    id: 'p5',
    name: 'Tegalalang Rice Terrace',
    category: 'Nature',
    tags: ['Scenic', 'Photo'],
    vibes: ['chill', 'zen'],
    image: 'https://images.unsplash.com/photo-1518544866330-95a2bec01b51?auto=format&fit=crop&w=800&q=80',
    cost: 35000,
    durationMin: 90,
    distanceKm: 9.4,
    lat: -8.4313,
    lng: 115.2795,
    rating: 4.7,
    description: 'Iconic emerald rice paddies cascading down a valley.',
  },
  {
    id: 'p6',
    name: 'Hujan Locale',
    category: 'Foodie',
    tags: ['Indonesian', 'Modern'],
    vibes: ['luxury', 'chaos'],
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    cost: 220000,
    durationMin: 90,
    distanceKm: 1.6,
    lat: -8.5085,
    lng: 115.2590,
    rating: 4.8,
    description: 'Modern Indonesian dining with seasonal ingredients.',
  },
  {
    id: 'p7',
    name: 'Sacred Monkey Forest',
    category: 'Nature',
    tags: ['Wildlife', 'Spiritual'],
    vibes: ['chaos', 'chill'],
    image: 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=800&q=80',
    cost: 80000,
    durationMin: 75,
    distanceKm: 1.4,
    lat: -8.5188,
    lng: 115.2585,
    rating: 4.5,
    description: 'Ancient temple sanctuary inside a primordial forest.',
  },
  {
    id: 'p8',
    name: 'Locavore To Go',
    category: 'Cafe',
    tags: ['Brunch', 'Quick'],
    vibes: ['chill'],
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
    cost: 70000,
    durationMin: 45,
    distanceKm: 1.1,
    lat: -8.5051,
    lng: 115.2601,
    rating: 4.6,
    description: 'Fast, beautifully plated brunch from the Locavore team.',
  },
  {
    id: 'p9',
    name: 'Goa Gajah (Elephant Cave)',
    category: 'Hidden Gem',
    tags: ['Historic', 'Quiet'],
    vibes: ['zen'],
    image: 'https://images.unsplash.com/photo-1583309217394-d31c4ee5e3a8?auto=format&fit=crop&w=800&q=80',
    cost: 30000,
    durationMin: 60,
    distanceKm: 4.8,
    lat: -8.5232,
    lng: 115.2870,
    rating: 4.5,
    description: '9th-century meditation cave hidden in tropical garden.',
  },
];

export function pickItinerary(vibe: Vibe, budget: number): Place[] {
  const candidates = PLACES.filter(
    (p) => p.vibes.includes(vibe) && p.cost <= budget,
  ).sort((a, b) => b.rating - a.rating);
  const picked = candidates.slice(0, 4);
  if (picked.length < 3) {
    PLACES.forEach((p) => {
      if (picked.length < 3 && !picked.find((x) => x.id === p.id)) picked.push(p);
    });
  }
  return picked.slice(0, 3 + (vibe === 'chaos' ? 1 : 0));
}
