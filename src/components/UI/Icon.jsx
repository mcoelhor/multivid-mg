import { Baby, BedDouble, Calendar, Beer, CakeSlice, Calculator, Camera, Car, CarTaxiFront, CircleDot, CloudRain, Coffee, Compass, Croissant, Dog, FlaskConical, Fuel, Hammer, HardHat, Heart, HeartPulse, Hospital, Hotel, House, Info, KeyRound, Landmark, Laptop, Mail, Moon, Mountain, PawPrint, Pill, Pizza, Ruler, Sandwich, Scissors, ShoppingBag, ShoppingCart, Siren, Stethoscope, Store, Sunrise, Trees, Utensils, UtensilsCrossed, WashingMachine, Wrench } from 'lucide-react'

const ICONES = { Baby, BedDouble, Calendar, Beer, CakeSlice, Calculator, Camera, Car, CarTaxiFront, CircleDot, CloudRain, Coffee, Compass, Croissant, Dog, FlaskConical, Fuel, Hammer, HardHat, Heart, HeartPulse, Hospital, Hotel, House, Info, KeyRound, Landmark, Laptop, Mail, Moon, Mountain, PawPrint, Pill, Pizza, Ruler, Sandwich, Scissors, ShoppingBag, ShoppingCart, Siren, Stethoscope, Store, Sunrise, Trees, Utensils, UtensilsCrossed, WashingMachine, Wrench }

/** Ícone pelo nome (ex.: "Pill"). Só os ícones usados entram no app, para ele ficar leve. */
export function Icon({ name, size = 20, strokeWidth = 1.9, className = '', ...rest }) {
  const C = ICONES[name] || Store
  return <C size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" {...rest} />
}

export function InstagramIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
    </svg>
  )
}
