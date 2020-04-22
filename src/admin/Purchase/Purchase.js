import React, { useState, useEffect, Fragment, useMemo } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiDatePicker,
  EuiFieldText,
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiButton,
  EuiSuperSelect,
  EuiHealth,
  EuiFieldNumber,
  EuiText,
  EuiTextColor,
  EuiPanel,
  EuiButtonIcon,
  EuiAvatar
} from '@elastic/eui';
import moment from 'moment';
import schema from 'async-validator';
import AV from 'leancloud-storage';
import ac from 'accounting';

import { GoodsItem } from '../components';
import styles from './index.module.scss';

const itemDescriptor = {
  goodsId: {
    type: 'string',
    required: true,
    message: '请选择商品'
  },
  color: {
    type: 'string',
    required: true,
    message: '请选择颜色'
  },
  size: {
    type: 'string',
    required: true,
    message: '请选择尺码'
  },
  number: {
    type: 'integer',
    required: true,
    message: '请输入数量(数量>0)',
    validator(rule, value) {
      return value > 0;
    }
  },
  subTotal: {
    type: 'number',
    required: true
  }
};

const purchaseDescriptor = {
  purchaseDate: {
    type: 'object',
    required: true,
    message: '请选择采购日期'
  },
  purchaser: {
    type: 'string',
    required: true,
    message: '请填写采购人'
  },
  totalPrice: {
    type: 'number',
    required: true
  }
};

const itemValidator = new schema(itemDescriptor);
const purchaseValidator = new schema(purchaseDescriptor);

const SUB_ORDER_TEMPLATE = {
  goodsId: '',
  color: '',
  size: '',
  price: 0,
  number: 0,
  subTotal: 0
};

