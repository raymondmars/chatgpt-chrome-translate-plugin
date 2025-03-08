### AI Translation Bot

この拡張機能は、DeepSeek、Gemini、ChatGPTなど複数のAIモデル（各APIを介して）を使用し、選択したテキストをお好みの言語へ翻訳いたします。20以上の言語に対応しており、プロキシの利用も可能です。

完全に無料かつオープンソースのプロジェクトです。拡張機能の設定ページでAPIキーを設定してください。APIキーはローカルでのみ保存されるため、漏洩のリスクはございません。

## Features
- 選択したテキストの言語を自動検出し、お好みの言語に翻訳します。
- ショートカットキーを使って選択したテキストを素早く翻訳できます。
- Facebook、YouTube、X、Reddit、Gmailなど、さまざまなプラットフォームの入力欄やコメント欄などの編集可能なテキストも翻訳できます。
- プロキシを使用してAIモデルにアクセスする場合や、カスタムヘッダーが必要な場合も対応しています。
- 20以上の言語をサポートしています。

## Installation
[AI Translation Bot](https://chromewebstore.google.com/detail/chatgpt-translation-bot/fglemdfemikhijpgojdobdgplbcfomdf) にアクセスし、お使いのブラウザに拡張機能をインストールしてください。

## How to setting
- Translation Botの設定画面を開きます。  
- お好みの翻訳エンジンとAIモデルを選択します。  
- APIキーを入力します。  
- 翻訳の種類ごとにショートカットキーとターゲット言語を設定します。  
- 「Save」をクリックして設定を反映してください。 

![how to config](/images/how-to-config-10-ja.png)

**ご注意:** ショートカットキーを変更した場合、新しいショートカットキーを有効にするにはページをリロードしていただく必要がございます。ただし、ターゲット言語を変更するだけであれば、ページをリロードせずとも即時に適用されます。

#### Advanced Features:
- プロキシ経由でAIモデルを使用する場合は、`Use proxy`にチェックを入れ、プロキシのアドレスを入力してください。  
- プロキシでカスタムヘッダーが必要な場合は、`Add custom headers`にチェックを入れて、カスタムヘッダーを追加できます。

## How to use
**1. General Translation (Non-editable Text):**

  - ウェブページ上の選択したテキストを翻訳するときに使用します。  
  - ショートカットキー（初期設定）: Ctrl + Q  
  - ターゲット言語: お好みの言語に設定（例：简体中文）  
  - 使い方: ページ上の任意のテキストを選択し、Ctrl + Qを押すと即座に翻訳されます。

  **1.1 Text Selection Method:**  
  翻訳したいテキストの選択方法として、2つのモードに対応しています。  

  (1) **Mouse Selection (default)** - マウスでテキストをドラッグして選択します。  

  (2) **Hover Over Text** - マウスをテキスト上に乗せるだけで、自動的にそのテキストが選択されます。  
  **Note:** ページが煩雑になりやすいため、この機能にはオン・オフを切り替えるショートカットキーがございます。このモードを選択していても、デフォルトではオフになっています。オンにするにはショートカットキーを押してください。再度ショートカットキーを押すとオフに戻ります。  

  ![how to config](/images/how-to-config-11-ja.png)  

**2. Editable Area Translation:**

  - 入力欄やコメント欄のテキストを翻訳するときに使用します。（例：Facebook、YouTube、Twitter、Reddit、Gmailなど）
  - ショートカットキー（初期設定）: Shift + Ctrl + L  
  - ターゲット言語: お好みの言語（例：English）  
  - 使い方: 入力欄やコメント欄で翻訳したいテキストを選択または貼り付けて、Shift + Ctrl + L（初期設定）を押すと即座に翻訳されます。

Click this link to see the [demo video](https://www.youtube.com/watch?v=tr90eCvougE).

## About use proxy in this extension  
VPNなどを使用してAIモデルやそのAPIにアクセスされる場合は、拡張機能を利用する際にVPNが有効な状態であることをご確認ください。  
プロキシを使用してAIモデルにアクセスする場合は、拡張機能の設定ページでプロキシアドレスを入力してください。（以下のスクリーンショットを参照）  
![config the proxy](/images/free-proxy-ja.png)   

## Common issues   
- **選択したテキストが翻訳されず、ずっと「Translating...」の表示が消えない場合**   

  **Solution:** ネットワーク接続をご確認いただき、ChatGPTなどのAIモデルのサイトに正常にアクセスできるかチェックしてください。もしAIモデルへのアクセスにVPNが必要な場合は、VPNが起動しているかをご確認ください。一部のAIモデルではAPI利用の前払いが必要になる場合がありますので、APIアカウントの請求状態もご確認ください。  

## How to contribute
* 気に入っていただけましたら、スターを付けていただくと励みになります。  
* 質問や提案がございましたら、ぜひIssueを立ててください。  
* プロジェクトへ貢献していただける場合は、Pull Requestをお送りいただければ幸いです。  
