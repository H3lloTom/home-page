import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiTabs,
  EuiTab,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTabbedContent
} from '@elastic/eui';
import { InfiniteLoader, List } from 'react-virtualized';
import AV from 'leancloud-storage';

const purchaseRowRenderer = list => props => {
  return <div>{props.index}</div>;
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
    purchaseRecordQuery.include('purchase');
    purchaseRecordQuery.include('subPurchase');
    const purchaseList = await purchaseRecordQuery
      .skip(skip)
      .limit(10)
      .find();
    setPurchasePageNo(purchasePageNo);
    setPurchaseList(purchaseList);
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
      name: 'purchase',
      content: (
        <Fragment>
          入库统计
          <InfiniteLoader
            isRowLoaded={isRowLoaded('purchase')}
            loadMoreRows={loadMoreRows('purchase')}
            rowCount={remoteRowCount('purchase')}>
            {({ onRowsRendered, registerChild }) => (
              <List
                height={200}
                onRowsRendered={onRowsRendered}
                ref={registerChild}
                rowCount={remoteRowCount('purchase')}
                rowHeight={20}
                rowRenderer={purchaseRowRenderer(purchaseList)}
                width={300}
              />
            )}
          </InfiniteLoader>
        </Fragment>
      )
    },
    {
      id: 'sale',
      name: 'sale',
      content: (
        <Fragment>
          出库统计
          <InfiniteLoader
            isRowLoaded={isRowLoaded('sale')}
            loadMoreRows={loadMoreRows('sale')}
            rowCount={remoteRowCount('sale')}>
            {({ onRowsRendered, registerChild }) => (
              <List
                height={200}
                onRowsRendered={onRowsRendered}
                ref={registerChild}
                rowCount={remoteRowCount('sale')}
                rowHeight={20}
                rowRenderer={saleRowRenderer(saleList)}
                width={300}
              />
            )}
          </InfiniteLoader>
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
