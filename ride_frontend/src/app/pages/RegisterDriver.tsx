import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Car, Eye, EyeOff, User, Phone, MapPin, Upload, FileText, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import AuthService from '../../services/auth.service';
import DriverService from '../../services/driver.service';

export function RegisterDriver() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    city: '',
    country: '',
  });
  const [driverData, setDriverData] = useState({
    license_number: '',
    license_image_front: null as File | null,
    license_image_back: null as File | null,
    license_expiry_date: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_color: '',
    license_plate: '',
    vehicle_image: null as File | null,
    total_seats: '',
    insurance_number: '',
    insurance_image: null as File | null,
    insurance_expiry_date: '',
    years_of_experience: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData.email || !userData.password || !userData.first_name || !userData.last_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (userData.password !== userData.password2) {
      toast.error('Passwords do not match');
      return;
    }

    if (userData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setStep(2);
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required driver fields
    if (!driverData.license_number || !driverData.license_image_front || !driverData.license_image_back ||
        !driverData.license_expiry_date || !driverData.vehicle_make || !driverData.vehicle_model ||
        !driverData.vehicle_year || !driverData.vehicle_color || !driverData.license_plate ||
        !driverData.total_seats || !driverData.insurance_number || !driverData.insurance_image ||
        !driverData.insurance_expiry_date || !driverData.years_of_experience) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Register user first
      const userResponse = await AuthService.register({
        ...userData,
        user_type: 'driver',
      });

      // Then create driver profile
      const driverProfileData = {
        license_number: driverData.license_number,
        license_image_front: driverData.license_image_front!,
        license_image_back: driverData.license_image_back!,
        license_expiry_date: driverData.license_expiry_date,
        vehicle_make: driverData.vehicle_make,
        vehicle_model: driverData.vehicle_model,
        vehicle_year: parseInt(driverData.vehicle_year),
        vehicle_color: driverData.vehicle_color,
        license_plate: driverData.license_plate,
        vehicle_image: driverData.vehicle_image || undefined,
        total_seats: parseInt(driverData.total_seats),
        insurance_number: driverData.insurance_number,
        insurance_image: driverData.insurance_image!,
        insurance_expiry_date: driverData.insurance_expiry_date,
        years_of_experience: parseInt(driverData.years_of_experience),
        bio: driverData.bio || undefined,
      };

      await DriverService.createProfile(driverProfileData);

      toast.success('Driver registration submitted! Your application will be reviewed by our admin team.');
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.email) {
          toast.error(`Email: ${errors.email.join(', ')}`);
        } else if (errors.license_number) {
          toast.error(`License: ${errors.license_number.join(', ')}`);
        } else {
          toast.error('Registration failed. Please try again.');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (field: string, file: File | null) => {
    setDriverData({ ...driverData, [field]: file });
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Car className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">RideShare</span>
            </div>
            <CardTitle className="text-2xl">Become a Driver</CardTitle>
            <p className="text-gray-600 mt-2">
              Step 1: Create your account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    type="text"
                    value={userData.first_name}
                    onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    type="text"
                    value={userData.last_name}
                    onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone_number"
                    type="tel"
                    value={userData.phone_number}
                    onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={userData.date_of_birth}
                  onChange={(e) => setUserData({ ...userData, date_of_birth: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    type="text"
                    value={userData.city}
                    onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                    placeholder="New York"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    type="text"
                    value={userData.country}
                    onChange={(e) => setUserData({ ...userData, country: e.target.value })}
                    placeholder="USA"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password2">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="password2"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={userData.password2}
                    onChange={(e) => setUserData({ ...userData, password2: e.target.value })}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Next: Driver Information
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">RideShare</span>
          </div>
          <CardTitle className="text-2xl">Driver Information</CardTitle>
          <p className="text-gray-600 mt-2">
            Step 2: Complete your driver profile (All fields required)
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDriverSubmit} className="space-y-6">
            {/* License Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                License Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number *</Label>
                  <Input
                    id="license_number"
                    type="text"
                    value={driverData.license_number}
                    onChange={(e) => setDriverData({ ...driverData, license_number: e.target.value })}
                    placeholder="DL123456789"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_expiry_date">License Expiry Date *</Label>
                  <Input
                    id="license_expiry_date"
                    type="date"
                    value={driverData.license_expiry_date}
                    onChange={(e) => setDriverData({ ...driverData, license_expiry_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_image_front">License Front Image *</Label>
                  <Input
                    id="license_image_front"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('license_image_front', e.target.files?.[0] || null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_image_back">License Back Image *</Label>
                  <Input
                    id="license_image_back"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('license_image_back', e.target.files?.[0] || null)}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_make">Vehicle Make *</Label>
                  <Input
                    id="vehicle_make"
                    type="text"
                    value={driverData.vehicle_make}
                    onChange={(e) => setDriverData({ ...driverData, vehicle_make: e.target.value })}
                    placeholder="Toyota"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_model">Vehicle Model *</Label>
                  <Input
                    id="vehicle_model"
                    type="text"
                    value={driverData.vehicle_model}
                    onChange={(e) => setDriverData({ ...driverData, vehicle_model: e.target.value })}
                    placeholder="Camry"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_year">Vehicle Year *</Label>
                  <Input
                    id="vehicle_year"
                    type="number"
                    value={driverData.vehicle_year}
                    onChange={(e) => setDriverData({ ...driverData, vehicle_year: e.target.value })}
                    placeholder="2020"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_color">Vehicle Color *</Label>
                  <Input
                    id="vehicle_color"
                    type="text"
                    value={driverData.vehicle_color}
                    onChange={(e) => setDriverData({ ...driverData, vehicle_color: e.target.value })}
                    placeholder="White"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_plate">License Plate *</Label>
                  <Input
                    id="license_plate"
                    type="text"
                    value={driverData.license_plate}
                    onChange={(e) => setDriverData({ ...driverData, license_plate: e.target.value })}
                    placeholder="ABC-1234"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_seats">Total Seats (including driver) *</Label>
                  <Input
                    id="total_seats"
                    type="number"
                    value={driverData.total_seats}
                    onChange={(e) => setDriverData({ ...driverData, total_seats: e.target.value })}
                    placeholder="4"
                    min="2"
                    max="8"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_image">Vehicle Image</Label>
                <Input
                  id="vehicle_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('vehicle_image', e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <Separator />

            {/* Insurance Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Insurance Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance_number">Insurance Policy Number *</Label>
                  <Input
                    id="insurance_number"
                    type="text"
                    value={driverData.insurance_number}
                    onChange={(e) => setDriverData({ ...driverData, insurance_number: e.target.value })}
                    placeholder="INS123456789"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance_expiry_date">Insurance Expiry Date *</Label>
                  <Input
                    id="insurance_expiry_date"
                    type="date"
                    value={driverData.insurance_expiry_date}
                    onChange={(e) => setDriverData({ ...driverData, insurance_expiry_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance_image">Insurance Document Image *</Label>
                <Input
                  id="insurance_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('insurance_image', e.target.files?.[0] || null)}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Experience & Bio */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Experience & Bio
              </h3>
              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Years of Driving Experience *</Label>
                <Input
                  id="years_of_experience"
                  type="number"
                  value={driverData.years_of_experience}
                  onChange={(e) => setDriverData({ ...driverData, years_of_experience: e.target.value })}
                  placeholder="5"
                  min="0"
                  max="50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={driverData.bio}
                  onChange={(e) => setDriverData({ ...driverData, bio: e.target.value })}
                  placeholder="Tell passengers about yourself, your driving style, and what makes you a great driver..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Your application will be reviewed by our admin team. You will receive an email once your application is approved and you can start accepting rides.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}