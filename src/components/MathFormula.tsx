import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      // Clean formula if wrapped in dollar signs or backticks
      let clean = formula.trim();
      if (clean.startsWith('$$') && clean.endsWith('$$')) {
        clean = clean.slice(2, -2).trim();
      } else if (clean.startsWith('$') && clean.endsWith('$')) {
        clean = clean.slice(1, -1).trim();
      }

      return katex.renderToString(clean, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch (err) {
      console.warn('KaTeX rendering error for formula:', formula, err);
      return null;
    }
  }, [formula, displayMode]);

  if (!html) {
    return (
      <code className={`font-mono text-cyan-300 text-sm ${className}`}>
        {formula}
      </code>
    );
  }

  return (
    <span
      className={`inline-block text-slate-100 ${displayMode ? 'my-2 overflow-x-auto max-w-full' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
