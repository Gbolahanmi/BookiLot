import Image from "next/image";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackEmoji?: string;
  initials?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
};

const getInitials = (name?: string, initials?: string): string => {
  if (initials) return initials.toUpperCase();
  if (!name) return "?";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name?: string): string => {
  if (!name) return "bg-gray-300";

  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return colors[hash % colors.length];
};

export default function Avatar({
  src,
  alt,
  name,
  size = "md",
  className = "",
  fallbackEmoji,
  initials,
}: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const bgColor = getAvatarColor(name);
  const initial = getInitials(name, initials);

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white overflow-hidden ${bgColor} ${sizeClass} ${className}`}
      title={name || alt || "User Avatar"}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || "User Avatar"}
          className="w-full h-full object-cover"
        />
      ) : fallbackEmoji ? (
        <span>{fallbackEmoji}</span>
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
