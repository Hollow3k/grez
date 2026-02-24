import * as vscode from 'vscode';
import { HeartbeatPayload } from './types';
import { sendHeartbeat } from './apiClient';

export class GrezTracker {
    private token: string | undefined;
    private lastHearbeatTime: number = 0;
    private readonly INTERVAL = 120000; // 2 mins
    private disposables: vscode.Disposable[] = [];
    private statusBarItem: vscode.StatusBarItem;

    constructor(private context: vscode.ExtensionContext) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'grez.setupKey'; // Changed to setupKey for now since dashboard isn't built
        this.context.subscriptions.push(this.statusBarItem);
    }

    public async updateToken() {
        this.token = await this.context.secrets.get('grez_api_key');
        console.log("[GREZ] Token refreshed in tracker.");
    }

    private updateStatusBar(projectName: string, isSyncing: boolean = false) {
        if (isSyncing) {
            this.statusBarItem.text = `$(pulse) GREZ: Syncing...`;
            this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
        } else {
            this.statusBarItem.text = `$(heart) GREZ: ${projectName}`;
            this.statusBarItem.color = undefined; // Reset to default
        }
        this.statusBarItem.tooltip = "Click to update your GREZ API Key";
    }

    public async start() {
        await this.updateToken(); // MUST load token before starting syncs
        
        this.statusBarItem.text = "$(sync~spin) GREZ: Initializing...";
        this.statusBarItem.show();

        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(() => this.handleActivity(true)),
            vscode.window.onDidChangeTextEditorOptions(() => this.handleActivity(false)),
            vscode.window.onDidChangeActiveTextEditor(() => this.handleActivity(false))
        );
    }

    private async handleActivity(isWrite: boolean): Promise<void> {
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

        this.updateStatusBar(heartbeat.project, true);

        await sendHeartbeat(heartbeat, this.context);

        this.updateStatusBar(heartbeat.project, false);
    }

    public stop() {
        this.statusBarItem.hide();
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        console.log("[GREZ] Tracker stopped.");
    }
}