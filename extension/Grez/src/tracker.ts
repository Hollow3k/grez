import * as vscode from 'vscode';
import { HeartbeatPayload } from './types';
import { sendHeartbeat } from './apiClient';
import { timeStamp } from 'console';

export class GrezTracker{
    private lastHearbeatTime: number = 0;
    private readonly INTERVAL = 120000; // 2mins
    private disposables : vscode.Disposable[] = [];

    private statusBarItem: vscode.StatusBarItem;

    constructor(private context: vscode.ExtensionContext) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'grez.openDashboard'; // Command to trigger later
        this.context.subscriptions.push(this.statusBarItem);
    }

    private updateStatusBar(projectName: string) {
        this.statusBarItem.text = `$(code) GREZ: Tracking ${projectName}`;
        this.statusBarItem.tooltip = "Click to view your GREZ Dashboard";
    }

    public start(){
        this.statusBarItem.text = "$(sync~spin) GREZ: Initializing...";
        this.statusBarItem.show();
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(
                () => {this.handleActivity(true);}
            ),
            vscode.window.onDidChangeTextEditorOptions(
                () => {this.handleActivity(true);}
            ),
            vscode.window.onDidChangeActiveTextEditor(
                () => {this.handleActivity(true);}
            )
        )
    }

    private handleActivity(isWrite : boolean) : void{
        if (!vscode.window.state.focused) return;

        const now = Date.now();
        if (now - this.lastHearbeatTime < this.INTERVAL) return;

        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        this.lastHearbeatTime = now;

        const heartbeat: HeartbeatPayload = {
            project: vscode.workspace.name || 'External',
            language: editor.document.languageId,
            file: editor.document.fileName,
            lineCount: editor.document.lineCount,
            isWrite: isWrite,
            timestamp: new Date().toISOString()
        };

        sendHeartbeat(heartbeat);

        this.updateStatusBar(heartbeat.project);
    }

    public stop(){
        this.statusBarItem.hide();
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        console.log("[GREZ] Tracker stopped and UI cleaned up.");
    }
}