import * as vscode from "vscode";
import { jsonPathTo } from "./jsonPathTo";

let currentString: string = "";
let status: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  status.command = "extension.statusBarJSONPath";
  status.show();
  context.subscriptions.push(status);

  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => updateStatus(status)));
  context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => updateStatus(status)));
  context.subscriptions.push(vscode.window.onDidChangeTextEditorViewColumn(() => updateStatus(status)));
  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(() => updateStatus(status)));
  context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(() => updateStatus(status)));

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.statusBarJSONPath", async () => {
      await vscode.env.clipboard.writeText(currentString);
    })
  );

  updateStatus(status);
}

function updateStatus(status: vscode.StatusBarItem): void {
  currentString = "";

  const editor = vscode.window.activeTextEditor;
  if (
    !editor ||
    !(
      editor.document.languageId.toLowerCase() === "json" || //
      editor.document.languageId.toLowerCase() === "jsonc" ||
      editor.document.languageId.toLowerCase() === "asl" ||
      editor.document.languageId.toLowerCase() === "ssm-json"
    )
  ) {
    status.text = "";
    return;
  }

  try {
    const text = editor.document.getText();
    const config = vscode.workspace.getConfiguration("statusBarJSONPath");
    const sep = config.get("keysSeparators") as string;
    const path = jsonPathTo(text, editor.document.offsetAt(editor.selection.active), sep);
    currentString = path;

    status.text = "JSONPath: " + path;
    status.tooltip = "Click to copy to clipboard";
  } catch (ex) {
    if (ex instanceof SyntaxError) {
      status.text = `JSONPath: Invalid JSON.`;
    } else {
      status.text = `JSONPath: Error.`;
    }
    status.tooltip = undefined;
  }
}

export function deactivate() { }
