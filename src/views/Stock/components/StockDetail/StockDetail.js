import React, { useState } from 'react';
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
  const [selectedTabId, setSelectedTab] = useState('purchase');
  const [purchaseList, setPurchaseList] = useState([]);
  const [purchasePageNo, setPurchasePageNo] = useState(0);
  const [purchaseTotal, setPurchaseTotal] = useState(0);

  const [saleList, setSaleList] = useState([]);
  const [salePageNo, setsalePageNo] = useState(0);
  const [saleTotal, setSaleTotal] = useState(0);

  const queryMorePurchase = (skip, pageNo = 0) => {};
  const loadMoreRows = type => ({ startIndex, stopIndex }) => {};
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
      name: '入库统计',
      content: (
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
      )
    },
    {
      id: 'sale',
      name: '出库统计'
    }
  ];
  return (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutHeader>库存详情</EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiTabbedContent
          tabs={tabs}
          selectedTab={selectedTabId}
          onTabClick={setSelectedTab}></EuiTabbedContent>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

StockDetail.propTypes = {
  stockId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default StockDetail;
