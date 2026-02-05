// Data redaction utility for PII in trading contracts

const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  accountNumber: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  name: /\b(?:Mr|Mrs|Ms|Dr)\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
  iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g
};

export const redactPII = (text: string): { redacted: string; redactions: Array<{ type: string; count: number }> } => {
  let redacted = text;
  const redactions: Array<{ type: string; count: number }> = [];

  Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
    const matches = redacted.match(pattern);
    if (matches) {
      redacted = redacted.replace(pattern, (match) => {
        if (type === 'email') return match.replace(/[^@]/g, '*').replace('@', '@');
        if (type === 'phone') return '***-***-****';
        if (type === 'ssn') return '***-**-****';
        if (type === 'accountNumber') return '****-****-****-****';
        if (type === 'iban') return '**XX XXXX XXXX XXXX XXXX';
        return '***REDACTED***';
      });
      redactions.push({ type, count: matches.length });
    }
  });

  return { redacted, redactions };
};

export const maskSensitiveData = (text: string, maskChar: string = '*'): string => {
  return redactPII(text).redacted;
};
