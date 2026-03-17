import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { Drivers } from './pages/Drivers';
import { DriverProfile } from './pages/DriverProfile';
import { BookRide } from './pages/BookRide';
import { Bookings } from './pages/Bookings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RegisterDriver } from './pages/RegisterDriver';
import { AdminDashboard } from './pages/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/register-driver',
    Component: RegisterDriver,
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
  {
    path: '/admin',
    Component: AdminDashboard,
  },
]);
