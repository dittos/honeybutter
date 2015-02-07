/// <reference path="compiler.ts" />

var nodes: HB.ASTNode[] = [
    new HB.StaticNode('<p>'),
    new HB.CondNode([{
        predicateExpr: 'days <= 1',
        body: [
            new HB.StaticNode('Today!'),
            new HB.LoopNode('hour', 'hours', [
                new HB.SubviewNode('Button({text: "Select " + hour})'),
                new HB.LoopNode('minute', '[1, 2]', [
                    new HB.SubviewNode('Button({text: "Select " + hour + "/" + minute})'),
                    new HB.LoopNode('second', '[1, 2]', [
                        new HB.SubviewNode('Button({text: "Select " + hour + "/" + minute + "/" + second})')
                    ]),
                    new HB.SubviewNode('Button({text: "Deselect " + minute})')
                ]),
                new HB.SubviewNode('Button({text: "Deselect " + hour})')
            ])
        ]
    },{
        predicateExpr: 'days < 7',
        body: [
            new HB.ExprNode('days'),
            new HB.StaticNode(' days')
        ]
    }], [
        new HB.StaticNode('More than 1 week'),
        new HB.SubviewNode('Button({text: "Cancel"})')
    ]),
    new HB.StaticNode('</p>\n'),
    new HB.SubviewNode('Button({text: "Refresh"})')
];

var result = HB.compileRenderer(nodes);
console.log(result);
console.log('-----------');
var resultFunc = Function('__ctx', result);
var Button = (attrs) => attrs;
console.log(resultFunc({days: 1, hours: [1, 2], Button: Button}));
console.log(resultFunc({days: 1, hours: [1, 2, 3], Button: Button}));
console.log(resultFunc({days: 3, Button: Button}));
console.log(resultFunc({days: 10, Button: Button}));
