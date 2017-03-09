'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { jsonPathTo } from './jsonPathTo'

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "statusBarJSONPath" is now active!');

    const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    status.command = 'extension.statusBarJSONPath';
    status.show();
    context.subscriptions.push(status);

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(e => updateStatus(status)));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(e => updateStatus(status)));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorViewColumn(e => updateStatus(status)));
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(e => updateStatus(status)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(e => updateStatus(status)));

    // context.subscriptions.push(vscode.commands.registerCommand('extension.statusBarJSONPath', () => {
    //     vscode.window.showInformationMessage('Hello JSON Path');
    // }));

    updateStatus(status);
}

function updateStatus(status: vscode.StatusBarItem): void {

    const editor = vscode.window.activeTextEditor
    if (!editor) {
        return
    }

    try {
        const text = editor.document.getText()
        JSON.parse(text)
        const path = jsonPathTo(text, editor.document.offsetAt(editor.selection.active))

        status.text = 'Path: ' + path;
    } catch (ex) {
        if (ex instanceof SyntaxError) {
            status.text = `Invalid JSON.`;
        } else {
            status.text = `Error in JSONPath`;
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}