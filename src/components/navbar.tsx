import React from "react";

function Navbar() {
  return (
    <header className="bg-white shadow-lg border-b border-slate-200 w-full fixed z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">SafeRoads</h1>
              <p className="text-sm text-slate-600">
                Traffic Safety Initiative
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <a
              href="#"
              className="text-slate-600 hover:text-emerald-600 transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-emerald-600 transition-colors"
            >
              Guidelines
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-emerald-600 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
