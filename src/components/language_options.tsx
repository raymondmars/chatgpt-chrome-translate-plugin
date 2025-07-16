import React from 'react';

export const LANGUAGE_LIST = [
  { value: 'Arabic', label: 'العربية' },
  { value: 'Bulgarian', label: 'Български' },
  { value: 'Chinese', label: '简体中文' },
  { value: 'Traditional Chinese', label: '繁體中文' },
  { value: 'Croatian', label: 'Hrvatski' },
  { value: 'Czech', label: 'Čeština' },
  { value: 'Danish', label: 'Dansk' },
  { value: 'Dutch', label: 'Nederlands' },
  { value: 'English', label: 'English' },
  { value: 'Finnish', label: 'Suomi' },
  { value: 'French', label: 'Français' },
  { value: 'German', label: 'Deutsch' },
  { value: 'Greek', label: 'Ελληνικά' },
  { value: 'Hungarian', label: 'Magyar' },
  { value: 'Indonesian', label: 'Indonesia' },
  { value: 'Italian', label: 'Italiano' },
  { value: 'Japanese', label: '日本語' },
  { value: 'Korean', label: '한국어' },
  { value: 'Vietnamese', label: 'Tiếng Việt' },
  { value: 'Norwegian', label: 'Norsk' },
  { value: 'Polish', label: 'Polski' },
  { value: 'Portuguese', label: 'Português' },
  { value: 'Romanian', label: 'Română' },
  { value: 'Russian', label: 'Русский' },
  { value: 'Slovak', label: 'Slovenčina' },
  { value: 'Slovenian', label: 'Slovenščina' },
  { value: 'Spanish', label: 'Español' },
  { value: 'Swedish', label: 'Svenska' },
  { value: 'Thai', label: 'ไทย' },
  { value: 'Turkish', label: 'Türkçe' },
  { value: 'Ukrainian', label: 'Українська' },
];

export const LanguageOptions = () => (
  <>
    {LANGUAGE_LIST.map(lang => (
      <option key={lang.value} value={lang.value}>{lang.label}</option>
    ))}
  </>
); 
