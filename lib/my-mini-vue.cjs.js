'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

//复制对象属性
//判断是否是对象
function isObject(raw) {
    return raw !== null && typeof raw === "object";
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const publicInstanceProxyHandler = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    return {
        vnode,
        type: vnode.type,
        setupState: {}
    };
}
function setupComponent(instance) {
    //TODO init props
    //TODO init slots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    //定义组件代理对象
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler);
    if (component.setup) {
        const res = component.setup();
        handleSetupResult(res, instance);
    }
}
function handleSetupResult(res, instance) {
    //TODO function res
    if (typeof res === "object") {
        instance.setupState = res;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    if (typeof vnode.type === 'string') {
        //处理元素
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        //处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
//挂载元素
function mountElement(vnode, container) {
    const { type, props, children } = vnode;
    //创建元素
    const el = document.createElement(type);
    vnode.el = el;
    //设置元素属性
    if (isObject(props)) {
        for (const key in props) {
            el.setAttribute(key, props[key]);
        }
    }
    //挂载元素子节点
    mountchildren(children, el);
    container.append(el);
}
function mountchildren(children, container) {
    if (typeof children === 'string') {
        container.textContent = children;
    }
    else if (Array.isArray(children)) {
        children.forEach(vnode => {
            patch(vnode, container);
        });
    }
}
//处理组件
function processComponent(vnode, container) {
    //挂载组件
    mountComponent(vnode, container);
}
function mountComponent(initialVnode, container) {
    //创建instance对象
    const instance = createComponentInstance(initialVnode);
    //初始化组件
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    instance.vnode.el = subTree.el;
}

function createVNode(type, props, children) {
    return {
        type,
        props,
        children
    };
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
