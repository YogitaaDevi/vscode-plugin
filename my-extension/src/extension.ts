import * as vscode from "vscode";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";

export class CardListViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "cardList";
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
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

  private async createFile(id: string) {
    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
      const newFileUri = vscode.Uri.file(
        path.join(workspaceFolder.fsPath, `Photo-${id}.txt`)
      );

      try {
        await vscode.workspace.fs.stat(newFileUri);
        vscode.window.showInformationMessage(
          `File "Photo-${id}.txt" already exists.`
        );
      } catch {
        const content = Buffer.from("Hello World");
        await vscode.workspace.fs.writeFile(newFileUri, content);
        vscode.window.showInformationMessage(`File created: Photo-${id}.txt`);
      }
    } else {
      vscode.window.showErrorMessage(
        "Open a workspace or folder in VS Code first."
      );
    }
  }

  private refreshList() {
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
            const filteredPosts = posts.map((post: any) => ({
              id: post.id,
              title: post.title.substring(0, 40) + "...",
              url: post.thumbnailUrl,
            }));

            this._view?.webview.postMessage({
              type: "updatePosts",
              posts: filteredPosts,
            });
          } catch (error) {
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

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const htmlPath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "html",
      "index.html"
    );
    const htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "js", "script.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "css", "style.css")
    );

    return htmlContent
      .replace(/{{styleUri}}/g, styleUri.toString())
      .replace(/{{scriptUri}}/g, scriptUri.toString());
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new CardListViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CardListViewProvider.viewType,
      provider
    )
  );
}

export function deactivate() {}
