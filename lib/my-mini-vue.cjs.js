'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

//复制对象属性
const extend = Object.assign;
const EMPTY_OBJ = {};
//判断是否是对象
function isObject(raw) {
    return raw !== null && typeof raw === "object";
}
//判断是否改变
function hasChanged(value, newValue) {
    return !Object.is(value, newValue);
}
//判断对象是由有相应的key
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
//xx-xx->xxXx
function camelize(str) {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
}
//event->Event
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
//Event->onEvent
function toHandlerKey(str) {
    return str ? "on" + capitalize(camelize(str)) : "";
}

class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        activeEffect = this;
        const res = this._fn();
        activeEffect = null;
        return res;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function effect(fn, options = {}) {
    const { scheduler } = options;
    //封装fn
    const _effect = new ReactiveEffect(fn, scheduler);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
//存储所有依赖
const targetMap = new Map();
//用于获取当前依赖
let activeEffect;
//收集依赖
function track(target, key) {
    //获取target对应的依赖
    let depsMap = targetMap.get(target);
    //初始化
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    //获取key对应的依赖
    let deps = depsMap.get(key);
    //初始化
    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
    }
    //收集依赖
    trackEffect(deps);
}
function trackEffect(deps) {
    if (!activeEffect)
        return;
    if (deps.has(activeEffect))
        return;
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
}
//触发依赖
function trigger(target, key) {
    //获取target对应依赖
    let depsMap = targetMap.get(target);
    //获取key对应依赖
    let deps = depsMap.get(key);
    triggerEffect(deps);
}
function triggerEffect(deps) {
    //遍历dpes
    for (const dep of deps) {
        if (dep.scheduler) {
            dep.scheduler();
        }
        else {
            //执行依赖函数
            dep.run();
        }
    }
}
//清除依赖
function cleanupEffect(effect) {
    effect.deps.forEach((item) => {
        item.delete(effect);
    });
    effect.deps.length = 0;
}

function createGetter(isReadonly = false, isShallowReadonly = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (isShallowReadonly) {
            return res;
        }
        if (!isReadonly) {
            track(target, key);
        }
        //深层次响应式
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        //触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get: createGetter(),
    set: createSetter()
};
const readonlyHandler = {
    get: createGetter(true),
    set(target, key, value) {
        console.warn(`${key} set 失败 因为 target 是 readonly`, target);
        return true;
    }
};
const shallowReadonlyHanlder = extend({}, readonlyHandler, { get: createGetter(true, true) });

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandler);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHanlder);
}
function createActiveObject(raw, handlers) {
    return new Proxy(raw, handlers);
}

function ref(value) {
    return new RefImpl(value);
}
class RefImpl {
    constructor(value) {
        this.deps = new Set();
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
    }
    get value() {
        trackEffect(this.deps);
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(this._value, newValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffect(this.deps);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(traget, key, value) {
            if (isRef(traget[key]) && !isRef(value)) {
                return traget[key].value = value;
            }
            else {
                return Reflect.set(traget, key, value);
            }
        }
    });
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const handerKey = toHandlerKey(event);
    if (hasOwn(props, handerKey)) {
        props[handerKey](...args);
    }
}

function initProps(instance) {
    instance.props = instance.vnode.props || {};
}

function initSlots(instance) {
    if (instance.vnode.shapeFlag & 16 /* ShapeFlags.SLOTS_CHILDREN */) {
        normalizeObjectSlots(instance.slots, instance.vnode.children);
    }
}
function normalizeObjectSlots(slots, children) {
    for (const key in children) {
        slots[key] = (props) => normalizeSlotsValue(children[key](props));
    }
}
function normalizeSlotsValue(value) {
    return Array.isArray(value) ? value : [value];
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const publicInstanceProxyHandler = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

let currentInstance = null;
function createComponentInstance(vnode, parent) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: null
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setCurrrentInstance(instance) {
    currentInstance = instance;
}
function getCurrentInstance() {
    return currentInstance;
}
function setupComponent(instance) {
    //TODO init props
    initProps(instance);
    //TODO init slots
    initSlots(instance);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    //定义组件代理对象
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler);
    if (component.setup) {
        setCurrrentInstance(instance);
        const res = proxyRefs(component.setup(shallowReadonly(instance.props), { emit: instance.emit }));
        handleSetupResult(res, instance);
        setCurrrentInstance(null);
    }
    else {
        finishComponentSetup(instance);
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

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createTextVNode(text) {
    return createVNode(Text, null, text);
}
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(null, vnode, rootContainer, null);
            }
        };
    };
}

