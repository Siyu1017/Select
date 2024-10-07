(() => {
    /**
     * 取得元素
     * @param {string} s 
     * @param {boolean} a 
     * @returns {HTMLElement|Array}
     */

    var $ = (s, a) => { return a == true ? document.querySelectorAll(s) : document.querySelector(s); };

    const S = {
        install: (select) => {
            var $ = (s, a) => { return a == true ? document.querySelectorAll(s) : document.querySelector(s); };

            function getPosition(element) {
                function offset(el) {
                    var rect = el.getBoundingClientRect(),
                        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
                        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
                }
                return { x: offset(element).left, y: offset(element).top };
            }

            $("[data-select]", true).forEach(select => {
                var popup = select.querySelector(".unique-select-popup").cloneNode(true);
                popup.className = select.className.replace("select", "") + " unique-select-popup";
                document.body.appendChild(popup);
                var dh = getPosition(select).y - window.scrollY;
                popup.style.left = getPosition(select).x + "px";
                if (window.innerHeight - dh - 8 > 150) {
                    popup.style.top = dh + 8 + select.scrollHeight + "px";
                } else {
                    popup.style.top = getPosition(select).y - 8 - popup.offsetHeight + "px";
                }
                select.style.setProperty("--rotate", "0deg");
                var selected = select.querySelector(".unique-select-item.selected:not([disabled], [disabled='true'], .disabled) .unique-select-item-text") ? select.querySelector(".unique-select-item.selected:not([disabled], [disabled='true'], .disabled) .unique-select-item-text") : select.querySelector(".unique-select-item.selected:not([disabled], [disabled='true'], .disabled)");
                if (select.querySelector(".unique-select-default") === null) {
                    var def = document.createElement("div");
                    def.className = "unique-select-default";
                    if (select.querySelector(".unique-select-item.selected:not([disabled], [disabled='true'], .disabled)")) {
                        def.innerText = selected.innerText;
                    } else {
                        def.innerText = "請選擇...";
                    }
                    select.appendChild(def);
                } else {
                    if (select.querySelector(".unique-select-item.selected:not([disabled], [disabled='true'], .disabled)")) {
                        select.querySelector(".unique-select-default").innerText = selected.innerText;
                    }
                }
                if (select.querySelector(".unique-select-item.selected:not([disabled], [disabled='true'], .disabled)")) {
                    select.value = select.querySelector(".unique-select-item.selected:not([disabled], [disabled='true'], .disabled)").getAttribute("value");
                }
                if (select.getAttribute("multiple") != "" && !select.getAttribute("multiple") == true) {
                    select.querySelectorAll(".unique-select-item.selected:not([disabled], [disabled='true'], .disabled)").forEach((s, i) => {
                        if (i != 0) {
                            s.classList.remove("selected")
                        }
                    })
                }
                select.addEventListener("click", (e) => {
                    if (!document.body.contains(popup)) {
                        popup = select.querySelector(".unique-select-popup").cloneNode(true);
                        popup.className = select.className.replace("select", "") + " unique-select-popup";
                        document.body.appendChild(popup);
                    } else {
                        if (popup.contains(e.target)) return;
                    }
                    popup.className = select.className.replace("select", "") + " unique-select-popup";
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
                    if (e.target.classList.contains("unique-select-item") && !e.target.classList.contains("disabled")) {
                        var event = new CustomEvent("change", { detail: e.target.getAttribute("value") || "" });
                        select.value = e.target.getAttribute("value") || "";
                        select.setAttribute("value", e.target.getAttribute("value") || "");
                        if (select.getAttribute("multiple") != "" && !select.getAttribute("multiple") == true) {
                            popup.querySelectorAll(".unique-select-item.selected").forEach(i => {
                                i.classList.remove("selected");
                            })
                            select.querySelectorAll(".unique-select-item.selected").forEach(i => {
                                i.classList.remove("selected");
                            })
                        }
                        e.target.classList.add("selected");
                        if (select.querySelector(".unique-select-default") !== null) {
                            select.querySelector(".unique-select-default").innerText = e.target.innerText;
                        } else {
                            var def = document.createElement("div");
                            def.className = "unique-select-default";
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
        },
        getValue: (element) => {
            return element.getAttribute("value");
        }
    }

    window.S = S;
})();