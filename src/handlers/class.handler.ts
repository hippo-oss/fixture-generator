// eslint-disable-next-line import/no-extraneous-dependencies
import {
    Expression,
    factory,
    isConstructorDeclaration,
    NodeFlags,
    Statement,
    SyntaxKind,
    Type,
    VariableStatement,
} from 'typescript';
import { DefaultValueHandler } from './types';
import { isNumberType, isStringType, isSymbolType } from '../fixture-transformer.guards';
import { getClassConstructor, getPropertyAssignmentValue, getSourceFile, overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';
import { calculateRequirePath } from './utils/calculate.utils';
import { createCallExpressionBlock, createRequireStatement } from './utils/create.utils';
import { TypeSymbolWithLinks } from './types/object.types';

export const classHandler: DefaultValueHandler = (
    { type, typeChecker, override, parameter, inUndefinedUnion, currentFile, defaultValueFunction, options, level },
) => {
    if (!type.isClass()) {
        return handlerFail();
    }

    const overrideProperties: TypeSymbolWithLinks[] = [];
    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'interface' });
        const overrideType = typeChecker.getTypeAtLocation(override);
        if (overrideType === type) {
            return handlerSuccess(override);
        }
        overrideProperties.push(...overrideType.getProperties());
    }

    const blockStatements: Statement[] = [];

    let classRequireStatement: VariableStatement | undefined;

    const sourceFile = getSourceFile(type);
    const differentFile = sourceFile !== currentFile;
    if (differentFile) {
        const relativePath = calculateRequirePath(currentFile, sourceFile);

        classRequireStatement = createRequireStatement(`${type.symbol.getName()}File`, relativePath);
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

    const properties = typeChecker.getPropertiesOfType(type) as TypeSymbolWithLinks[];
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

        let propName = prop.getName();
        let propKey: string | Expression = factory.createStringLiteral(propName);
        if (prop.links?.nameType && isSymbolType(prop.links.nameType)) {
            propName = prop.links.nameType.symbol.getName();
            propKey = defaultValueFunction({
                type: prop.links.nameType,
                typeChecker,
                override: undefined,
                currentFile,
                options,
                level,
            }).data;
        }

        const propType = typeChecker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);

        const propValue = defaultValueFunction({
            type: propType,
            typeChecker,
            override: overrideValueExpression,
            parameter: propName,
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
                    classInstanceIdentifier, propKey,
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

        let propName = overrideProperty.getName();
        let propKey: string | Expression = factory.createStringLiteral(propName);
        if (overrideProperty.links?.nameType && isSymbolType(overrideProperty.links.nameType)) {
            propName = overrideProperty.links.nameType.symbol.getName();
            propKey = defaultValueFunction({
                    type: overrideProperty.links.nameType,
                    typeChecker,
                    override: undefined,
                    currentFile,
                    options,
                    level,
                }).data;
        }

        const propValue = defaultValueFunction({
            type: indexSignatureType,
            typeChecker,
            override: overrideValueExpression,
            parameter: propName,
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
                    classInstanceIdentifier, propKey,
                ),
                factory.createToken(SyntaxKind.EqualsToken),
                propValue.data,
            ),
        );

        blockStatements.push(overrideAssignmentStatement);
    });

    const returnStatement = factory.createReturnStatement(classInstanceIdentifier);
    blockStatements.push(returnStatement);

    return handlerSuccess(createCallExpressionBlock(blockStatements));
};
