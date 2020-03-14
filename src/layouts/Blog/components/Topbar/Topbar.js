import React, { useState, useEffect } from 'react';
import {
  EuiHeader,
  EuiHeaderSection,
  EuiTextColor,
  EuiHeaderLogo,
  EuiHeaderLinks,
  EuiHeaderLink,
  EuiPopover,
  EuiModal,
  EuiModalHeader,
  EuiModalBody,
  EuiModalFooter,
  EuiOverlayMask,
  EuiModalHeaderTitle,
  EuiButton,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiFieldPassword,
  EuiIcon
} from '@elastic/eui';
import { useLocation, useHistory } from 'react-router-dom';
import schema from 'async-validator';
import AV from 'leancloud-storage';

import styles from './index.module.scss';

const descriptor = {
  username: {
    type: 'string',
    required: 'true',
    message: '请输入用户名'
  },
  password: {
    type: 'string',
    required: true,
    message: '请输入密码'
  }
};

const validator = new schema(descriptor);

const Topbar = () => {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isPopoverOpen, setPopover] = useState(false);
  const [errors, setErrors] = useState([]);
  const location = useLocation();
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const getRouterProps = path => {
    return {
      href: `#${path}`,
      isActive: location.pathname === path
    };
  };
  const onLogin = async () => {
    let nextErrors = [];
    try {
      await validator.validate({
        username,
        password
      });
      setErrors(nextErrors);
    } catch ({ errors }) {
      nextErrors = nextErrors.concat(errors);
      setErrors(nextErrors);
      return;
    }
    setLoginLoading(true);
    try {
      await AV.User.logIn(username, password);
      setLoginLoading(false);
      history.replace('/stock');
    } catch (error) {
      setLoginLoading(false);
    }
  };
  const errorMessages = errors.map(e => e.message);
  return (
    <EuiHeader className={styles.header}>
      <EuiHeaderSection border="right">
        <EuiHeaderLogo iconType="logoMetrics" href="#/">
          Neptune
        </EuiHeaderLogo>
      </EuiHeaderSection>
      <EuiHeaderLinks>
        <EuiHeaderLink {...getRouterProps('/post')}>文章</EuiHeaderLink>

        <EuiHeaderLink {...getRouterProps('/profile')}>个人简介</EuiHeaderLink>

        <EuiPopover
          isOpen={isPopoverOpen}
          closePopover={() => setPopover(false)}
          button={
            <EuiHeaderLink
              onClick={() => setPopover(true)}
              iconType="arrowDown"
              iconSide="right">
              工具
            </EuiHeaderLink>
          }>
          Hi
        </EuiPopover>
      </EuiHeaderLinks>
      <EuiHeaderSection side="right">
        <EuiHeaderLogo
          iconType="user"
          onClick={() => setLoginModalVisible(true)}>
          <EuiTextColor component="span" color="subdued">
            登录
          </EuiTextColor>
        </EuiHeaderLogo>
      </EuiHeaderSection>
      {loginModalVisible && (
        <EuiOverlayMask>
          <EuiModal onClose={() => setLoginModalVisible(false)}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>登录</EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <EuiForm isInvalid={errors.length > 0} error={errorMessages}>
                <EuiFormRow label="用户名" display="columnCompressed">
                  <EuiFieldText
                    icon="user"
                    value={username}
                    onChange={e => setUsername(e.target.value)}></EuiFieldText>
                </EuiFormRow>
                <EuiFormRow label="密码" display="columnCompressed">
                  <EuiFieldPassword
                    value={password}
                    onChange={e =>
                      setPassword(e.target.value)
                    }></EuiFieldPassword>
                </EuiFormRow>
              </EuiForm>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButton isLoading={loginLoading} onClick={onLogin} fill>
                登录
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      )}
    </EuiHeader>
  );
};

export default Topbar;