function createRender(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    // n1：oldVnode, n2: newVnode
    function render(n1, n2, container, parentComponent) {
        patch(n1, n2, container, parentComponent);
    }
    function patch(n1, n2, container, parentComponent) {
        const { type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (n2.shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    //处理元素
                    processElement(n1, n2, container, parentComponent);
                }
                else if (n2.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    //处理组件
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountchildren(n2.children, container, parentComponent);
    }
    function processText(n1, n2, container) {
        mountText(n2, container);
    }
    function mountText(vnode, container) {
        const text = document.createTextNode(vnode.children);
        container.append(text);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    //挂载元素
    function mountElement(vnode, container, parentComponent) {
        const { type, props, children } = vnode;
        //创建元素
        const el = hostCreateElement(type);
        vnode.el = el;
        //设置元素属性
        if (isObject(props)) {
            for (const key in props) {
                hostPatchProp(el, key, null, props[key]);
            }
        }
        //挂载元素子节点
        if (vnode.shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (vnode.shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountchildren(children, el, parentComponent);
        }
        hostInsert(el, container);
    }
    function mountchildren(children, container, parentComponent) {
        children.forEach(vnode => {
            patch(null, vnode, container, parentComponent);
        });
    }
    //更新元素
    function patchElement(n1, n2, container) {
        console.log("patchElement");
        console.log(n1, n2);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchProps(el, oldProps, newProps);
    }
    function patchProps(el, oldPorps, newProps) {
        if (oldPorps != newProps) {
            //修改
            for (const key in newProps) {
                const preProp = oldPorps[key];
                const nextProp = newProps[key];
                if (preProp !== nextProp) {
                    console.log(nextProp);
                    hostPatchProp(el, key, preProp, nextProp);
                }
            }
            //删除
            if (oldPorps === EMPTY_OBJ)
                return;
            for (const key in oldPorps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, oldPorps[key], undefined);
                }
            }
        }
    }
    //处理组件
    function processComponent(n1, n2, container, parentComponent) {
        //挂载组件
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVnode, container, parentComponent) {
        //创建instance对象
        const instance = createComponentInstance(initialVnode, parentComponent);
        //初始化组件
        setupComponent(instance);
        setupRenderEffect(instance, container);
    }
    function setupRenderEffect(instance, container) {
        effect(() => {
            const { isMounted } = instance;
            if (!isMounted) {
                const subTree = (instance.subTree = instance.render.call(instance.proxy));
                patch(null, subTree, container, instance);
                instance.vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const subTree = instance.render.call(instance.proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(preSubTree, subTree, container, instance);
                instance.vnode.el = subTree.el;
                instance.isMounted = true;
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, null, slot(props));
        }
    }
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        //第一次调用provide
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { provides } = currentInstance.parent;
        return provides[key];
    }
}

function createElement(tag) {
    return document.createElement(tag);
}
function patchProp(el, key, preValue, nextValue) {
    function isOn(str) {
        return /^on[A-Z]/.test(str);
    }
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), nextValue);
    }
    else {
        if (nextValue === undefined || nextValue === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}
function insert(el, container) {
    container.append(el);
}
const render = createRender({ createElement, patchProp, insert });
function createApp(...arg) {
    return render.createApp(...arg);
}

exports.createApp = createApp;
exports.createRender = createRender;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.ref = ref;
exports.renderSlots = renderSlots;
