### ChatGPT Translation Bot

This extension uses the (OpenAI ChatGPT, DeepSeek) API to translate the selected text into your desired language. It supports 20+ languages and can be used with a proxy.

This is a completely free and open source project. You can configure your api key in the settings page of the extension. It  will be stored locally and there is no risk of leakage.

## Features
- Automatically detect the language of the selected text and auto translate it into your desired language.
- Support shortcut key to translate the selected text.
- Support translate any editable area text, such as the text in the input box, text area, etc. such as Facebook, Youtube, X, and Reddit comment area, and Gmail text input area.
- Support proxy and custom headers for the people who use a proxy to access ChatGPT.
- Support 20+ languages.

## Installation
Go to [ChatGPT Translation Bot](https://chromewebstore.google.com/detail/chatgpt-translation-bot/fglemdfemikhijpgojdobdgplbcfomdf) and install extension for your browser.

## How to setting
- Open the Translation Bot settings.
- Choose your preferred translator and model.
- Enter your API Key.
- Set your desired shortcuts and target languages for each translation type.
- Click 'Save' to apply your settings. 

![how to config](/images/how-to-config.png)

**Attention:** Whenever you change the shortcut keys, you need to refresh the page to make the new shortcut take effect.
But if you change the target language, you don't need to refresh the page, the new language will take effect immediately.

#### Advanced Features:
- If you use a proxy to access ChatGPT, you can check the `Use proxy` option and fill in a proxy address.
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
If you use a VPN tool to access ChatGPT or it's API, you need to turn on the VPN while using this extension. 
If you use a proxy to access ChatGPT, you can fill in the proxy address in the settings page of this extension. (see below screenshot)
![config the proxy](/images/free-proxy.png)   

## Common issues   
- **Can't translate the selected text and always show 'Translating...'**   

  **Solution:** Please check your network connection and make sure the ChatGPT([chat.openai.com](https://chat.openai.com)) is accessible. If you need a VPN to access the ChatGPT, to confirm the VPN is turned on. If all of these didn't work, please to confirm you have pre-billed your OpenAI API account. Since a couple of months ago, OpenAI has changed its policy, you need to pre-bill your account to use the ChatGPT API.  


## How to contribute
* If you like it, please give it a star to support it.   
* If you have any questions or suggestions, please feel free to open an issue.    
* If you want to contribute to this project, please feel free to open a pull request.     
