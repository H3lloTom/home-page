import React, { useState, useEffect } from 'react';
import {
  EuiFlexGroup,
  EuiCard,
  EuiFlexItem,
  EuiButton,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButtonEmpty,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiTextArea,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiBasicTable,
  EuiSelect,
  EuiStat,
  EuiPanel,
  EuiIcon
} from '@elastic/eui';
import schema from 'async-validator';
import AV from 'leancloud-storage';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import styles from './index.module.scss';

const descriptor = {
  name: {
    type: 'string',
    required: true,
    message: '请填写名称'
  },
  description: {
    type: 'string',
    required: true,
    message: '请填写描述信息'
  }
};

const validator = new schema(descriptor);

const AddModal = props => {
  const [addLoading, setAddLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const validate = async data => {
    try {
      await validator.validate(data);
      setErrors([]);
      return true;
    } catch ({ errors }) {
      setErrors(errors);
      return false;
    }
  };
  const onSave = async () => {
    const data = { name, description };
    let isValid = await validate(data);
    if (isValid) {
      setAddLoading(true);
      try {
        let directory = new AV.Object('Directory');
        directory.set(data);
        await directory.save();
        setAddLoading(false);
        props.onClose();
        props.onSuccess();
      } catch (error) {
        setAddLoading(false);
      }
    }
  };
  const errorMessages = errors.map(e => e.message);
  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.onClose}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>新增文件夹</EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiForm isInvalid={errors.length > 0} error={errorMessages}>
            <EuiFormRow label="名称">
              <EuiFieldText
                value={name}
                onChange={e => setName(e.target.value)}></EuiFieldText>
            </EuiFormRow>
            <EuiFormRow label="描述">
              <EuiTextArea
                value={description}
                onChange={e => setDescription(e.target.value)}></EuiTextArea>
            </EuiFormRow>
          </EuiForm>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty onClick={props.onClose}>取消</EuiButtonEmpty>
          <EuiButton isLoading={addLoading} onClick={onSave} fill>
            保存
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};

const PostList = props => {
  const { id, name } = props;
  const history = useHistory();
  const [directoryItems, setDirectoryItems] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [moveLoading, setMoveLoading] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState('');
  const refresh = async () => {
    let query = new AV.Query('Post');
    let directory = AV.Object.createWithoutData('Directory', id);
    query.equalTo('directory', directory).descending('createdAt');
    const posts = await query.find();
    setPosts(posts);
  };
  const fetchDirectoryItems = async () => {
    let query = new AV.Query('Directory');
    query.limit(1000);
    const directoryItems = await query.find();
    setDirectoryItems(directoryItems);
  };
  const onDelete = async id => {
    let post = AV.Object.createWithoutData('Post', id);
    await post.destroy();
    refresh();
  };
  const onCloseMoveModal = () => {
    setSelectedDirectory('');
    setMoveLoading(false);
    setMoveModalVisible(false);
  };
  const onMove = async () => {
    if (!selectedDirectory) {
      return;
    }
    setMoveLoading(true);
    try {
      const targetDirectory = AV.Object.createWithoutData(
        'Directory',
        selectedDirectory
      );
      const posts = selectedItems.map(s => {
        const post = AV.Object.createWithoutData('Post', s.id);
        post.set('directory', targetDirectory);
        return post;
      });
      await AV.Object.saveAll(posts);
      onCloseMoveModal();
      refresh();
    } catch (error) {
      setMoveLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    fetchDirectoryItems();
  }, [id]);
  const columns = [
    {
      id: 'title',
      field: 'title',
      name: '文章标题',
      render: (val, item) => item.get('title')
    },
    {
      id: 'createdAt',
      field: 'createdAt',
      name: '创建时间',
      render: (val, item) =>
        moment(item.get('createdAt')).format('YYYY/MM/DD HH:mm:ss')
    },
    {
      id: 'updatedAt',
      field: 'updatedAt',
      name: '更新时间',
      render: (val, item) =>
        moment(item.get('updatedAt')).format('YYYY/MM/DD HH:mm:ss')
    },
    {
      id: 'actions',
      name: '操作',
      actions: [
        {
          name: 'edit',
          description: '编辑',
          icon: 'pencil',
          type: 'icon',
          onClick: item => {
            history.push(`/a/post/edit/${item.id}`);
          }
        },
        {
          name: 'delete',
          description: '删除',
          icon: 'trash',
          type: 'icon',
          onClick: item => {
            const result = window.confirm(`确定要删除${item.get('title')}?`);
            if (result) {
              onDelete(item.id);
            }
          }
        }
      ]
    }
  ];
  const selection = {
    selectable: item => true,
    selectableMessage: selectable =>
      !selectable ? 'User is currently offline' : undefined,
    onSelectionChange: setSelectedItems
  };
  const directoryOptions = directoryItems.map(d => ({
    text: d.get('name'),
    value: d.id
  }));
  return (
    <>
      <EuiFlyout onClose={props.onClose}>
        <EuiFlyoutHeader>{name}-文章列表</EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiButton
                iconType="folderOpen"
                size="s"
                onClick={() => setMoveModalVisible(true)}
                disabled={selectedItems.length === 0}>
                移动文件夹
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}></EuiFlexItem>
          </EuiFlexGroup>
          <EuiBasicTable
            selection={selection}
            isSelectable
            columns={columns}
            itemId="id"
            items={posts}></EuiBasicTable>
        </EuiFlyoutBody>
      </EuiFlyout>
      {moveModalVisible && (
        <EuiOverlayMask>
          <EuiModal onClose={onCloseMoveModal}>
            <EuiModalHeader>移动文件夹</EuiModalHeader>
            <EuiModalBody>
              <EuiForm>
                <EuiFormRow fullWidth>
                  <EuiSelect
                    fullWidth
                    options={directoryOptions}
                    value={selectedDirectory}
                    hasNoInitialSelection
                    onChange={e =>
                      setSelectedDirectory(e.target.value)
                    }></EuiSelect>
                </EuiFormRow>
              </EuiForm>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButton isLoading={moveLoading} onClick={onMove}>
                确认
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      )}
    </>
  );
};

