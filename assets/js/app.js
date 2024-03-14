'use strict'

console.log('Script is OK! ༼ つ ◕_◕ ༽つ');

// DIALOG TABLE
if (document.querySelector('.result-table__dialog')) {
    import('./dialog-table.js').then(e => {
        console.log("Dialog table loaded (づ ◕‿◕ )づ")
    }).catch(e => {
        console.log("Sorry, dialog tables not loaded (ಥ﹏ಥ)", e)
    })
}

function toggleRelatedInputs(element, id, action) {
    // Применяя toggleRelatedInputs к выпдающим спискам, в element передается event
    // Если в element передается event, то функция не отрабатывает
    // Сделал првоерку на тип элемента и в случае если element === Event, то передается element.target
    element = element instanceof Event ? element.target : element
    id = id ?? element.id;
    let value = element.value;
    if (element.type == 'select-one') value = element.selectedIndex;
    document.querySelectorAll('.' + id).forEach(element => {
        if (action === "disabled") {
            element.classList.remove("disabled");
        } else if (action === "finding") {
            element.classList.remove("disabled");
            if (element.querySelector('.input-field__input').value === "finding...") {
                element.querySelector('.input-field__input').value = ""
            }
        } else {
            element.classList.add("related-item-hidden");
        }
    });
    document.querySelectorAll('.related-to-' + id + '-' + value)?.forEach(element => {
        if (action === "disabled") {
            element.classList.add("disabled");
        } else if (action === "finding") {
            element.querySelector('.input-field__input').value = "finding..."
            element.classList.add("disabled");
        } else {
            element.classList.remove("related-item-hidden");
        }
    });
}

function toggleCalculationType(element, id, action) {
    toggleRelatedInputs(element, id, action);
    calculate();
}

function forceNumeric(input) {
    input.value = input.value
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*?)\..*/g, '$1');
}

const output = {
    value: null,
    val: function (value) {
        this.value = value;
        return this;
    },
    replace: function (search, replacement) {
        this.value = this.value.replace(search, replacement);
        return this;
    },
    set: function (elementId) {
        document.getElementById(elementId).innerHTML = this.value;
        return this;
    }
};

