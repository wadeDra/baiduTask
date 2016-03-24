/**
 * Created by wade on 16/3/22.
 */
/**
 * aqiData，存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
 *    "北京": 90,
 *    "上海": 40
 * };
 */
"use strict";
var aqiData = {};
function id(id) {
    return document.getElementById(id);
}
var cityName = id('aqi-city-input');
var airValue = id('aqi-value-input');
var addBtn = id('add-btn');
var aqiTable = id('aqi-table');
var _do = false;//标志位判断一下要不要渲染

/*原型链定义一个trim方法去除空格*/
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
};

/*兼容各种浏览器咯*/
function addEvent(elm, type, func) {
    if (!elm) return false;
    if (elm.addEventListener)
        elm.addEventListener(type, func, false);
    else if (elm.attachEvent)
        elm.attachEvent(type, func);
    else
        elm['on' + type] = func;
}

/*定义一个Element对象*/
function Element(tagName, children) {
    this.tagName = tagName
    this.children = children
}

/**
 * 虚拟DOM方法,参照知乎
 * 定义了一个Element对象的render方法
 *
 */

Element.prototype.render = function () {
    var el = document.createElement(this.tagName) // 根据tagName构建
    var children = this.children || []
    children.forEach(function (child) {
        var childEl = (child instanceof Element)
            ? child.render() // 如果子节点也是虚拟DOM，递归构建DOM节点
            : document.createTextNode(child) // 如果字符串，只构建文本节点
        el.appendChild(childEl)
    });
    return el
}


/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData() {
    var city = cityName.value.trim();
    var value = airValue.value.trim();

    if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(city)) {
        alert('请输入正确的城市名称!');
        cityName.focus();
        return false;
    }
    if (!/^[1-9]*$/.test(value)) {
        alert('请输入正整数!');
        airValue.focus();
        return false;
    }
    aqiData[city] = value;
    cityName.value = '';
    airValue.value = '';
    cityName.focus();
    _do = true;
}

/**
 * 渲染aqi-table表格
 */
function renderAqiList() {
    var aqiFragment = document.createDocumentFragment();
    var tr = new Element('tr', [
        new Element('td', ['城市']),
        new Element('td', ['空气质量']),
        new Element('td', ['操作'])
    ]);
    aqiFragment.appendChild(tr.render());
    for (var data in aqiData) {
        var result = new Element('tr', [
            new Element('td', [data]),
            new Element('td', [aqiData[data]]),
            new Element('td', [
                new Element('button', ['删除'])
            ])
        ]);
        aqiFragment.appendChild(result.render());
    }
    aqiTable.innerHTML = '';
    if (_do)
        aqiTable.appendChild(aqiFragment);
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
    addAqiData();
    renderAqiList();
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle(e) {
    // do sth.
    /*根据event事件获得子节点元素*/
    var del = e.target.parentNode.parentNode.childNodes[0].innerHTML;
    /**
     *
     * 使用delete删除对象中的属性
     * https://segmentfault.com/a/1190000003048399
     * */
    delete aqiData[del];
    renderAqiList();
}

function init() {

    // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
    addEvent(addBtn, 'click', addBtnHandle)
    // 想办法给aqi-table中的所有删除按钮绑定事件，触发delBtnHandle函数
    addEvent(aqiTable, 'click', delBtnHandle)
}

init();