const Purchase = props => {
  const [purchase, setPurchase] = useState({
    purchaseDate: moment(),
    purchaser: ''
  });
  const [errors, setErrors] = useState([]);
  const [goodsItems, setGoodsItems] = useState([]);
  const [goodsOptions, setGoodsOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [items, setItems] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const onChangePurchase = (key, val) => {
    const nextPurchase = {
      ...purchase,
      [key]: val
    };
    setPurchase(nextPurchase);
  };
  const queryGoods = async () => {
    const goodsQuery = new AV.Query('Goods');
    let goods = await goodsQuery.limit(1000).find();
    const goodsOptions = goods.map(g => ({
      value: g.id,
      inputDisplay: (
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiAvatar
              size="s"
              name={g.get('name')}
              imageUrl={g.get('picture').thumbnailURL(50, 50)}></EuiAvatar>
          </EuiFlexItem>
          <EuiFlexItem grow={6}>
            <EuiText className="eui-textTruncate" size="m" color="default">
              {g.get('name')}
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      ),
      dropdownDisplay: (
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiAvatar
              name={g.get('name')}
              imageUrl={g.get('picture').thumbnailURL(50, 50)}></EuiAvatar>
          </EuiFlexItem>
          <EuiFlexItem grow={6}>
            <EuiText className="eui-textTruncate" size="m" color="default">
              {g.get('name')}
            </EuiText>
            <EuiText size="xs" color="secondary">
              单价：{ac.formatMoney(g.get('price'), '￥')}
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      )
    }));
    setGoodsOptions(goodsOptions);
    setGoodsItems(goods);
  };
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
  const onChangeTableRow = (index, key, val) => {
    const nextItems = [...items];
    nextItems[index][key] = val;
    nextItems.forEach(n => {
      const { number, goodsId } = n;
      if (goodsId) {
        const goods = goodsItems.find(g => g.id === goodsId);
        n.price = goods.get('price');
        n.subTotal = n.price * number;
      }
    });
    setItems(nextItems);
  };
  const onAddItem = async () => {
    const nextItems = items.concat({
      ...SUB_ORDER_TEMPLATE,
      index: items.length
    });
    setItems(nextItems);
  };
  const onDelete = item => {
    const nextItems = [...items];
    nextItems.splice(item.index, 1);
    nextItems.forEach((val, index) => (val.index = index));
    setItems(nextItems);
  };
  const onSave = async () => {
    // 如果商品清单为0条，退出
    if (items.length === 0) {
      setErrors([{ message: '请添加商品' }]);
      return;
    }
    const p = { ...purchase, totalPrice: itemsStatistics.totalPrice };
    // 校验采购单信息
    try {
      await purchaseValidator.validate(p);
    } catch ({ errors }) {
      setErrors(errors);
      return;
    }
    // 校验商品清单
    const itemErrors = [];
    for (let i = 0; i < items.length; i++) {
      try {
        await itemValidator.validate(items[i]);
      } catch ({ errors }) {
        itemErrors.push({
          message: `${i + 1}：${errors.map(e => e.message).join(',')}`
        });
      }
    }
    setErrors([].concat(itemErrors));
    if (itemErrors.length === 0) {
      setSaveLoading(true);
      try {
        // 创建主订单
        const mainPurchase = new AV.Object('Purchase');
        mainPurchase.set({
          purchaseDate: purchase.purchaseDate.toDate(),
          purchaser: purchase.purchaser,
          totalPrice: itemsStatistics.totalPrice
        });
        // 商品入库
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          // 查询库存中是否有相同货号、颜色、尺寸的商品
          // 创建入库记录
          const subPurchase = new AV.Object('SubPurchase');
          const purchaseRecord = new AV.Object('PurchaseRecord');
          const goods = goodsItems.find(g => g.id === item.goodsId);
          subPurchase.set({
            color: item.color,
            goods: goods,
            price: goods.get('price'),
            purchase: mainPurchase,
            number: item.number,
            size: item.size,
            subTotal: item.subTotal
          });
          const query = new AV.Query('Stock');
          query
            .equalTo('goods', goods)
            .equalTo('color', item.color)
            .equalTo('size', item.size);
          let stocks = await query.find();
          // 如果没有相同的商品，则新建一条
          if (stocks.length === 0) {
            const instance = new AV.Object('Stock');
            purchaseRecord.set({
              stock: instance,
              subPurchase,
              purchase: mainPurchase
            });
            instance.set({
              color: item.color,
              goods: goods,
              number: item.number,
              size: item.size,
              total: item.subTotal
            });
            // 保存子订单
            await subPurchase.save();
            // 保存库存
            await instance.save();
            // 保存库存记录
            await purchaseRecord.save();
            continue;
          }
          // 如果有相同的商品，则更新原有的商品库存
          const stock = stocks[0];
          stock.set({
            number: stock.get('number') + item.number,
            total: stock.get('total') + item.subTotal
          });
          purchaseRecord.set({
            stock,
            subPurchase,
            purchase: mainPurchase
          });
          // 保存子订单
          await subPurchase.save();
          // 保存库存
          await stock.save();
          // 保存入库记录
          await purchaseRecord.save();
        }
        setSaveLoading(false);
        props.history.replace('/a/stock');
      } catch (error) {
        console.log(error);
        setSaveLoading(false);
      }
    }
  };
  const itemsStatistics = useMemo(() => {
    const totalNumber = items.map(i => i.number).reduce((a, b) => a + b, 0);
    const totalPrice = items.map(i => i.subTotal).reduce((a, b) => a + b, 0);
    return {
      totalNumber,
      totalPrice
    };
  }, [items]);
  const columns = [
    {
      field: 'index',
      name: '序号',
      width: '50px',
      render: (val, item) => {
        return item.index + 1;
      }
    },
    {
      field: 'goodsId',
      name: (
        <Fragment>
          <EuiTextColor
            component="span"
            className="euiTableCellContent__text"
            size="s">
            商品
          </EuiTextColor>
          <EuiButtonIcon
            iconType="refresh"
            onClick={() => queryGoods()}></EuiButtonIcon>
          <EuiButtonIcon
            iconType="plusInCircle"
            onClick={() => setAddModalVisible(true)}></EuiButtonIcon>
        </Fragment>
      ),
      width: '30%',
      render: (val, item) => {
        return (
          <div className={styles.tableCol}>
            <EuiSuperSelect
              hasDividers
              fullWidth
              valueOfSelected={val}
              onChange={value => onChangeTableRow(item.index, 'goodsId', value)}
              itemLayoutAlign="center"
              options={goodsOptions}></EuiSuperSelect>
          </div>
        );
      },
      footer: () => {
        return (
          <EuiButton size="s" iconType="listAdd" onClick={onAddItem}>
            新增
          </EuiButton>
        );
      }
    },
    {
      field: 'color',
      name: '颜色',
      width: '150px',
      render: (val, item) => {
        return (
          <div className={styles.tableCol}>
            <EuiSuperSelect
              hasDividers
              fullWidth
              valueOfSelected={val}
              onChange={value => onChangeTableRow(item.index, 'color', value)}
              itemLayoutAlign="center"
              options={colorOptions}></EuiSuperSelect>
          </div>
        );
      }
    },
    {
      field: 'size',
      name: '尺寸',
      render: (val, item) => {
        return (
          <div className={styles.tableCol}>
            <EuiSuperSelect
              hasDividers
              fullWidth
              onChange={value => onChangeTableRow(item.index, 'size', value)}
              valueOfSelected={val}
              itemLayoutAlign="top"
              options={sizeOptions}></EuiSuperSelect>
          </div>
        );
      }
    },
    {
      field: 'number',
      name: '数量',
      render: (val, item) => {
        return (
          <div className={styles.tableCol}>
            <EuiFieldNumber
              fullWidth
              value={val}
              onChange={e =>
                onChangeTableRow(item.index, 'number', +e.target.value)
              }></EuiFieldNumber>
          </div>
        );
      },
      footer: ({ items }) => {
        return (
          <EuiTextColor size="m" color="default">
            总数：
            {itemsStatistics.totalNumber}
          </EuiTextColor>
        );
      }
    },
    {
      field: 'price',
      name: '单价',
      render: val => {
        return (
          <EuiTextColor size="m" color="secondary">
            {ac.formatMoney(val, '￥')}
          </EuiTextColor>
        );
      }
    },
    {
      field: 'subTotal',
      name: '小计',
      render: val => {
        return (
          <EuiTextColor size="m" color="danger">
            {ac.formatMoney(val, '￥')}
          </EuiTextColor>
        );
      },
      footer: ({ items }) => {
        return (
          <EuiTextColor size="m" color="danger">
            总计：
            {ac.formatMoney(itemsStatistics.totalPrice, '￥')}
          </EuiTextColor>
        );
      }
    },
    {
      name: '操作',
      actions: [
        {
          name: 'Delete',
          description: '删除商品',
          icon: 'trash',
          color: 'primary',
          type: 'icon',
          onClick: onDelete,
          isPrimary: true
        }
      ]
    }
  ];
  const errorMessages = errors.map(e => e.message);
  useEffect(() => {
    queryDict();
    queryGoods();
  }, []);
  return (
    <EuiForm isInvalid={errors.length > 0} error={errorMessages}>
      <EuiFormRow display="rowCompressed" label="采购日期">
        <EuiDatePicker
          selected={purchase.purchaseDate}
          onChange={val => onChangePurchase('purchaseDate', val)}
          dateFormat="YYYY/MM/DD"
          locale="zh-cn"
          maxDate={moment()}></EuiDatePicker>
      </EuiFormRow>
      <EuiFormRow display="rowCompressed" label="采购人">
        <EuiFieldText
          value={purchase.purchaser}
          onChange={e =>
            onChangePurchase('purchaser', e.target.value)
          }></EuiFieldText>
      </EuiFormRow>
      <EuiFormRow fullWidth label="商品清单">
        <EuiBasicTable
          items={items}
          itemId="id"
          columns={columns}></EuiBasicTable>
      </EuiFormRow>
      <EuiSpacer size="l" />
      <EuiPanel paddingSize="s" hasShadow>
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton isLoading={saveLoading} fill size="m" onClick={onSave}>
              保存
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      <EuiSpacer size="l" />
      {addModalVisible && (
        <GoodsItem
          type="add"
          onClose={() => setAddModalVisible(false)}
          onConfirm={() => {
            setAddModalVisible(false);
            queryGoods();
          }}></GoodsItem>
      )}
    </EuiForm>
  );
};

export default Purchase;
