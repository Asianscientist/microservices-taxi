import { useEffect, useMemo, useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import DriverService from '../../services/driver.service';

interface SearchFormProps {
  onSearch?: (from: string, to: string, date: string, seats: number) => void;
  compact?: boolean;
}

export function SearchForm({ onSearch, compact = false }: SearchFormProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState('1');
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadCities = async () => {
      try {
        const routes = await DriverService.getRoutes();
        const list = Array.isArray(routes) ? routes : routes.results || routes.data || [];
        const unique = new Set<string>();
        for (const r of list) {
          if (r?.from_city) unique.add(String(r.from_city));
          if (r?.to_city) unique.add(String(r.to_city));
        }
        if (!cancelled) setCities(Array.from(unique).sort((a, b) => a.localeCompare(b)));
      } catch {
        if (!cancelled) setCities([]);
      }
    };
    loadCities();
    return () => {
      cancelled = true;
    };
  }, []);

  const toCityOptions = useMemo(() => {
    if (!from) return cities;
    return cities.filter((c) => c !== from);
  }, [cities, from]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && from && to && date) {
      onSearch(from, to, date, parseInt(seats));
    }
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[150px]">
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger>
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger>
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent>
                  {toCityOptions.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div className="w-24">
              <Select value={seats} onValueChange={setSeats}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} seat{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger id="from">
                  <SelectValue placeholder="Select departure city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger id="to">
                  <SelectValue placeholder="Select destination city" />
                </SelectTrigger>
                <SelectContent>
                  {toCityOptions.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats">Number of Seats</Label>
              <Select value={seats} onValueChange={setSeats}>
                <SelectTrigger id="seats">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} seat{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Search className="w-5 h-5 mr-2" />
            Search for Rides
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
