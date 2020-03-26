import React, { useState, useEffect, useReducer } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiFilePicker,
  EuiFieldText,
  EuiStepsHorizontal,
  EuiPanel,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem
} from '@elastic/eui';
import MonacoEditor from 'react-monaco-editor';
import ReactMarkdown from 'react-markdown';
import classnames from 'classnames';
import styles from './index.module.scss';

const initState = {
  step: 1,
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

const BlogEdit = props => {
  const [state, dispatch] = useReducer(reducer, initState);
  const steps = [
    {
      title: '填写基本信息',
      isSelected: state.step === 1,
      onClick: () => dispatch({ type: 'setState', value: { step: 1 } }),
      id: 'basic'
    },
    {
      title: '写作',
      isSelected: state.step === 2,
      onClick: () => dispatch({ type: 'setState', value: { step: 2 } }),
      id: 'writing'
    },
    {
      title: '保存',
      isSelected: state.step === 3,
      onClick: () => dispatch({ type: 'setState', value: { step: 3 } }),
      id: 'save'
    }
  ];
  return (
    <>
      <EuiFlexGroup direction="column" className={styles.container}>
        <EuiFlexItem grow={false}>
          <EuiStepsHorizontal steps={steps}></EuiStepsHorizontal>`
        </EuiFlexItem>
        <EuiFlexItem grow>
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
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSpacer size="s"></EuiSpacer>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default BlogEdit;
