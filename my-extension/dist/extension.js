"use strict";
// import * as vscode from "vscode";
// import * as https from "https";
// import * as path from "path";
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
// export function activate(context: vscode.ExtensionContext) {
//   console.log('Congratulations, your extension "my-extension" is now active!');
//   const disposable = vscode.commands.registerCommand(
//     "my-extension.helloWorld",
//     () => {
//       vscode.window.showInformationMessage("Hello World from my-extension!");
//     }
//   );
//   const jsonProvider = new JsonProvider();
//   vscode.window.registerTreeDataProvider("myView", jsonProvider);
//   vscode.commands.registerCommand("my-extension.createFile", (id: string) => {
//     createFile(id);
//   });
//   jsonProvider.refreshJson();
//   context.subscriptions.push(disposable);
// }
// async function createFile(id: string) {
//   if (
//     vscode.workspace.workspaceFolders &&
//     vscode.workspace.workspaceFolders.length > 0
//   ) {
//     const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
//     const newFileUri = vscode.Uri.file(
//       path.join(workspaceFolder.fsPath, `PhotoID-${id}.txt`)
//     );
//     try {
//       await vscode.workspace.fs.stat(newFileUri);
//       vscode.window.showInformationMessage(
//         `File "PhotoID-${id}.txt" already exists.`
//       );
//     } catch (error) {
//       const helloWorldContent = Buffer.from("Hello World");
//       await vscode.workspace.fs.writeFile(newFileUri, helloWorldContent);
//       vscode.window.showInformationMessage(`File created: PhotoID-${id}.txt`);
//     }
//   } else {
//     vscode.window.showErrorMessage(
//       "Open a workspace or folder in VS Code first."
//     );
//   }
// }
// export function deactivate() {}
// class JsonProvider implements vscode.TreeDataProvider<JsonItem> {
//   private _onDidChangeTreeData: vscode.EventEmitter<
//     JsonItem | undefined | void
//   > = new vscode.EventEmitter<JsonItem | undefined | void>();
//   readonly onDidChangeTreeData: vscode.Event<JsonItem | undefined | void> =
//     this._onDidChangeTreeData.event;
//   private jsonItems: JsonItem[] = [];
//   refreshJson() {
//     https
//       .get("https://jsonplaceholder.typicode.com/photos", (res) => {
//         let data = "";
//         res.on("data", (chunk) => {
//           data += chunk;
//         });
//         res.on("end", () => {
//           try {
//             const jsonData = JSON.parse(data);
//             this.jsonItems = jsonData.map((item: any) => {
//               return new JsonItem(
//                 `Photo ID: ${item.id}`,
//                 item.url,
//                 item.title,
//                 item.id.toString()
//               );
//             });
//             this._onDidChangeTreeData.fire();
//           } catch (error) {
//             console.error("Failed to parse API response:", error);
//           }
//         });
//       })
//       .on("error", (error) => {
//         console.error("API request error:", error);
//       });
//   }
//   getTreeItem(element: JsonItem): vscode.TreeItem {
//     return element;
//   }
//   getChildren(): JsonItem[] {
//     return this.jsonItems;
//   }
// }
// class JsonItem extends vscode.TreeItem {
//   constructor(
//     public readonly title: string,
//     public readonly url: string,
//     public readonly description: string,
//     public readonly id: string
//   ) {
//     super(title, vscode.TreeItemCollapsibleState.None);
//     this.tooltip = title;
//     this.description = description;
//     this.iconPath = vscode.Uri.parse(url);
//     this.command = {
//       command: "my-extension.createFile",
//       title: "Create File",
//       arguments: [this.id],
//     };
//   }
// }
const vscode = __importStar(require("vscode"));
const https = __importStar(require("https"));
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
            const newFileUri = vscode.Uri.file(path.join(workspaceFolder.fsPath, `Post-${id}.txt`));
            try {
                await vscode.workspace.fs.stat(newFileUri);
                vscode.window.showInformationMessage(`File "Post-${id}.txt" already exists.`);
            }
            catch {
                const content = Buffer.from("Hello World");
                await vscode.workspace.fs.writeFile(newFileUri, content);
                vscode.window.showInformationMessage(`File created: Post-${id}.txt`);
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
        https
            .get("https://jsonplaceholder.typicode.com/photos", (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    const posts = JSON.parse(data);
                    const filteredPosts = posts.map((post) => ({
                        id: post.id,
                        title: post.title.toUpperCase(),
                        url: post.thumbnailUrl,
                    }));
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
    _getHtmlForWebview(webview) {
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Card List</title>
          <style>
              body {
                  padding: 10px;
                  color: var(--vscode-foreground);
                  font-family: var(--vscode-font-family);
              }
              .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 20px;
              }
              .refresh-button {
                  background: var(--vscode-button-background);
                  color: var(--vscode-button-foreground);
                  border: none;
                  padding: 4px 12px;
                  cursor: pointer;
                  border-radius: 2px;
              }
              .refresh-button:hover {
                  background: var(--vscode-button-hoverBackground);
              }
              .card {
                  background: var(--vscode-editor-background);
                  border: 1px solid var(--vscode-widget-border);
                  border-radius: 4px;
                  padding: 10px;
                  margin-bottom: 10px;
                  cursor: pointer;
              }
              .card:hover {
                  background: var(--vscode-list-hoverBackground);
              }
              .card h3 {
                  margin: 0 0 10px 0;
                  font-size: 14px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
              }
              .id-badge {
                  background: var(--vscode-badge-background);
                  color: var(--vscode-badge-foreground);
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: normal;
              }
              .card img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 2px;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h2>My Extension</h2>
              <button class="refresh-button">Refresh</button>
          </div>
          <div id="card-container"></div>
          <script>
              const vscode = acquireVsCodeApi();

              document.querySelector('.refresh-button').addEventListener('click', () => {
                  vscode.postMessage({ type: 'refresh' });
              });

              window.addEventListener('message', event => {
                  const message = event.data;
                  switch (message.type) {
                      case 'updatePosts':
                          const container = document.getElementById('card-container');
                          container.innerHTML = message.posts.map(post => 
                           \` <img src="\${post.url}" alt="Photo \${post.id}"/>
                              <div class="card" data-id="\${post.id}">
                                  <h3>
                                      \${post.title}
                                      <span class="id-badge">ID: \${post.id}</span>
                                  </h3>
                              </div>\`
                          ).join('');

                          document.querySelectorAll('.card').forEach(card => {
                              card.addEventListener('click', () => {
                                  vscode.postMessage({
                                      type: 'cardClicked',
                                      id: card.dataset.id
                                  });
                              });
                          });
                          break;
                  }
              });
          </script>
      </body>
      </html>
    `;
    }
}
exports.CardListViewProvider = CardListViewProvider;
function activate(context) {
    const provider = new CardListViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(CardListViewProvider.viewType, provider));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map