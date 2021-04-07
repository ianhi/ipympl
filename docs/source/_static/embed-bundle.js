define("jupyter-matplotlib", ["@jupyter-widgets/base"], (__WEBPACK_EXTERNAL_MODULE__jupyter_widgets_base__) => { return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Export widget models and views, and the npm package version number.
__exportStar(__webpack_require__(/*! ./mpl_widget */ "./src/mpl_widget.ts"), exports);
__exportStar(__webpack_require__(/*! ./toolbar_widget */ "./src/toolbar_widget.ts"), exports);
__exportStar(__webpack_require__(/*! ./version */ "./src/version.ts"), exports);


/***/ }),

/***/ "./src/mpl_widget.ts":
/*!***************************!*\
  !*** ./src/mpl_widget.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MPLCanvasView = exports.MPLCanvasModel = void 0;
const base_1 = __webpack_require__(/*! @jupyter-widgets/base */ "@jupyter-widgets/base");
const utils = __importStar(__webpack_require__(/*! ./utils */ "./src/utils.ts"));
const version_1 = __webpack_require__(/*! ./version */ "./src/version.ts");
class MPLCanvasModel extends base_1.DOMWidgetModel {
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_name: 'MPLCanvasModel', _view_name: 'MPLCanvasView', _model_module: 'jupyter-matplotlib', _view_module: 'jupyter-matplotlib', _model_module_version: '^' + version_1.MODULE_VERSION, _view_module_version: '^' + version_1.MODULE_VERSION, header_visible: true, footer_visible: true, toolbar: null, toolbar_visible: true, toolbar_position: 'horizontal', resizable: true, capture_scroll: false, _width: 0, _height: 0, _figure_label: 'Figure', _message: '', _cursor: 'pointer', _image_mode: 'full', _rubberband_x: 0, _rubberband_y: 0, _rubberband_width: 0, _rubberband_height: 0 });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.offscreen_canvas = document.createElement('canvas');
        this.offscreen_context = utils.getContext(this.offscreen_canvas);
        // use `as any` to avoid typescript complaining that
        // these browser specific attributes don't exist.
        const context = this.offscreen_context;
        const backingStore = context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            1;
        this.requested_size = null;
        this.resize_requested = false;
        this.ratio = (window.devicePixelRatio || 1) / backingStore;
        this._init_image();
        this.on('msg:custom', this.on_comm_message.bind(this));
        this.on('change:resizable', () => {
            this._for_each_view((view) => {
                view.update_canvas();
            });
        });
        this.send_initialization_message();
    }
    send_message(type, message = {}) {
        message['type'] = type;
        this.send(message, {});
    }
    send_initialization_message() {
        if (this.ratio !== 1) {
            this.send_message('set_dpi_ratio', { dpi_ratio: this.ratio });
        }
        this.send_message('send_image_mode');
        this.send_message('refresh');
        this.send_message('initialized');
    }
    send_draw_message() {
        if (!this.waiting) {
            this.waiting = true;
            this.send_message('draw');
        }
    }
    handle_save() {
        const save = document.createElement('a');
        save.href = this.offscreen_canvas.toDataURL();
        save.download = this.get('_figure_label') + '.png';
        document.body.appendChild(save);
        save.click();
        document.body.removeChild(save);
    }
    handle_resize(msg) {
        const size = msg['size'];
        this.resize_canvas(size[0], size[1]);
        this.offscreen_context.drawImage(this.image, 0, 0);
        if (!this.resize_requested) {
            this._for_each_view((view) => {
                view.resize_canvas(size[0], size[1]);
            });
        }
        this.send_message('refresh');
        this.resize_requested = false;
        if (this.requested_size !== null) {
            // Requesting saved resize
            this.resize(this.requested_size[0], this.requested_size[1]);
            this.requested_size = null;
        }
    }
    resize(width, height) {
        // Do not request a super small size, as it seems to break the back-end
        if (width <= 5 || height <= 5) {
            return;
        }
        this._for_each_view((view) => {
            // Do an initial resize of each view, stretching the old canvas.
            view.resize_canvas(width, height);
        });
        if (this.resize_requested) {
            // If a resize was already requested, save the requested size for later
            this.requested_size = [width, height];
        }
        else {
            this.resize_requested = true;
            this.send_message('resize', { width: width, height: height });
        }
    }
    resize_canvas(width, height) {
        this.offscreen_canvas.setAttribute('width', `${width * this.ratio}`);
        this.offscreen_canvas.setAttribute('height', `${height * this.ratio}`);
    }
    handle_rubberband(msg) {
        let x0 = msg['x0'] / this.ratio;
        let y0 = (this.offscreen_canvas.height - msg['y0']) / this.ratio;
        let x1 = msg['x1'] / this.ratio;
        let y1 = (this.offscreen_canvas.height - msg['y1']) / this.ratio;
        x0 = Math.floor(x0) + 0.5;
        y0 = Math.floor(y0) + 0.5;
        x1 = Math.floor(x1) + 0.5;
        y1 = Math.floor(y1) + 0.5;
        this.set('_rubberband_x', Math.min(x0, x1));
        this.set('_rubberband_y', Math.min(y0, y1));
        this.set('_rubberband_width', Math.abs(x1 - x0));
        this.set('_rubberband_height', Math.abs(y1 - y0));
        this.save_changes();
        this._for_each_view((view) => {
            view.update_canvas();
        });
    }
    handle_draw(_msg) {
        // Request the server to send over a new figure.
        this.send_draw_message();
    }
    handle_binary(msg, dataviews) {
        const url_creator = window.URL || window.webkitURL;
        const buffer = new Uint8Array(dataviews[0].buffer);
        const blob = new Blob([buffer], { type: 'image/png' });
        const image_url = url_creator.createObjectURL(blob);
        // Free the memory for the previous frames
        if (this.image.src) {
            url_creator.revokeObjectURL(this.image.src);
        }
        this.image.src = image_url;
        // Tell Jupyter that the notebook contents must change.
        this.send_message('ack');
        this.waiting = false;
    }
    on_comm_message(evt, dataviews) {
        const msg = JSON.parse(evt.data);
        const msg_type = msg['type'];
        let callback;
        // Call the  'handle_{type}' callback, which takes
        // the figure and JSON message as its only arguments.
        try {
            callback = this['handle_' + msg_type].bind(this);
        }
        catch (e) {
            console.log("No handler for the '" + msg_type + "' message type: ", msg);
            return;
        }
        if (callback) {
            callback(msg, dataviews);
        }
    }
    _init_image() {
        this.image = document.createElement('img');
        this.image.onload = () => {
            if (this.get('_image_mode') === 'full') {
                // Full images could contain transparency (where diff images
                // almost always do), so we need to clear the canvas so that
                // there is no ghosting.
                this.offscreen_context.clearRect(0, 0, this.offscreen_canvas.width, this.offscreen_canvas.height);
            }
            this.offscreen_context.drawImage(this.image, 0, 0);
            this._for_each_view((view) => {
                view.update_canvas();
            });
        };
    }
    _for_each_view(callback) {
        for (const view_id in this.views) {
            this.views[view_id].then((view) => {
                callback(view);
            });
        }
    }
    remove() {
        this.send_message('closing');
    }
}
exports.MPLCanvasModel = MPLCanvasModel;
MPLCanvasModel.serializers = Object.assign(Object.assign({}, base_1.DOMWidgetModel.serializers), { toolbar: { deserialize: base_1.unpack_models } });
class MPLCanvasView extends base_1.DOMWidgetView {
    render() {
        this.resizing = false;
        this.resize_handle_size = 20;
        this.figure = document.createElement('div');
        this.figure.classList.add('jupyter-matplotlib-figure', 'jupyter-widgets', 'widget-container', 'widget-box', 'widget-vbox');
        this._init_header();
        this._init_canvas();
        this._init_footer();
        this._resize_event = this.resize_event.bind(this);
        this._stop_resize_event = this.stop_resize_event.bind(this);
        window.addEventListener('mousemove', this._resize_event);
        window.addEventListener('mouseup', this._stop_resize_event);
        this.waiting = false;
        return this.create_child_view(this.model.get('toolbar')).then((toolbar_view) => {
            this.toolbar_view = toolbar_view;
            this._update_toolbar_position();
            this._update_header_visible();
            this._update_footer_visible();
            this._update_toolbar_visible();
            this.model_events();
        });
    }
    model_events() {
        this.model.on('change:header_visible', this._update_header_visible.bind(this));
        this.model.on('change:footer_visible', this._update_footer_visible.bind(this));
        this.model.on('change:toolbar_visible', this._update_toolbar_visible.bind(this));
        this.model.on('change:toolbar_position', this._update_toolbar_position.bind(this));
        this.model.on('change:_figure_label', this._update_figure_label.bind(this));
        this.model.on('change:_message', this._update_message.bind(this));
        this.model.on('change:_cursor', this._update_cursor.bind(this));
    }
    _update_header_visible() {
        this.header.style.display = this.model.get('header_visible')
            ? ''
            : 'none';
    }
    _update_footer_visible() {
        this.footer.style.display = this.model.get('footer_visible')
            ? ''
            : 'none';
    }
    _update_toolbar_visible() {
        this.toolbar_view.el.style.display = this.model.get('toolbar_visible')
            ? ''
            : 'none';
    }
    _update_toolbar_position() {
        const toolbar_position = this.model.get('toolbar_position');
        if (toolbar_position === 'top' || toolbar_position === 'bottom') {
            this.el.classList.add('jupyter-widgets', 'widget-container', 'widget-box', 'widget-vbox', 'jupyter-matplotlib');
            this.model.get('toolbar').set('orientation', 'horizontal');
            this.clear();
            if (toolbar_position === 'top') {
                this.el.appendChild(this.toolbar_view.el);
                this.el.appendChild(this.figure);
            }
            else {
                this.el.appendChild(this.figure);
                this.el.appendChild(this.toolbar_view.el);
            }
        }
        else {
            this.el.classList.add('jupyter-widgets', 'widget-container', 'widget-box', 'widget-hbox', 'jupyter-matplotlib');
            this.model.get('toolbar').set('orientation', 'vertical');
            this.clear();
            if (toolbar_position === 'left') {
                this.el.appendChild(this.toolbar_view.el);
                this.el.appendChild(this.figure);
            }
            else {
                this.el.appendChild(this.figure);
                this.el.appendChild(this.toolbar_view.el);
            }
        }
    }
    clear() {
        while (this.el.firstChild) {
            this.el.removeChild(this.el.firstChild);
        }
    }
    _init_header() {
        this.header = document.createElement('div');
        this.header.style.textAlign = 'center';
        this.header.classList.add('jupyter-widgets', 'widget-label');
        this._update_figure_label();
        this.figure.appendChild(this.header);
    }
    _update_figure_label() {
        this.header.textContent = this.model.get('_figure_label');
    }
    _init_canvas() {
        const canvas_container = document.createElement('div');
        canvas_container.classList.add('jupyter-widgets', 'jupyter-matplotlib-canvas-container');
        this.figure.appendChild(canvas_container);
        const canvas_div = (this.canvas_div = document.createElement('div'));
        canvas_div.style.position = 'relative';
        canvas_div.style.clear = 'both';
        canvas_div.classList.add('jupyter-widgets', 'jupyter-matplotlib-canvas-div');
        canvas_div.addEventListener('keydown', this.key_event('key_press'));
        canvas_div.addEventListener('keyup', this.key_event('key_release'));
        // this is important to make the div 'focusable'
        canvas_div.setAttribute('tabindex', '0');
        canvas_container.appendChild(canvas_div);
        const canvas = (this.canvas = document.createElement('canvas'));
        canvas.style.display = 'block';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.zIndex = '0';
        this.context = utils.getContext(canvas);
        const top_canvas = (this.top_canvas = document.createElement('canvas'));
        top_canvas.style.display = 'block';
        top_canvas.style.position = 'absolute';
        top_canvas.style.left = '0';
        top_canvas.style.top = '0';
        top_canvas.style.zIndex = '1';
        top_canvas.addEventListener('mousedown', this.mouse_event('button_press'));
        top_canvas.addEventListener('mouseup', this.mouse_event('button_release'));
        top_canvas.addEventListener('mousemove', this.mouse_event('motion_notify'));
        top_canvas.addEventListener('mouseenter', this.mouse_event('figure_enter'));
        top_canvas.addEventListener('mouseleave', this.mouse_event('figure_leave'));
        top_canvas.addEventListener('wheel', this.mouse_event('scroll'));
        canvas_div.appendChild(canvas);
        canvas_div.appendChild(top_canvas);
        this.top_context = utils.getContext(top_canvas);
        this.top_context.strokeStyle = 'rgba(0, 0, 0, 255)';
        // Disable right mouse context menu.
        this.top_canvas.addEventListener('contextmenu', (_e) => {
            _e.preventDefault();
            _e.stopPropagation();
            return false;
        });
        this.resize_canvas(this.model.get('_width'), this.model.get('_height'));
        this.update_canvas();
    }
    update_canvas() {
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            return;
        }
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.model.offscreen_canvas, 0, 0);
        this.top_context.clearRect(0, 0, this.top_canvas.width, this.top_canvas.height);
        // Draw rubberband
        if (this.model.get('_rubberband_width') !== 0 &&
            this.model.get('_rubberband_height') !== 0) {
            this.top_context.strokeRect(this.model.get('_rubberband_x'), this.model.get('_rubberband_y'), this.model.get('_rubberband_width'), this.model.get('_rubberband_height'));
        }
        // Draw resize handle
        if (this.model.get('resizable')) {
            this.top_context.save();
            const gradient = this.top_context.createLinearGradient(this.top_canvas.width - this.resize_handle_size / 3, this.top_canvas.height - this.resize_handle_size / 3, this.top_canvas.width - this.resize_handle_size / 4, this.top_canvas.height - this.resize_handle_size / 4);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 255)');
            this.top_context.fillStyle = gradient;
            this.top_context.globalAlpha = 0.3;
            this.top_context.beginPath();
            this.top_context.moveTo(this.top_canvas.width, this.top_canvas.height);
            this.top_context.lineTo(this.top_canvas.width, this.top_canvas.height - this.resize_handle_size);
            this.top_context.lineTo(this.top_canvas.width - this.resize_handle_size, this.top_canvas.height);
            this.top_context.closePath();
            this.top_context.fill();
            this.top_context.restore();
        }
    }
    _update_cursor() {
        this.top_canvas.style.cursor = this.model.get('_cursor');
    }
    _init_footer() {
        this.footer = document.createElement('div');
        this.footer.style.textAlign = 'center';
        this.footer.classList.add('jupyter-widgets', 'widget-label');
        this._update_message();
        this.figure.appendChild(this.footer);
    }
    _update_message() {
        this.footer.textContent = this.model.get('_message');
    }
    resize_canvas(width, height) {
        // Keep the size of the canvas, and rubber band canvas in sync.
        this.canvas.setAttribute('width', `${width * this.model.ratio}`);
        this.canvas.setAttribute('height', `${height * this.model.ratio}`);
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.top_canvas.setAttribute('width', String(width));
        this.top_canvas.setAttribute('height', String(height));
        this.canvas_div.style.width = width + 'px';
        this.canvas_div.style.height = height + 'px';
        this.update_canvas();
    }
    mouse_event(name) {
        let last_update = 0;
        return (event) => {
            const canvas_pos = utils.get_mouse_position(event, this.top_canvas);
            if (name === 'scroll') {
                event['data'] = 'scroll';
                if (event.deltaY < 0) {
                    event.step = 1;
                }
                else {
                    event.step = -1;
                }
                if (this.model.get('capture_scroll')) {
                    event.preventDefault();
                }
            }
            if (name === 'button_press') {
                // If clicking on the resize handle
                if (canvas_pos.x >=
                    this.top_canvas.width - this.resize_handle_size &&
                    canvas_pos.y >=
                        this.top_canvas.height - this.resize_handle_size &&
                    this.model.get('resizable')) {
                    this.resizing = true;
                    return;
                }
                else {
                    this.canvas.focus();
                    this.canvas_div.focus();
                }
            }
            if (this.resizing) {
                // Ignore other mouse events while resizing.
                return;
            }
            if (name === 'motion_notify') {
                // If the mouse is on the handle, change the cursor style
                if (canvas_pos.x >=
                    this.top_canvas.width - this.resize_handle_size &&
                    canvas_pos.y >=
                        this.top_canvas.height - this.resize_handle_size) {
                    this.top_canvas.style.cursor = 'nw-resize';
                }
                else {
                    this.top_canvas.style.cursor = this.model.get('_cursor');
                }
            }
            // Rate-limit the position text updates so that we don't overwhelm the
            // system.
            if (Date.now() > last_update + 16) {
                last_update = Date.now();
                const x = canvas_pos.x * this.model.ratio;
                const y = canvas_pos.y * this.model.ratio;
                this.model.send_message(name, {
                    x: x,
                    y: y,
                    button: event.button,
                    step: event.step,
                    guiEvent: utils.get_simple_keys(event),
                });
            }
        };
    }
    resize_event(event) {
        if (this.resizing) {
            const new_size = utils.get_mouse_position(event, this.top_canvas);
            this.model.resize(new_size.x, new_size.y);
        }
    }
    stop_resize_event() {
        this.resizing = false;
    }
    key_event(name) {
        return (event) => {
            event.stopPropagation();
            event.preventDefault();
            // Prevent repeat events
            if (name === 'key_press') {
                if (event.key === this._key) {
                    return;
                }
                else {
                    this._key = event.key;
                }
            }
            if (name === 'key_release') {
                this._key = null;
            }
            let value = '';
            if (event.ctrlKey && event.key !== 'Control') {
                value += 'ctrl+';
            }
            else if (event.altKey && event.key !== 'Alt') {
                value += 'alt+';
            }
            else if (event.shiftKey && event.key !== 'Shift') {
                value += 'shift+';
            }
            value += 'k' + event.key;
            this.model.send_message(name, {
                key: value,
                guiEvent: utils.get_simple_keys(event),
            });
            return false;
        };
    }
    remove() {
        window.removeEventListener('mousemove', this._resize_event);
        window.removeEventListener('mouseup', this._stop_resize_event);
    }
}
exports.MPLCanvasView = MPLCanvasView;


