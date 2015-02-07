module HB {

    enum ASTNodeType {
        STATIC,
        EXPR,
        COND,
        LOOP,
        SUBVIEW
    }

    export class ASTNode {
        constructor(public type: ASTNodeType) {}
    }

    export class StaticNode extends ASTNode {
        constructor(public value: string) {
            super(ASTNodeType.STATIC);
        }
    }

    export class ExprNode extends ASTNode {
        constructor(public expr: string) {
            super(ASTNodeType.EXPR);
        }
    }

    export class CondNode extends ASTNode {
        constructor(public blocks: [{
            predicateExpr: string;
            body: ASTNode[];
        }], public elseBlockBody: ASTNode[]) {
            super(ASTNodeType.COND);
        }
    }

    export class LoopNode extends ASTNode {
        constructor(public variableName: string,
            public iterableExpr: string,
            public body: ASTNode[]) {
            super(ASTNodeType.LOOP);
        }
    }

    export class SubviewNode extends ASTNode {
        constructor(public expr: string) {
            super(ASTNodeType.SUBVIEW);
        }
    }

    export function compileRenderer(nodes: ASTNode[]) {
        var context: CompileContext = {
            nextSubviewID: 1,
            nextLoopID: 1,
            loopStack: []
        };
        return _compileRenderer(nodes, context, true);
    }

    function _compileRenderer(nodes: ASTNode[], context: CompileContext, root: boolean = false): string {
        var result = root ? 'var __m = "", __s = {};\nwith (__ctx) {\n' : '';
        nodes.forEach(node => {
            switch (node.type) {
            case ASTNodeType.STATIC:
                result += '__m += ' + JSON.stringify((<StaticNode>node).value) + ';\n';
                break;
            case ASTNodeType.EXPR:
                result += '__m += ' + ((<ExprNode>node).expr) + ';\n';
                break;
            case ASTNodeType.COND:
                var condNode = <CondNode>node;
                condNode.blocks.forEach(block => {
                    result += 'if (' + block.predicateExpr + ') {\n';
                    result += _compileRenderer(block.body, context);
                    result += '} else ';
                });
                result += '{\n' + _compileRenderer(condNode.elseBlockBody, context) + '}\n';
                break;
            case ASTNodeType.LOOP:
                var loopNode = <LoopNode>node;
                var loopID = context.nextLoopID++;
                result += 'var __i' + loopID + ' = 0, ';
                result += '__p' + loopID + ' = ';
                var outerLoopID = context.loopStack[context.loopStack.length - 1];
                if (outerLoopID) {
                    result += '__p' + outerLoopID + ' + "_" + __i' + outerLoopID + ';\n';
                } else {
                    result += '"";\n';
                }
                result += '(' + loopNode.iterableExpr + ').forEach(function(' + loopNode.variableName + ') {\n';
                context.loopStack.push(loopID);
                result += _compileRenderer(loopNode.body, context);
                context.loopStack.pop();
                result += '__i' + loopID + '++;\n';
                result += '});\n';
                break;
            case ASTNodeType.SUBVIEW:
                var subviewKey;
                var loopID = context.loopStack[context.loopStack.length - 1];
                subviewKey = '__viewID + "s' + context.nextSubviewID++ + '"';
                if (loopID) {
                    subviewKey += ' + __p' + loopID + ' + "_" + __i' + loopID;
                }
                result += '__m += ' + JSON.stringify('<script id="') + ' + ' + subviewKey + ' + ' + JSON.stringify('"></script>') + ';\n';
                result += '__s[' + subviewKey + '] = ' + (<SubviewNode>node).expr + ';\n';
                break;
            }
        });
        if (root) {
            result += '}\nreturn {markup: __m, subviews: __s};';
        }
        return result;
    }

    export interface CompileContext {
        nextSubviewID: number;
        nextLoopID: number;
        loopStack: number[];
    }

}
