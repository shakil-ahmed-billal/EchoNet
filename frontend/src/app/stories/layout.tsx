// Full-screen layout for the stories route
export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full min-h-screen bg-background">{children}</div>;
}