const input = {
    box: document.querySelector('#error-box'),
    list: document.querySelector('#error-list'),
    value: null,
    elementId: null,
    shown: false,
    processed: false,
    silent: false,
    reset: function () {
        this.shown = false;
        this.box.classList.remove('calculator-result--error-active');
        document.querySelectorAll('.input-field--error')?.forEach(el => el.classList.remove('input-field--error'))
        document.querySelectorAll('.calculator-result:not(.calculator-result--error)').forEach(el => el.classList.remove('calculator-result--hidden'))
    },
    error: function (inputId, message = `Incorrect value for "${inputId}"`, last = false) {
        if (this.silent) return;
        if (this.processed) this.reset();
        if (!Array.isArray(inputId)) inputId = [inputId];
        for (const inputIdItem of inputId) document.getElementById(inputIdItem).parentNode.classList.add('input-field--error');
        if (!this.shown) {
            this.processed = false;
            this.shown = true;
            this.list.innerHTML = '';
            this.box.classList.add('calculator-result--error-active');
            document.querySelectorAll('.calculator-result:not(.calculator-result--error)').forEach(el => el.classList.add('calculator-result--hidden'))
        }
        const element = document.createElement('p');
        element.classList.add('calculator-error__item');
        element.innerHTML = message;
        this.list.append(element);
        if (last) this.processed = true;
    },
    valid: function () {
        if (!this.shown || this.processed) this.reset();
        this.processed = true;
        this.silent = false;
        return !this.shown;
    },
    get: function (elementId) {
        this.elementId = elementId;
        let element = document.getElementById(elementId);
        this.silent = false;
        if (element == null) {
            this.value = null;
        } else {
            this.value = element.value;
            for (; element && element !== document; element = element.parentNode) {
                if (element.classList.contains('related-item-hidden')) this.silent = true;
            }
        }
        return this;
    },
    index: function () {
        this.value = document.getElementById(this.elementId).selectedIndex;
        return this;
    },
    checked: function (elementId) {
        this.value = document.getElementById(this.elementId).checked;
        return this;
    },
    split: function (separator) {
        this.value = this.value.split(separator);
        return this;
    },
    replace: function (pattern, replacement) {
        this.value = this.value.replace(pattern, replacement);
        return this;
    },
    default: function (value) {
        if (!this.value) this.value = value;
        return this;
    },
    optional: function (value) {
        if (!this.value) this.silent = true;
        return this;
    },
    gt: function (compare = 0, errorText = `The ${this.elementId} must be greater than ${compare}.`) {
        if (this.value instanceof Date) {
            compare = compare instanceof Date ? compare : new Date(document.getElementById(compare).value);
            if (this.value.getTime() <= compare.getTime()) this.error(this.elementId, errorText);
        } else {
            compare = isNaN(compare) ? Number(document.getElementById(compare).value) : compare;
            if (this.value === '' || isNaN(Number(this.value)))
                this.error(this.elementId, `The ${this.elementId} must be a number.`);
            else
                if (Number(this.value) <= compare) this.error(this.elementId, errorText);
        }
        return this;
    },
    gte: function (compare = 0, errorText = `The ${this.elementId} must be greater than or equal to ${compare}.`) {
        if (this.value instanceof Date) {
            compare = compare instanceof Date ? compare : new Date(document.getElementById(compare).value);
            if (this.value.getTime() < compare.getTime()) this.error(this.elementId, errorText);
        } else {
            compare = isNaN(compare) ? Number(document.getElementById(compare).value) : compare;
            if (this.value === '' || isNaN(Number(this.value)))
                this.error(this.elementId, `The ${this.elementId} must be a number.`);
            else
                if (Number(this.value) < compare) this.error(this.elementId, errorText);
        }
        return this;
    },
    lt: function (compare = 0, errorText = `The ${this.elementId} must be less than ${compare}.`) {
        if (this.value instanceof Date) {
            compare = compare instanceof Date ? compare : new Date(document.getElementById(compare).value);
            if (this.value.getTime() >= compare.getTime()) this.error(this.elementId, errorText);
        } else {
            compare = isNaN(compare) ? Number(document.getElementById(compare).value) : compare;
            if (this.value === '' || isNaN(Number(this.value)))
                this.error(this.elementId, `The ${this.elementId} must be a number.`);
            else
                if (Number(this.value) >= compare) this.error(this.elementId, errorText);
        }
        return this;
    },
    lte: function (compare = 0, errorText = `The ${this.elementId} must be less than or equal to ${compare}.`) {
        if (this.value instanceof Date) {
            compare = compare instanceof Date ? compare : new Date(document.getElementById(compare).value);
            if (this.value.getTime() > compare.getTime()) this.error(this.elementId, errorText);
        } else {
            compare = isNaN(compare) ? Number(document.getElementById(compare).value) : compare;
            if (this.value === '' || isNaN(Number(this.value)))
                this.error(this.elementId, `The ${this.elementId} must be a number.`);
            else
                if (Number(this.value) > compare) this.error(this.elementId, errorText);
        }
        return this;
    },
    integer: function (errorText = `The ${this.elementId} must be integer number (-3, -2, -1, 0, 1, 2, 3, ...).`) {
        if (!this.value.match(/^-?(0|[1-9]\d*)$/)) this.error(this.elementId, errorText);
        return this;
    },
    _naturalRegexp: /^([1-9]\d*)$/,
    natural: function (errorText = `The ${this.elementId} must be a natural number (1, 2, 3, ...).`) {
        if (!this.value.match(this._naturalRegexp)) this.error(this.elementId, errorText);
        return this;
    },
    natural_numbers: function (errorText = `The ${this.elementId} must be a set of natural numbers (1, 2, 3, ...).`) {
        this.split(/[ ,]+/);
        if (!this.value.every(value => value.match(this._naturalRegexp))) this.error(this.elementId, errorText);
        return this;
    },
    _mixedRegexp: /^(0|-?[1-9]\d*|-?[1-9]\d*\/[1-9]\d*|-?[1-9]\d*\s[1-9]\d*\/[1-9]\d*)$/,
    mixed: function (errorText = `The ${this.elementId} must be an integer/fraction/mixed number (1, 2/3, 4 5/6, ...).`) {
        if (!this.value.match(this._mixedRegexp)) this.error(this.elementId, errorText);
        return this;
    },
    mixed_numbers: function (errorText = `The ${this.elementId} must be a set of integer/fraction/mixed numbers (1, 2/3, 4 5/6, ...).`) {
        this.split(/,\s*/);
        if (!this.value.every(value => value.match(this._mixedRegexp))) this.error(this.elementId, errorText);
        return this;
    },
    number: function (errorText = `The "${this.elementId}" must be a number.`) {
        if (this.value === '' || isNaN(Number(this.value))) this.error(this.elementId, errorText);
        return this;
    },
    probability: function (errorText = `The "${this.elementId}" must be a number between 0 and 1.`) {
        if (this.value === '' || isNaN(Number(this.value)) || Number(this.value) < 0 || Number(this.value) > 1)
            this.error(this.elementId, errorText);
        return this;
    },
    percentage: function (errorText = `The "${this.elementId}" must be a number between 0 and 100.`) {
        if (this.value === '' || isNaN(Number(this.value)) || Number(this.value) < 0 || Number(this.value) > 100)
            this.error(this.elementId, errorText);
        return this;
    },
    numbers: function (errorText = `The ${this.elementId} must be a set of numbers.`) {
        if (this.value.filter(value => isNaN(Number(value))).length) this.error(this.elementId, errorText);
        return this;
    },
    whole: function (errorText = `The ${this.elementId} must be a whole number.`) {
        if (!this.value.match(/^(0|[1-9]\d*)$/)) this.error(this.elementId, errorText);
        return this;
    },
    positive: function (errorText = `The ${this.elementId} must be greater than 0.`) {
        this.gt(0, errorText);
        return this;
    },
    nonZero: function (errorText = `The ${this.elementId} must be non-zero.`) {
        if (this.value === '' || isNaN(Number(this.value)))
            this.error(this.elementId, `The ${this.elementId} must be a number.`);
        else
            if (Number(this.value) == 0) this.error(this.elementId, errorText);
        return this;
    },
    nonNegative: function (errorText = `The ${this.elementId} must be greater than or equal to 0.`) {
        this.gte(0, errorText);
        return this;
    },
    negative: function (errorText = `The ${this.elementId} must be less than 0.`) {
        this.lt(0, errorText);
        return this;
    },
    bool: function () {
        return !!this.value;
    },
    val: function () {
        if (this.value === '' || this.value === null) return null;
        return Number(this.value);
    },
    vals: function () {
        return this.value.map(value => Number(value));
    },
    raw: function () {
        return this.value;
    }
}