/***/ }),

/***/ "./src/toolbar_widget.ts":
/*!*******************************!*\
  !*** ./src/toolbar_widget.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ToolbarView = exports.ToolbarModel = void 0;
const base_1 = __webpack_require__(/*! @jupyter-widgets/base */ "@jupyter-widgets/base");
const version_1 = __webpack_require__(/*! ./version */ "./src/version.ts");
class ToolbarModel extends base_1.DOMWidgetModel {
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_name: 'ToolbarModel', _view_name: 'ToolbarView', _model_module: 'jupyter-matplotlib', _view_module: 'jupyter-matplotlib', _model_module_version: '^' + version_1.MODULE_VERSION, _view_module_version: '^' + version_1.MODULE_VERSION, toolitems: [], orientation: 'vertical', button_style: '', collapsed: true, _current_action: '' });
    }
}
exports.ToolbarModel = ToolbarModel;
class ToolbarView extends base_1.DOMWidgetView {
    render() {
        this.el.classList.add('jupyter-widgets', 'jupyter-matplotlib-toolbar', 'widget-container', 'widget-box');
        this.create_toolbar();
        this.model_events();
    }
    create_toolbar() {
        const toolbar_items = this.model.get('toolitems');
        this.toggle_button = document.createElement('button');
        this.toggle_button.classList.add('jupyter-matplotlib-button', 'jupyter-widgets', 'jupyter-button');
        this.toggle_button.setAttribute('href', '#');
        this.toggle_button.setAttribute('title', 'Toggle Interaction');
        this.toggle_button.style.outline = 'none';
        this.toggle_button.addEventListener('click', () => {
            this.model.set('collapsed', !this.model.get('collapsed'));
            this.model.save_changes();
        });
        const icon = document.createElement('i');
        icon.classList.add('center', 'fa', 'fa-fw', 'fa-bars');
        this.toggle_button.appendChild(icon);
        this.el.appendChild(this.toggle_button);
        this.toolbar = document.createElement('div');
        this.toolbar.classList.add('widget-container', 'widget-box');
        this.el.appendChild(this.toolbar);
        this.buttons = { toggle_button: this.toggle_button };
        for (const toolbar_ind in toolbar_items) {
            const name = toolbar_items[toolbar_ind][0];
            const tooltip = toolbar_items[toolbar_ind][1];
            const image = toolbar_items[toolbar_ind][2];
            const method_name = toolbar_items[toolbar_ind][3];
            if (!name) {
                continue;
            }
            const button = document.createElement('button');
            button.classList.add('jupyter-matplotlib-button', 'jupyter-widgets', 'jupyter-button');
            button.setAttribute('href', '#');
            button.setAttribute('title', tooltip);
            button.style.outline = 'none';
            button.addEventListener('click', this.toolbar_button_onclick(method_name));
            const icon = document.createElement('i');
            icon.classList.add('center', 'fa', 'fa-fw', 'fa-' + image);
            button.appendChild(icon);
            this.buttons[method_name] = button;
            this.toolbar.appendChild(button);
        }
        this.set_orientation(this.el);
        this.set_orientation(this.toolbar);
        this.set_buttons_style();
    }
    set_orientation(el) {
        const orientation = this.model.get('orientation');
        if (orientation === 'vertical') {
            el.classList.remove('widget-hbox');
            el.classList.add('widget-vbox');
        }
        else {
            el.classList.add('widget-hbox');
            el.classList.remove('widget-vbox');
        }
    }
    toolbar_button_onclick(name) {
        return (_event) => {
            // Special case for pan and zoom as they are toggle buttons
            if (name === 'pan' || name === 'zoom') {
                if (this.model.get('_current_action') === name) {
                    this.model.set('_current_action', '');
                }
                else {
                    this.model.set('_current_action', name);
                }
                this.model.save_changes();
            }
            this.send({
                type: 'toolbar_button',
                name: name,
            });
        };
    }
    set_buttons_style() {
        const class_map = {
            primary: ['mod-primary'],
            success: ['mod-success'],
            info: ['mod-info'],
            warning: ['mod-warning'],
            danger: ['mod-danger'],
        };
        for (const name in this.buttons) {
            const button = this.buttons[name];
            for (const class_name in class_map) {
                button.classList.remove(class_map[class_name]);
            }
            button.classList.remove('mod-active');
            const class_name = this.model.get('button_style');
            if (class_name !== '') {
                button.classList.add(class_map[class_name]);
            }
            if (name === this.model.get('_current_action')) {
                button.classList.add('mod-active');
            }
        }
    }
    update_collapsed() {
        this.toolbar.style.display = this.model.get('collapsed') ? '' : 'none';
    }
    model_events() {
        this.model.on('change:orientation', this.update_orientation.bind(this));
        this.model.on_some_change(['button_style', '_current_action'], this.set_buttons_style, this);
        this.model.on('change:collapsed', this.update_collapsed.bind(this));
    }
    update_orientation() {
        this.set_orientation(this.el);
        this.set_orientation(this.toolbar);
    }
}
exports.ToolbarView = ToolbarView;


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getContext = exports.get_simple_keys = exports.get_mouse_position = void 0;
// Get mouse position relative to target
function get_mouse_position(event, targ) {
    const boundingRect = targ.getBoundingClientRect();
    return {
        x: event.clientX - boundingRect.left,
        y: event.clientY - boundingRect.top,
    };
}
exports.get_mouse_position = get_mouse_position;
/*
 * return a copy of an object with only non-object keys
 * we need this to avoid circular references
 * http://stackoverflow.com/a/24161582/3208463
 */
