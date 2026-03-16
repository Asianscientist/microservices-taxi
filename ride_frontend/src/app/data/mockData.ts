// Mock data for the ride-sharing platform

export interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  totalTrips: number;
  yearsExperience: number;
  vehicleModel: string;
  vehicleYear: number;
  licensePlate: string;
  routes: string[];
  pricePerSeat: number;
  availableSeats: number;
  verified: boolean;
  bio: string;
}

export interface Review {
  id: string;
  driverId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  route: string;
}

export interface Booking {
  id: string;
  driverId: string;
  customerName: string;
  from: string;
  to: string;
  date: string;
  seats: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export const cities = [
  'New York',
  'Boston',
  'Philadelphia',
  'Washington DC',
  'Baltimore',
  'Newark',
  'Albany',
  'Syracuse',
  'Buffalo',
  'Pittsburgh'
];

export const drivers: Driver[] = [
  {
    id: '1',
    name: 'Michael Anderson',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    rating: 4.9,
    totalTrips: 487,
    yearsExperience: 8,
    vehicleModel: 'Toyota Camry',
    vehicleYear: 2022,
    licensePlate: 'ABC-1234',
    routes: ['New York', 'Boston', 'Philadelphia'],
    pricePerSeat: 45,
    availableSeats: 3,
    verified: true,
    bio: 'Professional driver with 8 years of experience. Safety and comfort are my top priorities. I maintain my vehicle in excellent condition and always arrive on time.'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    rating: 4.95,
    totalTrips: 623,
    yearsExperience: 10,
    vehicleModel: 'Honda Accord',
    vehicleYear: 2023,
    licensePlate: 'XYZ-5678',
    routes: ['Washington DC', 'Baltimore', 'Philadelphia'],
    pricePerSeat: 42,
    availableSeats: 4,
    verified: true,
    bio: 'Experienced and friendly driver. I love meeting new people and ensuring a pleasant journey for all my passengers. Clean car, smooth rides guaranteed!'
  },
  {
    id: '3',
    name: 'David Martinez',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    rating: 4.85,
    totalTrips: 392,
    yearsExperience: 6,
    vehicleModel: 'Nissan Altima',
    vehicleYear: 2021,
    licensePlate: 'DEF-9012',
    routes: ['New York', 'Albany', 'Syracuse'],
    pricePerSeat: 40,
    availableSeats: 3,
    verified: true,
    bio: 'Reliable and punctual driver with excellent knowledge of routes. I ensure safe and comfortable trips with good music and conversation.'
  },
  {
    id: '4',
    name: 'Emily Chen',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    rating: 4.92,
    totalTrips: 541,
    yearsExperience: 7,
    vehicleModel: 'Mazda 6',
    vehicleYear: 2022,
    licensePlate: 'GHI-3456',
    routes: ['Boston', 'Newark', 'New York'],
    pricePerSeat: 43,
    availableSeats: 4,
    verified: true,
    bio: 'Professional driver committed to excellent service. I prioritize passenger safety and comfort. My car is always clean and well-maintained.'
  },
  {
    id: '5',
    name: 'James Wilson',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    rating: 4.88,
    totalTrips: 456,
    yearsExperience: 9,
    vehicleModel: 'Ford Fusion',
    vehicleYear: 2021,
    licensePlate: 'JKL-7890',
    routes: ['Pittsburgh', 'Philadelphia', 'Baltimore'],
    pricePerSeat: 38,
    availableSeats: 3,
    verified: true,
    bio: 'Safe driver with perfect driving record. I value punctuality and ensure every trip is smooth and stress-free for my passengers.'
  },
  {
    id: '6',
    name: 'Maria Rodriguez',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    rating: 4.87,
    totalTrips: 378,
    yearsExperience: 5,
    vehicleModel: 'Chevrolet Malibu',
    vehicleYear: 2023,
    licensePlate: 'MNO-2345',
    routes: ['Buffalo', 'Syracuse', 'Albany'],
    pricePerSeat: 35,
    availableSeats: 4,
    verified: true,
    bio: 'Friendly and professional driver. I ensure a comfortable ride with air conditioning, music, and plenty of space for luggage.'
  }
];

export const reviews: Review[] = [
  {
    id: 'r1',
    driverId: '1',
    customerName: 'John Doe',
    rating: 5,
    comment: 'Excellent driver! Very professional and the car was spotless. Would definitely ride with Michael again.',
    date: '2026-03-10',
    route: 'New York → Boston'
  },
  {
    id: 'r2',
    driverId: '1',
    customerName: 'Jane Smith',
    rating: 5,
    comment: 'Smooth ride, arrived on time. Great conversation and very safe driving.',
    date: '2026-03-08',
    route: 'Boston → Philadelphia'
  },
  {
    id: 'r3',
    driverId: '1',
    customerName: 'Robert Brown',
    rating: 4,
    comment: 'Good experience overall. The car was comfortable and Michael was friendly.',
    date: '2026-03-05',
    route: 'New York → Philadelphia'
  },
  {
    id: 'r4',
    driverId: '2',
    customerName: 'Lisa Anderson',
    rating: 5,
    comment: 'Sarah is amazing! Super friendly, safe driver, and the car smelled great. Highly recommend!',
    date: '2026-03-11',
    route: 'Washington DC → Baltimore'
  },
  {
    id: 'r5',
    driverId: '2',
    customerName: 'Mark Thompson',
    rating: 5,
    comment: 'Perfect ride. Sarah made the trip enjoyable with great music and conversation.',
    date: '2026-03-09',
    route: 'Baltimore → Philadelphia'
  },
  {
    id: 'r6',
    driverId: '3',
    customerName: 'Emily Davis',
    rating: 5,
    comment: 'David is a great driver! Very punctual and knows the best routes to avoid traffic.',
    date: '2026-03-12',
    route: 'New York → Albany'
  },
  {
    id: 'r7',
    driverId: '3',
    customerName: 'Chris Martinez',
    rating: 4,
    comment: 'Good experience. The ride was comfortable and David was professional.',
    date: '2026-03-07',
    route: 'Albany → Syracuse'
  },
  {
    id: 'r8',
    driverId: '4',
    customerName: 'Amanda White',
    rating: 5,
    comment: 'Emily is wonderful! Clean car, smooth driving, and very friendly. Five stars!',
    date: '2026-03-13',
    route: 'Boston → New York'
  },
  {
    id: 'r9',
    driverId: '4',
    customerName: 'Kevin Lee',
    rating: 5,
    comment: 'Great ride! Emily was on time and very professional throughout the journey.',
    date: '2026-03-06',
    route: 'Newark → Boston'
  },
  {
    id: 'r10',
    driverId: '5',
    customerName: 'Rachel Green',
    rating: 4,
    comment: 'James is a safe and reliable driver. Had a pleasant trip with no issues.',
    date: '2026-03-11',
    route: 'Pittsburgh → Philadelphia'
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    driverId: '1',
    customerName: 'Current User',
    from: 'New York',
    to: 'Boston',
    date: '2026-03-20',
    seats: 2,
    totalPrice: 90,
    status: 'confirmed'
  }
];
