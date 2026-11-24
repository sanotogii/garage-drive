import "./globals.css";

export const metadata = { title: "Garage Drive", description: "Browse, upload and download files from your Garage S3 bucket" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