function roundTo(num, decimals = 5) {
    if (typeof num !== 'number' || !isFinite(num)) return num;
    if (num.toString().includes('e')) {
        const splitted = num.toString().split('e');
        return roundTo(+splitted[0], decimals) + `e${splitted[1]}`;
    };
    return +(Math.round(num + `e+${decimals}`) + `e-${decimals}`);
}


function currencyFormat(num, space = '&nbsp') {
    return `R${space}` + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const investmentTermError = 'The investment term must be greater than 0.';
const savingsGoalError = 'Your savings goal must be greater than 0.';
const lumpSumError = 'The lump sum amount must be less than your savings goal.';
const contributionError = 'The monthly contribution must be less than your savings goal';


function getCompound(compound) {
    switch (compound) {
        case 0:
            return 12;
        case 1:
            return 2;
        case 2:
            return 4;
        case 3:
            return 24;
        case 4:
            return 26;
        case 5:
            return 52;
        case 6:
            return 365;
    }
}

function calculateAmortization(
    principal,
    years,
    rate,
    compound = 12,
    initialContribution = 0,
    annualIncreaseRate = 0,
) {
    const months = Math.max(years * 12, 1);
    const cc = compound / 12
    const interest = rate / 100 / compound;
    const ratePayB = Math.pow(1 + interest, cc) - 1;

    let amortization = [];
    let contribution = initialContribution;
    let balance = principal;
    let totalContribution = 0;
    let totalInterest = 0;
    for (let i = 1; i <= months; i++) {
        const startBalance = balance;

        balance += contribution;
        totalContribution += contribution;

        const interestPayment = balance * ratePayB;
        totalInterest += interestPayment;
        balance += interestPayment;

        amortization.push({
            startBalance,
            endBalance: balance,
            interestPayment,
            totalContribution,
            totalInterest,
            contributionAmount: contribution
        });

        if (annualIncreaseRate && i % 12 === 0) {
            contribution *= 1 + annualIncreaseRate / 100;
        }
    }
    return amortization;
}

const DELTA = 0.0000000001;
const RETRY_COUNT = 10;
const DELTA_COUNT = 18;

function findAmortizationParam(
    initialIncrement,
    resultGetter
) {
    let delta = DELTA;
    for (let d = 0; d < DELTA_COUNT; d++) {
        let dm = 1 - delta;
        let dp = 1;
        for (let r = 0; r <= RETRY_COUNT; r++) {
            let value = 0.1;
            let increment = initialIncrement * Math.pow(2, r);
            for (let i = 0; i < 1000; i++) {
                const ratio = resultGetter(value);
                if (ratio < dm) {
                    value -= increment;
                    increment = increment / 2;
                } else if (ratio >= dm && ratio <= dp) {
                    if (value < 0) {
                        input.error([], 'Please check the input values are reasonable', true);
                        return 0;
                    }
                    return value;
                } else {
                    value += increment;
                }
            }
        }
        delta += delta;
    }

    input.error([], 'Please check the input values are reasonable', true);
    return 0;
}

function findMoneyParam(
    initialIncrement,
    resultGetter
) {
    const v0 = resultGetter(0.00);
    if (v0 <= 1) return 0;
    const v1 = resultGetter(0.01);
    if (v1 <= 1) return 0.01;
    const v2 = resultGetter(0.02);
    if (v2 <= 1) return 0.02;


    const foundV = roundDown2Dp(findAmortizationParam(initialIncrement, resultGetter));

    const fv = resultGetter(foundV);
    if (fv <= 1) return foundV;
    return foundV + 0.01;
}

function roundDown2Dp(num) {
    return Math.floor(num * 100) / 100;
}

function findInvestmentTerm(resultGetter) {
    for (let m = 1; m <= 1000 * 12; m++) {
        const ratio = resultGetter(m / 12);
        if (ratio <= 1) {
            return m / 12;
        }
    }

    input.error([], 'Please check the input values are reasonable', true);
    return 1 / 12;
}

function calculateFV(
    pv,
    years,
    rate,
    compound = 12,
    contribution = 0,
    annualIncreaseRate = 0
) {
    const amortization = calculateAmortization(pv, years, rate, compound, contribution, annualIncreaseRate);
    return amortization[amortization.length - 1];
}

// CHART_DONUT_BIG CHART_LOAN
'use strict'
const customDataLabels = {
    id: 'customDataLabel',
    afterDatasetDraw(chart, args, pluginOptions) {
        const {
            ctx,
            data
        } = chart;
        ctx.save();

        data.datasets[0].data.forEach((datapoint, index) => {
            const { x, y } = chart.getDatasetMeta(0).data[index].tooltipPosition();

            ctx.textAlign = 'center';
            ctx.font = '14px Inter';
            ctx.fillStyle = '#fff';
            ctx.textBaseline = 'middle';
            let toolTipText = datapoint != '0' ? datapoint + '%' : '';
            ctx.fillText(toolTipText, x, y);
        });
    },
};

const colors = {
    primary: '#162953',
    primaryLight: '#25468d',
    secondary: '#00ABD0'
};

const tooltip = {
    enabled: false,
    external: function (context) {
        let tooltipEl = document.getElementById('chartjs-tooltip');

        // Create element on first render
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
            document.body.appendChild(tooltipEl);
        }

        // Hide if no tooltip
        const tooltipModel = context.tooltip;
        if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
        }

        // Set caret Position
        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
        } else {
            tooltipEl.classList.add('no-transform');
        }

        function getBody(bodyItem) {
            return bodyItem.lines;
        }

        if (tooltipModel.body) {
            const bodyLines = tooltipModel.body.map(getBody);

            let innerHtml = '<thead>';

            let year = +(Number(tooltipModel.title) * 12).toFixed(0);
            let months = +(year % 12).toFixed(0);
            let yearText = `Year ${(year - months) / 12}`;
            let monthText = months === 0 ? '' : `, Month ${months}`;
            innerHtml += '<tr><th class="loan-chart__title">' + yearText + monthText + '</th></tr>';

            innerHtml += '</thead><tbody>';
            bodyLines.forEach(function (body, i) {
                innerHtml += '<tr><td class="loan-chart__text">' + body + '</td></tr>';
            });
            innerHtml += '</tbody>';

            let tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
        }

        const position = context.chart.canvas.getBoundingClientRect();

        // Display, position, and set styles for font
        tooltipEl.style.opacity = 1;
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.left = position.left + window.scrollX + tooltipModel.caretX - tooltipEl.clientWidth / 2 + 'px';
        tooltipEl.style.top = position.top + window.scrollY + tooltipModel.caretY - tooltipEl.clientHeight / 2 + 'px';
        tooltipEl.classList.add('loan-chart');
    },
};

