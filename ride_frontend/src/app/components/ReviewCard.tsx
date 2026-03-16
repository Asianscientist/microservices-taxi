import { Star, MapPin } from 'lucide-react';
import { Review } from '../data/mockData';
import { Card, CardContent } from './ui/card';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold">{review.customerName}</h4>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                />
              ))}
            </div>
          </div>
          <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
        </div>
        
        <p className="text-gray-700 mb-2">{review.comment}</p>
        
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="w-3 h-3" />
          <span>{review.route}</span>
        </div>
      </CardContent>
    </Card>
  );
}
