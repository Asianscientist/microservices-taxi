import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { CheckCircle, XCircle, Eye, Car, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import DriverService from '../../services/driver.service';
import { useNavigate } from 'react-router';

interface DriverProfile {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture?: string;
  };
  license_number: string;
  license_verification_status: 'pending' | 'approved' | 'rejected';
  license_verification_notes?: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  license_plate: string;
  total_seats: number;
  insurance_number: string;
  years_of_experience: number;
  bio?: string;
  created_at: string;
}

export function AdminDashboard() {
  const [pendingDrivers, setPendingDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingDrivers();
  }, []);

  const loadPendingDrivers = async () => {
    try {
      const response = await DriverService.getPendingVerifications();
      setPendingDrivers(response.results || response);
    } catch (error) {
      console.error('Failed to load pending drivers:', error);
      toast.error('Failed to load pending driver verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDriver = async (driverId: number, status: 'approved' | 'rejected', notes?: string) => {
    setActionLoading(driverId);
    try {
      await DriverService.verifyDriver(driverId, {
        license_verification_status: status,
        license_verification_notes: notes,
      });

      toast.success(`Driver ${status === 'approved' ? 'approved' : 'rejected'} successfully`);

      // Remove from pending list
      setPendingDrivers(prev => prev.filter(driver => driver.id !== driverId));
    } catch (error) {
      console.error('Failed to verify driver:', error);
      toast.error('Failed to verify driver');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage driver verifications and platform oversight</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDrivers.length}</div>
              <p className="text-xs text-muted-foreground">
                Drivers awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Active drivers on platform
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                New driver registrations
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Driver Verifications</CardTitle>
            <CardDescription>
              Review and approve driver license applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingDrivers.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
                <p className="mt-1 text-sm text-gray-500">No pending driver verifications.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingDrivers.map((driver) => (
                  <div key={driver.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={driver.user.profile_picture} />
                          <AvatarFallback>
                            {driver.user.first_name[0]}{driver.user.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {driver.user.first_name} {driver.user.last_name}
                            </h3>
                            {getStatusBadge(driver.license_verification_status)}
                          </div>
                          <p className="text-sm text-gray-500">{driver.user.email}</p>

                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">License:</span> {driver.license_number}
                            </div>
                            <div>
                              <span className="font-medium">Vehicle:</span> {driver.vehicle_make} {driver.vehicle_model} ({driver.vehicle_year})
                            </div>
                            <div>
                              <span className="font-medium">Plate:</span> {driver.license_plate}
                            </div>
                            <div>
                              <span className="font-medium">Experience:</span> {driver.years_of_experience} years
                            </div>
                          </div>

                          {driver.bio && (
                            <div className="mt-3">
                              <span className="font-medium text-sm">Bio:</span>
                              <p className="text-sm text-gray-600 mt-1">{driver.bio}</p>
                            </div>
                          )}

                          <p className="text-xs text-gray-400 mt-2">
                            Applied on {new Date(driver.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/driver/${driver.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleVerifyDriver(driver.id, 'rejected', 'Application rejected by admin')}
                          disabled={actionLoading === driver.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyDriver(driver.id, 'approved')}
                          disabled={actionLoading === driver.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}