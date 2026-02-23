import * as vscode from 'vscode';
import { GrezTracker } from './tracker';

let tracker: GrezTracker;

export function activate(context: vscode.ExtensionContext) {
    console.log('GREZ Extension is now active.');
    
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