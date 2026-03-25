import { useRef, type KeyboardEvent } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function PinInput({ value, onChange }: Props) {
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const chars = (value + '    ').slice(0, 4).split('');
    chars[i] = digit;
    onChange(chars.join('').trimEnd());
    if (digit && i < 3) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs[i - 1].current?.focus();
      const chars = (value + '    ').slice(0, 4).split('');
      chars[i - 1] = '';
      onChange(chars.join('').trimEnd());
    }
  };

  return (
    <div className="pin-container">
      {[0, 1, 2, 3].map(i => (
        <input
          key={i}
          ref={refs[i]}
          className="pin-box"
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
        />
      ))}
    </div>
  );
}
