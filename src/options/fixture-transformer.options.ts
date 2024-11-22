// eslint-disable-next-line import/no-extraneous-dependencies
import { isIdentifier, isPropertySignature, PropertySignature, Type, TypeChecker, TypeLiteralNode } from 'typescript';
import {
    DefaultEnumOption,
    DefaultUndefinedOption,
    HandlerNewFixtureOptions,
    NewFixtureOptions,
} from './fixture-transformer.options.types';

export const defaultNewFixtureOptions: HandlerNewFixtureOptions = {
    preferUndefined: false,
    preferNull: false,
    defaultEnum: 'astFirst',
    defaultUndefined: 'explicit',
};

function getType(member: PropertySignature, typeChecker: TypeChecker, key: keyof NewFixtureOptions): Type {
    if (!member.type) {
        throw new Error(`Missing type for property: ${key}`);
    }

    return typeChecker.getTypeFromTypeNode(member.type);
}

function extractOptionalBooleanFromType(type: Type, typeChecker: TypeChecker, key: keyof NewFixtureOptions)
    : boolean | undefined {
    const stringType = typeChecker.typeToString(type);
    switch (stringType) {
        case 'true':
            return true;
        case 'false':
            return false;
        case 'undefined':
            return undefined;
        default:
            throw new Error(`Invalid type for property ${key}: ${stringType}`);
    }
}

function extractDefaultEnumOptionFromType(type: Type, typeChecker: TypeChecker, key: keyof NewFixtureOptions)
    : DefaultEnumOption | undefined {
    let stringType: string;
    if (type.isStringLiteral()) {
        stringType = type.value;
    } else {
        stringType = typeChecker.typeToString(type);
    }
    switch (stringType) {
        case 'astFirst':
            return 'astFirst';
        case 'alphaFirst':
            return 'alphaFirst';
        case 'random':
            return 'random';
        case 'undefined':
            return undefined;
        default:
            throw new Error(`Invalid type for property ${key}: ${stringType}`);
    }
}

function extractDefaultUndefinedOptionFromType(
    type: Type, typeChecker: TypeChecker, key: keyof NewFixtureOptions,
): DefaultUndefinedOption | undefined {
    let stringType: string;
    if (type.isStringLiteral()) {
        stringType = type.value;
    } else {
        stringType = typeChecker.typeToString(type);
    }
    switch (stringType) {
        case 'explicit':
            return 'explicit';
        case 'nothing':
            return 'nothing';
        case 'undefined':
            return undefined;
        default:
            throw new Error(`Invalid type for property ${key}: ${stringType}`);
    }
}

export function extractNewFixtureOptions(typeArgument: TypeLiteralNode, typeChecker: TypeChecker): NewFixtureOptions {
    const newFixtureOptions: NewFixtureOptions = {};
    typeArgument.members.forEach((member) => {
        if (isPropertySignature(member) && isIdentifier(member.name)) {
            const key = member.name.text as keyof NewFixtureOptions;
            switch (key) {
                case 'preferUndefined': {
                    const type = getType(member, typeChecker, key);
                    newFixtureOptions.preferUndefined = extractOptionalBooleanFromType(type, typeChecker, key);
                    break;
                }

                case 'preferNull': {
                    const type = getType(member, typeChecker, key);
                    newFixtureOptions.preferNull = extractOptionalBooleanFromType(type, typeChecker, key);
                    break;
                }

                case 'defaultEnum': {
                    const type = getType(member, typeChecker, key);
                    newFixtureOptions.defaultEnum = extractDefaultEnumOptionFromType(type, typeChecker, key);
                    break;
                }

                case 'defaultUndefined': {
                    const type = getType(member, typeChecker, key);
                    newFixtureOptions.defaultUndefined = extractDefaultUndefinedOptionFromType(type, typeChecker, key);
                    break;
                }

                default: {
                    const exhaustiveCheck: never = key;
                    throw new Error(`Unknown property: ${exhaustiveCheck as string} in NewFixtureOptions`);
                }
            }
        }
    });

    return newFixtureOptions;
}
