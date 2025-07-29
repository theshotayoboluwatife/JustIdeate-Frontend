import { Facebook, Linkedin, Youtube, Instagram } from "lucide-react";
import logoPath from "@assets/justideate logo_1750798684679.png";

export function Footer() {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between items-start space-y-6 md:space-y-0">
          {/* Left side - Logo and tagline */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center">
              <img src={logoPath} alt="JustIdeate" className="h-8 w-auto" />
            </div>
            <p className="text-gray-400 text-sm mt-[6px] mb-[6px] ml-[12px] mr-[12px]">
              Find or create your next favorite zine.
            </p>
          </div>

          {/* Right side - Navigation links */}
          <div className="flex flex-col space-y-3 text-sm md:items-end">
            <a
              href="/about"
              className="text-gray-400 hover:text-white transition-colors"
            >
              About
            </a>
            <a
              href="https://app.youform.com/forms/xkkim3ka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
