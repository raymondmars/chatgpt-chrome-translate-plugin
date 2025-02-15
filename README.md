### AI Translation Bot
([English](README.md) | [简体中文](README_zh.md))

This extension uses multiple AI models (such as DeepSeek, Gemini, ChatGPT) via their respective APIs to translate the selected text into your desired language. It supports 20+ languages and can be used with a proxy.

This is a completely free and open-source project. You can configure your API key in the settings page of the extension. It will be stored locally, ensuring no risk of leakage.

## Features
- Automatically detects the language of the selected text and translates it into your preferred language.
- Supports shortcut keys to translate selected text.
- Supports translation of any editable area text, such as text in input boxes, text areas, and comment sections on platforms like Facebook, YouTube, X, Reddit, and Gmail.
- Allows use of proxy and custom headers for users who access AI models through a proxy.
- Supports 20+ languages.

## Installation
Go to [AI Translation Bot](https://chromewebstore.google.com/detail/chatgpt-translation-bot/fglemdfemikhijpgojdobdgplbcfomdf) and install extension for your browser.

## How to setting
- Open the Translation Bot settings.
- Choose your preferred translator and AI model.
- Enter your API Key.
- Set your desired shortcuts and target languages for each translation type.
- Click 'Save' to apply your settings. 

![how to config](/images/how-to-config.png)

**Attention:** Whenever you change the shortcut keys, you need to refresh the page to make the new shortcut take effect.
But if you change the target language, you don't need to refresh the page, the new language will take effect immediately.

#### Advanced Features:
- If you use a proxy to access an AI model, check the `Use proxy` option and fill in a proxy address.
if your proxy needs some custom headers, You can fill in the custom headers by checking the `Add custom headers` option.


## How to use
**1. General Translation (Non-editable Text):**

  - Use this for translating selected text on web pages.
  - Shortcut: Ctrl + Q (default)
  - Target Language: Set to your preferred language (e.g., 简体中文)
  - How to use: Select any text on a webpage, then press Ctrl + Q to translate it instantly.

  **1.1 Text Selection Method:**    
  Support two ways to select the text that you want to translate.   

  (1) **Mouse Selection (default)** - Use the mouse to select text.        

  (2) **Hover Over Text** - When the mouse hovers over the text, these contents will be selected automatically.      
  **Note:** Since this is a feature that can easily cause page clutter, a shortcut key is provided to turn this feature on or off. This feature is turned off by default even when this mode is selected. You need to press this shortcut key to enable this feature. Pressing this shortcut key again after turning it on will turn it off.   

  ![how to config](/images/how-to-config-1.png)   

**2. Editable Area Translation:**

  - Use this for translating text in input fields, comment areas, etc. (e.g., on Facebook, YouTube, Twitter, Reddit, or Gmail)
  - Shortcut: Shift + Ctrl + L (default)
  - Target Language: Set to your desired output language (e.g., English)
  - How to use: Select the text you've typed or paste text into an editable area, then press Shift + Ctrl + L (default) to translate it immediately.


Click this link to see the [demo video](https://www.youtube.com/watch?v=tr90eCvougE).

## About use proxy in this extension  
If you use a VPN tool to access an AI model or its API, ensure the VPN is active when using this extension.
If you use a proxy to access an AI model, you can fill in the proxy address in the settings page of the extension. (see below screenshot)
![config the proxy](/images/free-proxy.png)   

## Common issues   
- **Can't translate the selected text and always show 'Translating...'**   

  **Solution:** Please check your network connection and ensure the AI model’s website (e.g., ChatGPT or others) is accessible. If you require a VPN to access the AI models, confirm that the VPN is turned on. If these steps don't resolve the issue, confirm that you’ve pre-billed your API account, as some models now require pre-billing to use their API.  


## How to contribute
* If you like it, please give it a star to support it.   
* If you have any questions or suggestions, please feel free to open an issue.    
* If you want to contribute to this project, please feel free to open a pull request.     
