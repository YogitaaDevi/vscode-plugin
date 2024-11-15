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
const path = __importStar(require("path"));
function activate(context) {
    console.log('Congratulations, your extension "my-extension" is now active!');
    const disposable = vscode.commands.registerCommand("my-extension.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World from my-extension!");
    });
    const jsonProvider = new JsonProvider();
    vscode.window.registerTreeDataProvider("myView", jsonProvider);
    vscode.commands.registerCommand("my-extension.createFile", (id) => {
        createFile(id);
    });
    jsonProvider.refreshJson();
    context.subscriptions.push(disposable);
}
async function createFile(id) {
    if (vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.length > 0) {
        const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
        const newFileUri = vscode.Uri.file(path.join(workspaceFolder.fsPath, `PhotoID-${id}.txt`));
        const helloWorldContent = Buffer.from("Hello World");
        try {
            await vscode.workspace.fs.writeFile(newFileUri, helloWorldContent);
            vscode.window.showInformationMessage(`File created: PhotoID-${id}.txt`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create file: ${error}`);
        }
    }
    else {
        vscode.window.showErrorMessage("Open a workspace or folder in VS Code first.");
    }
}
function deactivate() { }
class JsonProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    jsonItems = [];
    refreshJson() {
        https
            .get("https://jsonplaceholder.typicode.com/photos", (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    const jsonData = JSON.parse(data);
                    this.jsonItems = jsonData.map((item) => {
                        return new JsonItem(`Photo ID: ${item.id}`, item.url, item.title, item.id.toString());
                    });
                    this._onDidChangeTreeData.fire();
                }
                catch (error) {
                    console.error("Failed to parse API response:", error);
                }
            });
        })
            .on("error", (error) => {
            console.error("API request error:", error);
        });
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        return this.jsonItems;
    }
}
class JsonItem extends vscode.TreeItem {
    title;
    url;
    description;
    id;
    constructor(title, url, description, id) {
        super(title, vscode.TreeItemCollapsibleState.None);
        this.title = title;
        this.url = url;
        this.description = description;
        this.id = id;
        this.tooltip = title;
        this.description = description;
        this.iconPath = vscode.Uri.parse(url);
        this.command = {
            command: "my-extension.createFile",
            title: "Create File",
            arguments: [this.id],
        };
    }
}
//# sourceMappingURL=extension.js.map