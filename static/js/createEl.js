function createEl(type, cfg) {
    var el = document.createElement(type)
    for (let attr in cfg) {
        if (attr === 'children') {
            cfg[attr].forEach((element) => {
                if (element instanceof HTMLElement) {
                    el.appendChild(element);
                } else {
                    el.appendChild(createEl(element.type, element));
                }
            });
            continue;
        }
        if (attr === 'elType') continue;
        el[attr] = cfg[attr];
    }

    return el;
};

export { createEl };