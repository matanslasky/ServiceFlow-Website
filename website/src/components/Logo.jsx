import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* CONTROL LOGO SIZE HERE - Currently h-14 (approx 56px) */}
      <img 
        src="/logo.png" 
        alt="ServiceFlow" 
        className="h-14 w-auto" 
        onError={(e) => {e.target.style.display='none';}} 
      />
    </div>
  );
}