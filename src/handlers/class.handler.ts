// eslint-disable-next-line import/no-extraneous-dependencies
import {
    Expression,
    factory,
    isConstructorDeclaration,
    NodeFlags,
    SourceFile,
    Statement,
    Symbol as TypeSymbol,
    SyntaxKind,
    Type,
    VariableStatement,
} from 'typescript';
import path = require('path');
import { DefaultValueHandler } from './types';
import { isNumberType, isStringType, isSymbolType } from '../fixture-transformer.guards';
import { getClassConstructor, getPropertyAssignmentValue, overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

function calculateRequirePath(currentFile: SourceFile, sourceFile: SourceFile): string {
    let relativePath = path.relative(
        path.dirname(currentFile.fileName),
        sourceFile.fileName,
    ).replace(/(\.d)?\.ts$/, '');

    relativePath = (!relativePath.startsWith('..') && !relativePath.startsWith('./'))
        ? `./${relativePath}`
        : relativePath;

    return relativePath;
}

export const classHandler: DefaultValueHandler = (
    { type, typeChecker, override, parameter, inUndefinedUnion, currentFile, defaultValueFunction, options, level },
) => {
    if (!type.isClass()) {
        return handlerFail();
    }

    const overrideProperties: TypeSymbol[] = [];
    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'interface' });
        const overrideType = typeChecker.getTypeAtLocation(override);
        if (overrideType === type) {
            return handlerSuccess(override);
        }
        overrideProperties.push(...overrideType.getProperties());
    }

    const { declarations } = type.symbol;
    if (!declarations || declarations.length === 0) {
        throw new Error(`Unable to get class declaration for class ${type.symbol.getName()}`);
    }

    const blockStatements: Statement[] = [];

    let classRequireStatement: VariableStatement | undefined;

    const sourceFile = declarations[0].getSourceFile();
    const differentFile = sourceFile !== currentFile;
    if (differentFile) {
        const relativePath = calculateRequirePath(currentFile, sourceFile);

        classRequireStatement = factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                    factory.createIdentifier(`${type.symbol.getName()}File`),
                    undefined,
                    undefined,
                    factory.createCallExpression(
                        factory.createIdentifier('require'),
                        undefined,
                        [factory.createStringLiteral(relativePath)],
                    ),
                )],
                NodeFlags.Const,
            ),
        );
        blockStatements.push(classRequireStatement);
    }

    const constructor = getClassConstructor(type);

    const classInstanceIdentifier = factory.createIdentifier('classInstance');
    const classInstanceInitializer: Expression = differentFile
        ? factory.createPropertyAccessExpression(
            factory.createIdentifier(`${type.symbol.getName()}File`),
            type.symbol.getName(),
        )
        : factory.createIdentifier(type.symbol.getName());

    const properties = typeChecker.getPropertiesOfType(type);
    if (!constructor) {
        const classInstanceStatement = factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                    classInstanceIdentifier,
                    undefined,
                    undefined,
                    factory.createNewExpression(classInstanceInitializer, undefined, []),
                )],
                NodeFlags.Const,
            ),
        );
        blockStatements.push(classInstanceStatement);

        properties.forEach((prop) => {
            if (!prop.valueDeclaration) {
                throw new Error(`Unable to get value declaration for property ${prop.getName()}`);
            }

            if (prop.getName().startsWith('#')) {
                return;
            }

            const propType = typeChecker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);

            const overrideProperty = overrideProperties
                .find((overrideProp) => overrideProp.getName() === prop.getName());
            if (overrideProperty) {
                if (!overrideProperty.valueDeclaration) {
                    throw new Error(`Unable to get value declaration for override property ${prop.getName()}`);
                }

                const overrideValueExpression = getPropertyAssignmentValue(overrideProperty.valueDeclaration);
                if (!overrideValueExpression) {
                    throw new Error(`Value declaration for override property is of unknown type ${prop.getName()}`);
                }
                const removalCheck = defaultValueFunction({
                    type: propType,
                    typeChecker,
                    override: overrideValueExpression,
                    parameter: prop.getName(),
                    currentFile,
                    options,
                    level,
                }).shouldRemove;

                if (removalCheck) {
                    return;
                }
            }

            const propertyAssignmentStatement = factory.createExpressionStatement(
                factory.createBinaryExpression(
                    factory.createElementAccessExpression(
                        classInstanceIdentifier, factory.createStringLiteral(prop.getName()),
                    ),
                    factory.createToken(SyntaxKind.EqualsToken),
                    defaultValueFunction({
                        type: propType, typeChecker, parameter: prop.getName(), currentFile, options, level,
                    }).data,
                ),
            );

            blockStatements.push(propertyAssignmentStatement);
        });
    } else {
        const constructorDeclaration = constructor.declarations && constructor.declarations[0];
        if (!constructorDeclaration || !isConstructorDeclaration(constructorDeclaration)) {
            throw new Error(`Unable to get the constructor declaration for class ${type.symbol.getName()}`);
        }

        const constructorParameters = constructorDeclaration.parameters;
        let constructorArguments: Expression[] = [];
        if (constructorParameters.length > 0) {
            constructorArguments = constructorParameters.map((param) => {
                const paramName = param.name.getText();
                const paramType = typeChecker.getTypeAtLocation(param);

                return defaultValueFunction({
                    type: paramType, typeChecker, parameter: paramName, currentFile, options, level,
                }).data;
            });
        }

        const classInstanceStatement = factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                    classInstanceIdentifier,
                    undefined,
                    undefined,
                    factory.createNewExpression(
                        classInstanceInitializer, undefined, constructorArguments,
                    ),
                )],
                NodeFlags.Const,
            ),
        );
        blockStatements.push(classInstanceStatement);
    }

    properties.forEach((prop) => {
        if (!prop.valueDeclaration) {
            throw new Error(`Unable to get value declaration for property ${prop.getName()}`);
        }

        const overrideProperty = overrideProperties.find((overrideProp) => overrideProp.getName() === prop.getName());

        if (!overrideProperty) {
            return;
        }

        if (!overrideProperty.valueDeclaration) {
            throw new Error(`Unable to get value declaration for override property ${prop.getName()}`);
        }

        const overrideValueExpression = getPropertyAssignmentValue(overrideProperty.valueDeclaration);
        if (!overrideValueExpression) {
            throw new Error(`Value declaration for override property is of unknown type ${prop.getName()}`);
        }

        overrideProperties.splice(overrideProperties.indexOf(overrideProperty), 1);

        const propType = typeChecker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);

        const propValue = defaultValueFunction({
            type: propType,
            typeChecker,
            override: overrideValueExpression,
            parameter: prop.getName(),
            currentFile,
            options,
            level,
        });
        if (propValue.shouldRemove) {
            return;
        }

        const overrideAssignmentStatement = factory.createExpressionStatement(
            factory.createBinaryExpression(
                factory.createElementAccessExpression(
                    classInstanceIdentifier, factory.createStringLiteral(prop.getName()),
                ),
                factory.createToken(SyntaxKind.EqualsToken),
                propValue.data,
            ),
        );

        blockStatements.push(overrideAssignmentStatement);
    });

    const indexSignatures = typeChecker.getIndexInfosOfType(type);
    const indexSignatureMap: Record<'String' | 'Number' | 'Symbol', Type | undefined> = {
        String: undefined,
        Number: undefined,
        Symbol: undefined,
    };

    indexSignatures.forEach((indexSignature) => {
        if (isStringType(indexSignature.keyType)) {
            indexSignatureMap.String = indexSignature.type;
        } else if (isNumberType(indexSignature.keyType)) {
            indexSignatureMap.Number = indexSignature.type;
        } else if (isSymbolType(indexSignature.keyType)) {
            indexSignatureMap.Symbol = indexSignature.type;
        }
    });

    overrideProperties.forEach((overrideProperty) => {
        let indexSignatureType: Type | undefined;
        if (!Number.isNaN(+overrideProperty.getName())) {
            indexSignatureType = indexSignatureMap.Number;
        } else if (overrideProperty.getName()
            .startsWith('__@')) {
            indexSignatureType = indexSignatureMap.Symbol;
        } else {
            indexSignatureType = indexSignatureMap.String;
        }

        if (!indexSignatureType) {
            return;
        }

        if (!overrideProperty.valueDeclaration) {
            throw new Error(`Unable to get value declaration for override property ${overrideProperty.getName()}`);
        }

        const overrideValueExpression = getPropertyAssignmentValue(overrideProperty.valueDeclaration);
        if (!overrideValueExpression) {
            throw new Error(`Value declaration for override property is of unknown type ${overrideProperty.getName()}`);
        }

        const propValue = defaultValueFunction({
            type: indexSignatureType,
            typeChecker,
            override: overrideValueExpression,
            parameter: overrideProperty.getName(),
            currentFile,
            options,
            level,
        });
        if (propValue.shouldRemove) {
            return;
        }

        const overrideAssignmentStatement = factory.createExpressionStatement(
            factory.createBinaryExpression(
                factory.createElementAccessExpression(
                    classInstanceIdentifier, factory.createStringLiteral(overrideProperty.getName()),
                ),
                factory.createToken(SyntaxKind.EqualsToken),
                propValue.data,
            ),
        );

        blockStatements.push(overrideAssignmentStatement);
    });

    const returnStatement = factory.createReturnStatement(classInstanceIdentifier);
    blockStatements.push(returnStatement);

    return handlerSuccess(factory.createCallExpression(
        factory.createFunctionExpression(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            factory.createBlock(blockStatements),
        ),
        undefined,
        [],
    ));
};
