import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface ReviewCardProps {
  review: any;
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
  
  const reviewerName = review?.reviewer_name || review?.customerName || 'Anonymous';
  const rating = Number(review?.rating || 0);
  const comment = review?.comment || '';
  const route = review?.trip_route || review?.route || '';
  const createdAt = review?.created_at || review?.date || '';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold">{reviewerName}</h4>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                />
              ))}
            </div>
          </div>
          {createdAt && <span className="text-sm text-gray-500">{formatDate(createdAt)}</span>}
        </div>
        
        <p className="text-gray-700 mb-2">{comment}</p>
        
        {route && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{route}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
