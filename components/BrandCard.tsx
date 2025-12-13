
import React from 'react';
import { Link } from '../context/AppContext';
import { BRAND_ICONS } from '../constants';
import { Brand } from '../types';
import { ArrowRight } from 'lucide-react';

interface Props {
  brand: Brand;
}

const BrandCard: React.FC<Props> = ({ brand }) => {
  const Icon = BRAND_ICONS[brand.id];

  return (
    <div className="flex justify-center h-full w-full">
      <Link 
        to={brand.route} 
        className="group relative block w-full aspect-square clip-heptagon transition-all duration-300 hover:scale-105"
      >
        {/* Background Layer with Gradient - Responsive Padding */}
        <div className={`absolute inset-0 bg-slate-800 group-hover:bg-slate-700 transition-colors duration-300 flex flex-col items-center justify-center p-2 md:p-6 text-center border-4 border-transparent`}>
           {/* Active Gradient Overlay */}
           <div className={`absolute inset-0 bg-gradient-to-br ${brand.gradient} opacity-20 group-hover:opacity-100 transition-opacity duration-500`} />
           
           {/* Content */}
           <div className="relative z-10 flex flex-col items-center w-full">
              {/* Responsive Icon Container Size */}
              <div className={`w-8 h-8 md:w-14 md:h-14 rounded-full bg-slate-900/50 backdrop-blur-sm flex items-center justify-center mb-1 md:mb-3 ${brand.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-4 h-4 md:w-7 md:h-7" />
              </div>
              
              {/* Responsive Title Text */}
              <h3 className="text-[10px] md:text-xl font-extrabold text-white mb-0 md:mb-1 drop-shadow-md leading-tight break-words w-full px-1">
                  {brand.name}
              </h3>
              
              {/* Tagline - Hidden on mobile to save space */}
              <p className="hidden md:block text-xs text-slate-300 font-medium mb-3 opacity-80 line-clamp-2 max-w-[80%] group-hover:text-white transition-colors">
                  {brand.tagline}
              </p>
              
              {/* Arrow - Hidden on mobile */}
              <div className="hidden md:flex mt-2 w-8 h-8 rounded-full bg-white/20 items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <ArrowRight size={16} />
              </div>
           </div>
        </div>
      </Link>
    </div>
  );
};

export default BrandCard;
