// eslint-disable-next-line import/no-extraneous-dependencies
import {
    Expression,
    factory,
    isArrayLiteralExpression,
    isRestTypeNode,
    isTupleTypeNode,
    TypeReference,
} from 'typescript';
import { DefaultValueHandler } from './types';
import { isArrayType } from '../fixture-transformer.guards';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const arrayHandler: DefaultValueHandler = (
    { type, typeChecker, override, currentFile, parameter, inUndefinedUnion, defaultValueFunction, options, level },
) => {
    if (!isArrayType(type, typeChecker)) {
        return handlerFail();
    }

    const overrideElements: Expression[] = [];
    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'array' });
        const overrideType = typeChecker.getTypeAtLocation(override);
        if (overrideType === type) {
            return handlerSuccess(override);
        }
        if (!isArrayLiteralExpression(override)) {
            throw new Error('Override for array is not an array literal');
        }
        overrideElements.push(...override.elements);
    }

    const arrayTypes = typeChecker.getTypeArguments(type as TypeReference);
    if (!override) {
        const defaultValues = arrayTypes
            .map((arrayType, index) => defaultValueFunction({
                type: arrayType,
                typeChecker,
                override: overrideElements[index],
                parameter,
                currentFile,
                options,
                level,
            }).data);
        return handlerSuccess(factory.createArrayLiteralExpression(defaultValues));
    }

    if (typeChecker.isTupleType(type)) {
        const arrayNode = typeChecker.typeToTypeNode(type, undefined, undefined);
        if (!arrayNode) {
            throw new Error(`Unable to get type node for array type ${typeChecker.typeToString(type)}`);
        }

        if (!isTupleTypeNode(arrayNode)) {
            throw new Error(`Type node for array type ${typeChecker.typeToString(type)} is not a tuple type node`);
        }

        const numRestOverrides = overrideElements.length - arrayTypes.length + 1;

        const defaultValues: Expression[] = [];
        arrayTypes.forEach((arrayType, index) => {
            if (isRestTypeNode(arrayNode.elements[index])) {
                for (let i = 0; i < numRestOverrides; i += 1) {
                    const overrideElement = overrideElements.shift();
                    defaultValues.push(defaultValueFunction({
                        type: arrayType,
                        typeChecker,
                        override: overrideElement,
                        parameter,
                        currentFile,
                        options,
                        level,
                    }).data);
                }
            } else {
                const overrideElement = overrideElements.shift();
                defaultValues.push(defaultValueFunction({
                    type: arrayType,
                    typeChecker,
                    override: overrideElement,
                    parameter,
                    currentFile,
                    options,
                    level,
                }).data);
            }
        });

        return handlerSuccess(factory.createArrayLiteralExpression(defaultValues));
    }

    if (typeChecker.isArrayType(type)) {
        const defaultValues = overrideElements
            .map((overrideElement) => defaultValueFunction({
                type: arrayTypes[0],
                typeChecker,
                override: overrideElement,
                parameter,
                currentFile,
                options,
                level,
            }).data);
        return handlerSuccess(factory.createArrayLiteralExpression(defaultValues));
    }

    return handlerFail();
};
