import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export const Barcode = ({
  value,
  format = 'CODE128',
  width = 1.6,
  height = 42,
  displayValue = true,
  fontSize = 12,
  font = 'JetBrains Mono, monospace',
  className = '',
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, String(value), {
          format,
          width,
          height,
          displayValue,
          fontSize,
          font,
          margin: 6,
          background: 'transparent',
          lineColor: '#0f172a',
        });
      } catch (err) {
        console.error('Barcode rendering error:', err);
      }
    }
  }, [value, format, width, height, displayValue, fontSize, font]);

  if (!value) return null;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg ref={svgRef} className="max-w-full" />
    </div>
  );
};

export default Barcode;
