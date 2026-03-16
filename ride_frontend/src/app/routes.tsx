import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { Drivers } from './pages/Drivers';
import { DriverProfile } from './pages/DriverProfile';
import { BookRide } from './pages/BookRide';
import { Bookings } from './pages/Bookings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/drivers',
    Component: Drivers,
  },
  {
    path: '/driver/:id',
    Component: DriverProfile,
  },
  {
    path: '/book/:id',
    Component: BookRide,
  },
  {
    path: '/bookings',
    Component: Bookings,
  },
]);