function get_simple_keys(original) {
    return Object.keys(original).reduce((obj, key) => {
        if (typeof original[key] !== 'object') {
            obj[key] = original[key];
        }
        return obj;
    }, {});
}
exports.get_simple_keys = get_simple_keys;
// taken from ipycanvas
// Helpful for getting context while avoidin typescript errors about a context
// possibly being null.
// https://github.com/martinRenou/ipycanvas/blob/8c91ec4f634ff3661f594872e8050cf27d6db0c6/src/widget.ts#L23-L29
function getContext(canvas) {
    const context = canvas.getContext('2d');
    if (context === null) {
        throw 'Could not create 2d context.';
    }
    return context;
}
exports.getContext = getContext;


/***/ }),

/***/ "./src/version.ts":
/*!************************!*\
  !*** ./src/version.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MODULE_NAME = exports.MODULE_VERSION = void 0;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const data = __webpack_require__(/*! ../package.json */ "./package.json");
/**
 * The _model_module_version/_view_module_version this package implements.
 *
 * The html widget manager assumes that this is the same as the npm package
 * version number.
 */
exports.MODULE_VERSION = data.version;
/*
 * The current package name.
 */
exports.MODULE_NAME = data.name;


/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/***/ ((module) => {

module.exports = JSON.parse('{"name":"jupyter-matplotlib","version":"0.9.0","description":"Matplotlib Jupyter Interactive Widget","author":"Matplotlib Development team","license":"BSD-3-Clause","main":"lib/index.js","types":"./lib/index.d.ts","files":["lib/**/*.js","dist/*.js","src/**/*.css"],"repository":{"type":"git","url":"https://github.com/matplotlib/jupyter-matplotlib.git"},"scripts":{"build":"yarn run build:lib && yarn run build:nbextension && yarn run build:labextension:dev","build:prod":"yarn run build:lib && yarn run build:nbextension && yarn run build:labextension","build:labextension":"jupyter labextension build .","build:labextension:dev":"jupyter labextension build --development True .","build:lib":"tsc","build:nbextension":"webpack --mode=production","clean":"yarn run clean:lib && yarn run clean:nbextension && yarn run clean:labextension","clean:lib":"rimraf lib","clean:labextension":"rimraf ipympl/labextension","clean:nbextension":"rimraf ipympl/nbextension/static/index.js","prepack":"yarn run build:lib","test":"jest","watch":"npm-run-all -p watch:*","watch:lib":"tsc -w","watch:nbextension":"webpack --watch --mode=development","watch:labextension":"jupyter labextension watch .","eslint":"eslint . --fix --ignore-path ../.gitignore","eslint:check":"eslint . --ignore-path ../.gitignore","lint":"yarn run prettier && yarn run eslint","lint:check":"yarn run prettier:check && yarn run eslint:check","prepublish":"yarn run clean && yarn run build","prettier":"prettier --ignore-path ../.gitignore --write \\"**/*{.ts,.tsx,.js,.jsx,.css,.json}\\"","prettier:check":"prettier --check --ignore-path ../.gitignore \\"**/*{.ts,.tsx,.js,.jsx,.css,.json}\\""},"jupyterlab":{"extension":"lib/plugin","outputDir":"ipympl/labextension/","sharedPackages":{"@jupyter-widgets/base":{"bundled":false,"singleton":true}}},"devDependencies":{"@babel/core":"^7.5.0","@babel/preset-env":"^7.5.0","@jupyterlab/builder":"^3.0.0","@phosphor/application":"^1.6.0","@phosphor/widgets":"^1.6.0","@types/jest":"^26.0.0","@types/webpack-env":"^1.13.6","@typescript-eslint/eslint-plugin":"^3.6.0","@typescript-eslint/parser":"^3.6.0","acorn":"^7.2.0","css-loader":"^3.2.0","eslint":"^7.4.0","eslint-config-prettier":"^6.11.0","eslint-plugin-prettier":"^3.1.4","fs-extra":"^7.0.0","identity-obj-proxy":"^3.0.0","jest":"^26.0.0","mkdirp":"^0.5.1","npm-run-all":"^4.1.3","prettier":"^2.0.5","rimraf":"^2.6.2","source-map-loader":"^1.1.3","style-loader":"^1.0.0","ts-jest":"^26.0.0","ts-loader":"^8.0.0","typescript":"~4.1.3","webpack":"^5.0.0","webpack-cli":"^4.0.0"},"dependencies":{"@jupyter-widgets/base":"^2 || ^3 || ^4.0.0","@types/node":"^14.14.35"},"keywords":["jupyter","jupyterlab","jupyterlab-extension","widgets"]}');

/***/ }),

/***/ "@jupyter-widgets/base":
/*!****************************************!*\
  !*** external "@jupyter-widgets/base" ***!
  \****************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__jupyter_widgets_base__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});;
//# sourceMappingURL=embed-bundle.js.map