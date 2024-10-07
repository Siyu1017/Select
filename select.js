import _ from './utils.js';

(() => {
    /**
     * 取得元素
     * @param {string} s 
     * @param {boolean} a 
     * @returns {HTMLElement|Array}
     */

    var $ = (s, a) => { return a == true ? document.querySelectorAll(s) : document.querySelector(s); };

    function ID(n, c) {
        var c =
            c || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            r = "",
            l = c.length;
        for (let i = 0; i < n; i++) {
            r += c.charAt(Math.floor(Math.random() * l));
        }
        return r;
    }

    // _.getPosition -> return the scroll distance
    /*------------------------------------------------------------      0 ( y )

             
    -------------------------  Viewport  -------------------------      scrollTop ( y )


                                Element                                 returnValue ( y )


    -------------------------  Viewport  -------------------------
    */

    const S = {
        version: "1.2.0",
        datas: {},
        config: {
            margin: 8,
            trigger: null,
            triggerClassName: "siyu-select-trigger",
            triggerAttributes: {},
            popupClassName: "siyu-select-popup",
            popupAttributes: {},
            noSelectedContent: "請選擇...",
            theme: "system"
        },
        install: (target, options, config = {}) => {
            if (!_.isElement(target)) {
                target = $(target);
            }

            if (!_.isElement(target)) return;

            var config = Object.assign({}, S.config, config);
            var id = ID(96);

            S.datas[id] = {
                target: target,
                options: options,
                config: config,
                trigger: config.trigger || null,
                currentContent: null,
                selected: null,
                value: null,
                popup: null,
                listeners: {},
                showPopup: false,
                useCustomTrigger: config.trigger != null ? true : false
            }

            /************** Elements **************/

            // Trigger
            if (S.datas[id].trigger == null) {
                S.datas[id].trigger = document.createElement("div");
                S.datas[id].trigger.className = S.datas[id].config.triggerClassName;
                if (S.datas[id].config.theme != "system") {
                    S.datas[id].trigger.classList.add(S.datas[id].config.theme);
                }
                Object.keys(S.datas[id].config.triggerAttributes).forEach(key => {
                    S.datas[id].trigger.setAttribute(key, S.datas[id].config.triggerAttributes[key]);
                })
                S.datas[id].target.appendChild(S.datas[id].trigger);

                // Current Content In Trigger
                S.datas[id].currentContent = document.createElement("div");
                S.datas[id].currentContent.className = "siyu-select-current-content";
                S.datas[id].trigger.appendChild(S.datas[id].currentContent);
            } else {
                if (!_.isElement(S.datas[id].trigger)) {
                    S.datas[id].trigger = $(S.datas[id].trigger);
                }
            }

            // Popup
            S.datas[id].popup = document.createElement("div");
            S.datas[id].popup.className = S.datas[id].config.popupClassName;
            if (S.datas[id].config.theme != "system") {
                S.datas[id].popup.classList.add(S.datas[id].config.theme);
            }
            Object.keys(S.datas[id].config.popupAttributes).forEach(key => {
                S.datas[id].popup.setAttribute(key, S.datas[id].config.popupAttributes[key]);
            })
            S.datas[id].popup.setAttribute("data-popup-id", id);

            /**
                [
                    {
                        type: "option" || "separator", //
                        value: value,                  //
                        content: content,              //
                        action: Function,              //
                        styles: String || Object,      //
                        classList: Array,              //
                        attributes: Object,            //
                        disabled: true || false,       //
                        selected: true || false        //
                    }
                ]
            */

            // Options in popup
            S.datas[id].options.forEach(item => {
                if (item.type == 'separator') {
                    var separator = document.createElement("div");
                    separator.className = "siyu-select-separator";
                    S.datas[id].popup.appendChild(separator);
                } else {
                    var option = document.createElement("div");
                    option.className = "siyu-select-option";
                    if (item.disabled == true) {
                        option.classList.add("disabled");
                    }
                    if (item.selected == true) {
                        selectOption(item, option);
                    }
                    if (_.isObject(item.attributes)) {
                        Object.keys(item.attributes).forEach(key => {
                            option.setAttribute(key, item.attributes[key]);
                        })
                    }
                    if (_.isArray(item.classList)) {
                        item.classList.forEach(className => {
                            option.classList.add(className);
                        })
                    }
                    if (_.isObject(item.styles)) {
                        Object.keys(item.styles).forEach(key => {
                            option.style[key] = item.styles[key];
                        })
                    } else if (_.isString(item.styles)) {
                        option.style = item.styles;
                    }
                    option.setAttribute("value", item.value);
                    option.innerHTML = item.content;
                    if (_.isFunction(item.action)) {
                        option.addEventListener("click", () => {
                            item.action({
                                value: item.value,
                                content: item.content
                            });
                        });
                    }
                    option.addEventListener("click", () => {
                        selectOption(item, option);
                        triggerEvent("change", {
                            value: item.value,
                            content: item.content
                        })
                        hidePopup();
                    })
                    item.element = option;
                    S.datas[id].popup.appendChild(option);
                }
            })

            if (S.datas[id].useCustomTrigger == false && (S.datas[id].selected == null || S.datas[id].value == null)) {
                S.datas[id].currentContent.innerHTML = S.datas[id].config.noSelectedContent;
            }

            /************** Event Listeners **************/

            S.datas[id].trigger.addEventListener("click", (e) => {
                if (S.datas[id].showPopup == true) {
                    hidePopup();
                } else {
                    showPopup();
                    triggerEvent("trigger", {
                        type: e.type
                    })
                }
            })

            window.addEventListener("blur", () => {
                hidePopup();
            })

            window.addEventListener("resize", function (e) {
                if (S.datas[id].showPopup == true) {
                    setPopup();
                }
            })

            document.addEventListener("click", (e) => {
                if (S.datas[id].popup.contains(e.target) || S.datas[id].trigger.contains(e.target)) return;
                hidePopup()
            })

            document.addEventListener('scroll', function (e) {
                if (S.datas[id].popup.contains(e.target)) return;
                if (S.datas[id].showPopup == true) {
                    setPopup();
                }
            }, true)

            document.addEventListener('wheel', function (e) {
                if (S.datas[id].popup.contains(e.target)) return;
                if (S.datas[id].showPopup == true) {
                    setPopup();
                }
            }, true)

            window.addEventListener('scroll', function (e) {
                if (S.datas[id].popup.contains(e.target)) return;
                if (S.datas[id].showPopup == true) {
                    setPopup();
                }
            }, true)

            window.addEventListener('wheel', function (e) {
                if (S.datas[id].popup.contains(e.target)) return;
                if (S.datas[id].showPopup == true) {
                    setPopup();
                }
            }, true)

            /************** Functions **************/

            // Private Functions

            function triggerEvent(event, value) {
                if (S.datas[id].listeners[event] && _.isArray(S.datas[id].listeners[event])) {
                    S.datas[id].listeners[event].forEach(callback => callback(value));
                }
            }

            function selectOption(data, option) {
                S.datas[id].popup.querySelectorAll(".selected").forEach(selected => {
                    selected.classList.remove("selected");
                })
                option.classList.add("selected");
                S.datas[id].value = data.value;
                S.datas[id].selected = data;
                if (S.datas[id].useCustomTrigger == false) {
                    S.datas[id].currentContent.innerHTML = data.content;
                }
            }

            function setPopup() {
                var offsetX = _.getPosition(S.datas[id].trigger).x - window.scrollX;
                var offsetY = _.getPosition(S.datas[id].trigger).y - window.scrollY;

                S.datas[id].popup.style.maxWidth = window.innerWidth - S.config.margin * 2 + "px";
                S.datas[id].popup.style.maxHeight = window.innerHeight - S.config.margin * 2 + "px";

                if (offsetX + S.datas[id].popup.offsetWidth + S.config.margin > window.innerWidth) {
                    S.datas[id].popup.style.left = window.innerWidth - S.datas[id].popup.offsetWidth - S.config.margin + "px";
                } else if (window.innerWidth - S.datas[id].popup.offsetWidth - S.config.margin < S.config.margin) {
                    S.datas[id].popup.style.left = S.config.margin + "px";
                } else {
                    S.datas[id].popup.style.left = offsetX + "px";
                }

                /*
                S.datas[id].popup.style.top = offsetY + S.datas[id].trigger.offsetHeight + S.config.margin + "px";
                if (offsetY + S.datas[id].popup.offsetHeight + S.config.margin * 2 > window.innerHeight) {
                    S.datas[id].popup.style.top = offsetY - S.config.margin - S.datas[id].popup.offsetHeight + "px";
                    if (offsetY - S.config.margin - S.datas[id].popup.offsetHeight < S.config.margin) {
                        S.datas[id].popup.style.top = S.config.margin + "px";
                    }
                }
                    */

                console.log(offsetY, window.innerHeight)

                if (offsetY + S.datas[id].trigger.offsetHeight + S.datas[id].popup.offsetHeight + S.config.margin * 2 > window.innerHeight) {
                    S.datas[id].popup.style.top = offsetY - S.datas[id].popup.offsetHeight - S.config.margin + "px";
                    if (offsetY - S.datas[id].popup.offsetHeight - S.config.margin < S.config.margin) {
                        S.datas[id].popup.style.top = S.config.margin + "px";
                    }
                    if (offsetY > window.innerHeight) {
                        S.datas[id].popup.style.top = window.innerHeight - S.datas[id].popup.offsetHeight - S.config.margin + "px";
                    }
                } else {
                    S.datas[id].popup.style.top = offsetY + S.datas[id].trigger.offsetHeight + S.config.margin + "px";
                    if (offsetY + S.datas[id].trigger.offsetHeight <= 0) {
                        if (offsetY - S.datas[id].popup.offsetHeight - S.config.margin < S.config.margin) {
                            S.datas[id].popup.style.top = S.config.margin + "px";
                        }
                    }
                }

                if (parseInt(S.datas[id].popup.style.top) > offsetY) {
                    S.datas[id].trigger.style.setProperty("--siyu-select-trigger-rotate", "90deg");
                } else {
                    S.datas[id].trigger.style.setProperty("--siyu-select-trigger-rotate", "-90deg");
                }
            }

            // Global Functions

            function setStyle(element, name, value, variable = false) {
                function set(targete, name, value, variable) {
                    if (variable == true) {
                        targete.style.setProperty(name, value);
                    } else {
                        targete.style[name] = value;
                    }
                }

                if (element == 'popup') {
                    set(S.datas[id].popup, name, value, variable);
                } else if (element == 'trigger') {
                    set(S.datas[id].trigger, name, value, variable);
                } else if (element == 'currentContent') {
                    set(S.datas[id].currentContent, name, value, variable);
                }
            }

            function on(event, callback) {
                if (!S.datas[id].listeners[event] || !_.isArray(S.datas[id].listeners[event])) {
                    S.datas[id].listeners[event] = [];
                }
                S.datas[id].listeners[event].push(callback);
            }

            function select(value, index = 0) {
                var matched = [];
                S.datas[id].options.forEach(item => {
                    if (item.value == value) {
                        matched.push(item);
                    }
                })
                if (matched[index]) {
                    return selectOption(matched[index], matched[index].element);
                }
            }

            function clearSelect() {
                S.datas[id].popup.querySelectorAll(".selected").forEach(selected => {
                    selected.classList.remove("selected");
                    S.datas[id].value = null;
                    S.datas[id].selected = null;
                    if (S.datas[id].useCustomTrigger == false) {
                        S.datas[id].currentContent.innerHTML = S.datas[id].config.noSelectedContent;
                    }
                })
            }

            function showPopup() {
                document.body.appendChild(S.datas[id].popup);
                S.datas[id].showPopup = true;
                S.datas[id].popup.classList.add("active");
                setPopup();
                /*
                S.datas[id].trigger.style.setProperty("--siyu-select-trigger-rotate", "90deg");
                S.datas[id].popup.style.top = _.getPosition(S.datas[id].trigger).y + S.datas[id].trigger.offsetHeight + S.config.margin + "px";
                S.datas[id].popup.style.left = _.getPosition(S.datas[id].trigger).x + "px";
                */
            }

            function hidePopup() {
                S.datas[id].popup.remove();
                S.datas[id].showPopup = false;
                S.datas[id].trigger.classList.remove("active");
                S.datas[id].popup.classList.remove("active");
                S.datas[id].trigger.style.setProperty("--siyu-select-trigger-rotate", "0deg");
            }

            return {
                on, showPopup, hidePopup, select, clearSelect, setStyle,
                elements: {
                    popup: S.datas[id].popup,
                    trigger: S.datas[id].trigger,
                    currentContent: S.datas[id].currentContent
                },
                id
            }

            /*
            S.datas[target].popup = target.querySelector(".select-popup").cloneNode(true);
            S.datas[target].popup.className = target.className.replace("select", "") + " select-popup";
            document.body.appendChild(S.datas[target].popup);
            var offsetY = _.getPosition(target).y - window.scrollY;
            S.datas[target].popup.style.left = _.getPosition(target).x + "px";
            if (window.innerHeight - offsetY - config.margin > S.datas[target].popup.offsetHeight) {
                S.datas[target].popup.style.top = offsetY + config.margin + target.scrollHeight + "px";
            } else {
                S.datas[target].popup.style.top = _.getPosition(target).y - config.margin - S.datas[target].popup.offsetHeight + "px";
            }
            target.style.setProperty("--rotate", "0deg");
            var selected = target.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled) .select-item-text") ? target.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled) .select-item-text") : select.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled)");

            if (target.querySelector(".select-default") === null) {
                var def = document.createElement("div");
                def.className = "select-default";
                if (target.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled)")) {
                    def.innerText = selected.innerText;
                } else {
                    def.innerText = "請選擇...";
                }
                target.appendChild(def);
            } else {
                if (target.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled)")) {
                    target.querySelector(".select-default").innerText = selected.innerText;
                }
            }
            if (target.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled)")) {
                target.value = target.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled)").getAttribute("value");
            }
            if (target.getAttribute("multiple") != "" && !target.getAttribute("multiple") == true) {
                target.querySelectorAll(".select-item.selected:not([disabled], [disabled='true'], .disabled)").forEach((s, i) => {
                    if (i != 0) {
                        s.classList.remove("selected")
                    }
                })
            }
            target.addEventListener("click", (e) => {
                if (!document.body.contains(popup)) {
                    popup = target.querySelector(".select-popup").cloneNode(true);
                    popup.className = target.className.replace("select", "") + " select-popup";
                    document.body.appendChild(popup);
                } else {
                    if (popup.contains(e.target)) return;
                }
                popup.className = target.className.replace("select", "") + " select-popup";
                target.classList.toggle("active");
                popup.classList.toggle("active");
                var dh = getPosition(target).y - window.scrollY;
                popup.style.left = getPosition(target).x + "px";
                if (target.classList.contains("active")) {
                    if (window.innerHeight - dh - 8 > 150) {
                        popup.style.top = dh + 8 + target.scrollHeight + "px";
                        target.style.setProperty("--rotate", "90deg");
                    } else {
                        popup.style.top = getPosition(target).y - 8 - popup.offsetHeight + "px";
                        target.style.setProperty("--rotate", "-90deg");
                    }
                } else {
                    target.style.setProperty("--rotate", "0deg");
                }
            })

            popup.addEventListener("click", (e) => {
                if (e.target.classList.contains("select-item") && !e.target.classList.contains("disabled")) {
                    var event = new CustomEvent("change", { detail: e.target.getAttribute("value") || "" });
                    select.value = e.target.getAttribute("value") || "";
                    select.setAttribute("value", e.target.getAttribute("value") || "");
                    if (select.getAttribute("multiple") != "" && !select.getAttribute("multiple") == true) {
                        popup.querySelectorAll(".select-item.selected").forEach(i => {
                            i.classList.remove("selected");
                        })
                        select.querySelectorAll(".select-item.selected").forEach(i => {
                            i.classList.remove("selected");
                        })
                    }
                    e.target.classList.add("selected");
                    if (select.querySelector(".select-default") !== null) {
                        select.querySelector(".select-default").innerText = e.target.innerText;
                    } else {
                        var def = document.createElement("div");
                        def.className = "select-default";
                        def.innerText = e.target.innerText;
                        popup.appendChild(def);
                        select.appendChild(def);
                    };
                    select.dispatchEvent(event);
                    popup.classList.remove("active");
                    select.classList.remove("active");
                    select.style.setProperty("--rotate", "0deg");
                }
            })

            document.addEventListener('scroll', function (e) {
                if (popup.contains(e.target)) return;
                var dh = getPosition(select).y - window.scrollY;
                popup.style.left = getPosition(select).x + "px";
                if (select.classList.contains("active")) {
                    if (window.innerHeight - dh - 8 > 150) {
                        popup.style.top = dh + 8 + select.scrollHeight + "px";
                        select.style.setProperty("--rotate", "90deg");
                    } else {
                        popup.style.top = getPosition(select).y - 8 - popup.offsetHeight + "px";
                        select.style.setProperty("--rotate", "-90deg");
                    }
                } else {
                    select.style.setProperty("--rotate", "0deg");
                }
            }, true);

            window.addEventListener("blur", () => {
                select.classList.remove("active");
                popup.classList.remove("active");
                select.style.setProperty("--rotate", "0deg");
            })

            document.addEventListener("click", (e) => {
                if (popup.contains(e.target) || select.contains(e.target)) return;
                select.classList.remove("active");
                popup.classList.remove("active");
                select.style.setProperty("--rotate", "0deg");
            })
                */

            /*
            $("[data-select]", true).forEach(select => {
                var popup = select.querySelector(".select-popup").cloneNode(true);
                popup.className = select.className.replace("select", "") + " select-popup";
                document.body.appendChild(popup);
                var dh = getPosition(select).y - window.scrollY;
                popup.style.left = getPosition(select).x + "px";
                if (window.innerHeight - dh - 8 > 150) {
                    popup.style.top = dh + 8 + select.scrollHeight + "px";
                } else {
                    popup.style.top = getPosition(select).y - 8 - popup.offsetHeight + "px";
                }
                select.style.setProperty("--rotate", "0deg");
                var selected = select.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled) .select-item-text") ? select.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled) .select-item-text") : select.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled)");
                if (select.querySelector(".select-default") === null) {
                    var def = document.createElement("div");
                    def.className = "select-default";
                    if (select.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled)")) {
                        def.innerText = selected.innerText;
                    } else {
                        def.innerText = "請選擇...";
                    }
                    select.appendChild(def);
                } else {
                    if (select.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled)")) {
                        select.querySelector(".select-default").innerText = selected.innerText;
                    }
                }
                if (select.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled)")) {
                    select.value = select.querySelector(".select-item.selected:not([disabled], [disabled='true'], .disabled)").getAttribute("value");
                }
                if (select.getAttribute("multiple") != "" && !select.getAttribute("multiple") == true) {
                    select.querySelectorAll(".select-item.selected:not([disabled], [disabled='true'], .disabled)").forEach((s, i) => {
                        if (i != 0) {
                            s.classList.remove("selected")
                        }
                    })
                }
                select.addEventListener("click", (e) => {
                    if (!document.body.contains(popup)) {
                        popup = select.querySelector(".select-popup").cloneNode(true);
                        popup.className = select.className.replace("select", "") + " select-popup";
                        document.body.appendChild(popup);
                    } else {
                        if (popup.contains(e.target)) return;
                    }
                    popup.className = select.className.replace("select", "") + " select-popup";
                    select.classList.toggle("active");
                    popup.classList.toggle("active");
                    var dh = getPosition(select).y - window.scrollY;
                    popup.style.left = getPosition(select).x + "px";
                    if (select.classList.contains("active")) {
                        if (window.innerHeight - dh - 8 > 150) {
                            popup.style.top = dh + 8 + select.scrollHeight + "px";
                            select.style.setProperty("--rotate", "90deg");
                        } else {
                            popup.style.top = getPosition(select).y - 8 - popup.offsetHeight + "px";
                            select.style.setProperty("--rotate", "-90deg");
                        }
                    } else {
                        select.style.setProperty("--rotate", "0deg");
                    }
                })

                popup.addEventListener("click", (e) => {
                    if (e.target.classList.contains("select-item") && !e.target.classList.contains("disabled")) {
                        var event = new CustomEvent("change", { detail: e.target.getAttribute("value") || "" });
                        select.value = e.target.getAttribute("value") || "";
                        select.setAttribute("value", e.target.getAttribute("value") || "");
                        if (select.getAttribute("multiple") != "" && !select.getAttribute("multiple") == true) {
                            popup.querySelectorAll(".select-item.selected").forEach(i => {
                                i.classList.remove("selected");
                            })
                            select.querySelectorAll(".select-item.selected").forEach(i => {
                                i.classList.remove("selected");
                            })
                        }
                        e.target.classList.add("selected");
                        if (select.querySelector(".select-default") !== null) {
                            select.querySelector(".select-default").innerText = e.target.innerText;
                        } else {
                            var def = document.createElement("div");
                            def.className = "select-default";
                            def.innerText = e.target.innerText;
                            popup.appendChild(def);
                            select.appendChild(def);
                        };
                        select.dispatchEvent(event);
                        popup.classList.remove("active");
                        select.classList.remove("active");
                        select.style.setProperty("--rotate", "0deg");
                    }
                })

                document.addEventListener('scroll', function (e) {
                    if (popup.contains(e.target)) return;
                    var dh = getPosition(select).y - window.scrollY;
                    popup.style.left = getPosition(select).x + "px";
                    if (select.classList.contains("active")) {
                        if (window.innerHeight - dh - 8 > 150) {
                            popup.style.top = dh + 8 + select.scrollHeight + "px";
                            select.style.setProperty("--rotate", "90deg");
                        } else {
                            popup.style.top = getPosition(select).y - 8 - popup.offsetHeight + "px";
                            select.style.setProperty("--rotate", "-90deg");
                        }
                    } else {
                        select.style.setProperty("--rotate", "0deg");
                    }
                }, true);

                window.addEventListener("blur", () => {
                    select.classList.remove("active");
                    popup.classList.remove("active");
                    select.style.setProperty("--rotate", "0deg");
                })

                document.addEventListener("click", (e) => {
                    if (popup.contains(e.target) || select.contains(e.target)) return;
                    select.classList.remove("active");
                    popup.classList.remove("active");
                    select.style.setProperty("--rotate", "0deg");
                })
            })
                */
        },
        getValue: (element) => {
            return element.getAttribute("value");
        }
    }

    window.S = S;
})();