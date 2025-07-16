import React, { useState, useRef } from 'react';
import { TargetLanguage, TranslatorType, createTranslator, OutputFormat, TranslateMessageType } from '../service/translator';
import { TranslateStore } from '../service/store';
import styles from './translator_box.module.scss';
import { LanguageOptions } from './language_options';

const TranslatorBox = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [targetLang, setTargetLang] = useState<TargetLanguage>(TargetLanguage.English);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const lastTranslated = useRef<{ input: string; lang: TargetLanguage }>({ input: '', lang: TargetLanguage.English });

  const handleTranslate = async (text: string, lang: TargetLanguage) => {
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const settings = await TranslateStore.getUserSettings();
      const type = settings.translatorType || TranslatorType.ChatGPT;
      const translator = createTranslator(type);
      translator.translate(text, lang, OutputFormat.PlainText, (message, type) => {
        if (type === TranslateMessageType.Error) {
          setError(message);
          setLoading(false);
        } else if (type === TranslateMessageType.Message) {
          setOutput(message);
        } else if (type === TranslateMessageType.End) {
          setLoading(false);
          // 记录本次已翻译内容和语言
          lastTranslated.current = { input: text, lang };
        }
      });
    } catch (e) {
      setError('Translate failed');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    setError('');
    setOutput('');
  };

  const handleInputBlur = () => {
    // 只有内容或目标语言发生变化时才触发翻译
    if (
      input.trim() &&
      (input !== lastTranslated.current.input || targetLang !== lastTranslated.current.lang)
    ) {
      setOutput('');
      handleTranslate(input, targetLang);
    }
  };

  const handleTargetLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as TargetLanguage;
    setTargetLang(lang);
    if (input.trim() && (input !== lastTranslated.current.input || lang !== lastTranslated.current.lang)) {
      setOutput('');
      handleTranslate(input, lang);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <div className={styles.translatorBox}>
      <h2 className={styles.title}>AI 翻译区</h2>
      <div style={{ marginBottom: 12 }}>
        <label>
          目标语言：
          <select value={targetLang} onChange={handleTargetLangChange} className={styles.langSelect}>
            <LanguageOptions />
          </select>
        </label>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <textarea
          className={styles.inputArea}
          placeholder="请输入要翻译的内容"
          value={input}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
        <div style={{ position: 'relative' }}>
          <div
            className={
              styles.outputArea +
              (error ? ' ' + styles.error : '') +
              (loading ? ' ' + styles.loading : '')
            }
            style={{ paddingBottom: 36 }}
          >
            {loading ? '翻译中...' : (error ? error : output)}
          </div>
          {output && !loading && !error && (
            <button
              onClick={handleCopy}
              style={{
                position: 'absolute',
                right: 12,
                bottom: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                fontSize: 20,
                color: copied ? '#409eff' : '#888',
                transition: 'color 0.2s',
              }}
              title={copied ? '已复制' : '复制'}
            >
              {copied ? '✔️' : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslatorBox; 
