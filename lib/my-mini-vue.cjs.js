'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createComponentInstance(vnode) {
    return {
        vnode,
        type: vnode.type
    };
}
function setupComponent(instance) {
    //TODO init props
    //TODO init slots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
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
    patch(vnode);
}
function patch(vnode, container) {
    //处理组件
    processComponent(vnode);
}
function processComponent(vnode, container) {
    //挂载组件
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    //创建instance对象
    const instance = createComponentInstance(vnode);
    //初始化组件
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree);
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
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
