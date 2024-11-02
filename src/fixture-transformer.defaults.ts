// eslint-disable-next-line import/no-extraneous-dependencies
import {
    anyHandler,
    arrayHandler,
    bigIntHandler,
    bigIntLiteralHandler,
    booleanHandler,
    booleanLiteralHandler,
    classHandler,
    dateHandler,
    DefaultValueHandler,
    DefaultValueParams,
    DefaultValueResult,
    enumHandler,
    enumLiteralHandler,
    functionHandler,
    interfaceHandler,
    intersectionHandler,
    mapHandler,
    nullHandler,
    numberHandler,
    numberLiteralHandler,
    promiseHandler,
    stringHandler,
    stringLiteralHandler,
    tagHandler,
    undefinedHandler,
    unionHandler,
    unknownHandler,
    voidHandler,
} from './handlers';

export const defaultValueHandlers: DefaultValueHandler[] = [
    // Tag handler must be first, so that the intersectionHandler
    // (or any other handler) does not attempt to handle it
    tagHandler,

    anyHandler,
    unknownHandler,
    booleanHandler,
    numberHandler,
    stringHandler,
    enumHandler,
    bigIntHandler,
    stringLiteralHandler,
    numberLiteralHandler,
    booleanLiteralHandler,
    enumLiteralHandler,
    bigIntLiteralHandler,
    undefinedHandler,
    nullHandler,
    interfaceHandler,
    classHandler,
    unionHandler,
    intersectionHandler,
    functionHandler,
    arrayHandler,
    dateHandler,
    mapHandler,
    promiseHandler,
    voidHandler,
];

export function getDefaultValue(params: DefaultValueParams): DefaultValueResult {
    for (const handler of defaultValueHandlers) {
        const result = handler({ ...params, defaultValueFunction: getDefaultValue });
        if (result) {
            return result;
        }
    }

    throw new Error(`Unable to get default value in fixture for type ${params.typeChecker.typeToString(params.type)}`);
}
