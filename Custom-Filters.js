import React, { useEffect, useRef } from 'react'
import moment from 'moment';
import Holidays from 'date-holidays';
import CryptoJS from 'crypto-js';



export const convertToBaseFormatDate = (value, isFromDatabase = false, showTime = true, monthFormat = 'MMMM', documents = false) => {

    if (!value)
        return '';

    if (isFromDatabase) {

        value = new Date(value);

        if (documents)
            return moment.utc(value).format('MM/DD/YYYY');

        if (showTime)
            return moment.utc(value).format(monthFormat + ' D, YYYY hh:mm A');
        else
            return moment.utc(value).format(monthFormat + ' D, YYYY');
    }
    else
        return moment(value).format(monthFormat + ' D, YYYY');

}

export const convertToBaseFormatMobile = (value) => {

    if (value) {

        if (value.toString().length === 10) {

            const arr = value.toString().match(/^(\d{3})(\d{3})(\d{4})$/);

            if (arr)
                return '(' + arr[1] + ') ' + arr[2] + '-' + arr[3];
            else
                return "";

        }
        else
            return value;

    }
    else
        return '';

}

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
    return rows.filter(row => {
        const rowValue = row.values[id]
        return rowValue >= filterValue
    })
}

// Define a custom filter filter function!
function filterDate(rows, id, filterValue) {

    return rows.filter(row => {
        const rowValue = row.values[id]
        return moment.utc(rowValue).format('MM/DD/YYYY') == moment(filterValue).format('MM/DD/YYYY')
    })

}

// Define a custom Range filter function!
export function filterDateRange(rows, id, filterValue) {

    if (filterValue && filterValue.length > 1 && filterValue[0]) {
        return rows.filter(row => {
            const rowValue = row.values[id]
            const startDate = moment(filterValue[0]).format('MM/DD/YYYY');
            const endDate = moment(filterValue[1] ? filterValue[1] : filterValue[0]).format('MM/DD/YYYY');
            const rowDate = moment.utc(rowValue).format('MM/DD/YYYY');
            return moment(rowDate).isBetween(startDate, endDate, undefined, '[]');
        })
    }
    else {
        return rows;
    }

}




export function rowValuesToReturn(filterValueLowerCase, row) {
    if (row.values['Dealer Details']) return row.values['Dealer Details'].toLowerCase().includes(filterValueLowerCase);
    else if (row.values['Dealer Name']) return row.values['Dealer Name'].toLowerCase().includes(filterValueLowerCase);
    else if (row.values['Dealer']) return row.values['Dealer'].toLowerCase().includes(filterValueLowerCase);
    else if (row.values['Vehicle']) return row.values['Vehicle'].toLowerCase().includes(filterValueLowerCase);
    return row;
}

export function filterColorRange(rows, id, filterValue) {
    if (filterValue) {
        const filterValueLowerCase = filterValue[1] ? filterValue[1].toLowerCase() : '';
        if ((filterValue[0] === 'All') || (filterValue[0] === '')) {
            let allRows = rows.filter(row => {
                return rowValuesToReturn(filterValueLowerCase, row);
            })
            return allRows;
        }
        else {
            let risk = rows.filter(row => {
                let status = {
                    original: row.original['riskLevelStatus'],
                    dealerId: row.original.dealerId && row.original.dealerId['riskLevelStatus'],
                    dealerDetails: row.original.dealerDetails && row.original?.dealerDetails['riskLevelStatus']
                }

                if ((status.original === '' || status.dealerId === '' || status.dealerDetails === '') && filterValue[0] === 'Low') {
                    return status.original === '' || status.dealerId === '' || status.dealerDetails === '';
                }

                if (row.original['riskLevelStatus']) return row.original['riskLevelStatus'] === filterValue[0]
                else if (row.original.dealerId && row.original.dealerId['riskLevelStatus']) return row.original.dealerId['riskLevelStatus'] === filterValue[0];
                else if (row.original.dealerDetails && row.original.dealerDetails['riskLevelStatus']) return row.original.dealerDetails['riskLevelStatus'] === filterValue[0];

                return status.original || status.dealerId || status.dealerDetails;

            });
            if (filterValue[1] && filterValue[1].length) {

                return risk.filter(row => {
                    return rowValuesToReturn(filterValueLowerCase, row);
                });

            }
            return risk;
        }

    }
    else {
        return rows;
    }

}


// Define a custom Dealers search filter function!
export function filterDealerSelect(rows, id, filterValue) {

    if (filterValue) {

        if (filterValue === 'all')
            return rows;
        else {
            const filterValues = filterValue.split(' - ');
            return rows.filter(row => row.values['dealership'] === filterValues[1]);
        }

    }
    else {
        return rows;
    }

}

// Define a custom filter filter function!
function filterReactJSX(rows, id, filterValue) {

    return rows.filter(row => {

        const rowValue = row.values[id];
        const children = rowValue !== '' ? (rowValue.props ? rowValue.props.children : rowValue) : '';

        if (children !== '') {

            for (let i = 0; i < children.length; i++) {

                if (children[i].props && children[i].props.children && children[i].props.children.toString().toLowerCase().indexOf(filterValue.toString().toLowerCase()) > -1)
                    return true;
                else if (children.toString().toLowerCase().indexOf(filterValue.toString().toLowerCase()) > -1)
                    return true;

            }

        }

        return false;

    })
}


//Custom filter code
export function filterCustomReactJSX(rows, id, filterValue) {

    return rows.filter(row => {

        const rowValue = row.values[id];
        const children = rowValue !== '' ? (rowValue.props && rowValue.props.children && rowValue.props.children.length > 0 ? rowValue.props.children[0].props.children.toLowerCase() : rowValue.toLowerCase()) : '';

        if (children.indexOf(filterValue.toLowerCase()) > -1) {
            return true
        } else {
            return false
        }

    })
}
