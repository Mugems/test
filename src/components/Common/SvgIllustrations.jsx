import React from 'react';

// Collection/Coming Soon illustration
export const CollectComingSoonSvg = ({ width = 300, height = 200 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 300 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background gradient */}
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f0f9ff" />
        <stop offset="100%" stopColor="#e0f2fe" />
      </linearGradient>
      <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>

    <rect width="300" height="200" fill="url(#bgGradient)" rx="12" />

    {/* Collection jar/piggy bank */}
    <ellipse cx="150" cy="140" rx="45" ry="25" fill="#e5e7eb" opacity="0.5" />

    {/* Main collection container */}
    <rect
      x="120"
      y="60"
      width="60"
      height="70"
      rx="8"
      fill="#ffffff"
      stroke="#d1d5db"
      strokeWidth="2"
    />
    <rect x="125" y="50" width="50" height="15" rx="7" fill="#6b7280" />
    <circle cx="150" cy="57" r="3" fill="#ffffff" />

    {/* Coins falling into container */}
    <circle cx="135" cy="35" r="6" fill="url(#coinGradient)" />
    <text x="135" y="39" textAnchor="middle" fontSize="8" fill="#ffffff" fontWeight="bold">
      ₹
    </text>

    <circle cx="165" cy="25" r="6" fill="url(#coinGradient)" />
    <text x="165" y="29" textAnchor="middle" fontSize="8" fill="#ffffff" fontWeight="bold">
      ₹
    </text>

    <circle cx="145" cy="20" r="5" fill="url(#coinGradient)" opacity="0.8" />
    <text x="145" y="24" textAnchor="middle" fontSize="7" fill="#ffffff" fontWeight="bold">
      ₹
    </text>

    {/* Collection progress bars inside container */}
    <rect x="125" y="75" width="40" height="4" rx="2" fill="#e5e7eb" />
    <rect x="125" y="75" width="20" height="4" rx="2" fill="#10b981" />

    <rect x="125" y="85" width="40" height="4" rx="2" fill="#e5e7eb" />
    <rect x="125" y="85" width="30" height="4" rx="2" fill="#3b82f6" />

    <rect x="125" y="95" width="40" height="4" rx="2" fill="#e5e7eb" />
    <rect x="125" y="95" width="15" height="4" rx="2" fill="#f59e0b" />

    {/* Decorative elements */}
    <circle cx="80" cy="50" r="2" fill="#94a3b8" opacity="0.6" />
    <circle cx="220" cy="70" r="3" fill="#94a3b8" opacity="0.4" />
    <circle cx="90" cy="130" r="2" fill="#94a3b8" opacity="0.5" />
    <circle cx="210" cy="120" r="2" fill="#94a3b8" opacity="0.6" />

    {/* Clock/timer icon */}
    <circle cx="200" cy="40" r="15" fill="#ffffff" stroke="#d1d5db" strokeWidth="2" />
    <circle cx="200" cy="40" r="2" fill="#6b7280" />
    <line
      x1="200"
      y1="40"
      x2="200"
      y2="32"
      stroke="#6b7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="200"
      y1="40"
      x2="206"
      y2="44"
      stroke="#6b7280"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// No customers found illustration
export const NoCustomersFoundSvg = ({ width = 240, height = 160 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 240 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="noCustomersBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="100%" stopColor="#fde68a" />
      </linearGradient>
    </defs>

    <rect width="240" height="160" fill="url(#noCustomersBg)" rx="8" />

    {/* Empty folder/document */}
    <rect
      x="90"
      y="50"
      width="60"
      height="70"
      rx="4"
      fill="#ffffff"
      stroke="#d1d5db"
      strokeWidth="2"
    />
    <polygon points="90,50 90,65 105,50" fill="#f3f4f6" />
    <line
      x1="100"
      y1="70"
      x2="135"
      y2="70"
      stroke="#e5e7eb"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="100"
      y1="80"
      x2="130"
      y2="80"
      stroke="#e5e7eb"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="100"
      y1="90"
      x2="125"
      y2="90"
      stroke="#e5e7eb"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Search magnifying glass */}
    <circle cx="170" cy="45" r="12" fill="none" stroke="#94a3b8" strokeWidth="2" />
    <line
      x1="179"
      y1="54"
      x2="185"
      y2="60"
      stroke="#94a3b8"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* X mark inside search */}
    <line
      x1="165"
      y1="40"
      x2="175"
      y2="50"
      stroke="#ef4444"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="175"
      y1="40"
      x2="165"
      y2="50"
      stroke="#ef4444"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Decorative dots */}
    <circle cx="60" cy="40" r="2" fill="#94a3b8" opacity="0.5" />
    <circle cx="180" cy="90" r="2" fill="#94a3b8" opacity="0.5" />
    <circle cx="70" cy="120" r="2" fill="#94a3b8" opacity="0.5" />

    {/* Empty state lines */}
    <line
      x1="40"
      y1="140"
      x2="200"
      y2="140"
      stroke="#e5e7eb"
      strokeWidth="1"
      strokeDasharray="3,3"
    />
  </svg>
);

