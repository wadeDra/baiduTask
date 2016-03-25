/**
 * Created by wade on 16/3/22.
 */
/* 数据格式演示
 var aqiSourceData = {
 "北京": {
 "2016-01-01": 10,
 "2016-01-02": 10,
 "2016-01-03": 10,
 "2016-01-04": 10
 }
 };
 */
"use strict";

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
    var y = dat.getFullYear();
    var m = dat.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = dat.getDate();
    d = d < 10 ? '0' + d : d;
    return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
    var returnData = {};
    var dat = new Date("2016-01-01");
    var datStr = ''
    for (var i = 1; i < 92; i++) {
        datStr = getDateStr(dat);
        returnData[datStr] = Math.ceil(Math.random() * seed);
        dat.setDate(dat.getDate() + 1);
    }
    return returnData;
}

var aqiSourceData = {
    "北京": randomBuildData(500),
    "上海": randomBuildData(300),
    "广州": randomBuildData(200),
    "深圳": randomBuildData(100),
    "成都": randomBuildData(300),
    "西安": randomBuildData(500),
    "福州": randomBuildData(100),
    "厦门": randomBuildData(100),
    "沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
    nowSelectCity: -1,
    nowGraTime: "day"
}

var selectCity = document.getElementById('city-select');
var chartWrap = document.querySelector('.aqi-chart-wrap');
var graElements = document.getElementsByName('gra-time');

/*添加事件函数*/
function addEven(elem, type, func) {
    if (elem.addEventListener)
        elem.addEventListener(type, func, false);
    else if (elem.attachEvent)
        elem.attachEvent(type, func)
    else
        elem['on' + type] = func;
}


/**
 * 渲染图表
 */
function renderChart() {
    var charFragment = document.createDocumentFragment();
    var ulElement = document.createElement('ul');
    ulElement.className = pageState.nowGraTime;
    for (var item in chartData) {
        var liElement = document.createElement('li');
        var height = chartData[item];
        liElement.style.height = height;
        /*颜色按照高度来生成, 高的比较黑,本来想是可以矮的比较绿的,但是没有算法,望指点*/
        var color = "#" + Math.floor((500 - height) * 0x8312).toString(16);
        liElement.style.background = color;
        liElement.title = item + '的空气质量为: ' + height;
        charFragment.appendChild(liElement);
    }
    ulElement.appendChild(charFragment);
    chartWrap.replaceChild(ulElement, chartWrap.firstChild);
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange(e) {
    // 确定是否选项发生了变化
    var graTime = e.target.value;
    if (graTime === pageState.nowGraTime)
        return false;
    // 设置对应数据
    pageState.nowGraTime = graTime;
    initAqiChartData();
    // 调用图表渲染函数
    renderChart();
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange() {
    // 确定是否选项发生了变化
    if (selectCity.selectedIndex === pageState.nowSelectCity)
        return false;
    // 设置对应数据
    pageState.nowSelectCity = selectCity.selectedIndex;
    initAqiChartData();
    // 调用图表渲染函数
    renderChart();
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
    for (var i = 0; i < graElements.length; i++) {
        addEven(graElements[i], 'change', graTimeChange);
    }

}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
    // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
    var selectFragment = document.createDocumentFragment();
    for (var aqi in aqiSourceData) {
        var option = document.createElement('option');
        option.value = aqi;
        var text = document.createTextNode(aqi);
        option.appendChild(text);
        selectFragment.appendChild(option);
    }
    selectCity.appendChild(selectFragment);
    // 给select设置事件，当选项发生变化时调用函数citySelectChange
    addEven(selectCity, 'change', citySelectChange);

}


/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
    // 将原始的源数据处理成图表需要的数据格式
    var sourceData = aqiSourceData[selectCity.value];

    var count = 0;//数组的下标
    var array = [];//把数据按照每月或者每周存入这个数组
    var finalData = {};//最终数据
    var nowGraTime = pageState.nowGraTime;
    var dateString = '';//周还是月
    /*当选择为天数的时候*/
    if (nowGraTime === 'day') {
        chartData = sourceData;
        return false;
    }
    /*当选择为周的时候*/
    if (nowGraTime === 'week') {
        dateString = '周';
        for (var day in sourceData) {
            /*如果是周一, 周数就加一*/
            if (new Date(day).getDay() === 1) count++;
            groupData(day);
        }
    }
    /*当选择为月的时候*/
    if (nowGraTime === 'month') {
        var firstMonth = 0;
        dateString = '月';
        for (var day in sourceData) {
            var theMonth = new Date(day).getMonth();
            /*如果昨天的月数与今天的月数不一样*/
            if (firstMonth !== theMonth) {
                count++;
                firstMonth = theMonth;
            }
            groupData(day);
        }
    }

    /*算每个数组里面的每组平均值*/
    for (var i = 0; i < array.length; i++) {
        var sum = array[i].reduce(function (prev, next) {
            return prev + next;
        });
        finalData['第' + (i + 1) + dateString + ': '] = sum / array[i].length;
    }

    // 处理好的数据存到 chartData 中
    chartData = finalData;

    function groupData(day) {
        /**
         * 按周来举例子:
         * 如果这周是新的一周,就创建一个数组（也可以创建对象）来新建这个周*/
        if (typeof array[count] == 'undefined')
            array[count] = [];
        /*把每周里面天的数据放到周这个对象里面*/
        array[count].push(sourceData[day]);
    }
}

/**
 * 初始化函数
 */
function init() {
    initGraTimeForm()
    initCitySelector();
    initAqiChartData();
}

init();
