/*----- keys -----*/

- datas
- config
- install
- getValue

/*--- function ---*/

// install //

// parameters //

var parameters = {
    target: 'append under target',
    options: 'options in popup',
    config: 'custom select'
}



// default values //

var defaultValues = {
    margin: 8,
    trigger: null,
    triggerClassName: "siyu-select-trigger",
    triggerAttributes: {},
    popupClassName: "siyu-select-popup",
    popupAttributes: {},
    noSelectedContent: "請選擇...",
    theme: "system"
}

// option format //

[
    {
        type: "option" || "separator",
        value: '( any )',
        content: String,
        action: Function,
        styles: String || Object,
        classList: Array,
        attributes: Object,
        disabled: true || false,
        selected: true || false
    }
]

// return values //

var returnValues = {
    on, showPopup, hidePopup, select, clearSelect, setStyle,
    elements: {
        popup: S.datas[id].popup,
        trigger: S.datas[id].trigger,
        currentContent: S.datas[id].currentContent
    },
    id
}