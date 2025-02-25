/*
 * MIT License
 * Copyright (c) 2025 Ata İlhan Köktürk
 */

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-10">
      <div className="flex justify-center items-center max-w-7xl mx-auto px-4">
        <p className="text-sm">
          Made with ❤️ by <Link href="https://github.com/atailh4n" className="text-blue-400 hover:underline">atailh4n</Link>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}