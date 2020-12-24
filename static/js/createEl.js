function createEl(type, cfg) {
    var el = document.createElement(type)
    for (let attr in cfg) {
        if (attr === 'children') {
            cfg[attr].forEach((element) => {
                el.appendChild(createEl(element.type, element));
            });
            continue;
        }
        if (attr === 'type') continue;
        el[attr] = cfg[attr];
    }

    return el;
};

export { createEl };