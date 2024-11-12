// eslint-disable-next-line import/no-extraneous-dependencies
import { SourceFile } from 'typescript';
import path = require('path');

export function calculateRequirePath(currentFile: SourceFile, sourceFile: SourceFile): string {
    let relativePath = path.relative(
        path.dirname(currentFile.fileName),
        sourceFile.fileName,
    ).replace(/(\.d)?\.ts$/, '');

    relativePath = (!relativePath.startsWith('..') && !relativePath.startsWith('./'))
        ? `./${relativePath}`
        : relativePath;

    return relativePath;
}
