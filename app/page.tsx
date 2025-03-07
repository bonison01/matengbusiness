'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Wait for a moment before redirecting to make sure the loading UI is visible
    setTimeout(() => {
      router.push('/discover/product'); // Redirect to /home page
    }, 1000); // Adjust the timeout as needed
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white">
      <div className="text-center">
        <p className="text-xl font-semibold">Redirecting...</p>
        <div className="mt-4">
          <div className="w-16 h-16 border-4 border-t-4 border-white border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
