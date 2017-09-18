import {
  workspace as Workspace,
  window as Window,
  commands as Commands,
  languages as Languages,
  Position,
  Range,
  TextEdit,
  ExtensionContext
} from 'vscode';
import PHPFmt from './PHPFmt';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    Workspace.onWillSaveTextDocument(event => {
      if (event.document.languageId === 'php') {
        const phpfmt: PHPFmt = new PHPFmt();
        if (phpfmt.formatOnSave) {
          event.waitUntil(
            Commands.executeCommand('editor.action.formatDocument')
          );
        }
      }
    })
  );

  context.subscriptions.push(
    Commands.registerTextEditorCommand('phpfmt.format', textEditor => {
      if (textEditor.document.languageId === 'php') {
        Commands.executeCommand('editor.action.formatDocument');
      }
    })
  );

  context.subscriptions.push(
    Languages.registerDocumentFormattingEditProvider('php', {
      provideDocumentFormattingEdits: document => {
        return new Promise<any>((resolve, reject) => {
          const originalText: string = document.getText();
          const lastLine = document.lineAt(document.lineCount - 1);
          const range: Range = new Range(
            new Position(0, 0),
            lastLine.range.end
          );

          const phpfmt: PHPFmt = new PHPFmt();

          phpfmt
            .format(context, originalText)
            .then((text: string) => {
              if (text !== originalText) {
                resolve([new TextEdit(range, text)]);
              } else {
                reject();
              }
            })
            .catch(err => {
              if (err instanceof Error) {
                Window.showErrorMessage(err.message);
              }
              reject();
            });
        });
      }
    })
  );
}