// New loan opportunity illustration
export const NewLoanOpportunitySvg = ({ width = 200, height = 120 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 200 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="opportunityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#dbeafe" />
        <stop offset="100%" stopColor="#bfdbfe" />
      </linearGradient>
      <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>

    <rect width="200" height="120" fill="url(#opportunityGradient)" rx="8" />

    {/* Money/Coins stack */}
    <ellipse cx="100" cy="75" rx="20" ry="6" fill="url(#coinGradient)" opacity="0.8" />
    <ellipse cx="100" cy="70" rx="20" ry="6" fill="url(#coinGradient)" opacity="0.9" />
    <ellipse cx="100" cy="65" rx="20" ry="6" fill="url(#coinGradient)" />

    {/* Currency symbol on top coin */}
    <text x="100" y="68" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">
      ₹
    </text>

    {/* Handshake/deal icon */}
    <g transform="translate(140, 45)">
      {/* Hand 1 */}
      <path
        d="M 5 15 Q 8 10 15 12 L 20 15 Q 22 17 20 20 L 15 22 Q 8 20 5 15 Z"
        fill="#f3f4f6"
        stroke="#6b7280"
        strokeWidth="1.5"
      />
      {/* Hand 2 */}
      <path
        d="M 15 22 Q 18 17 25 19 L 30 22 Q 32 24 30 27 L 25 29 Q 18 27 15 22 Z"
        fill="#e5e7eb"
        stroke="#6b7280"
        strokeWidth="1.5"
      />
      {/* Handshake connection */}
      <ellipse cx="17.5" cy="18.5" rx="2.5" ry="4" fill="#d1d5db" />
    </g>

    {/* Document/contract icon */}
    <g transform="translate(45, 35)">
      <rect
        x="0"
        y="0"
        width="25"
        height="30"
        rx="2"
        fill="#ffffff"
        stroke="#d1d5db"
        strokeWidth="1.5"
      />
      <line x1="4" y1="8" x2="21" y2="8" stroke="#e5e7eb" strokeWidth="1.5" />
      <line x1="4" y1="13" x2="18" y2="13" stroke="#e5e7eb" strokeWidth="1.5" />
      <line x1="4" y1="18" x2="21" y2="18" stroke="#e5e7eb" strokeWidth="1.5" />
      <line x1="4" y1="23" x2="15" y2="23" stroke="#e5e7eb" strokeWidth="1.5" />
      {/* Signature line */}
      <line x1="4" y1="26" x2="12" y2="26" stroke="#3b82f6" strokeWidth="2" />
    </g>

    {/* Growth arrow */}
    <g transform="translate(60, 85)">
      <path
        d="M 0 20 Q 15 15 30 5"
        stroke="#10b981"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <polygon points="28,3 30,5 32,3 30,1" fill="#10b981" />
      <polygon points="26,7 30,5 28,9" fill="#10b981" />
    </g>

    {/* Decorative sparkles */}
    <g fill="#3b82f6" opacity="0.6">
      <polygon points="30,20 31.5,23.5 35,23.5 32.5,26 34,29.5 30,27.5 26,29.5 27.5,26 25,23.5 28.5,23.5" />
      <polygon points="165,30 166,32.5 168.5,32.5 166.5,34 167.5,36.5 165,35.5 162.5,36.5 163.5,34 161.5,32.5 164,32.5" />
    </g>
  </svg>
);

// export default {
//   CollectComingSoonSvg,
//   NoCustomersFoundSvg,
//   NewLoanOpportunitySvg,
// };
// Assign object to a variable


// Export the named variable as default
export default  { CollectComingSoonSvg,
  NoCustomersFoundSvg,
  NewLoanOpportunitySvg};
