'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

//复制对象属性
const extend = Object.assign;
const EMPTY_OBJ = {};
//判断是否是对象
function isObject(raw) {
    return raw !== null && typeof raw === "object";
}
function isString(value) {
    return typeof value === "string";
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

const TO_DISPLAY_STRING = Symbol("toDisplayString");
const CREATE_ELEMENT_VNODE = Symbol("createElementVnode");
const helperMapName = {
    [TO_DISPLAY_STRING]: "toDisplayString",
    [CREATE_ELEMENT_VNODE]: "createElementVnode"
};

function generate(ast) {
    const context = createGenerateContext();
    const push = context.push;
    if (ast.helpers.length) {
        genFunctionPreamble(push, ast);
    }
    push("return ");
    const functionName = "render";
    const args = ["_ctx", "_cache"];
    const signatrue = args.join(", ");
    push(`function ${functionName}(${signatrue}){`);
    const node = ast.codegenNode;
    push("return ");
    genNode(context, node);
    push("}");
    return {
        code: context.code
    };
}
function genFunctionPreamble(push, ast) {
    const VueBinging = "Vue";
    const alias = (str) => `${helperMapName[str]}: _${helperMapName[str]}`;
    push(`const { ${ast.helpers.map(alias).join(", ")} } = ${VueBinging}`);
    push("\n");
}
function genNode(context, node) {
    switch (node.type) {
        case 3 /* NodeTypes.TEXT */:
            genText(context, node);
            break;
        case 0 /* NodeTypes.INTERPOLATION */:
            genInterpolation(context, node);
            break;
        case 1 /* NodeTypes.SIMPLE_EXPRESSION */:
            genExpression(context, node);
            break;
        case 2 /* NodeTypes.ElEMENT */:
            genElement(context, node);
            break;
        case 5 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompound(context, node);
    }
}
function genElement(context, node) {
    const { push, helper } = context;
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    const { tag, props, children } = node;
    genNodeList(context, genNullable([tag, props, children]));
    push(")");
}
function genNullable(arr) {
    return arr.map(item => (item || "null"));
}
function genNodeList(context, list) {
    const { push } = context;
    const length = list.length;
    for (let i = 0; i < length; i++) {
        const node = list[i];
        if (isString(node)) {
            push(node);
        }
        else {
            genNode(context, node);
        }
        if (i < length - 1) {
            push(", ");
        }
    }
}
function genText(context, node) {
    context.push(`'${node.content}'`);
}
function createGenerateContext() {
    const context = {
        code: "",
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMapName[key]}`;
        }
    };
    return context;
}
function genInterpolation(context, node) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(context, node.content);
    push(")");
}
function genExpression(context, node) {
    context.push(node.content);
}
function genCompound(context, node) {
    const children = node.children;
    const { push } = context;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(context, child);
        }
    }
}

function baseParse(content) {
    const context = createParseContext(content);
    return createRoot(parseChildren(context, []));
}
function parseChildren(context, ancestors) {
    const nodes = [];
    let node;
    let s = context.source;
    while (!isEnd(s, ancestors)) {
        if (s.startsWith("{{")) {
            node = parseInterpolation(context);
        }
        else if (s[0] === "<") {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors);
            }
        }
        else {
            node = parseText(context);
        }
        nodes.push(node);
        s = context.source;
    }
    return nodes;
}
//解析插值
function parseInterpolation(context) {
    const openDelimiter = "{{";
    const closeDelimiter = "}}";
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
    advanceBy(context, openDelimiter.length);
    const rawContentLength = closeIndex - openDelimiter.length;
    const rawContent = parseTextData(context, rawContentLength);
    const content = rawContent.trim();
    advanceBy(context, closeDelimiter.length);
    return {
        type: 0 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 1 /* NodeTypes.SIMPLE_EXPRESSION */,
            content: content
        }
    };
}
//推进字符串
function advanceBy(context, index) {
    context.source = context.source.slice(index);
}
function createRoot(children) {
    return {
        children,
        type: 4 /* NodeTypes.ROOT */
    };
}
function createParseContext(content) {
    return {
        source: content
    };
}
//解析element
function parseElement(context, ancestors) {
    const element = parseTag(context, 0 /* TagType.START */);
    ancestors.push(element.tag);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, 1 /* TagType.END */);
    }
    else {
        throw new Error(`缺少结束标签${element.tag}`);
    }
    return element;
}
function startsWithEndTagOpen(source, tag) {
    return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag;
}
function parseTag(context, tag) {
    const match = (/^<\/?([a-z]*)/i).exec(context.source);
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    if (tag === 1 /* TagType.END */)
        return;
    return {
        type: 2 /* NodeTypes.ElEMENT */,
        tag: match[1]
    };
}
function parseText(context) {
    const endToken = ["{{", "<"];
    let endIndex = context.source.length;
    for (let i = endToken.length - 1; i >= 0; i--) {
        const index = context.source.indexOf(endToken[i]);
        if (index !== -1) {
            endIndex = Math.min(endIndex, index);
        }
    }
    const content = parseTextData(context, endIndex);
    return {
        type: 3 /* NodeTypes.TEXT */,
        content
    };
}
function parseTextData(context, index) {
    const content = context.source.slice(0, index);
    advanceBy(context, index);
    return content;
}
function isEnd(s, ancestors) {
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i];
            if (startsWithEndTagOpen(s, tag)) {
                return true;
            }
        }
    }
    return !s;
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    createCodegenNode(root);
    root.helpers = [...context.helpers.keys()];
}
function traverseNode(node, context) {
    const nodeTransforms = context.nodeTransforms;
    const exitFn = [];
    for (let i = 0; i < nodeTransforms.length; i++) {
        const nodeTransform = nodeTransforms[i];
        const exit = nodeTransform(node, context);
        if (exit) {
            exitFn.push(exit);
        }
    }
    switch (node.type) {
        case 0 /* NodeTypes.INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 2 /* NodeTypes.ElEMENT */:
            traverseChildren(node, context);
            break;
        case 4 /* NodeTypes.ROOT */:
            traverseChildren(node, context);
            break;
    }
    let i = exitFn.length;
    while (i--) {
        exitFn[i]();
    }
}
function traverseChildren(node, context) {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        traverseNode(node, context);
    }
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        }
    };
    return context;
}
function createCodegenNode(root) {
    const child = root.children[0];
    if (child.codegenNode) {
        root.codegenNode = child.codegenNode;
    }
    else {
        root.codegenNode = child;
    }
}

function createVnodeCall(tag, props, children, context) {
    context.helper(CREATE_ELEMENT_VNODE);
    return {
        type: 2 /* NodeTypes.ElEMENT */,
        tag,
        props,
        children
    };
}

function transformElement(node, context) {
    if (node.type === 2 /* NodeTypes.ElEMENT */) {
        return () => {
            const vnodeTag = `"${node.tag}"`;
            let props;
            const vnodeChildren = node.children[0];
            node.codegenNode = createVnodeCall(vnodeTag, props, vnodeChildren, context);
        };
    }
}

function transformExpression(node) {
    if (node.type === 0 /* NodeTypes.INTERPOLATION */) {
        processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
}

function isText(node) {
    return node.type === 0 /* NodeTypes.INTERPOLATION */ || node.type === 3 /* NodeTypes.TEXT */;
}

function transformText(node) {
    if (node.type === 2 /* NodeTypes.ElEMENT */) {
        return () => {
            const children = node.children;
            let currentNode;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const nextChild = children[j];
                        if (isText(nextChild)) {
                            if (!currentNode) {
                                currentNode = children[i] = {
                                    type: 5 /* NodeTypes.COMPOUND_EXPRESSION */,
                                    children: [child]
                                };
                            }
                            currentNode.children.push("+");
                            currentNode.children.push(nextChild);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentNode = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElement, transformText]
    });
    return generate(ast);
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
    $slots: (i) => i.slots,
    $props: (i) => i.props
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
        update: null,
        emit: () => { },
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: null,
        next: null
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
    if (component.setup && component.setup()) {
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
    else if (compiler && component.template) {
        instance.render = compiler(component.template);
    }
}
let compiler;
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
}

function shouldUpdateComponent(n1, n2) {
    const { props: preProps } = n1;
    const { props: nextProps } = n2;
    for (const key in preProps) {
        if (preProps[key] !== nextProps[key]) {
            return true;
        }
    }
    return false;
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
        key: props === null || props === void 0 ? void 0 : props.key,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
        component: null
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
                render(null, vnode, rootContainer, null, null);
            }
        };
    };
}

const queue = [];
let isFlushPending = false;
function queueJob(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    flushQueue();
}
function flushQueue() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJob);
}
function flushJob() {
    let job;
    while (job = queue.shift()) {
        job && job();
    }
    isFlushPending = false;
}
const p = Promise.resolve();
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}

function createRender(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    // n1：oldVnode, n2: newVnode
    function render(n1, n2, container, parentComponent, achor) {
        patch(n1, n2, container, parentComponent, achor);
    }
    function patch(n1, n2, container, parentComponent, achor) {
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
                    processElement(n1, n2, container, parentComponent, achor);
                }
                else if (n2.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    //处理组件
                    processComponent(n1, n2, container, parentComponent, achor);
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
    function processElement(n1, n2, container, parentComponent, achor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, achor);
        }
        else {
            patchElement(n1, n2, container, parentComponent);
        }
    }
    //挂载元素
    function mountElement(vnode, container, parentComponent, achor) {
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
        hostInsert(el, container, achor);
    }
    function mountchildren(children, container, parentComponent) {
        children.forEach(vnode => {
            patch(null, vnode, container, parentComponent, null);
        });
    }
    //更新元素
    function patchElement(n1, n2, container, parentComponent) {
        console.log("patchElement");
        console.log(n1, n2);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        //更新props
        patchProps(el, oldProps, newProps);
        //更新children
        patchChildren(n1, n2, el, parentComponent);
    }
    //更新props
    function patchProps(el, oldPorps, newProps) {
        if (oldPorps != newProps) {
            //修改
            for (const key in newProps) {
                const preProp = oldPorps[key];
                const nextProp = newProps[key];
                if (preProp !== nextProp) {
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
    //更新Children
    function patchChildren(n1, n2, container, parentComponent) {
        const { shapeFlag } = n2;
        const preShapeFlag = n1.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            if (preShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                //array to text
                //将原children清空
                unmountChildren(c1);
            }
            //text to text
            hostSetElementText(container, c2);
        }
        else {
            if (preShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                //text to array
                //text清空
                hostSetElementText(container, "");
                mountchildren(c2, container, parentComponent);
            }
            else {
                // array diff array
                patchKeyedChildren(c1, c2, container, parentComponent);
            }
        }
    }
    //清空元素
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent) {
        const l1 = c1.length;
        const l2 = c2.length;
        let e1 = l1 - 1;
        let e2 = l2 - 1;
        let i = 0;
        function isSameVNodeType(n1, n2) {
            return n1.key === n2.key && n1.type === n2.type;
        }
        //左侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, null);
                i++;
            }
            else {
                break;
            }
        }
        //右侧对比
        while (e1 >= i && e2 >= i) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, null);
                e1--;
                e2--;
            }
            else {
                break;
            }
        }
        //新节点比旧节点多
        if (i > e1) {
            if (i <= e2) {
                while (i <= e2) {
                    const nextPos = e2 + 1;
                    const achor = nextPos < l2 ? c2[nextPos].el : null;
                    patch(null, c2[i], container, parentComponent, achor);
                    i++;
                }
            }
        }
        else if (i > e2) { //旧节点比新节点多
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else { //新旧节点均未完全遍历，中间对比
            const toBePatched = e2 - i + 1;
            let patched = 0;
            //新节点key index映射
            const keyToNewIndexMap = new Map();
            //新节点index和旧节点index映射
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
            //遍历填充keyToNewIndexMap
            for (let j = i; j <= e2; j++) {
                const nextChild = c2[j];
                keyToNewIndexMap.set(nextChild.key, j);
            }
            //是否需要移动节点
            let moved = false;
            //遍历旧节点
            for (let j = i; j <= e1; j++) {
                const preChild = c1[j];
                //优化，当新节点都patch完毕后，剩余旧节点直接移除
                if (patched >= toBePatched) {
                    hostRemove(preChild.el);
                    continue;
                }
                let newIndex;
                //判断是否有key
                if (preChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(preChild.key);
                    newIndexToOldIndexMap[newIndex - i] = j + 1;
                }
                else {
                    for (let l = i; l <= e2; l++) {
                        if (isSameVNodeType(preChild, c2[l])) {
                            newIndex = l;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    //新节点没有对应节点直接移除
                    hostRemove(preChild.el);
                }
                else {
                    patch(preChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                    moved = true;
                }
            }
            //获取最长递增子序列
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let seqIndex = increasingNewIndexSequence.length - 1;
            for (let j = toBePatched - 1; j >= 0; j--) {
                const nextIndex = j + i;
                const nextChild = c2[nextIndex];
                const achor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                //新增
                if (newIndexToOldIndexMap[j] === 0) {
                    patch(null, nextChild, container, parentComponent, achor);
                }
                else if (moved) {
                    //移动
                    if (j < 0 || increasingNewIndexSequence[seqIndex] !== j) {
                        hostInsert(nextChild.el, container, achor);
                    }
                    else { //保持
                        seqIndex--;
                    }
                }
            }
        }
    }
    function getSequence(arr) {
        const length = arr.length;
        //记录以数组中每一个当前位置数结尾的递增序列的前一个位置
        const tempArr = new Array(length).fill(0);
        //如果有resubt[i] = b 表示在所有长度为i+1的递增序列中，最小结尾数量为b
        const result = [0];
        for (let i = 1; i < length; i++) {
            if (arr[i] === 0) {
                continue;
            }
            const arrI = arr[i];
            if (arrI > arr[result[result.length - 1]]) {
                tempArr[i] = result[result.length - 1];
                result.push(i);
            }
            else {
                let left = 0;
                let right = result.length - 1;
                while (left < right) {
                    const mid = (left + right) >> 1;
                    if (arrI > arr[mid]) {
                        left = mid + 1;
                    }
                    else {
                        right = mid;
                    }
                }
                if (arrI < arr[result[left]]) {
                    if (left > 0) {
                        tempArr[i] = result[left - 1];
                    }
                    result[left] = i;
                }
            }
        }
        let index = result.length - 1;
        while (index > 0) {
            const pre = tempArr[result[index]];
            result[index - 1] = pre;
            index--;
        }
        return result;
    }
    //处理组件
    function processComponent(n1, n2, container, parentComponent, achor) {
        if (!n1) {
            //挂载组件
            mountComponent(n2, container, parentComponent, achor);
        }
        else {
            //更新组件
            updateComponent(n1, n2);
        }
    }
    //更新组件
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.node = n2;
        }
    }
    function mountComponent(initialVnode, container, parentComponent, achor) {
        //创建instance对象
        const instance = (initialVnode.component = createComponentInstance(initialVnode, parentComponent));
        //初始化组件
        setupComponent(instance);
        setupRenderEffect(instance, container, achor);
    }
    function setupRenderEffect(instance, container, achor) {
        instance.update = effect(() => {
            const { isMounted } = instance;
            if (!isMounted) {
                const subTree = (instance.subTree = renderCalled(instance));
                patch(null, subTree, container, instance, achor);
                instance.vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const subTree = renderCalled(instance);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(preSubTree, subTree, container, instance, achor);
                instance.vnode.el = subTree.el;
                instance.isMounted = true;
            }
        }, {
            scheduler: () => {
                queueJob(instance.update);
            }
        });
    }
    function updateComponentPreRender(instance, nextVnode) {
        instance.props = nextVnode.props;
        instance.vnode = nextVnode;
        instance.next = null;
    }
    return {
        createApp: createAppAPI(render)
    };
}
function renderCalled(instance) {
    const { render, proxy } = instance;
    return render.call(proxy, proxy);
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

function toDisplayString(value) {
    return String(value);
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
function insert(el, container, achor) {
    container.insertBefore(el, achor || null);
}
function remove(el) {
    const parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const render = createRender({ createElement, patchProp, insert, remove, setElementText });
function createApp(...arg) {
    return render.createApp(...arg);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    h: h,
    renderSlots: renderSlots,
    createTextVNode: createTextVNode,
    createElementVnode: createVNode,
    getCurrentInstance: getCurrentInstance,
    registerRuntimeCompiler: registerRuntimeCompiler,
    provide: provide,
    inject: inject,
    createRender: createRender,
    nextTick: nextTick,
    toDisplayString: toDisplayString,
    ref: ref
});

function compileToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function("Vue", code)(runtimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

exports.compileToFunction = compileToFunction;
exports.createApp = createApp;
exports.createElementVnode = createVNode;
exports.createRender = createRender;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.nextTick = nextTick;
exports.provide = provide;
exports.ref = ref;
exports.registerRuntimeCompiler = registerRuntimeCompiler;
exports.renderSlots = renderSlots;
exports.toDisplayString = toDisplayString;
