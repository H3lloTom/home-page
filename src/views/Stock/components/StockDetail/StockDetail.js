import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiPanel,
  EuiTab,
  EuiHealth,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTabbedContent,
  EuiDescriptionList
} from '@elastic/eui';
import { WindowScroller, List } from 'react-virtualized';
import AV from 'leancloud-storage';
import ac from 'accounting';
import moment from 'moment';

const purchaseRowRenderer = list => props => {
  const { index, key } = props;
  const record = list[index];
  const listItems = [
    {
      title: '采购时间',
      description: moment(record.get('purchase').get('purchaseDate')).format(
        'YYYY/MM/DD'
      )
    },
    {
      title: '单价',
      description: ac.formatMoney(record.get('subPurchase').get('price'), '￥')
    },
    {
      title: '总金额',
      description: ac.formatMoney(
        record.get('subPurchase').get('subTotal'),
        '￥'
      )
    }
  ];
  return (
    <EuiFlexGroup key={key} alignItems="center">
      <EuiFlexItem grow={1}>
        <EuiHealth color="subdued"></EuiHealth>
      </EuiFlexItem>
      <EuiFlexItem grow={9}>
        <EuiDescriptionList
          listItems={listItems}
          type="inline"></EuiDescriptionList>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const saleRowRenderer = list => props => {
  return <div>{props.index}</div>;
};

const StockDetail = props => {
  const { stockId, onClose } = props;
  const [purchaseList, setPurchaseList] = useState([]);
  const [purchasePageNo, setPurchasePageNo] = useState(0);
  const [purchaseTotal, setPurchaseTotal] = useState(0);

  const [saleList, setSaleList] = useState([]);
  const [salePageNo, setsalePageNo] = useState(0);
  const [saleTotal, setSaleTotal] = useState(0);

  const queryMorePurchase = async (skip = 0, pageNo = purchasePageNo) => {
    const purchaseRecordQuery = new AV.Query('PurchaseRecord');
    const stock = AV.Object.createWithoutData('Stock', stockId);
    purchaseRecordQuery.equalTo('stock', stock);
    purchaseRecordQuery.include('stock');
    purchaseRecordQuery.include('purchase');
    purchaseRecordQuery.include('subPurchase');
    const purchaseList = await purchaseRecordQuery
      .skip(skip)
      .limit(10)
      .find();
    const purchaseTotal = await purchaseRecordQuery.count();
    setPurchasePageNo(purchasePageNo);
    setPurchaseList(purchaseList);
    setPurchaseTotal(purchaseTotal);
  };
  const loadMoreRows = type => ({ startIndex, stopIndex }) => {
    console.log(startIndex, stopIndex);
  };
  const isRowLoaded = type => ({ index }) => {
    const typeList = {
      purchase: purchaseList,
      sale: saleList
    };
    return !!typeList[type][index];
  };
  const remoteRowCount = type => {
    const typeTotal = {
      purchase: purchaseTotal,
      sale: saleTotal
    };
    return typeTotal[type];
  };
  const tabs = [
    {
      id: 'purchase',
      name: '采购记录',
      content: (
        <Fragment>
          <WindowScroller>
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
              <List
                autoHeight
                height={height}
                isScrolling={isScrolling}
                onScroll={onChildScroll}
                rowCount={remoteRowCount('purchase')}
                rowHeight={50}
                scrollTop={scrollTop}
                rowRenderer={purchaseRowRenderer(purchaseList)}
                width={500}
              />
            )}
          </WindowScroller>
        </Fragment>
      )
    },
    {
      id: 'sale',
      name: '销售记录',
      content: (
        <Fragment>
          <WindowScroller>
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
              <List
                autoHeight
                height={height}
                isScrolling={isScrolling}
                onScroll={onChildScroll}
                rowCount={remoteRowCount('sale')}
                rowHeight={50}
                scrollTop={scrollTop}
                rowRenderer={saleRowRenderer(saleList)}
                width={500}
              />
            )}
          </WindowScroller>
        </Fragment>
      )
    }
  ];
  useEffect(() => {
    queryMorePurchase();
  }, []);
  return (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutHeader>库存详情</EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiTabbedContent
          tabs={tabs}
          initialSelectedTab={tabs[0]}
          autoFocus="selected"></EuiTabbedContent>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

StockDetail.propTypes = {
  stockId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default StockDetail;
