import React, { useState, useEffect, useReducer, useMemo } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiFilePicker,
  EuiFieldText,
  EuiStepsHorizontal,
  EuiButtonIcon,
  EuiCallOut,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSelect,
  EuiImage
} from '@elastic/eui';
import MonacoEditor from 'react-monaco-editor';
import ReactMarkdown from 'react-markdown';
import classnames from 'classnames';
import schema from 'async-validator';
import AV from 'leancloud-storage';
import { useHistory, useParams } from 'react-router-dom';
import styles from './index.module.scss';

const initState = {
  step: 0,
  banner: null,
  directory: {},
  title: '',
  content: ''
};

const reducer = function(state, action) {
  switch (action.type) {
    case 'setState':
      return { ...state, ...action.value };
    default:
      return state;
  }
};

const descriptor = {
  banner: {
    type: 'object',
    required: true,
    message: '请选择banner图'
  },
  title: {
    type: 'string',
    required: true,
    message: '请输入标题'
  },
  content: {
    type: 'string',
    required: true,
    message: '请输入正文，不得为空'
  },
  directory: {
    type: 'object',
    required: true,
    message: '请选择文件夹'
  }
};

const validator = new schema(descriptor);

const BasicInfo = props => {
  const { state, dispatch } = props;
  const [options, setOptions] = useState([]);
  const onChangeBanner = async files => {
    if (files.length > 0) {
      const fileData = files[0];
      const file = new AV.File(fileData.name, fileData);
      const banner = await file.save();
      dispatch({ type: 'setState', value: { banner } });
      return;
    }
    dispatch({ type: 'setState', value: { banner: null } });
  };
  const init = async () => {
    const query = new AV.Query('Directory');
    const options = await query.limit(1000).find();
    setOptions(options);
  };
  const onChangeDir = e => {
    const id = e.target.value;
    const directory = options.find(o => o.id === id);
    dispatch({ type: 'setState', value: { directory } });
  };
  const directoryOptions = options.map(o => ({
    text: o.get('name'),
    value: o.id
  }));
  useEffect(() => {
    init();
  }, []);
  return (
    <EuiForm>
      <EuiFormRow label="首图" fullWidth className={styles.bannerRow}>
        {state.banner ? (
          <>
            <EuiImage
              className={styles.banner}
              url={state.banner.thumbnailURL(128 * 6, 128)}
              alt="banner"></EuiImage>
            <EuiButtonIcon
              color="subdued"
              iconType="cross"
              className={styles.closeBanner}
              onClick={() => onChangeBanner([])}></EuiButtonIcon>
          </>
        ) : (
          <EuiFilePicker
            initialPromptText="请选择banner图"
            accept="image/*"
            onChange={onChangeBanner}
            fullWidth></EuiFilePicker>
        )}
      </EuiFormRow>
      <EuiFormRow label="标题" fullWidth>
        <EuiFieldText
          value={state.title}
          onChange={e =>
            dispatch({ type: 'setState', value: { title: e.target.value } })
          }
          placeholder="请输入标题"
          fullWidth></EuiFieldText>
      </EuiFormRow>
      <EuiFormRow label="文件夹" fullWidth>
        <EuiSelect
          value={state.directory.id}
          hasNoInitialSelection
          onChange={onChangeDir}
          fullWidth
          options={directoryOptions}></EuiSelect>
      </EuiFormRow>
    </EuiForm>
  );
};

const MarkDownEditor = props => {
  const { state, dispatch } = props;
  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        <MonacoEditor
          theme="vs-dark"
          value={state.content}
          onChange={content =>
            dispatch({ type: 'setState', value: { content } })
          }
          language="markdown"></MonacoEditor>
      </EuiFlexItem>
      <EuiFlexItem>
        <ReactMarkdown
          className={classnames('markdown', styles.markdownArea)}
          source={state.content}></ReactMarkdown>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const Confirm = props => {
  const history = useHistory();
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = props;
  const [errors, setErrors] = useState([]);
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
  const save = async () => {
    const data = state;
    const isValid = await validate(data);
    if (isValid) {
      setLoading(true);
      try {
        let post = null;
        if (!id) {
          // 新建流程
          post = new AV.Object('Post');
        } else {
          post = AV.Object.createWithoutData('Post', id);
        }
        post.set(state);
        await post.save();
        setLoading(false);
        history.replace('/a/post');
      } catch (error) {
        setLoading(false);
      }
    }
  };
  return (
    <EuiFlexGroup direction="column">
      {errors.length > 0 && (
        <EuiFlexItem grow={false}>
          <EuiCallOut title="校验失败" iconType="alert" color="danger">
            {errors.map((e, index) => (
              <EuiText key={index}>
                {index + 1}、{e.message}
              </EuiText>
            ))}
          </EuiCallOut>
        </EuiFlexItem>
      )}
      <EuiFlexItem>
        <EuiButton onClick={save} isLoading={loading} fullWidth>
          保存
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const BlogEdit = props => {
  const { match, history } = props;
  const { id } = match.params;
  const [state, dispatch] = useReducer(reducer, initState);
  const steps = [
    {
      title: '填写基本信息',
      isSelected: state.step === 0,
      onClick: () => dispatch({ type: 'setState', value: { step: 0 } }),
      id: 'basic'
    },
    {
      title: '写作',
      isSelected: state.step === 1,
      onClick: () => dispatch({ type: 'setState', value: { step: 1 } }),
      id: 'writing'
    },
    {
      title: '保存',
      isSelected: state.step === 2,
      onClick: () => dispatch({ type: 'setState', value: { step: 2 } }),
      id: 'save'
    }
  ];
  const stepsView = useMemo(() => [BasicInfo, MarkDownEditor, Confirm]);
  const init = async () => {
    if (id) {
      try {
        const query = new AV.Query('Post');
        const post = await query.get(id);
        dispatch({
          type: 'setState',
          value: {
            banner: post.get('banner'),
            title: post.get('title'),
            directory: post.get('directory'),
            content: post.get('content')
          }
        });
      } catch (error) {
        history.replace('/a/post');
      }
    }
  };
  useEffect(() => {
    init();
  }, [id]);
  return (
    <>
      <EuiFlexGroup direction="column" className={styles.container}>
        <EuiFlexItem grow={false}>
          <EuiStepsHorizontal steps={steps}></EuiStepsHorizontal>`
        </EuiFlexItem>
        <EuiFlexItem grow>
          {React.createElement(stepsView[state.step], { state, dispatch })}
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default BlogEdit;
