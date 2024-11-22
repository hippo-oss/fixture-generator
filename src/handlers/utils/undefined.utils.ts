// eslint-disable-next-line import/no-extraneous-dependencies
import { Expression, Type, TypeChecker } from 'typescript';
import { isUndefinedType } from '../../fixture-transformer.guards';

export const canBeUndefined = (type: Type): boolean => {
    if (isUndefinedType(type)) {
        return true;
    }
    if (type.isUnion()) {
        return type.types.some(canBeUndefined);
    }
    if (type.isIntersection()) {
        return type.types.every(canBeUndefined);
    }
    return false;
};

export const overrideUndefinedCheck = ({ typeChecker, override, parameter, inUndefinedUnion, typeString }: {
    typeChecker: TypeChecker; override: Expression, parameter?: string, inUndefinedUnion?: boolean, typeString: string
}): void => {
    const overrideType = typeChecker.getTypeAtLocation(override);
    if (!inUndefinedUnion && canBeUndefined(overrideType)) {
        // eslint-disable-next-line max-len
        throw new Error(`Explicitly provided override for ${parameter ? `parameter ${parameter}` : typeString} can be or is undefined while the type does not allow undefined values. If you want to explicitly use undefined for a type 'Type' which does not allow undefined please do 'undefined as Type'`);
    }
};
