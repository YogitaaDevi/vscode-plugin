import * as vscode from "vscode";
import * as https from "https";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "my-extension" is now active!');

  const disposable = vscode.commands.registerCommand(
    "my-extension.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from my-extension!");
    }
  );

  const jsonProvider = new JsonProvider();
  vscode.window.registerTreeDataProvider("myView", jsonProvider);

  vscode.commands.registerCommand("my-extension.createFile", (id: string) => {
    createFile(id);
  });

  jsonProvider.refreshJson();
  context.subscriptions.push(disposable);
}

async function createFile(id: string) {
  if (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
  ) {
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
    const newFileUri = vscode.Uri.file(
      path.join(workspaceFolder.fsPath, `PhotoID-${id}.txt`)
    );

    const helloWorldContent = Buffer.from("Hello World");

    try {
      await vscode.workspace.fs.writeFile(newFileUri, helloWorldContent);
      vscode.window.showInformationMessage(`File created: PhotoID-${id}.txt`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to create file: ${error}`);
    }
  } else {
    vscode.window.showErrorMessage(
      "Open a workspace or folder in VS Code first."
    );
  }
}

export function deactivate() {}

class JsonProvider implements vscode.TreeDataProvider<JsonItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    JsonItem | undefined | void
  > = new vscode.EventEmitter<JsonItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<JsonItem | undefined | void> =
    this._onDidChangeTreeData.event;

  private jsonItems: JsonItem[] = [];

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

            this.jsonItems = jsonData.map((item: any) => {
              return new JsonItem(
                `Photo ID: ${item.id}`,
                item.url,
                item.title,
                item.id.toString()
              );
            });

            this._onDidChangeTreeData.fire();
          } catch (error) {
            console.error("Failed to parse API response:", error);
          }
        });
      })
      .on("error", (error) => {
        console.error("API request error:", error);
      });
  }

  getTreeItem(element: JsonItem): vscode.TreeItem {
    return element;
  }

  getChildren(): JsonItem[] {
    return this.jsonItems;
  }
}

class JsonItem extends vscode.TreeItem {
  constructor(
    public readonly title: string,
    public readonly url: string,
    public readonly description: string,
    public readonly id: string
  ) {
    super(title, vscode.TreeItemCollapsibleState.None);
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
