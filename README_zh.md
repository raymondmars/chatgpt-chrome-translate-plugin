### AI Translation Bot

这款Chrome插件支持多个AI模型（如 DeepSeek、Gemini、ChatGPT）将选中的文本翻译成您设置的语言。它支持 20 多种语言，并且可以使用代理。

这是一个完全免费的开源项目，您的 API 密钥被存储在本地，不会有泄露的风险。

## 功能特点
- 自动检测选中文本的语言，并将其翻译成您选择的语言。
- 支持快捷键来翻译选中的文本。
- 支持翻译任何可编辑区域的文本，如输入框、文本框和评论区（如 Facebook、YouTube、X、Reddit 和 Gmail）。
- 支持通过代理访问 AI 模型，并允许自定义请求头。
- 支持全世界 20 多种语言。
- **对的，你没有看错，它还支持将任何文字翻译成风趣幽默的中国方言和文言文！**  
  (注意，如果想让方言翻译有更好的效果，请尽量选择具备推理能力的模型，比如 DeepSeek 的 deepseek-reasoner 或者 Gemini 的 gemini-2.0-flash-thinking-exp-01-21)  

## 安装
前往 [AI Translation Bot](https://chromewebstore.google.com/detail/chatgpt-translation-bot/fglemdfemikhijpgojdobdgplbcfomdf) 并为您的浏览器安装扩展。

## 设置方法
- 打开 AI Translation Bot 的设置页面。
- 选择您偏好的翻译器和 AI 模型。
- 输入您的 API 密钥。
- 设置每种翻译类型的快捷键和目标语言。
- 点击 "保存" 以应用您的设置。

![how to config](/images/how-to-config-zh.png)

**注意：** 每次更改快捷键后，您需要刷新页面才能使新的快捷键生效。但如果更改目标语言，则无需刷新页面，新的语言会立即生效。

#### 高级功能：
- 如果您使用代理访问 AI 模型，请勾选 “使用代理” 选项，并填写代理地址。
- 如果您的代理需要自定义请求头，可以勾选 “添加自定义请求头” 选项，并填写所需的请求头。

## 如何使用
**1. 一般翻译（不可编辑文本）：**

- 用于翻译网页上选中的文本。
- 快捷键：Ctrl + Q（默认）
- 目标语言：设置为您偏好的语言（例如，简体中文）
- 使用方法：在网页上选择任意文本，然后按 Ctrl + Q 立即翻译。

**1.1 文本选择方式：**    
支持两种方式来选择您想翻译的文本。

(1) **鼠标选择（默认）** - 使用鼠标选择文本。

(2) **鼠标悬停选中文本** - 当鼠标悬停在文本上时，内容会自动选中。  
**注意：** 由于此功能可能会导致页面杂乱，因此提供了一个快捷键来开启或关闭此功能。即使选择了该模式，默认情况下该功能是关闭的。您需要按下快捷键来启用此功能。启用后再次按下快捷键将会关闭此功能。

![how to config](/images/how-to-config-1-zh.png)

**2. 可编辑区域翻译：**

- 用于翻译输入框、评论区等可编辑区域的文本（例如，Facebook、YouTube、Twitter、Reddit 或 Gmail）。
- 快捷键：Shift + Ctrl + L（默认）
- 目标语言：设置为您希望的输出语言（例如，英语）
- 使用方法：选择您输入的文本或粘贴到可编辑区域，然后按 Shift + Ctrl + L（默认）立即翻译。

点击此链接查看 [演示视频](https://www.youtube.com/watch?v=tr90eCvougE)。

## 关于在此扩展中使用代理
如果您使用 VPN 工具访问 AI 模型或其 API，请确保在使用此扩展时启用 VPN。
如果您通过代理访问 AI 模型，可以在扩展的设置页面填写代理地址。（见下方截图）
![config the proxy](/images/free-proxy-zh.png)

## 常见问题
- **无法翻译选中的文本，且总是显示 “正在翻译...”**

**解决方法：** 请检查您的网络连接，确保 AI 模型的网站（例如 ChatGPT 或其他）是可访问的。如果需要 VPN 才能访问 AI 模型，请确保 VPN 已开启。如果这些方法仍未解决问题，请确认您已经预先充值了您的 API 账户，因为一些模型现在要求预先充值才能使用其 API。

## 如何贡献
* 如果您喜欢此项目，请给它一个 Star。
* 如果您有任何问题或建议，请随时创建 issue ticket。
* 如果您想为此项目做贡献，请随时创建 Pull Request。
