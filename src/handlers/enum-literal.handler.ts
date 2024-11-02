// eslint-disable-next-line import/no-extraneous-dependencies
import { factory, isEnumDeclaration, isEnumMember } from 'typescript';
import { DefaultValueHandler } from './types';
import { isEnumLiteralType } from '../fixture-transformer.guards';
import { enumHandler } from './enum.handler';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const enumLiteralHandler: DefaultValueHandler = (
    { type, typeChecker, parameter, inUndefinedUnion, currentFile, defaultValueFunction, override, options, level },
) => {
    if (!isEnumLiteralType(type)) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'enumLiteral' });
        return handlerSuccess(override);
    }

    const enumMember = type.symbol.valueDeclaration;
    if (!enumMember) {
        throw new Error(`Unable to get enumLiteral ${type.symbol.getName()} value declaration`);
    }

    if (isEnumDeclaration(enumMember)) {
        // If an enum is used alongside an enumLiteral in an interface
        // the enum is flagged as an enumLiteral and not an enum, I have no idea why...
        return enumHandler({
            type,
            typeChecker,
            parameter,
            inUndefinedUnion,
            currentFile,
            defaultValueFunction,
            override,
            options,
            level,
        });
    }

    if (!enumMember || !isEnumMember(enumMember)) {
        throw new Error(`enumLiteral ${type.symbol.getName()} is not an enum member`);
    }

    const enumInitializer = enumMember.initializer;
    if (enumInitializer) {
        return handlerSuccess(enumInitializer);
    }

    const enumDeclaration = enumMember.parent;
    const enumPosition = enumDeclaration.members.findIndex((member) => member === enumMember);
    if (enumPosition === -1) {
        throw new Error(`Unable to find enumLiteral ${type.symbol.getName()} inside of its parent enum`);
    }
    return handlerSuccess(factory.createNumericLiteral(enumPosition.toString()));
};
