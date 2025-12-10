export function PageTransition({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  return (
    <main key={pathname}>
      {children}
    </main>
  );
}
