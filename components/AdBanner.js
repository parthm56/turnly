'use client';
import { useEffect } from 'react';

/**
 * TURNLY — Pure Google AdSense Responsive Display Unit Component
 */
export default function AdBanner({
  adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX',
  adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID || '1234567890',
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {},
}) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('[Turnly AdSense Error]', e);
    }
  }, []);

  return (
    <div style={{
      margin: '20px 0',
      textAlign: 'center',
      background: '#fafaf9',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: 14,
      padding: '12px 16px',
      overflow: 'hidden',
      ...style,
    }}>
      <div style={{ fontSize: 10, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        Advertisement / Sponsored
      </div>

      {/* Google AdSense Unit */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 90, ...style }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}
