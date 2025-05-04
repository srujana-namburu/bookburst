import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface UserCardProps {
  user: {
    id: number;
    name: string;
    profilePicture?: string;
    booksRead: number;
    genres: string[];
  };
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export function UserCard({
  user,
  isFollowing = false,
  onFollow,
  onUnfollow,
}: UserCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleFollowClick = () => {
    if (isFollowing) {
      onUnfollow?.();
    } else {
      onFollow?.();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
      <Link href={`/users/${user.id}`} className="flex items-center flex-1 hover:opacity-80 transition-opacity">
        <Avatar className="h-12 w-12 mr-4">
          <AvatarImage src={user.profilePicture} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-bookblue-800 dark:text-white">{user.name}</h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user.booksRead} books read this year</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {user.genres.join(" • ")}
          </p>
        </div>
      </Link>
      <Button
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        onClick={handleFollowClick}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </div>
  );
}
