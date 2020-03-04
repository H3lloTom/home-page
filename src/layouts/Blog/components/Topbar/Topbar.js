import React, { useState, useEffect } from 'react';
import {
  EuiHeader,
  EuiHeaderSection,
  EuiTextColor,
  EuiHeaderLogo,
  EuiHeaderLinks,
  EuiHeaderLink,
  EuiPopover
} from '@elastic/eui';
import { useLocation } from 'react-router-dom';
import AV from 'leancloud-storage';

import styles from './index.module.scss';

const Topbar = () => {
  const [isPopoverOpen, setPopover] = useState(false);
  const location = useLocation();
  const getRouterProps = path => {
    return {
      href: `#${path}`,
      isActive: location.pathname === path
    };
  };
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
        <EuiHeaderLogo iconType="user" href="#">
          <EuiTextColor component="span" color="subdued">
            登录
          </EuiTextColor>
        </EuiHeaderLogo>
      </EuiHeaderSection>
    </EuiHeader>
  );
};

export default Topbar;
