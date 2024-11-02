/* eslint-disable no-bitwise */

// eslint-disable-next-line import/no-extraneous-dependencies
import {
    BigIntLiteralType,
    isEnumDeclaration,
    isPropertyAssignment,
    isPropertySignature,
    Node,
    ObjectFlags,
    ObjectType,
    SourceFile,
    Symbol,
    SymbolFlags,
    SyntaxKind,
    Type as TypeType,
    Type,
    TypeChecker,
    TypeFlags,
    TypeReference,
} from 'typescript';

export const isAnyType = (type: Type): boolean => !!(type.flags & TypeFlags.Any);
export const isUnknownType = (type: Type): boolean => !!(type.flags & TypeFlags.Unknown);
export const isStringType = (type: Type): boolean => !!(type.flags & TypeFlags.String);
export const isNumberType = (type: Type): boolean => !!(type.flags & TypeFlags.Number);
export const isBooleanType = (type: Type): boolean => !!(type.flags & TypeFlags.Boolean);
export const isBigIntType = (type: Type): boolean => !!(type.flags & TypeFlags.BigInt);
export const isBooleanLiteralType = (type: Type): boolean => !!(type.flags & TypeFlags.BooleanLiteral);
export const isEnumLiteralType = (type: Type): boolean => !!(type.flags & TypeFlags.EnumLiteral);
export const isEnumType = (type: Type): boolean => !!(type.flags & TypeFlags.Enum)
    || !!(isEnumLiteralType(type) && type.symbol.valueDeclaration && isEnumDeclaration(type.symbol.valueDeclaration));
export const isUndefinedType = (type: Type): boolean => !!(type.flags & TypeFlags.Undefined);
export const isNullType = (type: Type): boolean => !!(type.flags & TypeFlags.Null);
export const isVoidType = (type: Type): boolean => !!(type.flags & TypeFlags.Void);
export const isNeverType = (type: Type): boolean => !!(type.flags & TypeFlags.Never);
export const isObjectType = (type: Type): boolean => !!(type.flags & TypeFlags.Object);
export const isArrayType = (type: Type, typeChecker: TypeChecker): boolean => (
    typeChecker.isArrayType(type) || typeChecker.isTupleType(type)
);
export const isSymbolType = (type: Type): boolean => !!(type.flags & TypeFlags.ESSymbolLike);
export const isBigIntLiteralType = (type: Type): type is BigIntLiteralType => !!(type.flags & TypeFlags.BigIntLiteral);
export const isSourceFile = (node: Node): node is SourceFile => node.kind === SyntaxKind.SourceFile;

// eslint-disable-next-line @typescript-eslint/ban-types
export const isTransientProperty = (symbol: Symbol): boolean => !!(
    symbol.flags & SymbolFlags.Transient && symbol.flags & SymbolFlags.Property
);

export const isMappedInterface = (type: Type): boolean => {
    if (
        type.flags & TypeFlags.Object
        && (type as ObjectType).objectFlags & ObjectFlags.Mapped
        && type.getCallSignatures().length === 0
    ) {
        return true;
    }
    return false;
};

export const isAnonymousInterface = (type: Type): boolean => {
    if (
        type.flags & TypeFlags.Object
        && (type as ObjectType).objectFlags & ObjectFlags.Anonymous
        && type.getCallSignatures().length === 0
    ) {
        return true;
    }
    return false;
};

export const isInterface = (type: Type): boolean => {
    if (
        type.isClassOrInterface()
        && type.symbol.getName() !== 'Date'
        && !type.isClass()
    ) {
        return true;
    }
    return false;
};

export function isDeepPartialOf(partialType: TypeType, fullType: TypeType, typeChecker: TypeChecker): boolean {
    if (partialType === fullType) {
        return true;
    }

    if ((isBooleanLiteralType(partialType) || isBooleanType(partialType)) && isBooleanType(fullType)) {
        return true;
    }

    if (isUndefinedType(partialType)) {
        return true;
    }

    if (fullType.isUnion()) {
        return fullType.types.some((type) => isDeepPartialOf(partialType, type, typeChecker));
    }

    if (isArrayType(partialType, typeChecker) && isArrayType(fullType, typeChecker)) {
        const partialElemTypes = typeChecker.getTypeArguments(partialType as TypeReference);
        const fullElemTypes = typeChecker.getTypeArguments(fullType as TypeReference);

        return partialElemTypes.every((partialElemType, index) => {
            const fullElemType = fullElemTypes[index];
            return isDeepPartialOf(partialElemType, fullElemType, typeChecker);
        });
    }

    if (!isObjectType(partialType) || !isObjectType(fullType)) {
        return false;
    }

    const partialProps = partialType.getProperties();
    const fullProps = fullType.getProperties();

    for (const partialProp of partialProps) {
        const fullProp = fullProps.find((p) => p.name === partialProp.name);

        if (!fullProp) {
            return false;
        }

        if (!partialProp.valueDeclaration
            || !fullProp.valueDeclaration
            || !isPropertyAssignment(partialProp.valueDeclaration)
            || !isPropertySignature(fullProp.valueDeclaration)) {
            throw new Error('partial or full prop is not a property');
        }

        const partialPropType = typeChecker.getTypeOfSymbolAtLocation(partialProp, partialProp.valueDeclaration);
        const fullPropType = typeChecker.getTypeOfSymbolAtLocation(fullProp, fullProp.valueDeclaration);

        if (partialPropType !== fullPropType && !isDeepPartialOf(partialPropType, fullPropType, typeChecker)) {
            return false;
        }
    }

    return true;
}
