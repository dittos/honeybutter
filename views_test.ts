/// <reference path="views.ts" />

var nodes: HB.ASTNode[] = [
    new HB.StaticNode('<div>'),
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
    new HB.SubviewNode('Button({text: "Refresh"})'),
    new HB.StaticNode('</div>')
];

function compileTemplate(nodes): HB.Template {
    return <HB.Template>{
        render: Function('__viewID', '__ctx', HB.compileRenderer(nodes))
    };
}

class App extends HB.TemplateView<{
    days: number;
    hours: number[];
}> {
    template = compileTemplate(nodes);

    // TODO: template parser
    _template = `<div>
        <p>
        {% if days <= 1 %}
            Today!
            {% for hour in hours %}
                {{= Button({text: "Select " + hour})}}
                {% for minute in [1, 2] %}
                    {{= Button({text: "Select " + hour + ":" + minute})}}
                    {% for second [1, 2] %}
                        {{= Button({text: "Select " + hour + ":" + minute + ":" + second})}}
                    {% endfor %}
                {% endfor %}
            {% endfor %}
        {% else if days < 7 %}
            {{ days }} days
        {% else %}
            More than 1 week {{= Button({text: "Refresh"})}}
        {% endif %}
        </p>
        {{= Button({text: 'Refresh'})}}
    </div>`

    getContext(): {[key: string]: any} {
        return {
            days: this.attrs.days,
            hours: this.attrs.hours,
            Button: HB.createFactory(Button)
        };
    }
}

class Button extends HB.View<{text: string}> {
    render() {
        if (!this.element) {
            this.element = document.createElement('button');
            this.element.id = this.viewID;
        }
        this.element.innerHTML = this.attrs.text;
    }
}

var view = new App('root', { days: 1, hours: [1, 2] });
view.render();
document.getElementById('app').appendChild(view.getElement());
view.update({ days: 5, hours: [1, 2] });
view.update({ days: 1, hours: [1, 3, 2] });
