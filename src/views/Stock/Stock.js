import React, { Fragment, useState, useEffect } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldSearch,
  EuiBasicTable,
  EuiTextColor,
  EuiColorPicker,
  EuiHealth,
  EuiAvatar,
  EuiSuperSelect
} from '@elastic/eui';
import AV from 'leancloud-storage';
import ac from 'accounting';
import _ from 'lodash';
import styles from './index.module.scss';

const Stock = () => {
  const [items, setItems] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [keywords, setKeywords] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const queryDict = async () => {
    const colorQuery = new AV.Query('Color');
    const sizeQuery = new AV.Query('Size');
    let colors = await colorQuery.limit(1000).find();
    let sizes = await sizeQuery.limit(1000).find();
    const colorOptions = colors.map(c => ({
      value: c.get('hex'),
      inputDisplay: (
        <EuiHealth color={'#' + c.get('hex')}>{c.get('name')}</EuiHealth>
      )
    }));
    const sizeOptions = sizes.map(s => ({
      value: s.get('value'),
      inputDisplay: s.get('name'),
      dropdownDisplay: <strong>{s.get('name')}</strong>
    }));

    setColorOptions(colorOptions);
    setSizeOptions(sizeOptions);
  };
  const queryStocks = async (
    key = keywords,
    index = pageIndex,
    size = pageSize
  ) => {
    const query = new AV.Query('Stock');
    const goodsQuery = new AV.Query('Goods');
    goodsQuery.contains('name', key);
    query.include('goods');
    query.matchesQuery('goods', goodsQuery);
    const stocks = await query
      .skip((index - 1) * size)
      .limit(size)
      .find();
    const total = await query
      .skip((index - 1) * size)
      .limit(size)
      .count();
    setTotal(total);
    setItems(stocks);
    setKeywords(key);
    setPageIndex(index);
    setPageSize(size);
  };
  const onTableChange = change => {
    const { page, sort } = change;
    if (page) {
      const { index, size } = page;
      queryStocks(keywords, index, size);
    }
  };
  const onSearchChange = key => queryStocks(key);
  const debouncedOnSearchChange = _.debounce(onSearchChange, 500);
  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: total,
    pageSizeOptions: [5, 10, 20]
  };
  const columns = [
    {
      name: '序号',
      field: 'index',
      width: '50px',
      render: (val, item) => {
        return <EuiTextColor>{item.get('index')}</EuiTextColor>;
      }
    },
    {
      name: '图片预览',
      field: 'goods.picture',
      render: (val, item) => {
        return (
          <EuiAvatar
            type="space"
            size="l"
            name={item.get('goods').get('name')}
            imageUrl={item
              .get('goods')
              .get('picture')
              .thumbnailURL(50, 50)}></EuiAvatar>
        );
      }
    },
    {
      name: '商品名',
      field: 'goods.name',
      render: (val, item) => {
        return <EuiTextColor>{item.get('goods').get('name')}</EuiTextColor>;
      }
    },
    {
      name: '商品编码',
      field: 'goods.itemCode',
      render: (val, item) => {
        return <EuiTextColor>{item.get('goods').get('itemCode')}</EuiTextColor>;
      }
    },
    {
      name: '颜色',
      field: 'color',
      width: '120px',
      render: (val, item) => {
        return (
          <div className={styles.tableCol}>
            <EuiSuperSelect
              hasDividers
              fullWidth
              disabled
              valueOfSelected={item.get('color')}
              options={colorOptions}></EuiSuperSelect>
          </div>
        );
      }
    },
    {
      name: '尺寸',
      field: 'size',
      width: '100px',
      render: (val, item) => {
        return (
          <div className={styles.tableCol}>
            <EuiSuperSelect
              hasDividers
              fullWidth
              disabled
              valueOfSelected={item.get('size')}
              options={sizeOptions}></EuiSuperSelect>
          </div>
        );
      }
    },
    {
      name: '联系方式',
      field: 'goods.contact',
      width: '100px',
      render: (val, item) => {
        return (
          <EuiTextColor color="subdued">
            {item.get('goods').get('contact')}
          </EuiTextColor>
        );
      }
    },
    {
      name: '库存',
      field: 'number',
      width: '150px',
      render: (val, item) => {
        return <EuiTextColor>{item.get('number')}</EuiTextColor>;
      }
    },
    {
      name: '小计',
      field: 'total',
      render: (val, item) => {
        return (
          <EuiTextColor color="danger">
            {ac.formatMoney(item.get('total'), '￥')}
          </EuiTextColor>
        );
      }
    }
  ];
  useEffect(() => {
    queryStocks();
    queryDict();
  }, []);
  return (
    <Fragment>
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiFieldSearch
            isClearable
            fullWidth
            onChange={e => {
              const value = e.target.value;
              debouncedOnSearchChange(value);
            }}
            placeholder="商品名/商品编码"></EuiFieldSearch>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiBasicTable
        columns={columns}
        items={items}
        onChange={onTableChange}
        pagination={pagination}></EuiBasicTable>
    </Fragment>
  );
};

export default Stock;
