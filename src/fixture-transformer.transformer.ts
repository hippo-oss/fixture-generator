// eslint-disable-next-line import/no-extraneous-dependencies
import {
    CallExpression,
    isCallExpression,
    isIdentifier,
    isTypeLiteralNode,
    Node,
    Program,
    SourceFile,
    TransformationContext,
    TransformerFactory,
    TypeChecker,
    visitEachChild,
    visitNode,
} from 'typescript';
import { getDefaultValue } from './fixture-transformer.defaults';
import { isSourceFile } from './fixture-transformer.guards';
import { defaultNewFixtureOptions, extractNewFixtureOptions, NewFixtureOptions } from './options';

function returnFixture(
    node: CallExpression,
    typeChecker: TypeChecker,
    currentFile: SourceFile,
    globalOptions: NewFixtureOptions,
): Node {
    if (!node.typeArguments || node.typeArguments.length > 2) {
        throw new Error('newFixture function should have one or two generic type variables');
    }

    const typeArgument = node.typeArguments[0];
    const type = typeChecker.getTypeFromTypeNode(typeArgument);

    let optionOverrides: NewFixtureOptions | undefined;
    if (node.typeArguments.length === 2) {
        const optionsTypeArgument = node.typeArguments[1];
        if (!isTypeLiteralNode(optionsTypeArgument)) {
            throw new Error('newFixture options type is not a type literal');
        }

        optionOverrides = extractNewFixtureOptions(optionsTypeArgument, typeChecker);
    }

    const options = { ...defaultNewFixtureOptions, ...globalOptions, ...optionOverrides };

    const override = node.arguments[0] ?? undefined;

    if (node.arguments.length > 1) {
        throw new Error('newFixture function should have no more than one argument');
    }

    const defaultValue = getDefaultValue({ type, typeChecker, currentFile, override, options, level: 0 }).data;
    return defaultValue;
}

function visit(
    node: Node,
    transformerContext: TransformationContext,
    typeChecker: TypeChecker,
    currentFile: SourceFile,
    globalOptions: NewFixtureOptions,
): Node {
    if (isCallExpression(node) && isIdentifier(node.expression) && node.expression.text === 'newFixture') {
        return returnFixture(node, typeChecker, currentFile, globalOptions);
    }
    return visitEachChild(
        node, (child) => visit(child, transformerContext, typeChecker, currentFile, globalOptions), transformerContext,
    );
}

export const fixtureTransformer = (program: Program, options: NewFixtureOptions): TransformerFactory<SourceFile> => {
    const typeChecker = program.getTypeChecker();
    return (context) => (sourceFile) => {
        const visitor = (node: Node) => visit(node, context, typeChecker, sourceFile, options);
        return visitNode(sourceFile, visitor, isSourceFile);
    };
};
