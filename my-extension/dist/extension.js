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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const https = __importStar(require("https"));
function activate(context) {
    console.log('Extension "my-extension" is now active!');
    // Register the webview view provider
    const sidebarProvider = new CustomSidebarProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("myView", sidebarProvider));
    // Trigger the API call immediately on activation
    sidebarProvider.loadContent();
}
class CustomSidebarProvider {
    context;
    view;
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(view) {
        console.log("Webview is being resolved");
        this.view = view;
        view.webview.options = { enableScripts: true };
        // If view is not initialized, call loadContent
        if (!this.view.webview.html) {
            this.loadContent();
        }
    }
    // Function to fetch and load content
    loadContent() {
        console.log("Fetching data from API..."); // Debugging log
        https.get("https://jsonplaceholder.typicode.com/photos", (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log("Data fetched:", jsonData); // Debug log
                    const htmlContent = `
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                  .container { padding: 10px; }
                  .item { margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                  .item img { max-width: 100%; border-radius: 5px; }
                  .item .title { font-size: 16px; font-weight: bold; margin-top: 5px; }
                  .item .description { font-size: 14px; color: #555; }
                  .item button { margin-top: 5px; }
                </style>
              </head>
              <body>
                <div class="container">
                  ${jsonData
                        .map((item) => `
                    <div class="item">
                      <img src="${item.thumbnailUrl}" alt="${item.title}" />
                      <div class="title">${item.title}</div>
                      <div class="description">${item.id}</div>
                      <button onclick="createFile('${item.id}')">Create File</button>
                    </div>`)
                        .join("")}
                </div>
                <script>
                  const vscode = acquireVsCodeApi();
                  function createFile(id) {
                    vscode.postMessage({ command: "createFile", id });
                  }
                </script>
              </body>
            </html>`;
                    // Ensure that the view exists before setting content
                    if (this.view) {
                        console.log("Setting webview HTML content");
                        this.view.webview.html = htmlContent; // Set the content to webview
                    }
                    // Listen for messages from the webview (e.g., button clicks)
                    if (this.view) {
                        this.view.webview.onDidReceiveMessage((message) => {
                            if (message.command === "createFile") {
                                this.createFile(message.id);
                            }
                        });
                    }
                }
                catch (error) {
                    console.error("Failed to load data:", error);
                }
            });
        });
    }
    // Create a file in the workspace based on the clicked item ID
    async createFile(id) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const filePath = vscode.Uri.joinPath(workspaceFolders[0].uri, `PhotoID-${id}.txt`);
            await vscode.workspace.fs.writeFile(filePath, Buffer.from("Hello World"));
            vscode.window.showInformationMessage(`File created: ${filePath.path}`);
        }
        else {
            vscode.window.showErrorMessage("Open a workspace or folder to create files.");
        }
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map