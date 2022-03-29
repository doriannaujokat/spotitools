/**
 * @param {?string} [path]
 * @param {?string} [viewBox]
 * @return {SVGIcon}
 * @this {SVGIcon}
 */
function SVGIcon(path, viewBox) {
    if (!new.target) return new SVGIcon(...arguments);
    this.viewBox = viewBox??undefined;
    this.path = path??undefined;
}
SVGIcon.prototype.setViewBox = function setViewBox(viewBox) {
    this.viewBox = viewBox;
    return this;
};
SVGIcon.prototype.setPath = function setPath(path) {
    this.path = path;
    return this;
};
SVGIcon.prototype.build = function build() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    if (this.viewBox) svg.setAttribute('viewBox', this.viewBox);
    const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute('d', this.path);
    svg.append(path);
    return svg;
};

function ProgressBar() {
    if (!new.target) return new ProgressBar(...arguments);
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.dom = undefined;
}
ProgressBar.prototype.build = function build() {
    if (this.dom) return this.dom;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    svg.classList.add('progressbar');
    svg.setAttribute('value', this.value);
    svg.setAttribute('min', this.min);
    svg.setAttribute('max', this.max);
    const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    svg.append(rect);
    const updateWidth = () => {
        const min = parseFloat(svg.getAttribute('min')??0);
        const max = Math.max(parseFloat(svg.getAttribute('max')??0),min);
        const val = Math.min(Math.max(parseFloat(svg.getAttribute('value')??0),min),max);
        this.min = min;
        this.max = max;
        this.value = val;
        const perc = Math.max(Math.min( (Math.abs(val-min)/Math.abs(min-max))*100 , 100),0);
        rect.style.width = `${perc}%`;
    }
    const observer = new MutationObserver((mutationsList) => {
        for(const mutation of mutationsList) {
            if (mutation.type === 'attributes' && (mutation.attributeName === 'value' || mutation.attributeName === 'min' || mutation.attributeName === 'max')) updateWidth();
        }
    });
    updateWidth();
    observer.observe(svg, {attributes: true, attributeFilter: ['value','min','max']}); // TODO Optimize and GC
    this.dom = svg;
    return svg;
};
ProgressBar.prototype.setValue = function setValue(value) {
    this.value = value;
    if (!this.dom) return this;
    this.dom.setAttribute('value', value);
    return this;
};
ProgressBar.prototype.setMin = function setMin(min) {
    this.min = min;
    if (!this.dom) return this;
    this.dom.setAttribute('min', min);
    return this;
};
ProgressBar.prototype.setMax = function setMax(max) {
    this.max = max;
    if (!this.dom) return this;
    this.dom.setAttribute('max', max);
    return this;
};

function ContainerDiv() {
    if (!new.target) return new ContainerDiv(...arguments);
    this.classes = [];
    this.children = [];
    this.innerText = undefined;
    this.dom = undefined;
}
ContainerDiv.prototype.addClasses = function addClasses(...classes) {
    this.classes.push(...classes);
    return this;
};
ContainerDiv.prototype.setInnerText = function setInnerText(innerText) {
    this.innerText = innerText;
    return this;
};
ContainerDiv.prototype.append = function append(...children) {
    this.children.push(...children.filter(v => v !== null && v !== undefined).map(v => v instanceof Node ? v : v?.build?.()));
    return this;
};
ContainerDiv.prototype.build = function build() {
    if (this.dom) return this.dom;
    const dom = document.createElement('div');
    dom.classList.add(...this.classes);
    if (this.innerText) dom.innerText = this.innerText;
    if (this.children.length > 0) dom.append(...this.children);
    this.dom = dom;
    return dom;
};
export { SVGIcon, ProgressBar, ContainerDiv };