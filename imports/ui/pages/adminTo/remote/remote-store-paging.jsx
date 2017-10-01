import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import { Paiements } from '/imports/api/paiements/paiements.js';
import RemotePaging from './remote-paging';


export default class RemoteStorePaging extends TrackerReact(React.Component) {


  constructor() {
    super();
    this.state = {
      subscription: {
        paiements: Meteor.subscribe('paiements')
      }
    }
  }

  componentWillUnmount() {
    this.state.subscription.paiements.stop();
  }

  //tracker-based reactivity in action, no need for `getMeteorData`!
  paiements() {
    return paiements.find({}).fetch(); //fetch must be called to trigger reactivity
  }

  filterNumber(targetVal, filterVal, comparator) {
    let valid = true;
    switch (comparator) {
      case '=': {
        if (targetVal !== filterVal) {
          valid = false;
        }
        break;
      }
      case '>': {
        if (targetVal <= filterVal) {
          valid = false;
        }
        break;
      }
      case '<=': {
        if (targetVal > filterVal) {
          valid = false;
        }
        break;
      }
      default: {
        console.error('Number comparator provided is not supported');
        break;
      }
    }
    return valid;
  }

  filterText(targetVal, filterVal) {
    if (targetVal.toString().toLowerCase().indexOf(filterVal) === -1) {
      return false;
    }

    return true;
  }

  onFilterChange(filterObj) {
    if (Object.keys(filterObj).length === 0) {
      this.setState({
        data: paiements()
      });
      return;
    }

    const data = paiements().filter((product) => {
      let valid = true;
      let filterValue;
      for (const key in filterObj) {
        const targetValue = product[key];
        switch (filterObj[key].type) {
          case 'NumberFilter': {
            filterValue = filterObj[key].value.number;
            valid = this.filterNumber(targetValue, filterValue, filterObj[key].value.comparator);
            break;
          }
          default: {
            filterValue = (typeof filterObj[key].value === 'string') ?
              filterObj[key].value.toLowerCase() : filterObj[key].value;
            valid = this.filterText(targetValue, filterValue);
            break;
          }
        }

        if (!valid) {
          break;
        }
      }
      return valid;
    });
    this.setState({
      data: data
    });
  }

  onPageChange(page, sizePerPage) {
    const currentIndex = (page - 1) * sizePerPage;
    this.setState({
      data: paiements().slice(currentIndex, currentIndex + sizePerPage),
      currentPage: page
    });
  }

  onSizePerPageList(sizePerPage) {
    const currentIndex = (this.state.currentPage - 1) * sizePerPage;
    this.setState({
      data: paiements().slice(currentIndex, currentIndex + sizePerPage),
      sizePerPage: sizePerPage
    });
  }

  onSortChange(sortName, sortOrder) {
    if (sortOrder === 'asc') {
      paiements().sort(function (a, b) {
        if (parseInt(a[sortName], 10) > parseInt(b[sortName], 10)) {
          return 1;
        } else if (parseInt(b[sortName], 10) > parseInt(a[sortName], 10)) {
          return -1;
        }
        return 0;
      });
    } else {
      paiements().sort(function (a, b) {
        if (parseInt(a[sortName], 10) > parseInt(b[sortName], 10)) {
          return -1;
        } else if (parseInt(b[sortName], 10) > parseInt(a[sortName], 10)) {
          return 1;
        }
        return 0;
      });
    }

    this.setState({
      data: paiements()
    });
  }

  onExportToCSV() {
    return paiements();
  }

  onSearchChange(searchText, colInfos, multiColumnSearch) {
    const text = searchText.trim();
    if (text === '') {
      this.setState({
        data: paiements()
      });
      return;
    }

    let searchTextArray = [];
    if (multiColumnSearch) {
      searchTextArray = text.split(' ');
    } else {
      searchTextArray.push(text);
    }

    const data = paiements().filter((product) => {
      const keys = Object.keys(product);
      let valid = false;
      for (let i = 0, keysLength = keys.length; i < keysLength; i++) {
        const key = keys[i];
        if (colInfos[key] && product[key]) {
          const { format, filterFormatted, formatExtraData, searchable, hidden } = colInfos[key];
          let targetVal = product[key];
          if (!hidden && searchable) {
            if (filterFormatted && format) {
              targetVal = format(targetVal, product, formatExtraData);
            }
            for (let j = 0, textLength = searchTextArray.length; j < textLength; j++) {
              const filterVal = searchTextArray[j].toLowerCase();
              if (targetVal.toString().toLowerCase().indexOf(filterVal) !== -1) {
                valid = true;
                break;
              }
            }
          }
        }
      }
      return valid;
    });
    this.setState({
      data: data
    });
  }

  renderShowsTotal(start, to, total) {
    return (
      <p style={{ color: 'blue' }}>
        De {start} à {to}, sur {total} au Total
      </p>
    );
  }


  render() {
    console.log(Paiements.find().count());
    return (

      <RemotePaging
        paiements={this.paiements}
        onSearchChange={this.onSearchChange.bind(this)} { ...this.state }
        onSortChange={this.onSortChange.bind(this)} { ...this.state }
        onPageChange={this.onPageChange.bind(this)}{ ...this.state }
        onSizePerPageList={this.onSizePerPageList.bind(this)} { ...this.state }
        onExportToCSV={this.onExportToCSV.bind(this)} { ...this.state }
        onFilterChange={this.onFilterChange.bind(this)} { ...this.state }
        onExportToCSV={this.onExportToCSV.bind(this)} { ...this.state }
        renderShowsTotal={this.renderShowsTotal.bind(this)} { ...this.state } />
    );
  }

}