const Directory = () => {
  const PAGE_SIZE = 10;
  const [stat, setStat] = useState({
    postCount: 0,
    directoryCount: 0,
    weekPostCount: 0,
    monthPostCount: 0,
    yearPostCount: 0
  });
  const [statLoading, setStatLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [addVisible, setAddVisible] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [current, setCurrent] = useState('');
  const [pageNo, setPageNo] = useState(0);
  const [total, setTotal] = useState(0);
  const hasMore = total > (pageNo + 1) * PAGE_SIZE;
  const queryStat = async () => {
    const weekDate = moment()
      .subtract(1, 'weeks')
      .toDate();
    const monthDate = moment()
      .subtract(1, 'months')
      .toDate();
    const yearDate = moment()
      .subtract(1, 'years')
      .toDate();
    const postCountQuery = new AV.Query('Post');
    const directoryCountQuery = new AV.Query('Directory');
    const weekPostCountQuery = new AV.Query('Post');
    const monthPostCountQuery = new AV.Query('Post');
    const yearPostCountQuery = new AV.Query('Post');
    const postCount = await postCountQuery.count();
    const directoryCount = await directoryCountQuery.count();
    const weekPostCount = await weekPostCountQuery
      .greaterThanOrEqualTo('createdAt', weekDate)
      .count();
    const monthPostCount = await monthPostCountQuery
      .greaterThanOrEqualTo('createdAt', monthDate)
      .count();
    const yearPostCount = await yearPostCountQuery
      .greaterThanOrEqualTo('createdAt', yearDate)
      .count();
    setStat({
      postCount,
      directoryCount,
      weekPostCount,
      monthPostCount,
      yearPostCount
    });
    setStatLoading(false);
  };
  const queryItems = async (pageNo = 0, pageSize = PAGE_SIZE) => {
    const query = new AV.Query('Directory');
    const items = await query
      .skip(pageNo * pageSize)
      .limit(pageSize)
      .descending('createdAt')
      .find();
    const total = await query.count();
    setPageNo(pageNo);
    setTotal(total);
    return items;
  };
  const onRefresh = async () => {
    queryStat();
    const items = await queryItems();
    setItems(items);
  };
  const onAppend = async () => {
    const nextItems = await queryItems(pageNo + 1);
    setItems(items.concat(nextItems));
  };
  useEffect(() => {
    onRefresh();
  }, []);
  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiPanel>
            <EuiStat
              isLoading={statLoading}
              textAlign="right"
              description="文章数"
              titleColor="danger"
              title={stat.postCount}>
              <EuiIcon type="tokenFile" color="danger"></EuiIcon>
            </EuiStat>
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <EuiStat
              isLoading={statLoading}
              textAlign="right"
              description="文件夹数"
              titleColor="danger"
              title={stat.directoryCount}>
              <EuiIcon type="tokenStruct" color="danger"></EuiIcon>
            </EuiStat>
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <EuiStat
              isLoading={statLoading}
              textAlign="right"
              description="周"
              titleColor="secondary"
              title={stat.weekPostCount}>
              <EuiIcon type="tokenDate" color="secondary"></EuiIcon>
            </EuiStat>
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <EuiStat
              isLoading={statLoading}
              textAlign="right"
              description="月"
              titleColor="secondary"
              title={stat.monthPostCount}>
              <EuiIcon type="tokenDate" color="secondary"></EuiIcon>
            </EuiStat>
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <EuiStat
              isLoading={statLoading}
              textAlign="right"
              description="年"
              titleColor="secondary"
              title={stat.yearPostCount}>
              <EuiIcon type="tokenDate" color="secondary"></EuiIcon>
            </EuiStat>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup direction="column">
        {items.map(i => {
          return (
            <EuiFlexItem key={i.id}>
              <EuiCard
                title={i.get('name')}
                description={i.get('description')}
                onClick={() => {
                  setCurrent(i);
                  setListVisible(true);
                }}
                textAlign="left"></EuiCard>
            </EuiFlexItem>
          );
        })}
      </EuiFlexGroup>
      <EuiFlexGroup justifyContent="spaceAround">
        <EuiFlexItem grow={false}>
          {hasMore && <EuiButton onClick={onAppend}>加载更多</EuiButton>}
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiButton
        onClick={() => setAddVisible(true)}
        fill
        iconType="plusInCircleFilled"
        className={styles.addBtn}>
        新增文件夹
      </EuiButton>
      {addVisible && (
        <AddModal
          onSuccess={onRefresh}
          onClose={() => setAddVisible(false)}></AddModal>
      )}
      {listVisible && (
        <PostList
          id={current.id}
          name={current.get('name')}
          onClose={() => setListVisible(false)}></PostList>
      )}
    </>
  );
};

export default Directory;
