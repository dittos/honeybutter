/// <reference path="compiler.ts" />

module HB {

    export interface ViewDescriptor {
        type;
        attrs;
    }

    export function createFactory(cls): (attrs: any) => ViewDescriptor {
        return (attrs) => ({type: cls, attrs: attrs});
    }

    export class View<T> {
        protected element: HTMLElement;

        constructor(protected viewID: string,
            protected attrs: T) {
        }

        getElement(): HTMLElement {
            return this.element;
        }

        update(attrs: T) {
            this.attrs = attrs;
            this.render();
            if (!this.element) {
                throw new Error();
            }
        }

        render() {
        }
    }

    export interface Template {
        render(viewID: string, context: {[key: string]: any}): RenderResult;
    }

    interface RenderResult {
        markup: string;
        subviews: {[viewID: string]: ViewDescriptor};
    }

    export class TemplateView<T> extends View<T> {
        template: Template;

        protected getContext(): {[key: string]: any} {
            return {};
        }

        render() {
            var result = this.template.render(this.viewID, this.getContext());
            var temp = document.createElement('div');
            temp.innerHTML = result.markup.trim();
            if (temp.childNodes.length !== 1) {
                // TODO: check node type
                throw new Error();
            }
            var el = <HTMLElement>temp.childNodes[0];
            for (var viewID in result.subviews) {
                var descriptor = result.subviews[viewID];
                var view = new descriptor.type(viewID, descriptor.attrs);
                view.render();

                var placeholder = el.querySelector('script[id="' + viewID + '"]');
                placeholder.parentNode.replaceChild(view.getElement(), placeholder);
            }
            if (this.element && this.element.parentNode) {
                this.element.parentNode.replaceChild(el, this.element);
            }
            this.element = el;
        }
    }

}
