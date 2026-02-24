import * as vscode from 'vscode';
import { GrezTracker } from './tracker';

let tracker: GrezTracker;

export async function activate(context: vscode.ExtensionContext) {
    console.log('GREZ Extension is now active.');
    
    const setupCommand = vscode.commands.registerCommand('grez.setupKey', async () => {
        const token = await vscode.window.showInputBox({
            prompt: "Enter your GREZ API Key from the dashboard",
            placeHolder: "Paste your JWT here...",
            password: true,
            ignoreFocusOut: true 
        });

        if (token) {
            await context.secrets.store('grez_api_key', token);
            
            if (tracker) tracker.updateToken(); 

            vscode.window.showInformationMessage("👑 GREZ: Connection Established!");
        }
    });

    const existingToken = await context.secrets.get('grez_api_key');
    if (!existingToken) {
        vscode.window.showWarningMessage(
            "GREZ: API Key not found. Please run 'GREZ: Setup API Key' to start syncing.",
            "Setup Now"
        ).then(selection => {
            if (selection === "Setup Now") {
                vscode.commands.executeCommand('grez.setupKey');
            }
        });
    }

    tracker = new GrezTracker(context);
    tracker.start();

    context.subscriptions.push({
        dispose: () => tracker.stop()
    });
}

export function deactivate() {
    if (tracker) tracker.stop();
	console.log("[GREZ] Shutdown complete.");
}