import("./lib/chartjs/chart.js").then(({ Chart, registerables }) => {
    Chart.register(...registerables);

    const pieChartData = [
        {
            data: [4, 61, 35],
            backgroundColor: [colors.primary, colors.primaryLight, colors.secondary],
            borderColor: colors.primary,
            borderWidth: 0.5,
        },
    ];

    const pieChart = new Chart(document.getElementById('chartDonutBig'), {
        type: 'pie',
        data: {
            datasets: pieChartData,
        },
        options: {
            rotation: 0,
            hover: { mode: null },
            responsive: false,
            layout: {
                padding: 30,
            },
            plugins: {
                tooltip: {
                    enabled: false,
                },
                legend: {
                    display: false,
                },
            },
        },
        plugins: [customDataLabels],
    });

    const barChartData = {
        labels: [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10
        ],
        datasets: [
            {
                label: 'Lump Sum',
                data: [
                    5000,
                    5000,
                    5000,
                    5000,
                    5000,
                    5000,
                    5000,
                    5000,
                    5000,
                    5000
                ],
                order: 1,
                backgroundColor: colors.primary,
                fill: true,
            },
            {
                label: 'Contributions',
                data: [
                    6000,
                    12300,
                    18915,
                    25861,
                    33154,
                    40811,
                    48852,
                    57295,
                    66159,
                    75467
                ],
                order: 2,
                backgroundColor: colors.primaryLight,
                fill: true,
            },
            {
                label: 'Interest',
                data: [
                    681,
                    1931,
                    3821,
                    6431,
                    9850,
                    14175,
                    19511,
                    25975,
                    33695,
                    42811
                ],
                order: 3,
                backgroundColor: colors.secondary,
                fill: true,
            }
        ],
    };

    const barChart = new Chart(document.getElementById('chartLoan'), {
        type: 'bar',
        data: barChartData,
        options: {
            response: true,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: tooltip,
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    stacked: true,
                    ticks: {
                        callback: (it) => currencyFormat(it, ' '),
                    },
                },
                x: {
                    stacked: true,
                    ticks: {
                        callback: function (value, index, ticks) {
                            return value + 1;
                        }
                    },
                    grid: {
                        display: false
                    },
                },
            },
        }
    });

    function changeChartData(values, values_two) {
        pieChart.data.datasets[0].data = values
        pieChart.data.datasets[0].labels = values.map(value => `${value}%`)
        pieChart.update()

        barChart.data.labels = values_two[0]
        barChart.data.datasets[0].data = values_two[1]
        barChart.data.datasets[1].data = values_two[2]
        barChart.data.datasets[2].data = values_two[3]
        barChart.update()
    }

    window.calculate = function () {
        const calcType = input.get('loan_type').index().val();

        const pv = input.get('starting_amount').nonNegative().val();
        const years = input.get('after').positive(investmentTermError).val();
        const rate = input.get('return_rate').nonNegative().val();
        const compound = input.get('compound').index().val();
        const contribution = input.get('additional_contribution').nonNegative().val();
        const annualIncreaseRate = input.get('annual_increase').nonNegative().val();

        const fv2 = input.get('your_target_2').positive(savingsGoalError).val();
        const pv2 = input.get('starting_amount_2').nonNegative().lt('your_target_2', lumpSumError).val();
        const years2 = input.get('after_2').positive(investmentTermError).val();
        const rate2 = input.get('return_rate_2').nonNegative().val();
        const compound2 = input.get('compound_2').index().val();
        const annualIncreaseRate2 = input.get('annual_increase_2').nonNegative().val();


        const fv3 = input.get('your_target_3').positive(savingsGoalError).val();
        const pv3 = input.get('starting_amount_3').nonNegative().lt('your_target_3', lumpSumError).val();
        const years3 = input.get('after_3').positive(investmentTermError).val();
        const compound3 = input.get('compound_3').index().val();
        const contribution3 = input.get('additional_contribution_3').nonNegative().lt('your_target_3', contributionError).val();
        const annualIncreaseRate3 = input.get('annual_increase_3').nonNegative().val();


        const fv4 = input.get('your_target_4').positive(savingsGoalError).val();
        const years4 = input.get('after_4').positive(investmentTermError).val();
        const rate4 = input.get('return_rate_4').nonNegative().val();
        const compound4 = input.get('compound_4').index().val();
        const contribution4 = input.get('additional_contribution_4').nonNegative().lt('your_target_4', contributionError).val();
        const annualIncreaseRate4 = input.get('annual_increase_4').nonNegative().val();

        const fv5 = input.get('your_target_5').positive(savingsGoalError).val();
        const pv5 = input.get('starting_amount_5').nonNegative().lt('your_target_5', lumpSumError).val();
        const rate5 = input.get('return_rate_5').nonNegative().val();
        const compound5 = input.get('compound_5').index().val();
        const contribution5 = input.get('additional_contribution_5').nonNegative().lt('your_target_5', contributionError).val();
        const annualIncreaseRate5 = input.get('annual_increase_5').nonNegative().val();


        if (!input.valid()) return;

        if (calcType === 0) {
            // End Amount
            const result = calculateAmortization(pv, years, rate, getCompound(compound), contribution, annualIncreaseRate);
            const fv = result[result.length - 1].endBalance;
            const totalInterest = result[result.length - 1].totalInterest;
            const totalPrincipal = result[result.length - 1].totalContribution + pv;
            output.val(`End Balance: ${currencyFormat(fv)}`).set('resultA-1');
            output.val(`Total Principal: ${currencyFormat(totalPrincipal)}`).set('resultA-2');
            output.val(`Total Interest: ${currencyFormat(totalInterest)}`).set('resultA-3');
            showResult(result, pv);
        }
        else if (calcType === 1) {
            // Monthly Contribution
            const { endBalance } = calculateFV(pv2, years2, rate2, getCompound(compound2), 0, annualIncreaseRate2);
            let contribution2;
            if (endBalance > fv2) {
                contribution2 = 0;
            } else {
                contribution2 = findMoneyParam(50, (c) => {
                    const amortization = calculateFV(pv2, years2, rate2, getCompound(compound2), c, annualIncreaseRate2);
                    return fv2 / amortization.endBalance;
                });
            }

            const result2 = calculateAmortization(pv2, years2, rate2, getCompound(compound2), contribution2, annualIncreaseRate2);
            const totalInterest = result2[result2.length - 1].totalInterest;
            const totalPrincipal = result2[result2.length - 1].totalContribution + pv;
            const trueFv = result2[result2.length - 1].endBalance;
            output.val(`You will need to contribute ${currencyFormat(contribution2)} per month escalating at ${annualIncreaseRate2}% to reach your savings goal of ${currencyFormat(fv2)}`).set('resultB');
            output.val(`End Balance: ${currencyFormat(trueFv)}`).set('resultB-1');
            output.val(`Total Principal: ${currencyFormat(totalPrincipal)}`).set('resultB-2');
            output.val(`Total Interest: ${currencyFormat(totalInterest)}`).set('resultB-3');
            showResult(result2, pv2);
        }
        else if (calcType === 2) {
            // Interest Rate
            const { totalContribution } = calculateFV(pv3, years3, 0, getCompound(compound3), contribution3, annualIncreaseRate3);
            const totalInvested = pv3 + totalContribution;
            let rate3;
            if (totalInvested > fv3) {
                rate3 = 0;
            } else {
                rate3 = findAmortizationParam(1, (r) => {
                    const amortization = calculateFV(pv3, years3, r, getCompound(compound3), contribution3, annualIncreaseRate3);
                    return fv3 / amortization.endBalance;
                });
            }

            const result3 = calculateAmortization(pv3, years3, rate3, getCompound(compound3), contribution3, annualIncreaseRate3);
            const totalInterest = result3[result3.length - 1].totalInterest;
            const totalPrincipal = result3[result3.length - 1].totalContribution + pv3;
            const trueFv = result3[result3.length - 1].endBalance;
            output.val(`You will need an annual interest rate of ${rate3.toFixed(3)}% to reach your savings goal of ${currencyFormat(fv3)}`).set('resultC');
            output.val(`End Balance: ${currencyFormat(trueFv)}`).set('resultC-1');
            output.val(`Total Principal: ${currencyFormat(totalPrincipal)}`).set('resultC-2');
            output.val(`Total Interest: ${currencyFormat(totalInterest)}`).set('resultC-3');
            showResult(result3, pv3);
        }
        else if (calcType === 3) {
            // Lump Sum Amount
            const { endBalance } = calculateFV(0, years4, rate4, getCompound(compound4), contribution4, annualIncreaseRate4);
            let pv4;
            if (endBalance > fv4) {
                pv4 = 0;
            } else {
                pv4 = findMoneyParam(5000, (pv) => {
                    const amortization = calculateFV(pv, years4, rate4, getCompound(compound4), contribution4, annualIncreaseRate4);
                    return fv4 / amortization.endBalance;
                });
            }

            const result4 = calculateAmortization(pv4, years4, rate4, getCompound(compound4), contribution4, annualIncreaseRate4);
            const totalInterest = result4[result4.length - 1].totalInterest;
            const totalPrincipal = result4[result4.length - 1].totalContribution + pv4;
            const trueFv = result4[result4.length - 1].endBalance;
            output.val(`You will need to invest ${currencyFormat(pv4)} at the beginning to reach your savings goal of ${currencyFormat(fv4)}`).set('resultD');
            output.val(`End Balance: ${currencyFormat(trueFv)}`).set('resultD-1');
            output.val(`Total Principal: ${currencyFormat(totalPrincipal)}`).set('resultD-2');
            output.val(`Total Interest: ${currencyFormat(totalInterest)}`).set('resultD-3');
            showResult(result4, pv4);
        }
        else if (calcType === 4) {
            // Investment Term
            const totalInvested = pv5 + contribution5;
            let years5;
            if (totalInvested >= fv5) {
                years5 = 0;
            } else {
                let yFound = false;
                [1, 2, 3, 4].forEach((m) => {
                    if (yFound) return;
                    years5 = m / 12;
                    const { endBalance } = calculateFV(pv5, years5, rate5, getCompound(compound5), contribution5, annualIncreaseRate5);
                    yFound = endBalance >= fv5;
                })

                if (!yFound) {
                    years5 = findInvestmentTerm((y) => {
                        const amortization = calculateFV(pv5, y, rate5, getCompound(compound5), contribution5, annualIncreaseRate5);
                        return fv5 / amortization.endBalance;
                    });
                }
            }

            const result5 = calculateAmortization(pv5, years5, rate5, getCompound(compound5), contribution5, annualIncreaseRate5);
            const totalInterest = result5[result5.length - 1].totalInterest;
            const totalPrincipal = result5[result5.length - 1].totalContribution + pv5;
            const trueFv = result5[result5.length - 1].endBalance;
            output.val(`You will need to invest ${years5.toFixed(1)} years to reach your savings goal of ${currencyFormat(fv5)}`).set('resultE');
            output.val(`End Balance: ${currencyFormat(trueFv)}`).set('resultE-1');
            output.val(`Total Principal: ${currencyFormat(totalPrincipal)}`).set('resultE-2');
            output.val(`Total Interest: ${currencyFormat(totalInterest)}`).set('resultE-3');
            showResult(result5, pv5);
        }
    }

    function showResult(result, principal) {
        let annualResults = [];
        let chartData = [[], [], [], []];
        let annualInterest = 0;
        let annualContribution = 0;
        let annualStartBalance = result[0] ? result[0].startBalance : undefined;
        let monthlyResultsHtml = '';
        let annualResultsHtml = '';
        result.forEach((item, index) => {
            monthlyResultsHtml += `<tr>
                <td class="text-center">${index + 1}</td>
                <td>${currencyFormat(item.startBalance)}</td>
                <td>${currencyFormat(item.contributionAmount)}</td>
                <td>${currencyFormat(item.interestPayment)}</td>
                <td>${currencyFormat(item.endBalance)}</td>
            </tr>`;

            annualInterest += item.interestPayment;
            annualContribution += item.contributionAmount;
            if (annualStartBalance === undefined) annualStartBalance = item.startBalance;

            if ((index + 1) % 12 === 0 || (index + 1) === result.length) {
                const title = 'Year #{1} End'.replace('{1}', Math.ceil((index + 1) / 12).toString());
                monthlyResultsHtml += `<th class="white text-center" colspan="5">${title}</th>`;
                annualResults.push({
                    "interestPayment": annualInterest,
                    "contribution": annualContribution,
                    "endBalance": item.endBalance,
                    "startBalance": annualStartBalance,
                    "totalInterest": item.totalInterest,
                    "totalContributions": item.totalContribution,
                });
                annualInterest = 0;
                annualContribution = 0;
                annualStartBalance = undefined;
            }
        });
        annualResults.forEach((r, index) => {
            annualResultsHtml += `<tr>
                <td class="text-center">${index + 1}</td>
                <td>${currencyFormat(r.startBalance)}</td>
                <td>${currencyFormat(r.contribution)}</td>
                <td>${currencyFormat(r.interestPayment)}</td>
                <td>${currencyFormat(r.endBalance)}</td>
        </tr>`;
            chartData[0].push((index + 1));
            chartData[1].push(roundTo(principal, 0));
            chartData[2].push(roundTo(r.totalContributions, 0));
            chartData[3].push(roundTo(r.totalInterest, 0));
        });
        const fv = result[result.length - 1].endBalance;
        const totalInterest = result[result.length - 1].totalInterest;
        const totalContributions = result.reduce((acc, item) => acc + item.contributionAmount, 0);
        const interestPercent = totalInterest / fv * 100;
        const contributionPercent = totalContributions / fv * 100;
        const principalPercent = principal / fv * 100;

        changeChartData([roundTo(principalPercent, 0), roundTo(contributionPercent, 0), roundTo(interestPercent, 0)], chartData);
        output.val(annualResultsHtml).set('annual-results');
        output.val(monthlyResultsHtml).set('monthly-results');
    }
})
