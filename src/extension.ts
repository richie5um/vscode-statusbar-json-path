'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as clipboardy from 'clipboardy';

import { jsonPathTo } from './jsonPathTo'

let currentString: string = '';
let status;

export function activate(context: vscode.ExtensionContext) {

    // console.log('Congratulations, your extension "statusBarJSONPath" is now active!');
    status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    status.command = 'extension.statusBarJSONPath';
    status.show();
    context.subscriptions.push(status);

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(e => updateStatus(status)));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(e => updateStatus(status)));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorViewColumn(e => updateStatus(status)));
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(e => updateStatus(status)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(e => updateStatus(status)));

    context.subscriptions.push(vscode.commands.registerCommand('extension.statusBarJSONPath', () => {
        clipboardy.write(currentString);
    }));

    updateStatus(status);
}

function updateStatus(status: vscode.StatusBarItem): void {

    currentString = '';

    const editor = vscode.window.activeTextEditor
    if (!(editor || editor.document.languageId.toLowerCase() === 'json' || editor.document.languageId.toLowerCase() === 'jsonc')) {
        status.text = '';
        return
    }

    try {
        const text = editor.document.getText()
        //JSON.parse(text)

        const path = jsonPathTo(text, editor.document.offsetAt(editor.selection.active))
        currentString = path;

        status.text = 'JSONPath: ' + path;
        status.tooltip = 'Click to copy to clipboard';
    } catch (ex) {
        if (ex instanceof SyntaxError) {
            status.text = `JSONPath: Invalid JSON.`;
        } else {
            status.text = `JSONPath: Error.`;
        }
        status.tooltip = undefined;
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}
