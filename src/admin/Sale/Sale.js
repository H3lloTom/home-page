import React, { useState, useEffect } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiSuperDatePicker,
  EuiBasicTable,
  EuiSpacer,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiAvatar,
  EuiText,
  EuiSuperSelect,
  EuiHealth,
  EuiBadge,
  EuiFieldNumber
} from '@elastic/eui';
import AV from 'leancloud-storage';
import dm from '@elastic/datemath';
import ac from 'accounting';
import schema from 'async-validator';
import styles from './index.module.scss';

const SUB_SALE_TEMPLATE = {
  stockId: '',
  size: '',
  color: '',
  maxNumber: 0,
  number: 0
};

const saleDescriptor = {
  start: {
    type: 'string',
    required: true,
    message: '请选择起始时间'
  },
  end: {
    type: 'string',
    required: true,
    message: '请选择结束时间'
  }
};

const itemDescriptor = {
  stockId: {
    type: 'string',
    required: true,
    message: '请选择商品'
  },
  number: {
    type: 'integer',
    required: true,
    message: '请输入数量(数量>0)',
    validator(rule, value) {
      return value > 0;
    }
  }
};

const saleValidator = new schema(saleDescriptor);
const itemValidator = new schema(itemDescriptor);

const Sale = props => {
  const [saveLoading, setSaveLoading] = useState(false);
  const [sale, setSale] = useState({
    start: 'now-1d',
    end: 'now'
  });
  const [errors, setErrors] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [goodsOptions, setGoodsOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [stockItems, setStockItems] = useState([]);
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
  const queryGoods = async () => {
    const stockQuery = new AV.Query('Stock');
    stockQuery.include('goods');
    let stocks = await stockQuery.limit(1000).find();
    const goodsOptions = stocks.map(s => ({
      value: s.id,
      inputDisplay: (
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiAvatar
              size="s"
              name={s.get('goods').get('name')}
              imageUrl={s
                .get('goods')
                .get('picture')
                .thumbnailURL(50, 50)}></EuiAvatar>
          </EuiFlexItem>
          <EuiFlexItem grow={4}>
            <EuiText className="eui-textTruncate" size="m" color="default">
              {s.get('goods').get('name')}
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={6}>
            <EuiText size="s">
              <EuiBadge>
                进价：{ac.formatMoney(s.get('goods').get('price'), '￥')}
              </EuiBadge>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      ),
      dropdownDisplay: (
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiAvatar
              name={s.get('goods').get('name')}
              imageUrl={s
                .get('goods')
                .get('picture')
                .thumbnailURL(50, 50)}></EuiAvatar>
          </EuiFlexItem>
          <EuiFlexItem grow={6}>
            <EuiText size="m" className="eui-textTruncate" color="default">
              {s.get('goods').get('name')}
            </EuiText>
            <EuiText size="s">
              <EuiBadge>
                进价：{ac.formatMoney(s.get('goods').get('price'), '￥')}
              </EuiBadge>
              <EuiBadge>尺码：{s.get('size')}</EuiBadge>
              <EuiBadge>
                <EuiHealth color={`#${s.get('color')}`}>
                  #{s.get('color')}
                </EuiHealth>
              </EuiBadge>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      )
    }));
    setGoodsOptions(goodsOptions);
    setStocks(stocks);
  };
  const onChangeTableRow = (index, key, val) => {
    const nextItems = [...stockItems];
    nextItems[index][key] = val;
    nextItems.forEach(n => {
      const { stockId } = n;
      if (stockId) {
        const stock = stocks.find(s => s.id === stockId);
        n.size = stock.get('size');
        n.color = stock.get('color');
        n.stockNumber = stock.get('number');
        n.maxNumber = stock.get('number');
      }
    });
    setStockItems(nextItems);
  };
  const onChangeSale = cover => {
    setSale({ ...sale, ...cover });
  };
  const onAddItem = () => {
    setStockItems(
      stockItems.concat({ ...SUB_SALE_TEMPLATE, index: stockItems.length })
    );
  };
  const onDeleteItem = item => {
    const nextItems = [...stockItems];
    nextItems.splice(item.index, 1);
    nextItems.forEach((val, index) => (val.index = index));
    setStockItems(nextItems);
  };
  const onSave = async () => {
    // 如果商品清单为0条，退出
    if (stockItems.length === 0) {
      setErrors([{ message: '请添加商品' }]);
      return;
    }
    const s = { ...sale };
    // 校验销售单信息
    try {
      await saleValidator.validate(s);
    } catch ({ errors }) {
      setErrors(errors);
      return;
    }
    // 校验商品清单
    const stockItemsErrors = [];
    for (let i = 0; i < stockItems.length; i++) {
      try {
        const item = stockItems[i];
        await itemValidator.validate(item);
      } catch ({ errors }) {
        stockItemsErrors.push({
          message: `${i + 1}：${errors.map(e => e.message).join(',')}`
        });
      }
    }
    setErrors([].concat(stockItemsErrors));
    if (stockItemsErrors.length === 0) {
      setSaveLoading(true);
      try {
        // 创建主销售单
        const mainSale = new AV.Object('Sale');
        mainSale.set({
          start: dm.parse(s.start).toDate(),
          end: dm.parse(s.end).toDate()
        });
        // 修改商品库存
        for (let i = 0; i < stockItems.length; i++) {
          const item = stockItems[i];
          const saleRecord = new AV.Object('SaleRecord');
          const subSale = new AV.Object('SubSale');
          const stock = stocks.find(s => s.id === item.stockId);
          // 设置子订单，并关联主订单
          subSale.set({
            stock,
            sale: mainSale,
            number: item.number
          });
          // 设置销售记录
          saleRecord.set({
            stock,
            subSale,
            sale: mainSale
          });
          // 修改库存
          stock.set({
            number: stock.get('number') - item.number
          });
          await subSale.save();
          await stock.save();
          await saleRecord.save();
        }
        setSaveLoading(false);
        props.history.replace('/a/stock');
      } catch (error) {
        console.log(error);
        setSaveLoading(false);
      }
    }
  };
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
      field: 'stockId',
      name: '库存商品',
      width: '400px',
      render: (val, item) => {
        return (
          <div className={styles.tableCol}>
            <EuiSuperSelect
              hasDividers
              fullWidth
              valueOfSelected={val}
              onChange={value => onChangeTableRow(item.index, 'stockId', value)}
              itemLayoutAlign="center"
              options={goodsOptions}></EuiSuperSelect>
          </div>
        );
      },
      footer: () => {
        return (
          <EuiButton onClick={onAddItem} size="s" iconType="listAdd">
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
              disabled
              valueOfSelected={val}
              itemLayoutAlign="center"
              options={colorOptions}></EuiSuperSelect>
          </div>
        );
      }
    },
    {
      field: 'size',
      name: '尺寸',
      width: '150px',
      render: (val, item) => {
        return (
          <div className={styles.tableCol}>
            <EuiSuperSelect
              hasDividers
              fullWidth
              disabled
              valueOfSelected={val}
              itemLayoutAlign="top"
              options={sizeOptions}></EuiSuperSelect>
          </div>
        );
      }
    },
    {
      field: 'stockNumber',
      name: '库存数量'
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
              max={item.maxNumber}
              onChange={e =>
                onChangeTableRow(item.index, 'number', +e.target.value)
              }></EuiFieldNumber>
          </div>
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
          onClick: onDeleteItem,
          isPrimary: true
        }
      ]
    }
  ];
  const errorMessages = errors.map(e => e.message);
  useEffect(() => {
    queryGoods();
    queryDict();
  }, []);
  return (
    <EuiForm isInvalid={errors.length > 0} error={errorMessages}>
      <EuiFormRow display="rowCompressed" label="日期范围">
        <EuiSuperDatePicker
          start={sale.start}
          end={sale.end}
          showUpdateButton={false}
          onTimeChange={({ start, end }) => onChangeSale({ start, end })}
          locale="zh-cn"></EuiSuperDatePicker>
      </EuiFormRow>
      <EuiSpacer size="l"></EuiSpacer>
      <EuiFormRow fullWidth label="商品清单">
        <EuiBasicTable items={stockItems} columns={columns}></EuiBasicTable>
      </EuiFormRow>
      <EuiSpacer size="l"></EuiSpacer>
      <EuiPanel paddingSize="s" hasShadow>
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton isLoading={saveLoading} fill size="m" onClick={onSave}>
              保存
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      <EuiSpacer size="l"></EuiSpacer>
    </EuiForm>
  );
};

export default Sale;
