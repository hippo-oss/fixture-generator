// eslint-disable-next-line import/no-extraneous-dependencies
import { Expression, SourceFile, Type, TypeChecker } from 'typescript';
import { HandlerNewFixtureOptions } from '../../options';

export type DefaultValueParams = {
    type: Type;
    typeChecker: TypeChecker;
    currentFile: SourceFile;
    override?: Expression;
    parameter?: string;
    inUndefinedUnion?: boolean;
    level: number;
    options: HandlerNewFixtureOptions;
};

export type DefaultValueResult = {
    data: Expression
    shouldRemove?: boolean;
};

export type DefaultValueHandler = (
    params: DefaultValueParams & { defaultValueFunction: (params: DefaultValueParams) => DefaultValueResult }
) => DefaultValueResult | null;
