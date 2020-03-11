import React, {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import {
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexGrid,
  EuiFlexItem,
  EuiFieldSearch,
  EuiButton,
  EuiImage
} from '@elastic/eui';
import AV from 'leancloud-storage';
import _ from 'lodash';
import { GoodsItem } from '../components';
import styles from './index.module.scss';

const Goods = () => {
  const columns = [
    {
      field: 'picture',
      name: '主图',
      render: (val, item) => (
        <EuiImage
          size="s"
          alt={item.get('name')}
          url={item.get('picture').url}></EuiImage>
      )
    },
    {
      field: 'name',
      name: '商品名',
      render: (val, item) => item.get('name')
    },
    {
      field: 'itemCode',
      name: '商品编码',
      render: (val, item) => item.get('itemCode')
    },
    {
      field: 'description',
      name: '描述',
      render: (val, item) => item.get('description')
    },
    {
      field: 'contact',
      name: '联系人',
      render: (val, item) => item.get('contact')
    },
    {
      field: 'price',
      name: '单价(元/件)',
      render: (val, item) => item.get('price')
    },
    {
      name: '操作',
      actions: [
        {
          name: 'Alter',
          description: '修改商品',
          icon: 'documentEdit',
          color: 'primary',
          type: 'icon',
          onClick: onAlter,
          isPrimary: true
        }
      ]
    }
  ];
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [keywords, setKeywords] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: items.length,
    pageSizeOptions: [5, 10, 20]
  };
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [alterModalVisible, setAlterModalVisible] = useState(false);
  const queryItems = useCallback(
    async (key = keywords, index = pageIndex, size = pageSize) => {
      const query = new AV.Query('Goods');
      const goodsItems = await query
        .skip((index - 1) * size)
        .limit(size)
        .contains('name', key)
        .find();
      setItems(goodsItems);
      setKeywords(key);
      setPageIndex(index);
      setPageSize(size);
    },
    [keywords, pageIndex, pageSize]
  );
  const onAdd = () => {
    setAddModalVisible(true);
  };
  const onCreate = () => {
    setAddModalVisible(false);
    queryItems();
  };
  const onSave = () => {
    setAlterModalVisible(false);
    queryItems();
  };
  const onSearchChange = useCallback(
    key => {
      queryItems(key);
    },
    [queryItems]
  );
  const debouncedOnSearchChange = useMemo(() => {
    return _.debounce(onSearchChange, 500);
  }, [onSearchChange]);
  const onTableChange = change => {
    const { page, sort } = change;
    if (page) {
      const { index, size } = page;
      queryItems(keywords, index, size);
    }
  };
  function onAlter(item) {
    const id = item.getObjectId();
    setSelectedId(id);
    setAlterModalVisible(true);
  }
  useEffect(() => {
    queryItems();
  }, []);
  return (
    <Fragment>
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiFieldSearch
            isClearable
            fullWidth
            placeholder="商品名/商品编码"
            onChange={e =>
              debouncedOnSearchChange(e.target.value)
            }></EuiFieldSearch>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={onAdd}>新增</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiBasicTable
        columns={columns}
        items={items}
        onChange={onTableChange}
        pagination={pagination}></EuiBasicTable>

      {/* 新增modal */}
      {addModalVisible && (
        <GoodsItem
          type="add"
          onClose={() => setAddModalVisible(false)}
          onConfirm={onCreate}></GoodsItem>
      )}
      {/* 编辑modal */}
      {alterModalVisible && (
        <GoodsItem
          type="alter"
          id={selectedId}
          onClose={() => setAlterModalVisible(false)}
          onConfirm={onSave}></GoodsItem>
      )}
    </Fragment>
  );
};

export default Goods;
