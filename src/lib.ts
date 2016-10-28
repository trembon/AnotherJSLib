/// <reference path="lib.interfaces.ts" />

/** Constructs a collection of all found nodes from the specified selector */
function $(selector: string): $.lib;
/** Constructs a collection of the specified node */
function $(node: Node): $.lib;
/** Constructs a collection of the specified nodes */
function $(nodeList: NodeList): $.lib;
/** Register a function to run after the DOM is ready for manipulation */
function $(func: Function): $.lib;
function $(data: any): $.lib { return new $.lib(data); }

module $ {

    export class lib {
        private ns: HTMLElement[];

        constructor(data: any) {
            if (data instanceof Node) {
                // Single node, just create new list with single item
                this.ns = [<HTMLElement>data];
            } else if (data instanceof NodeList) {
                // reinstance from a node list
                this.ns = Array.prototype.slice.call(data);
            } else if (typeof data === "string") {
                // default with selector
                this.ns = Array.prototype.slice.call(document.querySelectorAll(data));
            } else if (data instanceof Function) {
                // to support dom ready event shortcut
                var ready = () => {
                    document.removeEventListener("DOMContentLoaded", ready, false);
                    data();
                };
                document.addEventListener("DOMContentLoaded", ready, false);
            } else {
                // default return empty
                this.ns = [];
            }
        }

        public get(index: number): HTMLElement {
            return this.ns[index];
        }

        /** The number of nodes in the current selection */
        public length(): number {
            return this.ns.length;
        }

        /** Loop through all the nodes in the current selection */
        public each(callback: (item: HTMLElement, n: number) => any): lib {
            this.ns.forEach(callback);
            return this;
        }

        /** Starts to listen on the specified events for nodes in the current selection */
        public on(event: string, callback: (event: Event) => any): lib {
            var events = event.split(" ");
            this.each(item => {
                for (var i = 0; i < events.length; i++) {
                    item.addEventListener(events[i], callback, false);
                }
            });
            return this;
        }

        /** Reads the value from the specified attribute from the first node in the current selection */
        public attr(attr: string): any;
        /** Set the passed value to the specified attribute to the nodes in the current selection */
        public attr(attr: string, value: any): lib;

        public attr(attr: string, value?: any): any {
            if (value === undefined) {
                if (this.ns.length > 0) {
                    return this.ns[0].getAttribute(attr);
                }
                return undefined;
            } else {
                this.each(item => {
                    item.setAttribute(attr, value);
                });
                return this;
            }
        }

        /** Reads the value from the specified data attribute from the first node in the current selection */
        public data(name: string): any;
        /** Set the passed value to the specified data attribute to the nodes in the current selection */
        public data(name: string, value: any): lib;

        public data(name: string, value?: any): any {
            // check if browser supports the data tag
            if (this.ns.length > 0 && "dataset" in this.ns[0]) {
                if (value === undefined) {
                    return this.ns[0].dataset[name];
                } else {
                    this.each(item => {
                        item.dataset[name] = value;
                    });
                    return this;
                }
            } else {
                // if browser does not support the data tag, fallback to the attribute
                return this.attr("data-" + name.replace(/[A-Z]/g, (match) => "-" + match.toLowerCase()), value);
            }
        }

        /** Adds the specified class(es) to the nodes in the current selection */
        public addClass(name: string): lib {
            var classes = name.split(" ");
            this.each(item => {
                for (var i = 0; i < classes.length; i++) {
                    item.classList.add(name);
                }
            });
            return this;
        }

        /** Removes the specified class(es) from the nodes in the current selection */
        public removeClass(name: string): lib {
            var classes = name.split(" ");
            this.each(item => {
                for (var i = 0; i < classes.length; i++) {
                    item.classList.remove(classes[0]);
                }
            });
            return this;
        }

        /** Toggles the specified class(es) on the nodes in the current selection */
        public toggleClass(name: string): lib {
            var classes = name.split(" ");
            this.each(item => {
                for (var i = 0; i < classes.length; i++) {
                    item.classList.toggle(name);
                }
            });
            return this;
        }

        public hasClass(name: string): boolean {
            if (this.length() > 0) {
                return this.ns[0].classList.contains(name);
            }
        }

        /** Find all child elements of the nodes in the current selection */
        public find(selector: string): lib {
            var lib = $(null);
            this.each(item => {
                lib.ns = lib.ns.concat(Array.prototype.slice.call(item.querySelectorAll(selector)));
            });
            return lib;
        }

        /** Get the current css style value of the first node in the current selection */
        public css(style: string): any;
        /** Sets the css style value of the nodes in the current selection */
        public css(style: string, value: any): lib;
        /** Sets the css styles values of the nodes in the current selection */
        public css(styles: libCSSParameters): lib;

        public css(style: any, value?: any): any {
            if (typeof style === "string" && value === undefined) {
                if (this.length() > 0) {
                    return this.ns[0].style[css.get(style)];
                }
                return undefined;
            } else if (typeof style === "string" && value !== undefined) {
                var styleName = css.get(style);
                this.each(item => {
                    item.style[styleName] = value;
                });
            } else if (style instanceof Object) {
                for (var propertyName in style) {
                    var styleName = css.get(propertyName);
                    if (styleName !== undefined) {
                        this.each(item => {
                            item.style[styleName] = style[propertyName];
                        });
                    }
                }
            }
            return this;
        }

        /** Gets the closests parent that matches the specified selector of the first node in the current selection. */
        public closest(selector: string): lib {
            if (this.length() > 0) {
                var element = this.ns[0].parentNode, func;
                while (element) {
                    if (element[js.matches](selector)) {
                        return $(element);
                    }
                    element = element.parentNode;
                }
            }
            return $(null);
        }
    }

    class css {
        private static ss: string = css.init();

        /** Initializes the css class, by fetching all available styles from the browser and storing them in a variable. */
        private static init(): string {
            // get all possible styles of the web browser and merge them to a searchable string, seperated by a space
            var styles = "", stylesObj = window.getComputedStyle(document.documentElement, '');
            for (var style in stylesObj) {
                if (style !== undefined) {
                    styles += style + " ";
                }
            }
            return styles;
        }

        /** Gets the property name of the entered style name, with browser prefix if available. */
        public static get(styleName: string): string {
            if (styleName !== undefined) {
                styleName = styleName.replace(/-(.)/g, (match, match2) => match2.toUpperCase());
                var res = css.ss.match(new RegExp("(^|\\s)(moz|ms|webkit|o)?" + styleName + "(\\s|$)", "i"));
                if (res !== null && res.length > 0) {
                    return res[0].trim();
                }
            }
            return undefined;
        }
    }

    class js {
        public static matches: string = js.init();

        private static init(): string {
            var element: any = document.documentElement;
            return (element.matches || element.matchesSelector || element.mozMatchesSelector || element.msMatchesSelector || element.oMatchesSelector || element.webkitMatchesSelector).name;
        }
    }

    /** Performs an AJAX request to fetch data from the server. */
    export function ajax(settings: libAjaxParameters): void {
        var xmlhttp: XMLHttpRequest, sendData: any, data: any;

        if (settings === undefined || settings.url === undefined) {
            return;
        }

        // create ajax object
        xmlhttp = new XMLHttpRequest();

        if (settings.success) {
            xmlhttp.onreadystatechange = () => {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        // return the result to the success method, depending on what return type is specified
                        if (settings.type && settings.type.toLowerCase() === "json") {
                            settings.success(JSON.parse(xmlhttp.responseText));
                        } else if (settings.type && settings.type.toLowerCase() === "xml") {
                            settings.success(xmlhttp.responseXML);
                        } else {
                            settings.success(xmlhttp.responseText);
                        }
                    }
                }
                else {
                    // fetch errors and send to the error method if specified
                    if (settings.error !== undefined) {
                        settings.error(xmlhttp.status, xmlhttp.statusText);
                    }
                }
            };
        }
        // fetch errors and send to the error method if specified
        if (settings.error) {
            xmlhttp.onerror = () => {
                settings.error(xmlhttp.status, xmlhttp.statusText);
            };
        }

        // set the _ cache query parameter if caching is set to false
        if (settings.cache && settings.cache === false) {
            if (settings.url.indexOf("?") === -1) {
                settings.url += "?_=" + Date.now();
            } else {
                settings.url += "&_=" + Date.now();
            }
        }

        // create the send data string
        if (settings.data) {
            data = settings.data;
            sendData = [];
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    sendData.push(encodeURIComponent(property) + "=" + encodeURIComponent(data[property]));
                }
            }
            sendData = sendData.join("&");
        }

        // if method is GET, append the send data is not empty
        if (((settings.method) || settings.method === "GET") && sendData) {
            if (settings.url.indexOf("?") === -1) {
                settings.url += "?" + sendData;
            } else {
                settings.url += "&" + sendData;
            }
        }

        // setup the request
        xmlhttp.open((settings.method) ? settings.method : "GET", settings.url, (settings.async) ? settings.async : true);

        if (settings.method === "POST") {
            xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("Content-length", sendData.length);
            xmlhttp.setRequestHeader("Connection", "close");
            xmlhttp.send(sendData);
        } else {
            xmlhttp.send();
        }
    }
}