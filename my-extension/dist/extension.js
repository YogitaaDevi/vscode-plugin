"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardListViewProvider = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CardListViewProvider {
    _extensionUri;
    static viewType = "cardList";
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.type) {
                case "cardClicked":
                    this.createFile(data.id);
                    break;
                case "refresh":
                    this.refreshList();
                    break;
            }
        });
        this.refreshList();
    }
    async createFile(id) {
        if (vscode.workspace.workspaceFolders &&
            vscode.workspace.workspaceFolders.length > 0) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
            const newFileUri = vscode.Uri.file(path.join(workspaceFolder.fsPath, `Photo-${id}.txt`));
            try {
                await vscode.workspace.fs.stat(newFileUri);
                vscode.window.showInformationMessage(`File "Photo-${id}.txt" already exists.`);
            }
            catch {
                const content = Buffer.from("Hello World");
                await vscode.workspace.fs.writeFile(newFileUri, content);
                vscode.window.showInformationMessage(`File created: Photo-${id}.txt`);
            }
        }
        else {
            vscode.window.showErrorMessage("Open a workspace or folder in VS Code first.");
        }
    }
    refreshList() {
        if (!this._view) {
            return;
        }
        console.log("Fetching data...");
        https
            .get("https://jsonplaceholder.typicode.com/photos", (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    console.log("Raw data received");
                    const posts = JSON.parse(data);
                    const filteredPosts = posts.map((post) => ({
                        id: post.id,
                        title: post.title.substring(0, 40) + "...",
                        url: post.thumbnailUrl,
                    }));
                    console.log("Filtered posts:", filteredPosts);
                    this._view?.webview.postMessage({
                        type: "updatePosts",
                        posts: filteredPosts,
                    });
                }
                catch (error) {
                    console.error("Failed to parse API response:", error);
                    vscode.window.showErrorMessage("Failed to load data");
                }
            });
        })
            .on("error", (error) => {
            console.error("API request error:", error);
            vscode.window.showErrorMessage("Failed to fetch data");
        });
    }
    // private _getHtmlForWebview(webview: vscode.Webview): string {
    //   return `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //         <meta charset="UTF-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <title>Component Library</title>
    //         <style>
    //             body {
    //                 padding: 16px;
    //                 color: #ffffff;
    //                 background-color: #1e1e1e;
    //                 font-family: var(--vscode-font-family);
    //             }
    //             .header {
    //                 margin-bottom: 20px;
    //             }
    //             .header h1 {
    //                 font-size: 20px;
    //                 font-weight: 500;
    //                 margin: 0 0 16px 0;
    //             }
    //             .search-container {
    //                 position: relative;
    //                 margin-bottom: 24px;
    //                 width: 100%;
    //             }
    //             .search-input {
    //                 padding: 10px 12px 10px 12px;
    //                 background-color: #3c3c3c;
    //                 border: 1px solid #666666;
    //                 border-radius: 8px;
    //                 color: #383838;
    //                 font-size: 14px;
    //             }
    //             .search-icon {
    //                 position: absolute;
    //                 width: 16px;
    //                 height: 16px;
    //                 top: 9px;
    //                 left: 175px;
    //             }
    //             .component-card {
    //                 background-color: #252526;
    //                 border: 1px solid #1e1e1e;
    //                 border-radius: 6px;
    //                 margin-bottom: 16px;
    //                 padding: 16px;
    //                 display: flex;
    //                 align-items: center;
    //             }
    //             .component-info {
    //                 display: flex;
    //                 align-items: center;
    //                 gap: 16px;
    //             }
    //             .component-preview {
    //                 width: 110px;
    //                 height: 110px;
    //                 background-color: #3c3c3c;
    //                 border-radius: 10px;
    //                 display: flex;
    //                 align-items: center;
    //                 justify-content: center;
    //                 overflow: hidden;
    //             }
    //             .component-preview img {
    //                 width: 110px;
    //                 height: 110px;
    //                 object-fit: cover;
    //             }
    //             .component-title {
    //                 color: #ffffff;
    //                 font-size: 14px;
    //             }
    //             .create-button {
    //                 background-color: #2ea043;
    //                 border: none;
    //                 border-radius: 4px;
    //                 color: white;
    //                 padding: 6px 16px;
    //                 cursor: pointer;
    //                 font-size: 14px;
    //             }
    //             .create-button:hover {
    //                 background-color: #3fb950;
    //             }
    //         </style>
    //     </head>
    //     <body>
    //         <div class="header">
    //             <h1>Component library</h1>
    //         </div>
    //         <div class="search-container">
    //           <input type="text" class="search-input" placeholder="Search for a component">
    //             <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    //               <circle cx="11" cy="11" r="7"></circle>
    //                 <path d="M21 21l-4.35-4.35"></path>
    //             </svg>
    //         </div>
    //         <div id="loading">Loading components...</div>
    //         <div id="component-list"></div>
    //         <script>
    //             const vscode = acquireVsCodeApi();
    //             let loadingElement = document.getElementById('loading');
    //             let componentList = document.getElementById('component-list');
    //             document.querySelector('.search-input').addEventListener('input', (e) => {
    //                 const searchTerm = e.target.value.toLowerCase();
    //                 document.querySelectorAll('.component-card').forEach(card => {
    //                     const title = card.querySelector('.component-title').textContent.toLowerCase();
    //                     card.style.display = title.includes(searchTerm) ? 'flex' : 'none';
    //                 });
    //             });
    //             window.addEventListener('message', event => {
    //                 const message = event.data;
    //                 console.log('Received message:', message);
    //                 switch (message.type) {
    //                     case 'updatePosts':
    //                         loadingElement.style.display = 'none';
    //                         if (message.posts && message.posts.length > 0) {
    //                             componentList.innerHTML = message.posts.map(post => \`
    //                                 <div class="component-card">
    //                                     <div class="component-info">
    //                                         <div class="component-preview">
    //                                             <img src="\${post.url}" alt="Component \${post.id}" />
    //                                         </div>
    //                                         <span class="component-title">\${post.title}</span>
    //                                     </div>
    //                                     <button class="create-button" onclick="createComponent('\${post.id}')">
    //                                         Create
    //                                     </button>
    //                                 </div>
    //                             \`).join('');
    //                         } else {
    //                             componentList.innerHTML = '<div>No components found</div>';
    //                         }
    //                         break;
    //                 }
    //             });
    //             function createComponent(id) {
    //                 vscode.postMessage({
    //                     type: 'cardClicked',
    //                     id: id
    //                 }); 
    //             }
    //             vscode.postMessage({ type: 'refresh' });
    //         </script>
    //     </body>
    //     </html>
    //   `;
    // }
    _getHtmlForWebview(webview) {
        const htmlPath = vscode.Uri.joinPath(this._extensionUri, "media", "html", "index.html");
        const htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "js", "script.js"));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "css", "style.css"));
        return htmlContent
            .replace(/{{styleUri}}/g, styleUri.toString())
            .replace(/{{scriptUri}}/g, scriptUri.toString());
    }
}
exports.CardListViewProvider = CardListViewProvider;
function activate(context) {
    const provider = new CardListViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(CardListViewProvider.viewType, provider));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map