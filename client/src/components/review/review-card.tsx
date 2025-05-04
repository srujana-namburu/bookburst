import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  user: {
    id: number;
    name: string;
    email: string;
    profilePicture?: string;
  };
  book: {
    id: number;
    title: string;
    author: string;
  };
  rating: number;
  review: string;
  likes: number;
  comments: number;
  date: Date;
  onLike?: () => void;
  onComment?: () => void;
}

export function ReviewCard({
  user,
  book,
  rating,
  review,
  likes,
  comments,
  date,
  onLike,
  onComment,
}: ReviewCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-start mb-4">
        <Avatar className="h-10 w-10 mr-4">
          <AvatarImage src={user.profilePicture} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-md">{user.name}</h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Reviewed <span className="font-serif italic">{book.title}</span> by {book.author}
          </p>
        </div>
        <div className="ml-auto flex items-center">
          <StarRating rating={rating} readOnly size="sm" />
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-4">{review}</p>
      <div className="flex justify-between items-center text-sm">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary"
            onClick={onLike}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary"
            onClick={onComment}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{comments} comments</span>
          </Button>
        </div>
        <span className="text-gray-500 dark:text-gray-400">{formatTimeAgo(date)}</span>
      </div>
    </div>
  );
}
