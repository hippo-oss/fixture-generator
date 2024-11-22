// eslint-disable-next-line import/no-extraneous-dependencies
import { EnumMember, factory, isEnumDeclaration, Symbol as tsSymbol, Type } from 'typescript';
import { DefaultValueHandler } from './types';
import { isEnumType } from '../fixture-transformer.guards';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';
import { HandlerNewFixtureOptions } from '../options';

const getDefaultEnum = <T extends Type | (EnumMember & { symbol: tsSymbol })>(
    enums: T[], options: HandlerNewFixtureOptions,
): T => {
    const { defaultEnum } = options;
    let enumType: Type | EnumMember & { symbol: tsSymbol };
    switch (defaultEnum) {
        case undefined:
        case 'astFirst':
            [enumType] = enums;
            break;
        case 'alphaFirst':
            [enumType] = enums.sort((a, b) => a.symbol.getName().localeCompare(b.symbol.getName()));
            break;
        case 'random':
            enumType = enums[Math.floor(Math.random() * enums.length)];
            break;
        default: {
            const exhaustiveCheck: never = defaultEnum;
            throw new Error(`Unknown property: ${exhaustiveCheck as string} in NewFixtureOptions`);
        }
    }

    return enumType as T;
};

export const enumHandler: DefaultValueHandler = (
    { type, typeChecker, override, inUndefinedUnion, parameter, currentFile, defaultValueFunction, options, level },
) => {
    if (!isEnumType(type)) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'enum' });
        return handlerSuccess(override);
    }

    if (type.isUnion()) {
        const enumType = getDefaultEnum([...type.types], options);
        return defaultValueFunction({
            type: enumType, typeChecker, override, inUndefinedUnion, currentFile, parameter, options, level,
        });
    }

    const enumDeclarations = type.symbol.declarations;
    if (!enumDeclarations) {
        throw new Error(`Unable to get enum declarations for enum ${type.symbol.getName()}`);
    }

    const enumDeclaration = enumDeclarations[0];
    if (!isEnumDeclaration(enumDeclaration)) {
        throw new Error(`Unable to get enum declaration for enum ${type.symbol.getName()}`);
    }

    const members: (EnumMember & { symbol: tsSymbol })[] = [];
    enumDeclaration.members.forEach((member) => {
        if (!(member as EnumMember & { symbol: tsSymbol }).symbol) {
            throw new Error(`enum declaration member for enum ${type.symbol.getName()} does not have symbol)`);
        }
        members.push(member as EnumMember & { symbol: tsSymbol });
    });

    const member = getDefaultEnum([...members], options);
    const enumInitializer = member.initializer;
    if (enumInitializer) {
        return handlerSuccess(enumInitializer);
    }

    return handlerSuccess(factory.createNumericLiteral('0'));
};
