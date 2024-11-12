// eslint-disable-next-line import/no-extraneous-dependencies
import { Expression, factory, NodeFlags, Statement, VariableStatement } from 'typescript';


export function createRequireStatement(identifier: string, path: string): VariableStatement {
    return factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
            [factory.createVariableDeclaration(
                factory.createIdentifier(identifier),
                undefined,
                undefined,
                factory.createCallExpression(
                    factory.createIdentifier('require'),
                    undefined,
                    [factory.createStringLiteral(path)],
                ),
            )],
            NodeFlags.Const,
        ),
    );
}

export function createCallExpressionBlock(statements: Statement[]): Expression {
    return factory.createCallExpression(
        factory.createFunctionExpression(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            factory.createBlock(statements),
        ),
        undefined,
        [],
    );
}
