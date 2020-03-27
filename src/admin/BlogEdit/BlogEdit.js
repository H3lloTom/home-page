import React, { useState, useEffect, useReducer, useMemo } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiFilePicker,
  EuiFieldText,
  EuiStepsHorizontal,
  EuiPanel,
  EuiButtonIcon,
  EuiCallOut,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiImage
} from '@elastic/eui';
import MonacoEditor from 'react-monaco-editor';
import ReactMarkdown from 'react-markdown';
import classnames from 'classnames';
import schema from 'async-validator';
import AV from 'leancloud-storage';
import styles from './index.module.scss';

const initState = {
  step: 0,
  banner: null,
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
  }
};

const validator = new schema(descriptor);

const BasicInfo = props => {
  const { state, dispatch } = props;
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
  const { state, dispatch } = props;
  const [errors, setErrors] = useState([]);
  const validate = async () => {
    const data = {
      title: state.title,
      content: state.content,
      banner: state.banner
    };
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
    const isValid = await validate();
    if (isValid) {
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
        <EuiButton onClick={save} fullWidth>
          保存
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const BlogEdit = props => {
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
