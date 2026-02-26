export const metadata = {
  title: "ARIA - AI Research Intelligence Agent",
  description: "Your personal AI news monitoring agent",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
