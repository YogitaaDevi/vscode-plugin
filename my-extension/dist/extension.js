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
                        title: post.title.substring(0, 40) + "...",
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