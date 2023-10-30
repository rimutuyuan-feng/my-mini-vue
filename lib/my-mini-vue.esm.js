//复制对象属性
const extend = Object.assign;
//判断是否是对象
function isObject(raw) {
    return raw !== null && typeof raw === "object";
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

//存储所有依赖
const targetMap = new Map();
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

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
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

function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        emit: () => { }
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    //TODO init props
    initProps(instance);
    //TODO init slots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    //定义组件代理对象
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler);
    if (component.setup) {
        const res = component.setup(shallowReadonly(instance.props), { emit: instance.emit });
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
    if (vnode.shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        //处理元素
        processElement(vnode, container);
    }
    else if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
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
    function isOn(str) {
        return /^on[A-Z]/.test(str);
    }
    vnode.el = el;
    //设置元素属性
    if (isObject(props)) {
        for (const key in props) {
            if (isOn(key)) {
                el.addEventListener(key.slice(2).toLowerCase(), props[key]);
            }
            else {
                el.setAttribute(key, props[key]);
            }
        }
    }
    //挂载元素子节点
    if (vnode.shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (vnode.shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountchildren(children, el);
    }
    container.append(el);
}
function mountchildren(children, container) {
    children.forEach(vnode => {
        patch(vnode, container);
    });
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
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
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

export { createApp, h };
