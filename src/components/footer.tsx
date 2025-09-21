import React from "react";

function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <h3 className="text-lg font-bold">SafeRoads Initiative</h3>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              A citizen-driven platform to report traffic violations and improve
              road safety in our communities. Working together with local
              authorities to create safer streets for everyone.
            </p>
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-400 mb-2">
                Privacy & Security
              </h4>
              <p className="text-sm text-slate-300">
                All reports are anonymous. We do not collect personal
                information or require registration. Your privacy is our
                priority.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  How to Report
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  Reporting Guidelines
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  Track Your Report
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  Technical Help
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  Report Issues
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2025 SafeRoads Initiative. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-slate-400 hover:text-emerald-400 text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-emerald-400 text-sm transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-emerald-400 text-sm transition-colors"
            >
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
